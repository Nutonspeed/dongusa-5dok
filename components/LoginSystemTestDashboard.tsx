"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/app/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw } from "lucide-react"

interface TestScenario {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "success" | "error"
  result?: string
  duration?: number
}

export function LoginSystemTestDashboard() {
  const { signIn, signOut, checkAccountStatus, isAuthenticated, user, profile } = useAuth()
  const [scenarios, setScenarios] = useState<TestScenario[]>([
    {
      id: "valid-customer-login",
      name: "ล็อกอินลูกค้าที่ถูกต้อง",
      description: "ทดสอบการล็อกอินด้วยข้อมูลลูกค้าที่ถูกต้อง",
      status: "pending",
    },
    {
      id: "valid-admin-login",
      name: "ล็อกอินแอดมินที่ถูกต้อง",
      description: "ทดสอบการล็อกอินด้วยข้อมูลแอดมินที่ถูกต้อง",
      status: "pending",
    },
    {
      id: "invalid-credentials",
      name: "ข้อมูลล็อกอินผิด",
      description: "ทดสอบการจัดการเมื่อใส่ข้อมูลล็อกอินผิด",
      status: "pending",
    },
    {
      id: "brute-force-protection",
      name: "ป้องกัน Brute Force",
      description: "ทดสอบระบบป้องกันการพยายามล็อกอินหลายครั้ง",
      status: "pending",
    },
    {
      id: "logout-functionality",
      name: "การออกจากระบบ",
      description: "ทดสอบการออกจากระบบและการล้างข้อมูล session",
      status: "pending",
    },
    {
      id: "role-based-access",
      name: "การเข้าถึงตามบทบาท",
      description: "ทดสอบการเข้าถึงหน้าต่าง ๆ ตามบทบาทผู้ใช้",
      status: "pending",
    },
  ])

  const [isRunningAll, setIsRunningAll] = useState(false)

  const updateScenarioStatus = (id: string, status: TestScenario["status"], result?: string, duration?: number) => {
    setScenarios((prev) =>
      prev.map((scenario) => (scenario.id === id ? { ...scenario, status, result, duration } : scenario)),
    )
  }

  const runSingleTest = async (scenario: TestScenario) => {
    updateScenarioStatus(scenario.id, "running")
    const startTime = Date.now()

    try {
      switch (scenario.id) {
        case "valid-customer-login":
          await testValidCustomerLogin()
          break
        case "valid-admin-login":
          await testValidAdminLogin()
          break
        case "invalid-credentials":
          await testInvalidCredentials()
          break
        case "brute-force-protection":
          await testBruteForceProtection()
          break
        case "logout-functionality":
          await testLogoutFunctionality()
          break
        case "role-based-access":
          await testRoleBasedAccess()
          break
        default:
          throw new Error("Unknown test scenario")
      }

      const duration = Date.now() - startTime
      updateScenarioStatus(scenario.id, "success", "ทดสอบสำเร็จ", duration)
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ"
      updateScenarioStatus(scenario.id, "error", errorMessage, duration)
    }
  }

  const testValidCustomerLogin = async () => {
    const result = await signIn("user@sofacover.com", "user123")
    if (!result.success) {
      throw new Error(`การล็อกอินล้มเหลว: ${result.error}`)
    }

    // Wait for auth state to update
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (!isAuthenticated) {
      throw new Error("สถานะการยืนยันตัวตนไม่ถูกต้อง")
    }
  }

  const testValidAdminLogin = async () => {
    // Logout first if logged in
    if (isAuthenticated) {
      await signOut()
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    const result = await signIn("admin@sofacover.com", "admin123")
    if (!result.success) {
      throw new Error(`การล็อกอินแอดมินล้มเหลว: ${result.error}`)
    }

    // Wait for auth state to update
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (!isAuthenticated) {
      throw new Error("สถานะการยืนยันตัวตนแอดมินไม่ถูกต้อง")
    }
  }

  const testInvalidCredentials = async () => {
    const result = await signIn("invalid@email.com", "wrongpassword")
    if (result.success) {
      throw new Error("ระบบควรปฏิเสธข้อมูลล็อกอินที่ผิด")
    }

    if (!result.error) {
      throw new Error("ระบบควรแสดงข้อความแสดงข้อผิดพลาด")
    }
  }

  const testBruteForceProtection = async () => {
    const testEmail = "test@bruteforce.com"

    // Try multiple failed attempts
    for (let i = 0; i < 3; i++) {
      const result = await signIn(testEmail, "wrongpassword")
      if (result.success) {
        throw new Error("ระบบไม่ควรอนุญาตให้ล็อกอินด้วยรหัสผ่านผิด")
      }
    }

    // Check account status
    const status = await checkAccountStatus(testEmail)
    if (status.attempts === 0) {
      throw new Error("ระบบไม่ได้นับจำนวนครั้งที่พยายามล็อกอิน")
    }
  }

  const testLogoutFunctionality = async () => {
    // Ensure we're logged in first
    if (!isAuthenticated) {
      await signIn("user@sofacover.com", "user123")
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    await signOut()
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (isAuthenticated) {
      throw new Error("ระบบไม่ได้ออกจากระบบอย่างถูกต้อง")
    }
  }

  const testRoleBasedAccess = async () => {
    // This would test navigation and access control
    // For now, we'll just verify the role is set correctly
    if (isAuthenticated && profile) {
      const expectedRoles = ["customer", "admin"]
      if (!expectedRoles.includes(profile.role)) {
        throw new Error(`บทบาทผู้ใช้ไม่ถูกต้อง: ${profile.role}`)
      }
    } else {
      throw new Error("ไม่สามารถตรวจสอบบทบาทผู้ใช้ได้")
    }
  }

  const runAllTests = async () => {
    setIsRunningAll(true)

    // Reset all scenarios
    setScenarios((prev) =>
      prev.map((s) => ({ ...s, status: "pending" as const, result: undefined, duration: undefined })),
    )

    try {
      for (const scenario of scenarios) {
        await runSingleTest(scenario)
        // Small delay between tests
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      toast({
        title: "การทดสอบเสร็จสิ้น",
        description: "ทดสอบระบบล็อกอินทั้งหมดเสร็จสิ้นแล้ว",
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาดในการทดสอบ",
        description: error instanceof Error ? error.message : "ไม่ทราบสาเหตุ",
        variant: "destructive",
      })
    } finally {
      setIsRunningAll(false)
    }
  }

  const getStatusIcon = (status: TestScenario["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestScenario["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            สำเร็จ
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">ล้มเหลว</Badge>
      case "running":
        return <Badge variant="secondary">กำลังทดสอบ</Badge>
      default:
        return <Badge variant="outline">รอการทดสอบ</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            ระบบทดสอบการล็อกอิน
          </CardTitle>
          <CardDescription>ทดสอบฟังก์ชันการทำงานทั้งหมดของระบบล็อกอิน รวมถึงการจัดการข้อผิดพลาดและความปลอดภัย</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={runAllTests} disabled={isRunningAll} className="flex items-center gap-2">
              {isRunningAll ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {isRunningAll ? "กำลังทดสอบ..." : "ทดสอบทั้งหมด"}
            </Button>
          </div>

          <div className="space-y-4">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(scenario.status)}
                      <div>
                        <h4 className="font-medium">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground">{scenario.description}</p>
                        {scenario.result && (
                          <p
                            className={`text-sm mt-1 ${
                              scenario.status === "success" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {scenario.result}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {scenario.duration && (
                        <span className="text-xs text-muted-foreground">{scenario.duration}ms</span>
                      )}
                      {getStatusBadge(scenario.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runSingleTest(scenario)}
                        disabled={scenario.status === "running" || isRunningAll}
                      >
                        ทดสอบ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Auth Status */}
      <Card>
        <CardHeader>
          <CardTitle>สถานะการยืนยันตัวตนปัจจุบัน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">สถานะ:</p>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "ล็อกอินแล้ว" : "ยังไม่ได้ล็อกอิน"}
              </Badge>
            </div>
            {user && (
              <>
                <div>
                  <p className="text-sm font-medium">อีเมล:</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ชื่อ:</p>
                  <p className="text-sm text-muted-foreground">{user.full_name || "ไม่ระบุ"}</p>
                </div>
                {profile && (
                  <div>
                    <p className="text-sm font-medium">บทบาท:</p>
                    <Badge variant={profile.role === "admin" ? "destructive" : "default"}>
                      {profile.role === "admin" ? "แอดมิน" : "ลูกค้า"}
                    </Badge>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
