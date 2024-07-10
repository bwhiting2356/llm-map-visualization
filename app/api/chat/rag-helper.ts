import Anthropic from '@anthropic-ai/sdk';
import { Pinecone } from '@pinecone-database/pinecone';

const anthropic = new Anthropic();

const ragHelperSystemMessage = `
You are a helper that's assisting a downstream process. 
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


const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
});

const similaritySearch = async (embedding: number[]) => {
    try {
        const index = pc.Index(process.env.PINECONE_INDEX_NAME || '');
        const query = {
            vector: embedding,
            topK: 3,
            includeMetadata: true,
        };

        return index.query(query);
    } catch (error) {
        console.error('Error performing similarity search with Pinecone:', error);
        throw error;
    }
};

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

const optionChooserSystemMessage = `
I need your help figuring out which option from a similarity search is the match for a user query. The user is looking for a specific region and subregions.
Given the following message context, and the list of options below, please respond with the index (using 0-based indices) 
of the item in the list that is the best fit for the user's query. If you believe none of the options are appropriate for the query, return null.
A nearby or similar region is not a good match, only the exact region or subregion is a good match.

<query>
{{ QUERY }
 </query>
 <options>
{{ OPTIONS }}
 </options>

 **IMPORTANT**
 Now please respond with only an integer index or null, no other information.
`;


export const geojsonRagHelper = async (messages: any) => {
    const result = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
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
    const embedding = await getEmbedding(textToEmbed);
    const topResults = await similaritySearch(embedding);
    const selectedIndexResult = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 3000,
        temperature: 0,
        system: optionChooserSystemMessage.replace('{{ QUERY }}', textToEmbed).replace('{{ OPTIONS }}', JSON.stringify(topResults.matches)),
        messages: [
            {
                role: 'user',
                content: JSON.stringify(messages),
            },
        ],
    });
    console.log('selectedIndexResult', selectedIndexResult)
    const index = parseInt((selectedIndexResult.content[0] as any).text);
    if (index !== null && !isNaN(index)) {
        return topResults.matches[index].metadata
    } else {
        return {
            region: 'Region not found in database, unable to provide statistics',
            subregions: []
        }
    }
};