import { Client } from "pg";
const DB = process.env.DATABASE_URL;
if (!DB) { console.error("❌ DATABASE_URL missing"); process.exit(1); }
(async () => {
  const c = new Client({ connectionString: DB }); await c.connect();
  await c.query(`
  insert into categories (id,slug,name,created_at)
  values (gen_random_uuid(),'general','General',now())
  on conflict (slug) do nothing;
  insert into products (id,category_id,slug,name,price,is_active,created_at)
  select gen_random_uuid(), c.id, 'qa-test-product','QA Test Product',19900,true, now()
  from categories c where c.slug='general'
  and not exists (select 1 from products where slug='qa-test-product');
  insert into customers (id,email,name,created_at)
  values (gen_random_uuid(),'qa@example.com','QA User',now())
  on conflict (email) do nothing;
  `);
  await c.end(); console.log("✅ Seed inserted");
})();
