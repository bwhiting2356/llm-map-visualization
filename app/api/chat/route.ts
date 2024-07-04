export const maxDuration = 35;

import { geojsonRagHelper, getClaudeResponseAndHandleToolCall } from './claude';

export async function POST(req: Request) {
    const { messages } = await req.json();
    const filteredMessages = messages.map((m: any) => {
        // TODO: make this a helper function
        const { id, type, model, stop_reason, stop_sequence, usage, ...rest } = m;
        return rest;
    });
    const regionRAGResult = await geojsonRagHelper(filteredMessages);
    console.log('regionRAGResult', regionRAGResult);
    const result = await getClaudeResponseAndHandleToolCall(messages, regionRAGResult);
    return Response.json(result);
}
