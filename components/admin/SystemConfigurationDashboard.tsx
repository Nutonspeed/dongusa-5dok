"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Settings, Database, Mail, CreditCard, Truck, Bell } from "lucide-react"

interface SystemStatus {
  database: "connected" | "disconnected" | "error"
  email: "connected" | "mock" | "error"
  payment: "connected" | "mock" | "error"
  shipping: "connected" | "mock" | "error"
  storage: "connected" | "disconnected" | "error"
}

interface FeatureFlags {
  customCovers: boolean
  bulkOrders: boolean
  loyaltyProgram: boolean
  reviews: boolean
  wishlist: boolean
  advancedAnalytics: boolean
  bulkOperations: boolean
  exportFeatures: boolean
}

function getStatusIcon(status: string) {
  switch (status) {
    case "connected":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "mock":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    case "error":
    case "disconnected":
      return <XCircle className="h-5 w-5 text-red-500" />
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-500" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "connected":
      return (
        <Badge variant="default" className="bg-green-500">
          เชื่อมต่อแล้ว
        </Badge>
      )
    case "mock":
      return <Badge variant="secondary">โหมดทดสอบ</Badge>
    case "error":
      return <Badge variant="destructive">ข้อผิดพลาด</Badge>
    case "disconnected":
      return <Badge variant="outline">ไม่ได้เชื่อมต่อ</Badge>
    default:
      return <Badge variant="outline">ไม่ทราบสถานะ</Badge>
  }
}

export default function SystemConfigurationDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: "disconnected",
    email: "mock",
    payment: "mock",
    shipping: "mock",
    storage: "disconnected",
  })

  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    customCovers: true,
    bulkOrders: true,
    loyaltyProgram: false,
    reviews: true,
    wishlist: true,
    advancedAnalytics: true,
    bulkOperations: true,
    exportFeatures: true,
  })

  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  useEffect(() => {
    checkSystemStatus()
    loadFeatureFlags()
  }, [])

  const checkSystemStatus = async () => {
    try {
      const response = await fetch("/api/admin/system-status")
      const status = await response.json()
      setSystemStatus(status)
    } catch (error) {
      console.error("Failed to check system status:", error)
    }
  }

  const loadFeatureFlags = async () => {
    try {
      const response = await fetch("/api/admin/feature-flags")
      const flags = await response.json()
      setFeatureFlags(flags)
    } catch (error) {
      console.error("Failed to load feature flags:", error)
    }
  }

  const testConnection = async (service: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/health/${service}`)
      const result = await response.json()
      setTestResults((prev) => ({ ...prev, [service]: result }))

      // Update system status based on test result
      setSystemStatus((prev) => ({
        ...prev,
        [service]: result.status === "healthy" ? "connected" : "error",
      }))
    } catch (error) {
      setTestResults((prev) => ({ ...prev, [service]: { status: "error", error: error.message } }))
    } finally {
      setLoading(false)
    }
  }

  const updateFeatureFlag = async (flag: keyof FeatureFlags, value: boolean) => {
    try {
      await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [flag]: value }),
      })

      setFeatureFlags((prev) => ({ ...prev, [flag]: value }))
    } catch (error) {
      console.error("Failed to update feature flag:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">การกำหนดค่าระบบ</h1>
          <p className="text-muted-foreground">จัดการการเชื่อมต่อและฟีเจอร์ต่าง ๆ ของระบบ</p>
        </div>
        <Button onClick={checkSystemStatus} disabled={loading}>
          {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบสถานะ"}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="integrations">การเชื่อมต่อ</TabsTrigger>
          <TabsTrigger value="features">ฟีเจอร์</TabsTrigger>
          <TabsTrigger value="documentation">คู่มือ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ฐานข้อมูล</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.database)}
                  {getStatusBadge(systemStatus.database)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Supabase & Neon</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">อีเมล</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.email)}
                  {getStatusBadge(systemStatus.email)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">SMTP / SendGrid</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">การชำระเงิน</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.payment)}
                  {getStatusBadge(systemStatus.payment)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Stripe / PromptPay</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">การจัดส่ง</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.shipping)}
                  {getStatusBadge(systemStatus.shipping)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Thailand Post / Kerry / Flash</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">การจัดเก็บไฟล์</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.storage)}
                  {getStatusBadge(systemStatus.storage)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Vercel Blob</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">การแจ้งเตือน</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge variant="default" className="bg-green-500">
                    พร้อมใช้งาน
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">LINE Notify / Firebase</p>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ระบบที่แสดงสถานะ "โหมดทดสอบ" จะใช้ข้อมูลจำลองแทนการเชื่อมต่อจริง กรุณาตั้งค่าการเชื่อมต่อในแท็บ "การเชื่อมต่อ" เพื่อใช้งานจริง
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <IntegrationManagement
            systemStatus={systemStatus}
            onTestConnection={testConnection}
            testResults={testResults}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <FeatureFlagManagement featureFlags={featureFlags} onUpdateFlag={updateFeatureFlag} />
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <SystemDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function IntegrationManagement({
  systemStatus,
  onTestConnection,
  testResults,
  loading,
}: {
  systemStatus: SystemStatus
  onTestConnection: (service: string) => void
  testResults: Record<string, any>
  loading: boolean
}) {
  const integrations = [
    {
      id: "database",
      name: "ฐานข้อมูล",
      description: "Supabase และ Neon Database",
      status: systemStatus.database,
      envVars: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "DATABASE_URL"],
      testEndpoint: "database",
    },
    {
      id: "email",
      name: "ระบบอีเมล",
      description: "SMTP หรือ SendGrid สำหรับส่งอีเมล",
      status: systemStatus.email,
      envVars: ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SENDGRID_API_KEY"],
      testEndpoint: "email",
    },
    {
      id: "payment",
      name: "การชำระเงิน",
      description: "Stripe และ PromptPay",
      status: systemStatus.payment,
      envVars: ["STRIPE_SECRET_KEY", "PROMPTPAY_ID"],
      testEndpoint: "payment",
    },
    {
      id: "shipping",
      name: "การจัดส่ง",
      description: "Thailand Post, Kerry, Flash Express",
      status: systemStatus.shipping,
      envVars: ["THAILAND_POST_API_KEY", "KERRY_API_KEY", "FLASH_API_KEY"],
      testEndpoint: "shipping",
    },
    {
      id: "storage",
      name: "การจัดเก็บไฟล์",
      description: "Vercel Blob Storage",
      status: systemStatus.storage,
      envVars: ["BLOB_READ_WRITE_TOKEN"],
      testEndpoint: "storage",
    },
  ]

  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{integration.name}</span>
                  {getStatusIcon(integration.status)}
                </CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(integration.status)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTestConnection(integration.testEndpoint)}
                  disabled={loading}
                >
                  ทดสอบการเชื่อมต่อ
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Environment Variables ที่จำเป็น:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {integration.envVars.map((envVar) => (
                    <Badge key={envVar} variant="outline" className="text-xs">
                      {envVar}
                    </Badge>
                  ))}
                </div>
              </div>

              {testResults[integration.testEndpoint] && (
                <Alert
                  className={
                    testResults[integration.testEndpoint].status === "healthy" ? "border-green-500" : "border-red-500"
                  }
                >
                  <AlertDescription>
                    <strong>ผลการทดสอบ:</strong>{" "}
                    {testResults[integration.testEndpoint].message || testResults[integration.testEndpoint].error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FeatureFlagManagement({
  featureFlags,
  onUpdateFlag,
}: {
  featureFlags: FeatureFlags
  onUpdateFlag: (flag: keyof FeatureFlags, value: boolean) => void
}) {
  const features = [
    {
      key: "customCovers" as keyof FeatureFlags,
      name: "ผ้าคลุมโซฟาแบบกำหนดเอง",
      description: "อนุญาตให้ลูกค้าสั่งทำผ้าคลุมโซฟาตามขนาดที่ต้องการ",
    },
    {
      key: "bulkOrders" as keyof FeatureFlags,
      name: "การสั่งซื้อจำนวนมาก",
      description: "ระบบสำหรับการสั่งซื้อสินค้าจำนวนมากพร้อมส่วนลด",
    },
    {
      key: "loyaltyProgram" as keyof FeatureFlags,
      name: "โปรแกรมสะสมแต้ม",
      description: "ระบบสะสมแต้มและแลกของรางวัลสำหรับลูกค้า",
    },
    {
      key: "reviews" as keyof FeatureFlags,
      name: "รีวิวสินค้า",
      description: "อนุญาตให้ลูกค้าเขียนรีวิวและให้คะแนนสินค้า",
    },
    {
      key: "wishlist" as keyof FeatureFlags,
      name: "รายการสินค้าที่ชอบ",
      description: "ลูกค้าสามารถบันทึกสินค้าที่สนใจไว้ดูภายหลัง",
    },
    {
      key: "advancedAnalytics" as keyof FeatureFlags,
      name: "การวิเคราะห์ขั้นสูง",
      description: "รายงานและการวิเคราะห์ข้อมูลขายขั้นสูง",
    },
    {
      key: "bulkOperations" as keyof FeatureFlags,
      name: "การจัดการแบบกลุ่ม",
      description: "จัดการสินค้าและคำสั่งซื้อหลายรายการพร้อมกัน",
    },
    {
      key: "exportFeatures" as keyof FeatureFlags,
      name: "การส่งออกข้อมูล",
      description: "ส่งออกข้อมูลเป็นไฟล์ Excel, CSV, PDF",
    },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>การจัดการฟีเจอร์</CardTitle>
          <CardDescription>เปิด/ปิดฟีเจอร์ต่าง ๆ ของระบบตามความต้องการ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">{feature.name}</Label>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <Switch
                  checked={featureFlags[feature.key]}
                  onCheckedChange={(checked) => onUpdateFlag(feature.key, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SystemDocumentation() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>คู่มือการตั้งค่าระบบ</CardTitle>
          <CardDescription>คำแนะนำในการตั้งค่าการเชื่อมต่อต่าง ๆ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">1. การตั้งค่าฐานข้อมูล</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Supabase:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  สร้างโปรเจกต์ใหม่ที่{" "}
                  <a href="https://supabase.com" className="text-blue-500 hover:underline">
                    supabase.com
                  </a>
                </li>
                <li>คัดลอก URL และ anon key จาก Settings → API</li>
                <li>ตั้งค่า Environment Variables: SUPABASE_URL, SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">2. การตั้งค่าระบบอีเมล</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>SMTP:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>ใช้ Gmail SMTP: smtp.gmail.com, port 587</li>
                <li>สร้าง App Password สำหรับ Gmail</li>
                <li>ตั้งค่า: SMTP_HOST, SMTP_USER, SMTP_PASS</li>
              </ul>
              <p>
                <strong>SendGrid:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  สมัครสมาชิกที่{" "}
                  <a href="https://sendgrid.com" className="text-blue-500 hover:underline">
                    sendgrid.com
                  </a>
                </li>
                <li>สร้าง API Key จาก Settings → API Keys</li>
                <li>ตั้งค่า: SENDGRID_API_KEY</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">3. การตั้งค่าการชำระเงิน</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Stripe:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  สร้างบัญชีที่{" "}
                  <a href="https://stripe.com" className="text-blue-500 hover:underline">
                    stripe.com
                  </a>
                </li>
                <li>รับ Secret Key จาก Dashboard → Developers → API keys</li>
                <li>ตั้งค่า: STRIPE_SECRET_KEY</li>
              </ul>
              <p>
                <strong>PromptPay:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>ใช้เบอร์โทรศัพท์หรือเลขประจำตัวประชาชน</li>
                <li>ตั้งค่า: PROMPTPAY_ID, PROMPTPAY_MERCHANT_NAME</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">4. การตั้งค่าการจัดส่ง</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Thailand Post:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>สมัครใช้บริการ API ที่ไปรษณีย์ไทย</li>
                <li>ตั้งค่า: THAILAND_POST_API_KEY, THAILAND_POST_CUSTOMER_CODE</li>
              </ul>
              <p>
                <strong>Kerry Express:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>ติดต่อ Kerry Express เพื่อขอ API access</li>
                <li>ตั้งค่า: KERRY_API_KEY, KERRY_API_SECRET</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">5. การตั้งค่าการจัดเก็บไฟล์</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Vercel Blob:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>เปิดใช้งาน Blob Storage ใน Vercel Dashboard</li>
                <li>คัดลอก Token จาก Storage → Blob</li>
                <li>ตั้งค่า: BLOB_READ_WRITE_TOKEN</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>หมายเหตุ:</strong> หลังจากตั้งค่า Environment Variables แล้ว กรุณา restart แอปพลิเคชันและทดสอบการเชื่อมต่อในแท็บ
          "การเชื่อมต่อ"
        </AlertDescription>
      </Alert>
    </div>
  )
}
