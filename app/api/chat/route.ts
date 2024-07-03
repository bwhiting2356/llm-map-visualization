import { getClaudeResponseAndHandleToolCall } from './claude';

export async function POST(req: Request) {
    const { messages } = await req.json();
    const result = await getClaudeResponseAndHandleToolCall(messages);
    return Response.json(result);
}
