"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Plus, Search, Eye, Copy, Send, Printer, Calendar, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Bill {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  items: BillItem[]
  totalAmount: number
  status: "draft" | "sent" | "paid" | "overdue"
  createdAt: Date
  dueDate: Date
  paidAt?: Date
  notes?: string
}

interface BillItem {
  id: string
  productName: string
  fabricPattern: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

const mockBills: Bill[] = [
  {
    id: "BILL-001",
    customerId: "CUST-001",
    customerName: "สมชาย ใจดี",
    customerPhone: "081-234-5678",
    items: [
      {
        id: "1",
        productName: "ผ้าคลุมโซฟา 3 ที่นั่ง",
        fabricPattern: "ลายดอกไม้สีฟ้า",
        quantity: 1,
        unitPrice: 2500,
        totalPrice: 2500,
      },
    ],
    totalAmount: 2500,
    status: "paid",
    createdAt: new Date("2024-01-15"),
    dueDate: new Date("2024-01-22"),
    paidAt: new Date("2024-01-16"),
  },
  {
    id: "BILL-002",
    customerId: "CUST-002",
    customerName: "สมหญิง รักสวย",
    customerPhone: "082-345-6789",
    items: [
      {
        id: "2",
        productName: "ผ้าคลุมโซฟา L-Shape",
        fabricPattern: "ลายทางสีเทา",
        quantity: 1,
        unitPrice: 3500,
        totalPrice: 3500,
      },
    ],
    totalAmount: 3500,
    status: "sent",
    createdAt: new Date("2024-01-14"),
    dueDate: new Date("2024-01-21"),
  },
]

export default function BillsManagement() {
  const { toast } = useToast()
  const [bills, setBills] = useState<Bill[]>(mockBills)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [showCreateBill, setShowCreateBill] = useState(false)
  const [newBill, setNewBill] = useState({
    customerName: "",
    customerPhone: "",
    items: [{ productName: "", fabricPattern: "", quantity: 1, unitPrice: 0 }],
    notes: "",
  })

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerPhone.includes(searchTerm)
    const matchesStatus = selectedStatus === "all" || bill.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    }
    const labels = {
      draft: "ร่าง",
      sent: "ส่งแล้ว",
      paid: "ชำระแล้ว",
      overdue: "เกินกำหนด",
    }
    return <Badge className={colors[status as keyof typeof colors]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const createQuickBill = () => {
    const billId = `BILL-${String(bills.length + 1).padStart(3, "0")}`
    const totalAmount = newBill.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    const bill: Bill = {
      id: billId,
      customerId: `CUST-${Date.now()}`,
      customerName: newBill.customerName,
      customerPhone: newBill.customerPhone,
      items: newBill.items.map((item, index) => ({
        id: String(index + 1),
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      })),
      totalAmount,
      status: "draft",
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: newBill.notes,
    }

    setBills([...bills, bill])
    setShowCreateBill(false)
    setNewBill({
      customerName: "",
      customerPhone: "",
      items: [{ productName: "", fabricPattern: "", quantity: 1, unitPrice: 0 }],
      notes: "",
    })

    toast({
      title: "สร้างบิลสำเร็จ",
      description: `บิล ${billId} ถูกสร้างแล้ว`,
    })
  }

  const copyBillLink = (billId: string) => {
    const link = `${window.location.origin}/bill/view/${billId}`
    navigator.clipboard.writeText(link)
    toast({
      title: "คัดลอกลิงก์สำเร็จ",
      description: "ลิงก์บิลถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
    })
  }

  const sendBillMessage = (bill: Bill) => {
    const message = `สวัสดีครับ/ค่ะ คุณ${bill.customerName}

ขอส่งบิลสำหรับการสั่งซื้อ
บิลเลขที่: ${bill.id}
ยอดรวม: ${bill.totalAmount.toLocaleString()} บาท

ดูรายละเอียดบิล: ${window.location.origin}/bill/view/${bill.id}

กรุณาชำระเงินภายในกำหนด
ขอบคุณครับ/ค่ะ`

    navigator.clipboard.writeText(message)
    toast({
      title: "คัดลอกข้อความสำเร็จ",
      description: "ข้อความส่งบิลถูกคัดลอกแล้ว",
    })
  }

  const addBillItem = () => {
    setNewBill({
      ...newBill,
      items: [...newBill.items, { productName: "", fabricPattern: "", quantity: 1, unitPrice: 0 }],
    })
  }

  const updateBillItem = (index: number, field: string, value: any) => {
    const updatedItems = newBill.items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    setNewBill({ ...newBill, items: updatedItems })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-burgundy-800">จัดการบิล/ใบเสร็จ</h1>
          <p className="text-gray-600 mt-1">สร้างและจัดการบิลอย่างรวดเร็ว</p>
        </div>
        <Dialog open={showCreateBill} onOpenChange={setShowCreateBill}>
          <DialogTrigger asChild>
            <Button className="bg-burgundy-600 hover:bg-burgundy-700">
              <Plus className="w-4 h-4 mr-2" />
              สร้างบิลใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>สร้างบิลใหม่ (3 คลิก)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">ชื่อลูกค้า</Label>
                  <Input
                    id="customerName"
                    value={newBill.customerName}
                    onChange={(e) => setNewBill({ ...newBill, customerName: e.target.value })}
                    placeholder="ชื่อลูกค้า"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">เบอร์โทร</Label>
                  <Input
                    id="customerPhone"
                    value={newBill.customerPhone}
                    onChange={(e) => setNewBill({ ...newBill, customerPhone: e.target.value })}
                    placeholder="เบอร์โทรศัพท์"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <Label>รายการสินค้า</Label>
                {newBill.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mt-2">
                    <Input
                      placeholder="ชื่อสินค้า"
                      value={item.productName}
                      onChange={(e) => updateBillItem(index, "productName", e.target.value)}
                    />
                    <Input
                      placeholder="ลายผ้า"
                      value={item.fabricPattern}
                      onChange={(e) => updateBillItem(index, "fabricPattern", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="จำนวน"
                      value={item.quantity}
                      onChange={(e) => updateBillItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                    />
                    <Input
                      type="number"
                      placeholder="ราคา"
                      value={item.unitPrice}
                      onChange={(e) => updateBillItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addBillItem} className="mt-2 bg-transparent">
                  เพิ่มรายการ
                </Button>
              </div>

              {/* Total */}
              <div className="text-right">
                <p className="text-lg font-bold text-burgundy-600">
                  ยอดรวม:{" "}
                  {newBill.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toLocaleString()} บาท
                </p>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">หมายเหตุ</Label>
                <Textarea
                  id="notes"
                  value={newBill.notes}
                  onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                  placeholder="หมายเหตุเพิ่มเติม"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateBill(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={createQuickBill} className="bg-burgundy-600 hover:bg-burgundy-700">
                  สร้างบิล
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">บิลทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รอชำระ</p>
                <p className="text-2xl font-bold text-blue-600">{bills.filter((b) => b.status === "sent").length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ชำระแล้ว</p>
                <p className="text-2xl font-bold text-green-600">{bills.filter((b) => b.status === "paid").length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เกินกำหนด</p>
                <p className="text-2xl font-bold text-red-600">{bills.filter((b) => b.status === "overdue").length}</p>
              </div>
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาบิล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="draft">ร่าง</option>
              <option value="sent">ส่งแล้ว</option>
              <option value="paid">ชำระแล้ว</option>
              <option value="overdue">เกินกำหนด</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการบิล</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">รหัสบิล</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ลูกค้า</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ยอดรวม</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">สถานะ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">วันที่สร้าง</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">กำหนดชำระ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">{bill.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{bill.customerName}</h4>
                        <p className="text-sm text-gray-500">{bill.customerPhone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-burgundy-600">{bill.totalAmount.toLocaleString()} บาท</span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(bill.status)}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{bill.createdAt.toLocaleDateString("th-TH")}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{bill.dueDate.toLocaleDateString("th-TH")}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => copyBillLink(bill.id)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => sendBillMessage(bill)}>
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Printer className="w-4 h-4" />
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
    </div>
  )
}
