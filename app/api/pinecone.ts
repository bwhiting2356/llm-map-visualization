import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedding } from './openai';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' });

export const TOP_K = 10;

const indexName = 'message-index';

export type MessageMetadata = {
    message: string;
    date: string;
    userId: string;
};

export const index = pc.index<MessageMetadata>(indexName);

export const upsertMessages = async (metadataArray: MessageMetadata[]) => {
    const records = await Promise.all(
        metadataArray.map(async metadata => {
            const embedding = await getEmbedding(metadata.message);
            return {
                id: metadata.date,
                values: embedding,
                metadata,
            };
        }),
    );

    await index.upsert(records);
};

export const queryMessages = async (query: string, userId: string) => {
    const embedding = await getEmbedding(query);
    const filter = {
        userId: { $eq: userId },
    };

    return index.query({
        vector: embedding,
        filter: filter,
        topK: TOP_K,
        includeMetadata: true,
    });
};
