import { Pool } from "pg"

export async function getPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: { rejectUnauthorized: false },
  })

  pool.on("error", (error, _client) => {
    console.error(error, "Unexpected error on embedding Pool client")
  })

  return pool
}
