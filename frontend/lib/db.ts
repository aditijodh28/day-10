import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

console.log(
  "DATABASE_URL:",
  connectionString ? "FOUND" : "MISSING"
);

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Check .env.local");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const sql = async (
  text: string,
  values: any[] = []
) => {
  const result = await pool.query(text, values);
  return result.rows;
};