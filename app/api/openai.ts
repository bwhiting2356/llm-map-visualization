import OpenAI from 'openai';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function getEmbedding(message: string) {
    const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: message,
    });
    return embeddingResponse.data[0].embedding;
}
