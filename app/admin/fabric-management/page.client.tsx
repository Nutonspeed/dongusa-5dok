"use client"

import { IntegratedFabricManagement } from "@/components/integrated-fabric-management"

interface FabricManagementClientProps {
  autoAnalyze?: boolean
  autoName?: boolean
}

export default function FabricManagementClient({
  autoAnalyze = true,
  autoName = true,
}: FabricManagementClientProps) {
  const handleFabricProcessed = (fabric: unknown) => {
    console.log("Fabric processed:", fabric)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">จัดการลายผ้าและคอลเลกชัน</h1>
        <p className="text-muted-foreground mt-2">อัปโหลด วิเคราะห์ และสร้างชื่อคอลเลกชันด้วย AI อย่างครบวงจร</p>
      </div>

      <IntegratedFabricManagement
        autoAnalyze={autoAnalyze}
        autoName={autoName}
        onFabricProcessed={handleFabricProcessed}
      />
    </div>
  )
}
