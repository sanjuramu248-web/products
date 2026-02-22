import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config({
    path: './.env',
    debug: true,
})

const { DATABASE_URL } = process.env;

const sql = neon(DATABASE_URL!);

export async function getPgVersion() {
    const result = await sql`SELECT version()`;
    console.log("postgres connected", result[0]);
}