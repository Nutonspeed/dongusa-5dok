import { createClient } from "@supabase/supabase-js"

async function validateDatabaseSetup() {
  console.log("🔍 ตรวจสอบการเชื่อมต่อฐานข้อมูล Supabase...")

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    // ตรวจสอบการเชื่อมต่อ
    const { data: connectionTest, error: connectionError } = await supabase.from("profiles").select("count").limit(1)

    if (connectionError) {
      console.error("❌ การเชื่อมต่อฐานข้อมูลล้มเหลว:", connectionError.message)
      return false
    }

    console.log("✅ การเชื่อมต่อฐานข้อมูลสำเร็จ")

    // ตรวจสอบตารางที่จำเป็น
    const requiredTables = [
      "profiles",
      "products",
      "categories",
      "orders",
      "order_items",
      "cart_items",
      "fabrics",
      "fabric_collections",
      "customer_reviews",
      "wishlists",
      "loyalty_points",
      "unified_conversations",
      "unified_messages",
      "facebook_pages",
      "ai_chat_performance",
      "bug_reports",
      "user_feedback",
      "system_settings",
    ]

    console.log("🔍 ตรวจสอบตารางที่จำเป็น...")

    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select("*").limit(1)
      if (error) {
        console.error(`❌ ตาราง ${table} ไม่พร้อมใช้งาน:`, error.message)
        return false
      }
    }

    console.log(`✅ ตรวจสอบตารางทั้งหมด ${requiredTables.length} ตาราง - พร้อมใช้งาน`)

    // ตรวจสอบ RLS policies
    console.log("🔍 ตรวจสอบ Row Level Security...")

    const { data: policies, error: policyError } = await supabase.rpc("get_policies_info").single()

    if (!policyError) {
      console.log("✅ Row Level Security ตั้งค่าเรียบร้อย")
    }

    return true
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการตรวจสอบฐานข้อมูล:", error)
    return false
  }
}

async function seedInitialData() {
  console.log("🌱 เริ่มการ seed ข้อมูลเริ่มต้น...")

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
    const { data: existingCategories } = await supabase.from("categories").select("id").limit(1)

    if (existingCategories && existingCategories.length > 0) {
      console.log("ℹ️  ข้อมูลเริ่มต้นมีอยู่แล้ว - ข้าม seed process")
      return true
    }

    // Seed categories
    const { error: categoryError } = await supabase.from("categories").insert([
      {
        name: "ผ้าคลุมโซฟา",
        slug: "sofa-covers",
        description: "ผ้าคลุมโซฟาคุณภาพสูง",
        is_active: true,
      },
      {
        name: "ผ้าคลุมเก้าอี้",
        slug: "chair-covers",
        description: "ผ้าคลุมเก้าอี้ทุกรูปแบบ",
        is_active: true,
      },
    ])

    if (categoryError) {
      console.error("❌ ไม่สามารถ seed categories:", categoryError.message)
      return false
    }

    // Seed fabric collections
    const { error: collectionError } = await supabase.from("fabric_collections").insert([
      {
        name: "Premium Collection",
        slug: "premium",
        description: "คอลเลกชันผ้าพรีเมียม",
        is_featured: true,
        is_active: true,
      },
    ])

    if (collectionError) {
      console.error("❌ ไม่สามารถ seed fabric collections:", collectionError.message)
      return false
    }

    // Seed system settings
    const { error: settingsError } = await supabase.from("system_settings").insert([
      {
        key: "store_name",
        value: '"ELF SofaCover Pro"',
        description: "ชื่อร้านค้า",
      },
      {
        key: "store_status",
        value: '"active"',
        description: "สถานะร้านค้า",
      },
    ])

    if (settingsError) {
      console.error("❌ ไม่สามารถ seed system settings:", settingsError.message)
      return false
    }

    console.log("✅ Seed ข้อมูลเริ่มต้นสำเร็จ")
    return true
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการ seed ข้อมูล:", error)
    return false
  }
}

async function main() {
  console.log("🚀 เริ่มการตั้งค่าฐานข้อมูล ELF SofaCover Pro\n")

  const isValid = await validateDatabaseSetup()
  if (!isValid) {
    console.error("❌ การตั้งค่าฐานข้อมูลล้มเหลว")
    process.exit(1)
  }

  const seedSuccess = await seedInitialData()
  if (!seedSuccess) {
    console.error("❌ การ seed ข้อมูลล้มเหลว")
    process.exit(1)
  }

  console.log("\n" + "=".repeat(60))
  console.log("✅ การตั้งค่าฐานข้อมูลเสร็จสิ้น")
  console.log("=".repeat(60))
}

main().catch(console.error)
