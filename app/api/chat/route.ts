import { getClaudeResponseAndHandleToolCall, nigeriaStateProperties, provinceProperties, stateProperties } from './claude';

export async function POST(req: Request) {
    const { messages } = await req.json();
    const result = await getClaudeResponseAndHandleToolCall(messages, nigeriaStateProperties);
    return Response.json(result);
}
