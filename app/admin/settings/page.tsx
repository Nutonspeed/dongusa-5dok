"use client"

import { useState } from "react"
import {
  Store,
  CreditCard,
  Truck,
  Bell,
  Users,
  Shield,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store")
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    store: {
      name: "ร้านผ้าคลุมโซฟาพรีเมียม",
      description: "ผ้าคลุมโซฟาคุณภาพสูง ออกแบบเฉพาะตัว",
      email: "info@sofacover.com",
      phone: "02-123-4567",
      address: "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110",
      website: "https://sofacover.com",
      logo: "/placeholder.svg?height=100&width=100&text=Logo",
      currency: "THB",
      timezone: "Asia/Bangkok",
      language: "th",
    },
    payment: {
      bankTransfer: true,
      promptPay: true,
      cod: true,
      creditCard: false,
      bankAccount: "123-456-7890",
      bankName: "ธนาคารกสิกรไทย",
      promptPayId: "0812345678",
      codFee: 30,
    },
    shipping: {
      freeShippingThreshold: 1000,
      standardShippingFee: 50,
      expressShippingFee: 100,
      processingDays: 3,
      standardDeliveryDays: 5,
      expressDeliveryDays: 2,
      shippingAreas: ["กรุงเทพฯ", "ปริมณฑล", "ต่างจังหวัด"],
    },
    notifications: {
      emailNewOrder: true,
      emailLowStock: true,
      emailCustomerMessage: true,
      smsNewOrder: false,
      smsLowStock: true,
      lineNotify: true,
      lineToken: "YOUR_LINE_TOKEN",
    },
    users: [
      {
        id: 1,
        name: "ผู้ดูแลระบบหลัก",
        email: "admin@sofacover.com",
        role: "admin",
        status: "active",
        lastLogin: "2024-01-25T10:30:00",
      },
      {
        id: 2,
        name: "พนักงานขาย",
        email: "sales@sofacover.com",
        role: "staff",
        status: "active",
        lastLogin: "2024-01-24T16:45:00",
      },
    ],
    security: {
      twoFactorAuth: false,
      sessionTimeout: 60,
      passwordPolicy: "strong",
      loginAttempts: 5,
      ipWhitelist: [],
    },
  })

  const tabs = [
    { id: "store", name: "ข้อมูลร้าน", icon: Store },
    { id: "payment", name: "การชำระเงิน", icon: CreditCard },
    { id: "shipping", name: "การจัดส่ง", icon: Truck },
    { id: "notifications", name: "การแจ้งเตือน", icon: Bell },
    { id: "users", name: "ผู้ใช้งาน", icon: Users },
    { id: "security", name: "ความปลอดภัย", icon: Shield },
  ]

  const handleSave = () => {
    // Save settings logic here
    alert("บันทึกการตั้งค่าเรียบร้อยแล้ว")
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
          <p className="text-gray-600 mt-1">จัดการการตั้งค่าและการกำหนดค่าระบบ</p>
        </div>
        <Button
          onClick={handleSave}
          className="mt-4 md:mt-0 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
        >
          <Save className="w-4 h-4 mr-2" />
          บันทึกการตั้งค่า
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-pink-50 text-pink-700 border-r-2 border-pink-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Store Settings */}
          {activeTab === "store" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="w-5 h-5 mr-2" />
                  ข้อมูลร้าน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">โลโก้ร้าน</label>
                  <div className="flex items-center space-x-4">
                    <img
                      src={settings.store.logo || "/placeholder.svg"}
                      alt="Store Logo"
                      className="w-20 h-20 rounded-lg border border-gray-300 object-cover"
                    />
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      อัปโหลดโลโก้
                    </Button>
                  </div>
                </div>

                {/* Store Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อร้าน</label>
                    <input
                      type="text"
                      value={settings.store.name}
                      onChange={(e) => handleInputChange("store", "name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เว็บไซต์</label>
                    <input
                      type="url"
                      value={settings.store.website}
                      onChange={(e) => handleInputChange("store", "website", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบายร้าน</label>
                  <textarea
                    value={settings.store.description}
                    onChange={(e) => handleInputChange("store", "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={settings.store.email}
                        onChange={(e) => handleInputChange("store", "email", e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={settings.store.phone}
                        onChange={(e) => handleInputChange("store", "phone", e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      value={settings.store.address}
                      onChange={(e) => handleInputChange("store", "address", e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">สกุลเงิน</label>
                    <select
                      value={settings.store.currency}
                      onChange={(e) => handleInputChange("store", "currency", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="THB">บาทไทย (THB)</option>
                      <option value="USD">ดอลลาร์สหรัฐ (USD)</option>
                      <option value="EUR">ยูโร (EUR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เขตเวลา</label>
                    <select
                      value={settings.store.timezone}
                      onChange={(e) => handleInputChange("store", "timezone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="Asia/Bangkok">เอเชีย/กรุงเทพ</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ภาษา</label>
                    <select
                      value={settings.store.language}
                      onChange={(e) => handleInputChange("store", "language", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="th">ไทย</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Settings */}
          {activeTab === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  การชำระเงิน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Methods */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">วิธีการชำระเงิน</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.payment.bankTransfer}
                          onChange={(e) => handleInputChange("payment", "bankTransfer", e.target.checked)}
                          className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">โอนเงินผ่านธนาคาร</h4>
                          <p className="text-sm text-gray-600">รับชำระผ่านการโอนเงิน</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          settings.payment.bankTransfer ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {settings.payment.bankTransfer ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.payment.promptPay}
                          onChange={(e) => handleInputChange("payment", "promptPay", e.target.checked)}
                          className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">พร้อมเพย์ (PromptPay)</h4>
                          <p className="text-sm text-gray-600">รับชำระผ่าน QR Code</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          settings.payment.promptPay ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {settings.payment.promptPay ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.payment.cod}
                          onChange={(e) => handleInputChange("payment", "cod", e.target.checked)}
                          className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">เก็บเงินปลายทาง</h4>
                          <p className="text-sm text-gray-600">ชำระเมื่อได้รับสินค้า</p>
                        </div>
                      </div>
                      <Badge
                        className={settings.payment.cod ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {settings.payment.cod ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.payment.creditCard}
                          onChange={(e) => handleInputChange("payment", "creditCard", e.target.checked)}
                          className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">บัตรเครดิต/เดบิต</h4>
                          <p className="text-sm text-gray-600">รับชำระผ่านบัตร</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          settings.payment.creditCard ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {settings.payment.creditCard ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Bank Account Details */}
                {settings.payment.bankTransfer && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลบัญชีธนาคาร</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อธนาคาร</label>
                        <input
                          type="text"
                          value={settings.payment.bankName}
                          onChange={(e) => handleInputChange("payment", "bankName", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">เลขที่บัญชี</label>
                        <input
                          type="text"
                          value={settings.payment.bankAccount}
                          onChange={(e) => handleInputChange("payment", "bankAccount", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PromptPay Details */}
                {settings.payment.promptPay && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลพร้อมเพย์</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">หมายเลขพร้อมเพย์</label>
                      <input
                        type="text"
                        value={settings.payment.promptPayId}
                        onChange={(e) => handleInputChange("payment", "promptPayId", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="เบอร์โทรศัพท์หรือเลขประจำตัวประชาชน"
                      />
                    </div>
                  </div>
                )}

                {/* COD Fee */}
                {settings.payment.cod && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ค่าธรรมเนียมเก็บเงินปลายทาง</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ค่าธรรมเนียม (บาท)</label>
                      <input
                        type="number"
                        value={settings.payment.codFee}
                        onChange={(e) => handleInputChange("payment", "codFee", Number.parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Shipping Settings */}
          {activeTab === "shipping" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  การจัดส่ง
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Shipping Fees */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ค่าจัดส่ง</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ฟรีค่าจัดส่งเมื่อซื้อครบ (บาท)</label>
                      <input
                        type="number"
                        value={settings.shipping.freeShippingThreshold}
                        onChange={(e) =>
                          handleInputChange("shipping", "freeShippingThreshold", Number.parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ค่าจัดส่งปกติ (บาท)</label>
                      <input
                        type="number"
                        value={settings.shipping.standardShippingFee}
                        onChange={(e) =>
                          handleInputChange("shipping", "standardShippingFee", Number.parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ค่าจัดส่งด่วน (บาท)</label>
                      <input
                        type="number"
                        value={settings.shipping.expressShippingFee}
                        onChange={(e) =>
                          handleInputChange("shipping", "expressShippingFee", Number.parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Processing and Delivery Times */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ระยะเวลาดำเนินการ</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ระยะเวลาเตรียมสินค้า (วัน)</label>
                      <input
                        type="number"
                        value={settings.shipping.processingDays}
                        onChange={(e) =>
                          handleInputChange("shipping", "processingDays", Number.parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ระยะเวลาจัดส่งปกติ (วัน)</label>
                      <input
                        type="number"
                        value={settings.shipping.standardDeliveryDays}
                        onChange={(e) =>
                          handleInputChange("shipping", "standardDeliveryDays", Number.parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ระยะเวลาจัดส่งด่วน (วัน)</label>
                      <input
                        type="number"
                        value={settings.shipping.expressDeliveryDays}
                        onChange={(e) =>
                          handleInputChange("shipping", "expressDeliveryDays", Number.parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Areas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">พื้นที่จัดส่ง</h3>
                  <div className="space-y-3">
                    {settings.shipping.shippingAreas.map((area, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <span className="font-medium text-gray-900">{area}</span>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          ลบ
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full bg-transparent">
                      เพิ่มพื้นที่จัดส่ง
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  การแจ้งเตือน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">การแจ้งเตือนทางอีเมล</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">คำสั่งซื้อใหม่</h4>
                        <p className="text-sm text-gray-600">แจ้งเตือนเมื่อมีคำสั่งซื้อใหม่</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNewOrder}
                        onChange={(e) => handleInputChange("notifications", "emailNewOrder", e.target.checked)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">สต็อกต่ำ</h4>
                        <p className="text-sm text-gray-600">แจ้งเตือนเมื่อสินค้าใกล้หมด</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailLowStock}
                        onChange={(e) => handleInputChange("notifications", "emailLowStock", e.target.checked)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">ข้อความจากลูกค้า</h4>
                        <p className="text-sm text-gray-600">แจ้งเตือนเมื่อมีข้อความใหม่</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailCustomerMessage}
                        onChange={(e) => handleInputChange("notifications", "emailCustomerMessage", e.target.checked)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SMS Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">การแจ้งเตือนทาง SMS</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">คำสั่งซื้อใหม่</h4>
                        <p className="text-sm text-gray-600">ส่ง SMS เมื่อมีคำสั่งซื้อใหม่</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsNewOrder}
                        onChange={(e) => handleInputChange("notifications", "smsNewOrder", e.target.checked)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">สต็อกต่ำ</h4>
                        <p className="text-sm text-gray-600">ส่ง SMS เมื่อสินค้าใกล้หมด</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsLowStock}
                        onChange={(e) => handleInputChange("notifications", "smsLowStock", e.target.checked)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>

                {/* LINE Notify */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">LINE Notify</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900">เปิดใช้งาน LINE Notify</h4>
                        <p className="text-sm text-gray-600">รับการแจ้งเตือนผ่าน LINE</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.lineNotify}
                        onChange={(e) => handleInputChange("notifications", "lineNotify", e.target.checked)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </div>
                    {settings.notifications.lineNotify && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LINE Token</label>
                        <input
                          type="text"
                          value={settings.notifications.lineToken}
                          onChange={(e) => handleInputChange("notifications", "lineToken", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="ใส่ LINE Notify Token"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users Management */}
          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    ผู้ใช้งาน
                  </div>
                  <Button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
                    เพิ่มผู้ใช้ใหม่
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ชื่อ</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">อีเมล</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">บทบาท</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">สถานะ</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">เข้าสู่ระบบล่าสุด</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">การดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
                              </div>
                              <span className="font-semibold text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-900">{user.email}</span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              className={
                                user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                              }
                            >
                              {user.role === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              className={
                                user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }
                            >
                              {user.status === "active" ? "ใช้งานอยู่" : "ไม่ใช้งาน"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{formatDate(user.lastLogin)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                แก้ไข
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  ความปลอดภัย
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Two-Factor Authentication */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">การยืนยันตัวตนแบบสองขั้นตอน</h3>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">เปิดใช้งาน 2FA</h4>
                      <p className="text-sm text-gray-600">เพิ่มความปลอดภัยด้วยการยืนยันสองขั้นตอน</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleInputChange("security", "twoFactorAuth", e.target.checked)}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Session Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">การตั้งค่าเซสชัน</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">หมดเวลาเซสชัน (นาที)</label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          handleInputChange("security", "sessionTimeout", Number.parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        min="5"
                        max="480"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนครั้งที่พยายามเข้าสู่ระบบ</label>
                      <input
                        type="number"
                        value={settings.security.loginAttempts}
                        onChange={(e) =>
                          handleInputChange("security", "loginAttempts", Number.parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        min="3"
                        max="10"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Policy */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">นโยบายรหัสผ่าน</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ความแข็งแกร่งของรหัสผ่าน</label>
                    <select
                      value={settings.security.passwordPolicy}
                      onChange={(e) => handleInputChange("security", "passwordPolicy", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="weak">อ่อน (อย่างน้อย 6 ตัวอักษร)</option>
                      <option value="medium">ปานกลาง (อย่างน้อย 8 ตัวอักษร + ตัวเลข)</option>
                      <option value="strong">แข็งแกร่ง (อย่างน้อย 8 ตัวอักษร + ตัวเลข + สัญลักษณ์)</option>
                    </select>
                  </div>
                </div>

                {/* Change Password */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">เปลี่ยนรหัสผ่าน</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านปัจจุบัน</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="ใส่รหัสผ่านปัจจุบัน"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านใหม่</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="ใส่รหัสผ่านใหม่"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่านใหม่</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="ยืนยันรหัสผ่านใหม่"
                        />
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
                      เปลี่ยนรหัสผ่าน
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
