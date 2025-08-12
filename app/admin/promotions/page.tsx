"use client"
import { logger } from '@/lib/logger';

import type React from "react"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Eye, Copy, Target, Percent, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"

interface Promotion {
  id: string
  name: string
  name_en: string
  description: string
  promotion_type: "percentage" | "fixed_amount" | "buy_x_get_y" | "free_shipping" | "bundle"
  discount_value: number
  minimum_order_amount: number
  maximum_discount_amount?: number
  target_type: string
  usage_limit?: number
  usage_limit_per_customer: number
  current_usage_count: number
  start_date: string
  end_date: string
  status: "draft" | "active" | "paused" | "expired" | "cancelled"
  auto_apply: boolean
  stackable: boolean
  priority: number
  coupon_codes: Array<{
    id: string
    code: string
    usage_count: number
    status: string
  }>
}

// Mock data for promotions
const mockPromotions: Promotion[] = [
  {
    id: "1",
    name: "ส่วนลดลูกค้าใหม่ 15%",
    name_en: "New Customer 15% Off",
    description: "ส่วนลดพิเศษ 15% สำหรับลูกค้าใหม่",
    promotion_type: "percentage",
    discount_value: 15,
    minimum_order_amount: 1000,
    maximum_discount_amount: 500,
    target_type: "new_customers",
    usage_limit: 100,
    usage_limit_per_customer: 1,
    current_usage_count: 23,
    start_date: "2024-01-01",
    end_date: "2024-02-29",
    status: "active",
    auto_apply: true,
    stackable: false,
    priority: 1,
    coupon_codes: [{ id: "1", code: "WELCOME15", usage_count: 23, status: "active" }],
  },
  {
    id: "2",
    name: "ซื้อครบ 3000 ลด 300",
    name_en: "Spend 3000 Save 300",
    description: "ซื้อสินค้าครบ 3000 บาท ลดทันที 300 บาท",
    promotion_type: "fixed_amount",
    discount_value: 300,
    minimum_order_amount: 3000,
    target_type: "all",
    usage_limit_per_customer: 3,
    current_usage_count: 156,
    start_date: "2024-01-15",
    end_date: "2024-03-15",
    status: "active",
    auto_apply: true,
    stackable: true,
    priority: 2,
    coupon_codes: [{ id: "2", code: "SAVE300", usage_count: 156, status: "active" }],
  },
  {
    id: "3",
    name: "ส่งฟรีทุกออเดอร์",
    name_en: "Free Shipping All Orders",
    description: "ส่งฟรีไม่มีขั้นต่ำ",
    promotion_type: "free_shipping",
    discount_value: 50,
    minimum_order_amount: 0,
    target_type: "all",
    usage_limit_per_customer: 999,
    current_usage_count: 445,
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    status: "active",
    auto_apply: true,
    stackable: true,
    priority: 3,
    coupon_codes: [{ id: "3", code: "FREESHIP", usage_count: 445, status: "active" }],
  },
]

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)

  const filteredPromotions = promotions.filter((promotion) => {
    const matchesSearch =
      promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.name_en.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || promotion.status === statusFilter
    const matchesType = typeFilter === "all" || promotion.promotion_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "ใช้งาน", className: "bg-green-100 text-green-800" },
      draft: { label: "ร่าง", className: "bg-gray-100 text-gray-800" },
      paused: { label: "หยุดชั่วคราว", className: "bg-yellow-100 text-yellow-800" },
      expired: { label: "หมดอายุ", className: "bg-red-100 text-red-800" },
      cancelled: { label: "ยกเลิก", className: "bg-red-100 text-red-800" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="w-4 h-4" />
      case "fixed_amount":
        return <Gift className="w-4 h-4" />
      case "free_shipping":
        return <Target className="w-4 h-4" />
      default:
        return <Gift className="w-4 h-4" />
    }
  }

  const formatDiscountValue = (type: string, value: number) => {
    switch (type) {
      case "percentage":
        return `${value}%`
      case "fixed_amount":
        return `฿${value}`
      case "free_shipping":
        return "ส่งฟรี"
      default:
        return `฿${value}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการโปรโมชั่น</h1>
          <p className="text-gray-600 mt-1">สร้างและจัดการโปรโมชั่น ส่วนลด และคูปอง</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              สร้างโปรโมชั่นใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>สร้างโปรโมชั่นใหม่</DialogTitle>
            </DialogHeader>
            <CreatePromotionForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">โปรโมชั่นทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{promotions.length}</p>
              </div>
              <Gift className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">กำลังใช้งาน</p>
                <p className="text-2xl font-bold text-green-600">
                  {promotions.filter((p) => p.status === "active").length}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">การใช้งานรวม</p>
                <p className="text-2xl font-bold text-purple-600">
                  {promotions.reduce((sum, p) => sum + p.current_usage_count, 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ส่วนลดรวม</p>
                <p className="text-2xl font-bold text-orange-600">฿45,230</p>
              </div>
              <Percent className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ค้นหาโปรโมชั่น..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="active">ใช้งาน</SelectItem>
                <SelectItem value="draft">ร่าง</SelectItem>
                <SelectItem value="paused">หยุดชั่วคราว</SelectItem>
                <SelectItem value="expired">หมดอายุ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="ประเภท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                <SelectItem value="percentage">ส่วนลดเปอร์เซ็นต์</SelectItem>
                <SelectItem value="fixed_amount">ส่วนลดจำนวนคงที่</SelectItem>
                <SelectItem value="free_shipping">ส่งฟรี</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Promotions List */}
      <div className="grid gap-6">
        {filteredPromotions.map((promotion) => (
          <Card key={promotion.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getPromotionTypeIcon(promotion.promotion_type)}
                    <h3 className="text-lg font-semibold text-gray-900">{promotion.name}</h3>
                    {getStatusBadge(promotion.status)}
                    {promotion.auto_apply && <Badge className="bg-blue-100 text-blue-800">ใช้อัตโนมัติ</Badge>}
                  </div>
                  <p className="text-gray-600 mb-3">{promotion.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">ส่วนลด:</span>
                      <span className="font-semibold text-primary ml-1">
                        {formatDiscountValue(promotion.promotion_type, promotion.discount_value)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">ขั้นต่ำ:</span>
                      <span className="font-semibold ml-1">฿{promotion.minimum_order_amount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ใช้แล้ว:</span>
                      <span className="font-semibold ml-1">
                        {promotion.current_usage_count}
                        {promotion.usage_limit && `/${promotion.usage_limit}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">วันหมดอายุ:</span>
                      <span className="font-semibold ml-1">
                        {new Date(promotion.end_date).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                  </div>

                  {promotion.coupon_codes.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">รหัสคูปอง: </span>
                      {promotion.coupon_codes.map((coupon) => (
                        <Badge key={coupon.id} variant="outline" className="mr-2">
                          {coupon.code}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-4 w-4 p-0"
                            onClick={() => navigator.clipboard.writeText(coupon.code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 lg:mt-0">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    ดู
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    แก้ไข
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                    <Trash2 className="w-4 h-4 mr-1" />
                    ลบ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CreatePromotionForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    name_en: "",
    description: "",
    promotion_type: "percentage",
    discount_value: 0,
    minimum_order_amount: 0,
    maximum_discount_amount: "",
    target_type: "all",
    usage_limit: "",
    usage_limit_per_customer: 1,
    start_date: "",
    end_date: "",
    auto_apply: false,
    stackable: false,
    coupon_code: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    logger.info("Creating promotion:", formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
          <TabsTrigger value="conditions">เงื่อนไข</TabsTrigger>
          <TabsTrigger value="settings">การตั้งค่า</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">ชื่อโปรโมชั่น (ไทย)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="name_en">ชื่อโปรโมชั่น (อังกฤษ)</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">คำอธิบาย</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="promotion_type">ประเภทโปรโมชั่น</Label>
              <Select
                value={formData.promotion_type}
                onValueChange={(value) => setFormData({ ...formData, promotion_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">ส่วนลดเปอร์เซ็นต์</SelectItem>
                  <SelectItem value="fixed_amount">ส่วนลดจำนวนคงที่</SelectItem>
                  <SelectItem value="free_shipping">ส่งฟรี</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discount_value">
                {formData.promotion_type === "percentage" ? "เปอร์เซ็นต์ส่วนลด" : "จำนวนส่วนลด (บาท)"}
              </Label>
              <Input
                id="discount_value"
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                required
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minimum_order_amount">ยอดสั่งซื้อขั้นต่ำ (บาท)</Label>
              <Input
                id="minimum_order_amount"
                type="number"
                value={formData.minimum_order_amount}
                onChange={(e) => setFormData({ ...formData, minimum_order_amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="maximum_discount_amount">ส่วนลดสูงสุด (บาท)</Label>
              <Input
                id="maximum_discount_amount"
                type="number"
                value={formData.maximum_discount_amount}
                onChange={(e) => setFormData({ ...formData, maximum_discount_amount: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="target_type">กลุ่มเป้าหมาย</Label>
            <Select
              value={formData.target_type}
              onValueChange={(value) => setFormData({ ...formData, target_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ลูกค้าทุกคน</SelectItem>
                <SelectItem value="new_customers">ลูกค้าใหม่</SelectItem>
                <SelectItem value="returning_customers">ลูกค้าเก่า</SelectItem>
                <SelectItem value="vip_customers">ลูกค้า VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">วันที่เริ่มต้น</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">วันที่สิ้นสุด</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usage_limit">จำนวนการใช้งานทั้งหมด</Label>
              <Input
                id="usage_limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                placeholder="ไม่จำกัด"
              />
            </div>
            <div>
              <Label htmlFor="usage_limit_per_customer">จำนวนการใช้งานต่อลูกค้า</Label>
              <Input
                id="usage_limit_per_customer"
                type="number"
                value={formData.usage_limit_per_customer}
                onChange={(e) => setFormData({ ...formData, usage_limit_per_customer: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="coupon_code">รหัสคูปอง (ถ้ามี)</Label>
            <Input
              id="coupon_code"
              value={formData.coupon_code}
              onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
              placeholder="เช่น SAVE20"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto_apply"
                checked={formData.auto_apply}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_apply: checked })}
              />
              <Label htmlFor="auto_apply">ใช้โปรโมชั่นอัตโนมัติ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="stackable"
                checked={formData.stackable}
                onCheckedChange={(checked) => setFormData({ ...formData, stackable: checked })}
              />
              <Label htmlFor="stackable">สามารถใช้ร่วมกับโปรโมชั่นอื่นได้</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          สร้างโปรโมชั่น
        </Button>
      </div>
    </form>
  )
}
