import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../src/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations')

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `)
}

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Aborting migration.')
    process.exit(1)
  }
  const files = (await fs.readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()
  const client = await pool.connect()
  try {
    await ensureTable(client)
    const { rows } = await client.query('SELECT filename FROM schema_migrations')
    const applied = new Set(rows.map((r) => r.filename))
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`· skip ${file}`)
        continue
      }
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8')
      console.log(`→ applying ${file}`)
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations(filename) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log(`✓ ${file}`)
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      }
    }
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch((err) => {
  console.error('[migrate] failed:', err)
  process.exit(1)
})
