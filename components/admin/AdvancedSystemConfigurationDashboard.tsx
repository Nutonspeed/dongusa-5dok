"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Mail,
  CreditCard,
  Truck,
  TestTube,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Zap,
  Shield,
  Monitor,
  Activity,
} from "lucide-react"

interface SystemStatus {
  database: "connected" | "disconnected" | "error"
  email: "connected" | "mock" | "error"
  payment: "connected" | "mock" | "error"
  shipping: "connected" | "mock" | "error"
  storage: "connected" | "disconnected" | "error"
  cache: "connected" | "disconnected" | "error"
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
  aiRecommendations: boolean
  realTimeNotifications: boolean
}

interface IntegrationConfig {
  id: string
  name: string
  description: string
  status: string
  envVars: string[]
  testEndpoint: string
  icon: any
  category: string
  priority: "high" | "medium" | "low"
  documentation: string
}

function getStatusIcon(status: string) {
  switch (status) {
    case "connected":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "mock":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
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
      return <Badge className="bg-green-500 hover:bg-green-600">เชื่อมต่อแล้ว</Badge>
    case "mock":
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          โหมดทดสอบ
        </Badge>
      )
    case "error":
      return <Badge variant="destructive">ข้อผิดพลาด</Badge>
    case "disconnected":
      return <Badge variant="outline">ไม่ได้เชื่อมต่อ</Badge>
    default:
      return <Badge variant="outline">ไม่ทราบสถานะ</Badge>
  }
}

export default function AdvancedSystemConfigurationDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: "connected",
    email: "mock",
    payment: "mock",
    shipping: "mock",
    storage: "connected",
    cache: "connected",
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
    aiRecommendations: false,
    realTimeNotifications: true,
  })

  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [configBackup, setConfigBackup] = useState<any>(null)

  const integrations: IntegrationConfig[] = [
    {
      id: "database",
      name: "ฐานข้อมูล",
      description: "Supabase และ Neon Database สำหรับจัดเก็บข้อมูลหลัก",
      status: systemStatus.database,
      envVars: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "DATABASE_URL"],
      testEndpoint: "database",
      icon: Database,
      category: "core",
      priority: "high",
      documentation: "https://supabase.com/docs",
    },
    {
      id: "email",
      name: "ระบบอีเมล",
      description: "SMTP หรือ SendGrid สำหรับส่งอีเมลแจ้งเตือนและการตลาด",
      status: systemStatus.email,
      envVars: ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SENDGRID_API_KEY"],
      testEndpoint: "email",
      icon: Mail,
      category: "communication",
      priority: "high",
      documentation: "https://sendgrid.com/docs",
    },
    {
      id: "payment",
      name: "การชำระเงิน",
      description: "Stripe และ PromptPay สำหรับรับชำระเงิน",
      status: systemStatus.payment,
      envVars: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "PROMPTPAY_ID"],
      testEndpoint: "payment",
      icon: CreditCard,
      category: "commerce",
      priority: "high",
      documentation: "https://stripe.com/docs",
    },
    {
      id: "shipping",
      name: "การจัดส่ง",
      description: "Thailand Post, Kerry, Flash Express สำหรับจัดส่งสินค้า",
      status: systemStatus.shipping,
      envVars: ["THAILAND_POST_API_KEY", "KERRY_API_KEY", "FLASH_API_KEY"],
      testEndpoint: "shipping",
      icon: Truck,
      category: "logistics",
      priority: "medium",
      documentation: "https://developer.thailandpost.co.th",
    },
    {
      id: "storage",
      name: "การจัดเก็บไฟล์",
      description: "Vercel Blob Storage สำหรับจัดเก็บรูปภาพและไฟล์",
      status: systemStatus.storage,
      envVars: ["BLOB_READ_WRITE_TOKEN"],
      testEndpoint: "storage",
      icon: Database,
      category: "core",
      priority: "high",
      documentation: "https://vercel.com/docs/storage/vercel-blob",
    },
    {
      id: "cache",
      name: "ระบบแคช",
      description: "Upstash Redis สำหรับแคชข้อมูลและเพิ่มประสิทธิภาพ",
      status: systemStatus.cache,
      envVars: ["KV_REST_API_URL", "KV_REST_API_TOKEN"],
      testEndpoint: "cache",
      icon: Zap,
      category: "performance",
      priority: "medium",
      documentation: "https://upstash.com/docs/redis",
    },
  ]

  useEffect(() => {
    checkSystemStatus()
    loadFeatureFlags()
    loadConfigBackup()
  }, [])

  const checkSystemStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/system-status")
      if (response.ok) {
        const status = await response.json()
        setSystemStatus(status)
      }
    } catch (error) {
      console.error("Failed to check system status:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadFeatureFlags = async () => {
    try {
      const response = await fetch("/api/admin/feature-flags")
      if (response.ok) {
        const flags = await response.json()
        setFeatureFlags(flags)
      }
    } catch (error) {
      console.error("Failed to load feature flags:", error)
    }
  }

  const loadConfigBackup = async () => {
    try {
      const response = await fetch("/api/admin/config-backup")
      if (response.ok) {
        const backup = await response.json()
        setConfigBackup(backup)
      }
    } catch (error) {
      console.error("Failed to load config backup:", error)
    }
  }

  const testConnection = async (service: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/health/${service}`)
      const result = await response.json()
      setTestResults((prev) => ({ ...prev, [service]: result }))

      setSystemStatus((prev) => ({
        ...prev,
        [service]: result.status === "healthy" ? "connected" : "error",
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setTestResults((prev) => ({
        ...prev,
        [service]: { status: "error", error: message },
      }))
    } finally {
      setLoading(false)
    }
  }

  const updateFeatureFlag = async (flag: keyof FeatureFlags, value: boolean) => {
    try {
      const response = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [flag]: value }),
      })

      if (response.ok) {
        setFeatureFlags((prev) => ({ ...prev, [flag]: value }))
      }
    } catch (error) {
      console.error("Failed to update feature flag:", error)
    }
  }

  const exportConfiguration = async () => {
    try {
      const config = {
        systemStatus,
        featureFlags,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      }

      const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `system-config-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export configuration:", error)
    }
  }

  const toggleSecretVisibility = (envVar: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [envVar]: !prev[envVar],
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getOverallHealthScore = () => {
    const statuses = Object.values(systemStatus)
    const connected = statuses.filter((s) => s === "connected").length
    return Math.round((connected / statuses.length) * 100)
  }

  const getCategoryIntegrations = (category: string) => {
    return integrations.filter((integration) => integration.category === category)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ระบบกำหนดค่าขั้นสูง</h1>
          <p className="text-muted-foreground mt-1">จัดการการเชื่อมต่อ ฟีเจอร์ และการตั้งค่าระบบแบบครบวงจร</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" onClick={loadConfigBackup}>
            <Upload className="w-4 h-4 mr-2" />
            นำเข้าการตั้งค่า
          </Button>
          <Button variant="outline" onClick={exportConfiguration}>
            <Download className="w-4 h-4 mr-2" />
            ส่งออกการตั้งค่า
          </Button>
          <Button onClick={checkSystemStatus} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบสถานะ"}
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="admin-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">สุขภาพระบบโดยรวม</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-2xl font-bold text-primary">{getOverallHealthScore()}%</div>
                </div>
              </div>
              <Monitor className="w-8 h-8 text-primary" />
            </div>
            <Progress value={getOverallHealthScore()} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card className="admin-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">การเชื่อมต่อที่ใช้งานได้</p>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(systemStatus).filter((s) => s === "connected").length}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="admin-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">โหมดทดสอบ</p>
                <div className="text-2xl font-bold text-amber-600">
                  {Object.values(systemStatus).filter((s) => s === "mock").length}
                </div>
              </div>
              <TestTube className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="admin-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ฟีเจอร์ที่เปิดใช้งาน</p>
                <div className="text-2xl font-bold text-primary">
                  {Object.values(featureFlags).filter(Boolean).length}
                </div>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Configuration Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="integrations">การเชื่อมต่อ</TabsTrigger>
          <TabsTrigger value="features">ฟีเจอร์</TabsTrigger>
          <TabsTrigger value="monitoring">การติดตาม</TabsTrigger>
          <TabsTrigger value="documentation">คู่มือ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SystemOverview
            systemStatus={systemStatus}
            integrations={integrations}
            healthScore={getOverallHealthScore()}
          />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationManagement
            integrations={integrations}
            onTestConnection={testConnection}
            testResults={testResults}
            loading={loading}
            showSecrets={showSecrets}
            onToggleSecret={toggleSecretVisibility}
            onCopyToClipboard={copyToClipboard}
          />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <FeatureFlagManagement featureFlags={featureFlags} onUpdateFlag={updateFeatureFlag} />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <SystemMonitoring systemStatus={systemStatus} testResults={testResults} />
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <SystemDocumentation integrations={integrations} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Component implementations would continue here...
function SystemOverview({ systemStatus, integrations, healthScore }: any) {
  return (
    <div className="space-y-6">
      <Card className="admin-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            สถานะระบบหลัก
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter((i: any) => i.priority === "high")
              .map((integration: any) => (
                <div key={integration.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <integration.icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{integration.name}</span>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                  {getStatusBadge(integration.status)}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function IntegrationManagement({
  integrations,
  onTestConnection,
  testResults,
  loading,
  showSecrets,
  onToggleSecret,
  onCopyToClipboard,
}: any) {
  return (
    <div className="space-y-6">
      {["core", "commerce", "communication", "logistics", "performance"].map((category) => (
        <Card key={category} className="admin-shadow">
          <CardHeader>
            <CardTitle className="capitalize">{category} Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations
                .filter((i: any) => i.category === category)
                .map((integration: any) => (
                  <div key={integration.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <integration.icon className="w-6 h-6 text-primary" />
                        <div>
                          <h4 className="font-semibold">{integration.name}</h4>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(integration.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onTestConnection(integration.testEndpoint)}
                          disabled={loading}
                        >
                          <TestTube className="w-4 h-4 mr-2" />
                          ทดสอบ
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Environment Variables:</Label>
                        <div className="grid gap-2 mt-2">
                          {integration.envVars.map((envVar: string) => (
                            <div key={envVar} className="flex items-center gap-2 p-2 bg-muted rounded">
                              <code className="text-sm flex-1">{envVar}</code>
                              <Button variant="ghost" size="sm" onClick={() => onToggleSecret(envVar)}>
                                {showSecrets[envVar] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => onCopyToClipboard(envVar)}>
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {testResults[integration.testEndpoint] && (
                        <Alert
                          className={
                            testResults[integration.testEndpoint].status === "healthy"
                              ? "border-green-500"
                              : "border-red-500"
                          }
                        >
                          <AlertDescription>
                            <strong>ผลการทดสอบ:</strong>{" "}
                            {testResults[integration.testEndpoint].message ||
                              testResults[integration.testEndpoint].error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FeatureFlagManagement({ featureFlags, onUpdateFlag }: any) {
  const features = [
    {
      key: "customCovers",
      name: "ผ้าคลุมโซฟาแบบกำหนดเอง",
      description: "อนุญาตให้ลูกค้าสั่งทำผ้าคลุมโซฟาตามขนาด",
      category: "product",
    },
    { key: "bulkOrders", name: "การสั่งซื้อจำนวนมาก", description: "ระบบสำหรับการสั่งซื้อสินค้าจำนวนมาก", category: "commerce" },
    { key: "loyaltyProgram", name: "โปรแกรมสะสมแต้ม", description: "ระบบสะสมแต้มและแลกของรางวัล", category: "marketing" },
    { key: "reviews", name: "รีวิวสินค้า", description: "อนุญาตให้ลูกค้าเขียนรีวิวและให้คะแนน", category: "social" },
    { key: "wishlist", name: "รายการสินค้าที่ชอบ", description: "บันทึกสินค้าที่สนใจไว้ดูภายหลัง", category: "social" },
    {
      key: "advancedAnalytics",
      name: "การวิเคราะห์ขั้นสูง",
      description: "รายงานและการวิเคราะห์ข้อมูลขาย",
      category: "analytics",
    },
    { key: "bulkOperations", name: "การจัดการแบบกลุ่ม", description: "จัดการสินค้าและคำสั่งซื้อหลายรายการ", category: "admin" },
    { key: "exportFeatures", name: "การส่งออกข้อมูล", description: "ส่งออกข้อมูลเป็นไฟล์ Excel, CSV, PDF", category: "admin" },
    { key: "aiRecommendations", name: "คำแนะนำด้วย AI", description: "ระบบแนะนำสินค้าด้วยปัญญาประดิษฐ์", category: "ai" },
    {
      key: "realTimeNotifications",
      name: "การแจ้งเตือนแบบเรียลไทม์",
      description: "แจ้งเตือนทันทีเมื่อมีกิจกรรมสำคัญ",
      category: "communication",
    },
  ]

  const categories = ["product", "commerce", "marketing", "social", "analytics", "admin", "ai", "communication"]

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <Card key={category} className="admin-shadow">
          <CardHeader>
            <CardTitle className="capitalize">{category} Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features
                .filter((f) => f.category === category)
                .map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">{feature.name}</Label>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                    <Switch
                      checked={featureFlags[feature.key as keyof FeatureFlags]}
                      onCheckedChange={(checked) => onUpdateFlag(feature.key, checked)}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SystemMonitoring({ systemStatus, testResults }: any) {
  return (
    <Card className="admin-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          การติดตามระบบ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">ระบบติดตามขั้นสูง</h3>
          <p className="text-muted-foreground mb-4">ติดตามประสิทธิภาพและสุขภาพของระบบแบบเรียลไทม์</p>
          <Button>
            <Monitor className="w-4 h-4 mr-2" />
            เปิดใช้งานการติดตาม
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SystemDocumentation({ integrations }: any) {
  return (
    <div className="space-y-6">
      <Card className="admin-shadow">
        <CardHeader>
          <CardTitle>คู่มือการตั้งค่าระบบขั้นสูง</CardTitle>
          <CardDescription>คำแนะนำโดยละเอียดสำหรับการตั้งค่าและจัดการระบบ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {integrations.map((integration: any) => (
            <div key={integration.id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <integration.icon className="w-5 h-5" />
                  {integration.name}
                </h3>
                <Button variant="outline" size="sm" asChild>
                  <a href={integration.documentation} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    เอกสารอย่างเป็นทางการ
                  </a>
                </Button>
              </div>
              <div className="space-y-2 text-sm pl-7">
                <p className="text-muted-foreground">{integration.description}</p>
                <div>
                  <strong>Environment Variables ที่จำเป็น:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {integration.envVars.map((envVar: string) => (
                      <li key={envVar} className="font-mono text-xs">
                        {envVar}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
