import Anthropic from '@anthropic-ai/sdk';
import { searchWeb } from './serp-api';
import { listAvailableGeojsons } from './list-regions';

const anthropic = new Anthropic();

const commonSystemMessage = `
 You are an assistant that helps a user estimate statistics for regions within an area and visualize them on a map, 
  You are connected to a front-end interface with a map (mapbox light mode) that is able to display these statistics. 
  This tool can be used for multiple areas and sub-regions. 
`;

const systemMessageNoRegionAvailable = `
${commonSystemMessage}

An upstream process has determined that the user's requested region is not available in the database. Please inform them of this and ask for a different region.
`;

const systemMessageRegionAvailable = `
  ${commonSystemMessage}
  
  An upstream RAG process will give you a list of sub-regions for the user's requested area 
  and populate the tool definitions with these sub-regions (for example, counties, states, provinces). However, it's possible we don't actually
  have the user's requested region in the database. If it appears not to match based on the context, please give an appropriate response
  rather than moving formward. The region in the RAG result is : {{ REGION }}. 
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

const buildSystemMessage = (regionRAGResult: any) => {
    if (regionRAGResult.subregions.length === 0) {
        return systemMessageNoRegionAvailable;
    }
    return systemMessageRegionAvailable.replace('{{ REGION }}', regionRAGResult.region);
};

const buildTools = (regionRAGResult: any) => {
    if (regionRAGResult.subregions.length === 0) {
        return [
            {
                name: 'list_available_regions',
                description: 'List all available regions',
                input_schema: {
                    type: 'object',
                    properties: {},
                },
            },
        ];
    }
    const formattedSubregions = regionRAGResult.subregions.reduce((acc: any, subregion: string) => {
        acc[subregion] = { type: 'number' };
        return acc;
    }, {});
    return [
        {
            name: 'list_available_regions',
            description: 'List all available regions',
            input_schema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'continuous_stats_estimates',
            description: 'Provide estimated continous statistic for all sub-regions',
            input_schema: {
                type: 'object',
                properties: {
                    estimates: {
                        type: 'object',
                        description: 'An object with sub-region names as keys and estimated values',
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
                        description: 'Second color for the color scale (e.g., #0000FF for blue)',
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
                        description: 'An object with sub-region names as keys and estimated values',
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
                        description: 'The name of the {{ REGION }} key to pass back to the client',
                    },
                },
                required: ['categories', 'title', 'categoryColors', 'confidence', 'regionKey'],
            },
        },
    ] as any;
};

export const getClaudeResponse = async (messages: any, regionRAGResult: any) => {
    const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 3000,
        temperature: 0,
        system: buildSystemMessage(regionRAGResult),
        tools: buildTools(regionRAGResult),
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
        } else if (name === 'list_available_regions') {
            const regions = await listAvailableGeojsons();
            console.log('regions', regions)
            nextMessage = {
                role: 'user',
                content: [
                    {
                        type: 'tool_result',
                        tool_use_id: id,
                        content: JSON.stringify(regions)
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
