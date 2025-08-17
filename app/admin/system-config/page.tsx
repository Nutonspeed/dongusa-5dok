import type { Metadata } from "next"
import AdvancedSystemConfigurationDashboard from "@/components/admin/AdvancedSystemConfigurationDashboard"

export const metadata: Metadata = {
  title: "ระบบกำหนดค่าขั้นสูง - SofaCover Pro Admin",
  description: "จัดการการเชื่อมต่อ ฟีเจอร์ และการตั้งค่าระบบแบบครบวงจร",
}

export default function SystemConfigPage() {
  return (
    <div className="container mx-auto py-6">
      <AdvancedSystemConfigurationDashboard />
    </div>
  )
}
