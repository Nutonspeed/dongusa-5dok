import fs from "fs"; import path from "path"; import { Client } from "pg";
const DB = process.env.DATABASE_URL;
if (!DB) { console.error("❌ DATABASE_URL missing"); process.exit(1); }
const MIG_DIR = path.resolve("supabase/migrations");
(async () => {
  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false }});
  await client.connect();
  const files = fs.readdirSync(MIG_DIR).filter(f=>f.endsWith(".sql")).sort();
  for (const f of files) {
    const sql = fs.readFileSync(path.join(MIG_DIR,f), "utf8");
    process.stdout.write(`>> Applying ${f} ... `);
    try { await client.query("BEGIN"); await client.query(sql); await client.query("COMMIT"); console.log("OK"); }
    catch (e:any){ await client.query("ROLLBACK"); console.error(`FAIL\n${e.message}`); process.exit(1); }
  }
  await client.end(); console.log("✅ All migrations applied");
})();
