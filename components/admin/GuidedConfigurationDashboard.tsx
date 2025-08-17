"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Globe,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConfigurationItem {
  id: string
  category: string
  name: string
  description: string
  value: any
  type: "text" | "number" | "boolean" | "select" | "textarea"
  required: boolean
  validation?: (value: any) => string | null
  suggestions?: string[]
  tutorial?: {
    title: string
    steps: string[]
    tips: string[]
  }
  impact: "low" | "medium" | "high"
  relatedSettings?: string[]
}

const configurationItems: ConfigurationItem[] = [
  {
    id: "store_name",
    category: "basic",
    name: "ชื่อร้าน",
    description: "ชื่อที่จะแสดงในหน้าเว็บไซต์และเอกสารต่าง ๆ",
    value: "ELF SofaCover Pro",
    type: "text",
    required: true,
    validation: (value) => (value.length < 3 ? "ชื่อร้านต้องมีอย่างน้อย 3 ตัวอักษร" : null),
    suggestions: ["ELF SofaCover Pro", "ELF Home Decor", "ELF Furniture Cover"],
    tutorial: {
      title: "การตั้งชื่อร้านที่ดี",
      steps: ["เลือกชื่อที่สั้น กระชับ และจดจำง่าย", "ใช้คำที่เกี่ยวข้องกับธุรกิจ", "หลีกเลี่ยงตัวอักษรพิเศษที่ซับซ้อน", "ตรวจสอบว่าชื่อนี้ไม่ซ้ำกับคู่แข่ง"],
      tips: ["ชื่อที่ดีจะช่วยให้ลูกค้าจดจำได้ง่าย", "ควรสอดคล้องกับโดเมนเนมและโซเชียลมีเดีย"],
    },
    impact: "high",
    relatedSettings: ["seo_title", "meta_description"],
  },
  {
    id: "payment_stripe_key",
    category: "payment",
    name: "Stripe Secret Key",
    description: "คีย์สำหรับเชื่อมต่อกับระบบชำระเงิน Stripe",
    value: "",
    type: "text",
    required: true,
    validation: (value) => (!value.startsWith("sk_") ? "Stripe Secret Key ต้องขึ้นต้นด้วย sk_" : null),
    tutorial: {
      title: "การตั้งค่า Stripe",
      steps: [
        "เข้าไปที่ dashboard.stripe.com",
        "สร้างบัญชีหรือเข้าสู่ระบบ",
        "ไปที่ Developers > API keys",
        "คัดลอก Secret key (ขึ้นต้นด้วย sk_)",
        "วางใส่ในช่องนี้",
      ],
      tips: ["ใช้ Test key สำหรับการทดสอบ", "เก็บ Live key ไว้อย่างปลอดภัย", "อย่าแชร์ Secret key กับใครเด็ดขาด"],
    },
    impact: "high",
    relatedSettings: ["payment_methods", "currency"],
  },
  {
    id: "smtp_host",
    category: "email",
    name: "SMTP Host",
    description: "เซิร์ฟเวอร์สำหรับส่งอีเมล",
    value: "",
    type: "text",
    required: true,
    suggestions: ["smtp.gmail.com", "smtp.sendgrid.net", "smtp.mailgun.org"],
    tutorial: {
      title: "การตั้งค่าอีเมล",
      steps: [
        "เลือกผู้ให้บริการอีเมล (Gmail, SendGrid, Mailgun)",
        "สร้างบัญชีและรับ SMTP credentials",
        "กรอกข้อมูล Host, Port, Username, Password",
        "ทดสอบการส่งอีเมล",
      ],
      tips: [
        "Gmail: ใช้ App Password แทน password ปกติ",
        "SendGrid: เหมาะสำหรับธุรกิจขนาดใหญ่",
        "ตรวจสอบ spam folder เมื่อทดสอบ",
      ],
    },
    impact: "high",
    relatedSettings: ["smtp_port", "smtp_user", "smtp_pass"],
  },
]

export default function GuidedConfigurationDashboard() {
  const [activeCategory, setActiveCategory] = useState("basic")
  const [configurations, setConfigurations] = useState<Record<string, any>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showTutorial, setShowTutorial] = useState<string | null>(null)
  const [completionProgress, setCompletionProgress] = useState(0)

  const categories = [
    { id: "basic", name: "ข้อมูลพื้นฐาน", icon: Settings, color: "text-blue-600" },
    { id: "payment", name: "การชำระเงิน", icon: Shield, color: "text-green-600" },
    { id: "email", name: "อีเมล", icon: Globe, color: "text-purple-600" },
    { id: "shipping", name: "การจัดส่ง", icon: TrendingUp, color: "text-orange-600" },
    { id: "advanced", name: "ขั้นสูง", icon: Zap, color: "text-red-600" },
  ]

  useEffect(() => {
    // Load existing configurations
    const savedConfigs = localStorage.getItem("system_configurations")
    if (savedConfigs) {
      setConfigurations(JSON.parse(savedConfigs))
    }

    // Initialize with default values
    const defaultConfigs: Record<string, any> = {}
    configurationItems.forEach((item) => {
      defaultConfigs[item.id] = item.value
    })
    setConfigurations((prev) => ({ ...defaultConfigs, ...prev }))
  }, [])

  useEffect(() => {
    // Calculate completion progress
    const requiredItems = configurationItems.filter((item) => item.required)
    const completedItems = requiredItems.filter((item) => {
      const value = configurations[item.id]
      return value && value.toString().trim() !== ""
    })
    setCompletionProgress((completedItems.length / requiredItems.length) * 100)
  }, [configurations])

  const handleConfigChange = (itemId: string, value: any) => {
    const newConfigs = { ...configurations, [itemId]: value }
    setConfigurations(newConfigs)
    localStorage.setItem("system_configurations", JSON.stringify(newConfigs))

    // Validate
    const item = configurationItems.find((i) => i.id === itemId)
    if (item?.validation) {
      const error = item.validation(value)
      setValidationErrors((prev) => ({
        ...prev,
        [itemId]: error || "",
      }))
    }
  }

  const getConfigurationsByCategory = (category: string) => {
    return configurationItems.filter((item) => item.category === category)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const renderConfigurationItem = (item: ConfigurationItem) => {
    const value = configurations[item.id] || ""
    const error = validationErrors[item.id]
    const hasValue = value && value.toString().trim() !== ""

    return (
      <Card key={item.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {item.name}
                {item.required && <span className="text-red-500">*</span>}
                {hasValue && <CheckCircle className="w-4 h-4 text-green-600" />}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getImpactColor(item.impact)}>
                {item.impact === "high" ? "สำคัญมาก" : item.impact === "medium" ? "สำคัญ" : "ทั่วไป"}
              </Badge>
              {item.tutorial && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTutorial(showTutorial === item.id ? null : item.id)}
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Configuration Input */}
          <div>
            {item.type === "text" && (
              <Input
                value={value}
                onChange={(e) => handleConfigChange(item.id, e.target.value)}
                placeholder={`กรอก${item.name}`}
                className={error ? "border-red-500" : ""}
              />
            )}

            {item.type === "textarea" && (
              <Textarea
                value={value}
                onChange={(e) => handleConfigChange(item.id, e.target.value)}
                placeholder={`กรอก${item.name}`}
                rows={3}
                className={error ? "border-red-500" : ""}
              />
            )}

            {item.type === "boolean" && (
              <div className="flex items-center space-x-2">
                <Switch checked={value} onCheckedChange={(checked) => handleConfigChange(item.id, checked)} />
                <Label>เปิดใช้งาน</Label>
              </div>
            )}

            {error && (
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-600">{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Suggestions */}
          {item.suggestions && item.suggestions.length > 0 && (
            <div>
              <Label className="text-sm text-gray-600">คำแนะนำ:</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {item.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigChange(item.id, suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Tutorial */}
          {showTutorial === item.id && item.tutorial && (
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <h4 className="font-semibold">{item.tutorial.title}</h4>

                  <div>
                    <p className="text-sm font-medium mb-2">ขั้นตอน:</p>
                    <ol className="text-sm space-y-1 ml-4">
                      {item.tutorial.steps.map((step, index) => (
                        <li key={index} className="list-decimal">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {item.tutorial.tips && (
                    <div>
                      <p className="text-sm font-medium mb-2">เคล็ดลับ:</p>
                      <ul className="text-sm space-y-1 ml-4">
                        {item.tutorial.tips.map((tip, index) => (
                          <li key={index} className="list-disc text-blue-600">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Related Settings */}
          {item.relatedSettings && item.relatedSettings.length > 0 && (
            <div>
              <Label className="text-sm text-gray-600">การตั้งค่าที่เกี่ยวข้อง:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.relatedSettings.map((relatedId) => {
                  const relatedItem = configurationItems.find((i) => i.id === relatedId)
                  return relatedItem ? (
                    <Badge key={relatedId} variant="outline" className="text-xs">
                      {relatedItem.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">การตั้งค่าระบบแบบมีคำแนะนำ</h1>
          <p className="text-gray-600 mt-1">กำหนดค่าระบบต่าง ๆ พร้อมคำแนะนำและการสอนใช้งาน</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">ความสมบูรณ์</div>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={completionProgress} className="w-32" />
            <span className="text-sm font-medium">{Math.round(completionProgress)}%</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryItems = getConfigurationsByCategory(category.id)
              const requiredItems = categoryItems.filter((item) => item.required)
              const completedItems = requiredItems.filter((item) => {
                const value = configurations[item.id]
                return value && value.toString().trim() !== ""
              })
              const progress = requiredItems.length > 0 ? (completedItems.length / requiredItems.length) * 100 : 100

              return (
                <div key={category.id} className="text-center">
                  <category.icon className={`w-8 h-8 mx-auto mb-2 ${category.color}`} />
                  <h3 className="font-medium text-sm">{category.name}</h3>
                  <div className="mt-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">
                      {completedItems.length}/{requiredItems.length} เสร็จสิ้น
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              <category.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="grid gap-4">{getConfigurationsByCategory(category.id).map(renderConfigurationItem)}</div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            การดำเนินการด่วน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Lightbulb className="w-6 h-6" />
              <span>แนะนำการตั้งค่า</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <CheckCircle className="w-6 h-6" />
              <span>ตรวจสอบการตั้งค่า</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <BookOpen className="w-6 h-6" />
              <span>คู่มือการใช้งาน</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
