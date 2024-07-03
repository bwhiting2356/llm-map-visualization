import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: Request) {
    const { pathname } = new URL(req.url);
    const region = pathname.split('/').pop();

    console.log('pathname', pathname);
    console.log('region', region);

    // Type checking to ensure region is a string
    if (typeof region !== 'string' || !region) {
        return new Response(JSON.stringify({ error: 'Invalid region parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const filePath = path.join(process.cwd(), 'data', `${region}.json`);

    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const jsonResponse = JSON.parse(fileContent);
        return new Response(JSON.stringify(jsonResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'File not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
