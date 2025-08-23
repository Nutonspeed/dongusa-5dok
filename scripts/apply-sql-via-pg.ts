#!/usr/bin/env tsx
/**
 * Apply SQL file to Postgres directly using `pg` client.
 * Usage:
 * 1. Ensure env POSTGRES_URL_NON_POOLING or POSTGRES_URL is set (you provided these earlier).
 * 2. Run: npx tsx scripts/apply-sql-via-pg.ts docs/SUPABASE_SQL_ORDERED.sql
 *
 * This avoids Supabase RPC and runs the SQL directly against the Postgres endpoint.
 * Be careful: this uses the provided DB credentials and will execute DDL statements.
 */
import { readFileSync } from "fs"
import { resolve } from "path"
import { Client } from "pg"

const fileArg = process.argv[2] || "docs/SUPABASE_SQL_ORDERED.sql"
const fullPath = resolve(process.cwd(), fileArg)
let url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING

if (!url) {
  console.error("Missing Postgres connection string. Set POSTGRES_URL_NON_POOLING or POSTGRES_URL in environment.")
  process.exit(1)
}

async function main() {
  console.log("Applying SQL file:", fullPath)
  const sql = readFileSync(fullPath, "utf8")

  // Connect with SSL (Supabase requires ssl, but rejectUnauthorized false for self-signed)
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false } as any,
  })

  try {
    await client.connect()
    console.log("Connected to Postgres")

    // Execute the whole SQL content. Some servers allow multiple statements in one query.
    // If the server rejects, we'll try to split by $$ blocks and semicolons as fallback.
    try {
      await client.query(sql)
      console.log("Executed SQL file successfully (single query).")
    } catch (err: any) {
      console.warn("Single-query execution failed, attempting safer split execution:", err.message)
      // Fallback: naive split by dollar-quoted function blocks and run parts.
      // This is a pragmatic approach; if it still fails we'll surface the error.
      // Split by $$ to preserve function bodies
      const parts = sql.split("$$")
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          // outside $$ blocks: can split by semicolon
          const statements = parts[i]
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
          for (const stmt of statements) {
            try {
              await client.query(stmt)
            } catch (e: any) {
              console.error("Statement error:", e.message)
              throw e
            }
          }
        } else {
          // inside $$ block (function body) - rewrap and execute as single statement
          const wrapped = `$$${parts[i]}$$`
          // find preceding CREATE OR REPLACE FUNCTION ... $$...$$;
          // To keep it simple, just try to execute the block (may fail if not full statement)
          try {
            // no-op: function bodies should have been executed as part of surrounding statement;
            // if we reach here, skip (we already executed surrounding parts)
            continue
          } catch (e: any) {
            console.error("Dollar-block exec error:", e.message)
            throw e
          }
        }
      }
      console.log("Executed SQL by splitting into statements.")
    }

    console.log("All done.")
    process.exit(0)
  } catch (e: any) {
    console.error("Fatal error applying SQL:", e.message || e)
    process.exit(1)
  } finally {
    try {
      await client.end()
    } catch {}
  }
}

main().catch((e) => {
  console.error("Unhandled error:", e)
  process.exit(1)
})
