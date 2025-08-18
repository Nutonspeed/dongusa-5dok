#!/usr/bin/env tsx

/**
 * ตรวจสอบและแก้ไขระบบอัตโนมัติ
 * รันสคริปต์ validation และ fix ตามลำดับ
 */

import { BuildSystemValidator } from "./validate-build-system"
import { ModuleSystemFixer } from "./fix-module-system"

async function runSystemValidationAndFix() {
  console.log("🚀 เริ่มการตรวจสอบและแก้ไขระบบ ELF SofaCover Pro")
  console.log("=".repeat(70))

  try {
    // Step 1: รันการตรวจสอบระบบ
    console.log("📋 ขั้นตอนที่ 1: ตรวจสอบระบบ")
    const validator = new BuildSystemValidator()
    const validationResult = await validator.validate()

    console.log("\n" + "=".repeat(50))

    // Step 2: แก้ไขปัญหาที่พบ
    console.log("🔧 ขั้นตอนที่ 2: แก้ไขปัญหาอัตโนมัติ")
    const fixer = new ModuleSystemFixer()
    await fixer.fixAll()

    console.log("\n" + "=".repeat(50))

    // Step 3: ตรวจสอบอีกครั้งหลังแก้ไข
    console.log("✅ ขั้นตอนที่ 3: ตรวจสอบหลังแก้ไข")
    const finalValidator = new BuildSystemValidator()
    const finalResult = await finalValidator.validate()

    console.log("\n" + "=".repeat(70))
    console.log("📊 สรุปผลการดำเนินการ:")

    if (finalResult.success) {
      console.log("🎉 ระบบพร้อมใช้งาน! ปัญหาทั้งหมดได้รับการแก้ไขแล้ว")
      console.log("✅ สามารถ deploy ได้อย่างปลอดภัย")
    } else {
      console.log("⚠️  ยังมีปัญหาบางอย่างที่ต้องแก้ไขด้วยตนเอง:")
      finalResult.errors.forEach((error) => console.log(`  ❌ ${error}`))
      finalResult.warnings.forEach((warning) => console.log(`  ⚠️  ${warning}`))
    }

    console.log("\n💡 คำแนะนำสำหรับอนาคต:")
    console.log("1. รันสคริปต์นี้ก่อน deploy ทุกครั้ง")
    console.log("2. เพิ่มใน CI/CD pipeline เป็น pre-build step")
    console.log("3. ใช้ pre-commit hooks เพื่อป้องกันปัญหา")
    console.log("4. ตั้งค่า dependency version locks ใน package.json")

    return finalResult.success
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการรันสคริปต์:", error)
    return false
  }
}

// รันสคริปต์
runSystemValidationAndFix().then((success) => {
  process.exit(success ? 0 : 1)
})
