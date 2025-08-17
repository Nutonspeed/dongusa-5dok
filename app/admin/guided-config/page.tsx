import type { Metadata } from "next"
import GuidedConfigurationDashboard from "@/components/admin/GuidedConfigurationDashboard"

export const metadata: Metadata = {
  title: "การตั้งค่าแบบมีคำแนะนำ - ELF SofaCover Pro Admin",
  description: "กำหนดค่าระบบต่าง ๆ พร้อมคำแนะนำและการสอนใช้งาน",
}

export default function GuidedConfigPage() {
  return (
    <div className="container mx-auto py-6">
      <GuidedConfigurationDashboard />
    </div>
  )
}
