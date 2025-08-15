import { IntegratedFabricManagement } from "@/components/integrated-fabric-management"

export default function FabricManagementPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">จัดการลายผ้าและคอลเลกชัน</h1>
        <p className="text-muted-foreground mt-2">อัปโหลด วิเคราะห์ และสร้างชื่อคอลเลกชันด้วย AI อย่างครบวงจร</p>
      </div>

      <IntegratedFabricManagement
        autoAnalyze={true}
        autoName={true}
        onFabricProcessed={(fabric) => {
          console.log("Fabric processed:", fabric)
        }}
      />
    </div>
  )
}
