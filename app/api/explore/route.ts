import { neon } from '@neondatabase/serverless';

export async function GET(req: Request) {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);
    const result = await sql`SELECT * FROM maps LIMIT ${limit} OFFSET ${offset}`;

    return new Response(JSON.stringify(result));
}