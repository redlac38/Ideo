import { postgres } from '@vercel/postgres'

// Lazily initialize the postgres client so the module can be imported
// even during build time without a DATABASE_URL.
let sql: ReturnType<typeof postgres> | null = null

export function getSql() {
  if (!sql) {
    sql = postgres()
  }
  return sql
}

export async function query(text: string, params?: unknown[]) {
  const client = getSql()
  return client.query(text, params)
}

export { postgres }
