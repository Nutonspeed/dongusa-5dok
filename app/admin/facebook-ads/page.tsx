import type { Metadata } from "next"
import AdvancedFacebookAdvertisingDashboard from "@/components/marketing/AdvancedFacebookAdvertisingDashboard"

export const metadata: Metadata = {
  title: "Facebook Advertising | ELF SofaCover Pro Admin",
  description:
    "Advanced Facebook advertising management system with AI-powered audience targeting and campaign optimization",
}

export default function FacebookAdsPage() {
  return <AdvancedFacebookAdvertisingDashboard />
}
