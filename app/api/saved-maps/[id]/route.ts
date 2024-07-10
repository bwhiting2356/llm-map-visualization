import { neon } from '@neondatabase/serverless';

export async function GET(req: Request, { params }: any) {
    const { id } = params;
    console.log('id', id);

    const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL!);
    const result = await sql`SELECT * FROM maps WHERE uuid = ${id} LIMIT 1`;

    if (result.length === 0) {
        return new Response('Map not found', { status: 404 });
    }

    return new Response(JSON.stringify(result[0]));
}
