import Anthropic from '@anthropic-ai/sdk';
import { searchWeb } from './serp-api';

import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});

const anthropic = new Anthropic();

const voyageApiUrl = 'https://api.voyageai.com/v1/embeddings';
const getEmbedding = async (text: string) => {
    const voyageApiKey = process.env.VOYAGE_API_KEY;

    const payload = {
        input: [text],
        model: 'voyage-large-2',
    };

    try {
        const response = await fetch(voyageApiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${voyageApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Voyage API returned an error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data[0].embedding;
    } catch (error) {
        console.error('Error fetching embedding from Voyage API:', error);
        throw error;
    }
};

const performSimilaritySearch = async (embedding: number[]) => {
    try {
        const index = pc.Index(process.env.PINECONE_INDEX_NAME || '');
        const query = {
            vector: embedding,
            topK: 1,
            includeMetadata: true,
        };

        const searchResult = await index.query(query);
        return searchResult.matches[0];
    } catch (error) {
        console.error('Error performing similarity search with Pinecone:', error);
        throw error;
    }
};

const ragHelperSystemMessage = `
You are a helper that's assistinga downstream process. 
This system is trying to estimate statistics for a region, and subregions within it, and visualize them on a map.
Your job is to take the message context and figture out which region the user is asking about. 
This will then be passed into a similarity search to match what existing in the database.
The database records look somethign like this: 

{
    region: "Chicago",
    subregions: ["Cook County", "DuPage County", "Lake County", "Will County"]
}

Please return a similar object with the region and subregions that you think the user is asking about. 
It is not necessary for the subregion list to be exhaustive, just enough for a similarity search to be able to match.
***IMPORTANT*** return only the json object for the region, no other explanation is needed.
`;

export const geojsonRagHelper = async (messages: any) => {
    const result = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 3000,
        temperature: 0,
        system: ragHelperSystemMessage,
        messages: [
            {
                role: 'user',
                content: JSON.stringify(messages),
            },
        ],
    });
    const textToEmbed = (result.content[0] as any).text;
    console.log('text to embed:', textToEmbed);
    const embedding = await getEmbedding(textToEmbed);
    const topResult = await performSimilaritySearch(embedding);
    console.log('top result:', topResult);
    return topResult?.metadata;
};

const systemMessage = `
  You are an assistant that helps a user estimate statistics for regions within an area and visualize them on a map, 
  You are connected to a front-end interface with a map (mapbox light mode) that is able to display these statistics. 
  This tool can be used for multiple areas and sub-regions. 
  
  An upstream RAG process will give you a list of sub-regions for the user's requested area 
  and populate the tool definitions with these sub-regions (for example, counties, states, provinces). However, it's possible we don't actually
  have the user's requested region in the database. If it appears not to match based on the context, please give an appropriate response
  rather than moving formward. The region in the RAG result is : {{ REGION }}
  It's understood that this is not perfect up-to-date information, and it's just an estimate based on your training data. 
  Nonetheless, it is useful for brainstorming and exploration, and you should return the confidence level of the estimates to the user.

  **Important** When providing the estimates and visualizing them on the map, simply confirm to the user that the data has been rendered on the map without over-explaining the internal process. 
  Do not mention the name of the function, this is not necessary for the user to know.

  Additionally, you can now visualize categorical statistics, such as the most common fish species in each province. 
  Ensure that the categoryColors object uses category names as keys (e.g., "Bass": "#FF5733") rather than indexes. 
  When providing categorical statistics, always return the category names rather than indexes in the estimates. Mentioning the category names to the user is unecessary as they will see it in the legend.
  The color pallete should provide enough contrast, be appropriate for the data being visualized, and be visually appealing.

  It is crucial to provide accurate and consistent data based on well-known, widely accepted information. 
  Avoid introducing unnecessary variety or less common options. Base your estimates on the most popular and widely recognized statistics.
  When you respond in text format, please respond in markdown when possible. The response should be concise and mention general trends. 
  If you're asking for clarification please be concise.

  Example of the correct format:
  {
    "estimates": {
      "Alabama": "Bass",
      "Alaska": "Salmon",
      ...
    },
    "title": "Estimated Most Common Fish Species in Each Province",
    "categoryColors": {
      "Bass": "#FF5733",
      "Salmon": "#33FF57",
      ...
    }
  } 
`;

const buildSystemMessage = (regionRAGResult: any) =>
    systemMessage.replace('{{ REGION }}', regionRAGResult.region);

export const getClaudeResponse = async (messages: any, regionRAGResult: any) => {
    const formattedSubregions = regionRAGResult.subregions.reduce((acc: any, subregion: string) => {
        acc[subregion] = { type: 'number' };
        return acc;
    }, {});
    const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 3000,
        temperature: 0,
        system: buildSystemMessage(regionRAGResult),
        tools: [
            {
                name: 'continuous_stats_estimates',
                description: 'Provide estimated continous statistic for all sub-regions',
                input_schema: {
                    type: 'object',
                    properties: {
                        estimates: {
                            type: 'object',
                            description:
                                'An object with sub-region names as keys and estimated values',
                            properties: formattedSubregions,
                        },
                        title: {
                            type: 'string',
                            description: 'Title for the map',
                        },
                        color1: {
                            type: 'string',
                            description: 'First color for the color scale (e.g., #FF0000 for red)',
                        },
                        color2: {
                            type: 'string',
                            description:
                                'Second color for the color scale (e.g., #0000FF for blue)',
                        },
                        legendSide1: {
                            type: 'string',
                            description:
                                'Description for the side of the legend corresponding to color1 (e.g., Low)',
                        },
                        legendSide2: {
                            type: 'string',
                            description:
                                'Description for the side of the legend corresponding to color2 (e.g., High)',
                        },
                        confidence: {
                            type: 'string',
                            description: 'Confidence level of the estimates (Low, Medium, High)',
                        },
                        regionKey: {
                            type: 'string',
                            description:
                                'The name of the {{ REGION }} key to pass back to the client (this is the top level region, not subdivision)',
                        },
                    },
                    required: [
                        'estimates',
                        'title',
                        'color1',
                        'color2',
                        'legendSide1',
                        'legendSide2',
                        'confidence',
                        'regionKey',
                    ],
                },
            },
            {
                name: 'category_stats_estimates',
                description: 'Provide estimated categorical statistic for all sub-regions',
                input_schema: {
                    type: 'object',
                    properties: {
                        estimates: {
                            type: 'object',
                            description:
                                'An object with sub-region names as keys and estimated values',
                            properties: formattedSubregions,
                        },
                        title: {
                            type: 'string',
                            description: 'Title for the map',
                        },
                        categoryColors: {
                            type: 'object',
                            description:
                                'An object mapping category names to colors (only include categories that are in the estimates)',
                        },
                        confidence: {
                            type: 'string',
                            description: 'Confidence level of the estimates (Low, Medium, High)',
                        },
                        regionKey: {
                            type: 'string',
                            description:
                                'The name of the {{ REGION }} key to pass back to the client',
                        },
                    },
                    required: ['categories', 'title', 'categoryColors', 'confidence', 'regionKey'],
                },
            },
        ],
        messages,
    });
    return msg;
};

export const getClaudeResponseAndHandleToolCall = async (
    messages: any,
    regionRAGResult: any,
): Promise<any> => {
    const filteredMessages = messages.map((m: any) => {
        const { id, type, model, stop_reason, stop_sequence, usage, ...rest } = m;
        return rest;
    });
    const result = await getClaudeResponse(filteredMessages, regionRAGResult);
    if (result.stop_reason === 'tool_use') {
        const toolCall = result.content.find(item => item.type === 'tool_use') as any;
        const { name, id } = toolCall;
        let nextMessage;
        if (name === 'continuous_stats_estimates' || name === 'category_stats_estimates') {
            nextMessage = {
                role: 'user',
                content: [
                    {
                        type: 'tool_result',
                        tool_use_id: id,
                        content: 'rendered',
                    },
                ],
            };
        } else {
            const result = await searchWeb(toolCall.input);
            nextMessage = {
                role: 'user',
                content: [
                    {
                        type: 'tool_result',
                        tool_use_id: id,
                        content: JSON.stringify(result),
                    },
                ],
            };
        }

        const allMessages = [...messages, result, nextMessage];
        // TODO: maybe keep a counter to prevent infinite loop in recursion (and not allow tool use if so on final loop)
        return getClaudeResponseAndHandleToolCall(allMessages, regionRAGResult);
    } else {
        return [...messages, result];
    }
};
