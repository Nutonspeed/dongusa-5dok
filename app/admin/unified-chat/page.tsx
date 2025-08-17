import type { Metadata } from "next"
import UnifiedFacebookChatDashboard from "@/components/admin/UnifiedFacebookChatDashboard"

export const metadata: Metadata = {
  title: "Unified Facebook Chat | ELF SofaCover Pro Admin",
  description: "ระบบแชท Facebook แบบรวมศูนย์ที่เหนือกว่า 365 เพจ",
}

export default function UnifiedChatPage() {
  return <UnifiedFacebookChatDashboard />
}
