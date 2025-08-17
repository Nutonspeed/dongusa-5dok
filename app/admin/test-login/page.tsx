import { LoginSystemTestDashboard } from "@/components/LoginSystemTestDashboard"

export default function TestLoginPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ทดสอบระบบล็อกอิน</h1>
        <p className="text-muted-foreground mt-2">ทดสอบและตรวจสอบการทำงานของระบบล็อกอินทั้งหมด</p>
      </div>

      <LoginSystemTestDashboard />
    </div>
  )
}
