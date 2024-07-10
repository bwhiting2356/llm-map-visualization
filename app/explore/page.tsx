import { neon } from '@neondatabase/serverless';

async function getData() {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT * FROM estimates`;
    return result;
}

export default async function ExplorePage() {
    const data = await getData();
    return <div>{JSON.stringify(data)}</div>;
}
