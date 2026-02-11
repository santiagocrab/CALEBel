import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function query<T>(text: string, params?: Array<string | number | boolean | null | any[] | Record<string, any>>) {
  const result = await pool.query<T>(text, params);
  return result;
}
