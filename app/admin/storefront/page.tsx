"use client"

import { useState } from "react"
import {
  Eye,
  Save,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Palette,
  Type,
  Layout,
  Settings,
  Globe,
  Star,
  Heart,
  ShoppingCart,
  Users,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface StorefrontSettings {
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    fontSize: number
    borderRadius: number
  }
  layout: {
    headerStyle: string
    footerStyle: string
    productGridColumns: number
    showSidebar: boolean
    sidebarPosition: string
  }
  content: {
    siteName: string
    tagline: string
    welcomeMessage: string
    aboutText: string
    contactInfo: {
      phone: string
      email: string
      address: string
    }
  }
  features: {
    showReviews: boolean
    showWishlist: boolean
    showCompare: boolean
    showRecentlyViewed: boolean
    enableLiveChat: boolean
    showSocialMedia: boolean
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string
    ogImage: string
  }
}

const defaultSettings: StorefrontSettings = {
  theme: {
    primaryColor: "#8B1538",
    secondaryColor: "#F5F5DC",
    accentColor: "#D4AF37",
    fontFamily: "Inter",
    fontSize: 16,
    borderRadius: 8,
  },
  layout: {
    headerStyle: "modern",
    footerStyle: "detailed",
    productGridColumns: 3,
    showSidebar: true,
    sidebarPosition: "left",
  },
  content: {
    siteName: "SofaCover Pro",
    tagline: "ผ้าคลุมโซฟาคุณภาพพรีเมียม",
    welcomeMessage: "ยินดีต้อนรับสู่ร้านผ้าคลุมโซฟาออนไลน์ที่ดีที่สุด",
    aboutText: "เราเป็นผู้เชี่ยวชาญด้านผ้าคลุมโซฟาคุณภาพสูง ด้วยประสบการณ์กว่า 10 ปี",
    contactInfo: {
      phone: "02-123-4567",
      email: "info@sofacover.com",
      address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
    },
  },
  features: {
    showReviews: true,
    showWishlist: true,
    showCompare: false,
    showRecentlyViewed: true,
    enableLiveChat: true,
    showSocialMedia: true,
  },
  seo: {
    metaTitle: "SofaCover Pro - ผ้าคลุมโซฟาคุณภาพพรีเมียม",
    metaDescription: "ร้านผ้าคลุมโซฟาออนไลน์ที่ดีที่สุด มีผ้าคลุมโซฟาหลากหลายแบบ คุณภาพสูง ราคาดี",
    keywords: "ผ้าคลุมโซฟา, โซฟาคัฟเวอร์, ผ้าคลุมเฟอร์นิเจอร์, sofa cover",
    ogImage: "/images/og-image.jpg",
  },
}

export const dynamic = "force-dynamic"

export default function StorefrontManagerPage() {
  const [settings, setSettings] = useState<StorefrontSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState("theme")
  const [previewDevice, setPreviewDevice] = useState("desktop")
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSettingChange = (section: keyof StorefrontSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleNestedSettingChange = (section: keyof StorefrontSettings, nestedKey: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedKey]: {
          ...(prev[section] as any)[nestedKey],
          [key]: value,
        },
      },
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setHasChanges(false)
    setIsSaving(false)
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "desktop":
        return <Monitor className="w-4 h-4" />
      case "tablet":
        return <Tablet className="w-4 h-4" />
      case "mobile":
        return <Smartphone className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการหน้าร้าน</h1>
          <p className="text-gray-600 mt-1">ปรับแต่งรูปลักษณ์และการทำงานของหน้าร้านออนไลน์</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {hasChanges && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
            </Badge>
          )}
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            ดูตัวอย่าง
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="bg-primary hover:bg-primary/90">
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </div>

      {/* Preview Device Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">ดูตัวอย่างบน:</span>
              <div className="flex items-center gap-1">
                {["desktop", "tablet", "mobile"].map((device) => (
                  <Button
                    key={device}
                    variant={previewDevice === device ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewDevice(device)}
                  >
                    {getDeviceIcon(device)}
                    <span className="ml-1 capitalize">{device}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>1,234 ผู้เยี่ยมชม/วัน</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>+12% จากเดือนที่แล้ว</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                การตั้งค่าหน้าร้าน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                <TabsList className="grid w-full grid-cols-1 h-auto">
                  <TabsTrigger value="theme" className="justify-start">
                    <Palette className="w-4 h-4 mr-2" />
                    ธีมและสี
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="justify-start">
                    <Layout className="w-4 h-4 mr-2" />
                    เลย์เอาต์
                  </TabsTrigger>
                  <TabsTrigger value="content" className="justify-start">
                    <Type className="w-4 h-4 mr-2" />
                    เนื้อหา
                  </TabsTrigger>
                  <TabsTrigger value="features" className="justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    ฟีเจอร์
                  </TabsTrigger>
                  <TabsTrigger value="seo" className="justify-start">
                    <Globe className="w-4 h-4 mr-2" />
                    SEO
                  </TabsTrigger>
                </TabsList>

                <div className="ml-4 flex-1">
                  <TabsContent value="theme" className="space-y-4 mt-0">
                    <div>
                      <Label htmlFor="primaryColor">สีหลัก</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={settings.theme.primaryColor}
                          onChange={(e) => handleSettingChange("theme", "primaryColor", e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={settings.theme.primaryColor}
                          onChange={(e) => handleSettingChange("theme", "primaryColor", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondaryColor">สีรอง</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={settings.theme.secondaryColor}
                          onChange={(e) => handleSettingChange("theme", "secondaryColor", e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={settings.theme.secondaryColor}
                          onChange={(e) => handleSettingChange("theme", "secondaryColor", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="fontFamily">ฟอนต์</Label>
                      <Select
                        value={settings.theme.fontFamily}
                        onValueChange={(value) => handleSettingChange("theme", "fontFamily", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                          <SelectItem value="Noto Sans Thai">Noto Sans Thai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>ขนาดฟอนต์: {settings.theme.fontSize}px</Label>
                      <Slider
                        value={[settings.theme.fontSize]}
                        onValueChange={(value) => handleSettingChange("theme", "fontSize", value[0])}
                        max={24}
                        min={12}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>มุมโค้ง: {settings.theme.borderRadius}px</Label>
                      <Slider
                        value={[settings.theme.borderRadius]}
                        onValueChange={(value) => handleSettingChange("theme", "borderRadius", value[0])}
                        max={20}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-4 mt-0">
                    <div>
                      <Label htmlFor="headerStyle">สไตล์ Header</Label>
                      <Select
                        value={settings.layout.headerStyle}
                        onValueChange={(value) => handleSettingChange("layout", "headerStyle", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">โมเดิร์น</SelectItem>
                          <SelectItem value="classic">คลาสสิก</SelectItem>
                          <SelectItem value="minimal">มินิมอล</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>จำนวนคอลัมน์สินค้า: {settings.layout.productGridColumns}</Label>
                      <Slider
                        value={[settings.layout.productGridColumns]}
                        onValueChange={(value) => handleSettingChange("layout", "productGridColumns", value[0])}
                        max={5}
                        min={2}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showSidebar"
                        checked={settings.layout.showSidebar}
                        onCheckedChange={(checked) => handleSettingChange("layout", "showSidebar", checked)}
                      />
                      <Label htmlFor="showSidebar">แสดง Sidebar</Label>
                    </div>

                    {settings.layout.showSidebar && (
                      <div>
                        <Label htmlFor="sidebarPosition">ตำแหน่ง Sidebar</Label>
                        <Select
                          value={settings.layout.sidebarPosition}
                          onValueChange={(value) => handleSettingChange("layout", "sidebarPosition", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">ซ้าย</SelectItem>
                            <SelectItem value="right">ขวา</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 mt-0">
                    <div>
                      <Label htmlFor="siteName">ชื่อเว็บไซต์</Label>
                      <Input
                        id="siteName"
                        value={settings.content.siteName}
                        onChange={(e) => handleSettingChange("content", "siteName", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tagline">สโลแกน</Label>
                      <Input
                        id="tagline"
                        value={settings.content.tagline}
                        onChange={(e) => handleSettingChange("content", "tagline", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="welcomeMessage">ข้อความต้อนรับ</Label>
                      <Textarea
                        id="welcomeMessage"
                        value={settings.content.welcomeMessage}
                        onChange={(e) => handleSettingChange("content", "welcomeMessage", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                      <Input
                        id="phone"
                        value={settings.content.contactInfo.phone}
                        onChange={(e) => handleNestedSettingChange("content", "contactInfo", "phone", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">อีเมล</Label>
                      <Input
                        id="email"
                        value={settings.content.contactInfo.email}
                        onChange={(e) => handleNestedSettingChange("content", "contactInfo", "email", e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="features" className="space-y-4 mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showReviews"
                          checked={settings.features.showReviews}
                          onCheckedChange={(checked) => handleSettingChange("features", "showReviews", checked)}
                        />
                        <Label htmlFor="showReviews">แสดงรีวิวสินค้า</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showWishlist"
                          checked={settings.features.showWishlist}
                          onCheckedChange={(checked) => handleSettingChange("features", "showWishlist", checked)}
                        />
                        <Label htmlFor="showWishlist">รายการโปรด</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showCompare"
                          checked={settings.features.showCompare}
                          onCheckedChange={(checked) => handleSettingChange("features", "showCompare", checked)}
                        />
                        <Label htmlFor="showCompare">เปรียบเทียบสินค้า</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enableLiveChat"
                          checked={settings.features.enableLiveChat}
                          onCheckedChange={(checked) => handleSettingChange("features", "enableLiveChat", checked)}
                        />
                        <Label htmlFor="enableLiveChat">Live Chat</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showSocialMedia"
                          checked={settings.features.showSocialMedia}
                          onCheckedChange={(checked) => handleSettingChange("features", "showSocialMedia", checked)}
                        />
                        <Label htmlFor="showSocialMedia">ลิงค์โซเชียลมีเดีย</Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4 mt-0">
                    <div>
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <Input
                        id="metaTitle"
                        value={settings.seo.metaTitle}
                        onChange={(e) => handleSettingChange("seo", "metaTitle", e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">ความยาวที่แนะนำ: 50-60 ตัวอักษร</p>
                    </div>
                    <div>
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        value={settings.seo.metaDescription}
                        onChange={(e) => handleSettingChange("seo", "metaDescription", e.target.value)}
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">ความยาวที่แนะนำ: 150-160 ตัวอักษร</p>
                    </div>
                    <div>
                      <Label htmlFor="keywords">Keywords</Label>
                      <Input
                        id="keywords"
                        value={settings.seo.keywords}
                        onChange={(e) => handleSettingChange("seo", "keywords", e.target.value)}
                        placeholder="คำค้นหา, คั่นด้วยจุลภาค"
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                ตัวอย่างหน้าร้าน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border rounded-lg overflow-hidden ${
                  previewDevice === "mobile"
                    ? "max-w-sm mx-auto"
                    : previewDevice === "tablet"
                      ? "max-w-2xl mx-auto"
                      : "w-full"
                }`}
                style={{
                  fontFamily: settings.theme.fontFamily,
                  fontSize: `${settings.theme.fontSize}px`,
                }}
              >
                {/* Preview Header */}
                <div
                  className="p-4 border-b"
                  style={{
                    backgroundColor: settings.theme.primaryColor,
                    color: "white",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold">{settings.content.siteName}</h1>
                      <p className="text-sm opacity-90">{settings.content.tagline}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {settings.features.showWishlist && <Heart className="w-5 h-5" />}
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-4" style={{ backgroundColor: settings.theme.secondaryColor }}>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">ยินดีต้อนรับ</h2>
                    <p className="text-gray-700">{settings.content.welcomeMessage}</p>
                  </div>

                  {/* Product Grid Preview */}
                  <div
                    className={`grid gap-4 mb-4`}
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(settings.layout.productGridColumns, previewDevice === "mobile" ? 2 : previewDevice === "tablet" ? 3 : 4)}, 1fr)`,
                    }}
                  >
                    {[1, 2, 3, 4].slice(0, settings.layout.productGridColumns).map((i) => (
                      <div
                        key={i}
                        className="bg-white p-3 shadow-sm"
                        style={{ borderRadius: `${settings.theme.borderRadius}px` }}
                      >
                        <div className="bg-gray-200 h-24 mb-2 rounded"></div>
                        <h3 className="font-medium text-sm">ผ้าคลุมโซฟา {i}</h3>
                        <p className="text-sm text-gray-600">฿1,299</p>
                        {settings.features.showReviews && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">4.5</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Features Preview */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {settings.features.showReviews && <Badge variant="outline">รีวิว</Badge>}
                    {settings.features.showWishlist && <Badge variant="outline">รายการโปรด</Badge>}
                    {settings.features.showCompare && <Badge variant="outline">เปรียบเทียบ</Badge>}
                    {settings.features.enableLiveChat && <Badge variant="outline">Live Chat</Badge>}
                  </div>
                </div>

                {/* Preview Footer */}
                <div className="p-4 bg-gray-100 border-t text-center text-sm">
                  <p>© 2024 {settings.content.siteName}</p>
                  <p>
                    {settings.content.contactInfo.phone} | {settings.content.contactInfo.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
