"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Plus, Search, Eye, Copy, Send, Printer, Calendar, DollarSign, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { calculateSubtotal, formatCurrency, type MoneyLineItem } from "@/lib/money"

interface BillItem {
  id: string
  productName: string
  fabricPattern: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Bill {
  id: string
  billNumber?: string
  customerId?: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  items: BillItem[]
  totalAmount: number
  amount?: number
  status: "draft" | "sent" | "paid" | "overdue" | "pending"
  createdAt: string | Date
  dueDate: string | Date
  paidAt?: string | Date
  notes?: string
}

export default function BillsManagement() {
  const { toast } = useToast()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [showCreateBill, setShowCreateBill] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newBill, setNewBill] = useState({
    customerName: "",
    customerPhone: "",
    items: [{ productName: "", fabricPattern: "", quantity: 1, unitPrice: 0 }],
    notes: "",
  })

  // Fetch bills from API
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (selectedStatus !== "all") params.set("status", selectedStatus)
        const res = await fetch(`/api/bills?${params.toString()}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`โหลดข้อมูลบิลล้มเหลว (${res.status})`)
        const data = await res.json()
        const normalized: Bill[] = (data.bills || []).map((b: any) => ({
          id: b.id,
          billNumber: b.billNumber,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          totalAmount: b.totalAmount ?? b.amount ?? 0,
          amount: b.amount,
          status: (b.status as Bill["status"]) || "draft",
          createdAt: b.createdAt || b.created_at || new Date().toISOString(),
          dueDate: b.dueDate || b.due_date || new Date().toISOString(),
          notes: b.notes,
          items: (b.items || []).map((it: any, idx: number) => ({
            id: it.id || String(idx + 1),
            productName: it.productName || it.name || it.description || "",
            fabricPattern: it.fabricPattern || it.pattern || "",
            quantity: it.quantity ?? 1,
            unitPrice: it.unitPrice ?? it.price ?? 0,
            totalPrice: it.totalPrice ?? (it.quantity ?? 1) * (it.unitPrice ?? it.price ?? 0),
          })),
        }))
        if (mounted) setBills(normalized)
      } catch (e: any) {
        if (mounted) setError(e?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [selectedStatus])

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        (bill.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.billNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.customerPhone || "").includes(searchTerm)
      const matchesStatus = selectedStatus === "all" || bill.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [bills, searchTerm, selectedStatus])

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      pending: "bg-amber-100 text-amber-800",
    }
    const labels = {
      draft: "ร่าง",
      sent: "ส่งแล้ว",
      paid: "ชำระแล้ว",
      overdue: "เกินกำหนด",
      pending: "รอชำระ",
    } as Record<string, string>
    const cls = colors[status as keyof typeof colors] || colors.draft
    const label = labels[status] || status
    return <Badge className={cls}>{label}</Badge>
  }

  const createQuickBill = async () => {
    try {
      setCreating(true)
      const lineItems: MoneyLineItem[] = newBill.items.map((item) => ({
        quantity: item.quantity ?? 0,
        price: item.unitPrice ?? 0,
      }))
      const totalAmount = calculateSubtotal(lineItems)

      const payload = {
        billNumber: `BILL-${Date.now()}`,
        customerName: newBill.customerName,
        customerPhone: newBill.customerPhone,
        items: newBill.items.map((it) => ({
          name: it.productName,
          quantity: it.quantity,
          price: it.unitPrice,
          total: (it.quantity ?? 0) * (it.unitPrice ?? 0),
        })),
        amount: totalAmount,
        subtotal: totalAmount,
        status: "draft",
        notes: newBill.notes,
      }

      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("สร้างบิลไม่สำเร็จ")
      const created = await res.json()

      setShowCreateBill(false)
      setNewBill({ customerName: "", customerPhone: "", items: [{ productName: "", fabricPattern: "", quantity: 1, unitPrice: 0 }], notes: "" })

      // Refresh list
      setBills((prev) => [
        {
          id: created.id,
          billNumber: created.billNumber,
          customerName: created.customerName,
          customerPhone: created.customerPhone,
          totalAmount: created.amount ?? created.totalAmount ?? 0,
          amount: created.amount,
          status: created.status || "draft",
          createdAt: created.createdAt || created.created_at || new Date().toISOString(),
          dueDate: created.dueDate || created.due_date || new Date().toISOString(),
          notes: created.notes,
          items: (created.items || []).map((it: any, idx: number) => ({
            id: it.id || String(idx + 1),
            productName: it.name || it.productName || "",
            fabricPattern: it.pattern || it.fabricPattern || "",
            quantity: it.quantity ?? 1,
            unitPrice: it.price ?? it.unitPrice ?? 0,
            totalPrice: it.total ?? it.totalPrice ?? 0,
          })),
        },
        ...prev,
      ])

      toast({ title: "สร้างบิลสำเร็จ", description: `บิล ${payload.billNumber} ถูกสร้างแล้ว` })
    } catch (e: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: e?.message || "ไม่สามารถสร้างบิลได้", variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  const copyBillLink = (billId: string) => {
    const link = `${window.location.origin}/bill/view/${billId}`
    navigator.clipboard.writeText(link)
    toast({ title: "คัดลอกลิงก์สำเร็จ", description: "ลิงก์บิลถูกคัดลอกไปยังคลิปบอร์ดแล้ว" })
  }

  const sendBillMessage = (bill: Bill) => {
    const message = `สวัสดีครับ/ค่ะ คุณ${bill.customerName}\n\nขอส่งบิลสำหรับการสั่งซื้อ\nบิลเลขที่: ${bill.billNumber || bill.id}\nยอดรวม: ${formatCurrency(bill.totalAmount)}\n\nดูรายละเอียดบิล: ${window.location.origin}/bill/view/${bill.id}\n\nกรุณาชำระเงินภายในกำหนด\nขอบคุณครับ/ค่ะ`
    navigator.clipboard.writeText(message)
    toast({ title: "คัดลอกข้อความสำเร็จ", description: "ข้อความส่งบิลถูกคัดลอกแล้ว" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-burgundy-800">จัดการบิล/ใบเสร็จ</h1>
          <p className="text-gray-600 mt-1">สร้างและจัดการบิลอย่างรวดเร็ว</p>
        </div>
        <Dialog open={showCreateBill} onOpenChange={setShowCreateBill}>
          <DialogTrigger asChild>
            <Button className="bg-burgundy-600 hover:bg-burgundy-700" disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              สร้างบิลใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>สร้างบิลใหม่ (3 คลิก)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">ชื่อลูกค้า</Label>
                  <Input id="customerName" value={newBill.customerName} onChange={(e) => setNewBill({ ...newBill, customerName: e.target.value })} placeholder="ชื่อลูกค้า" />
                </div>
                <div>
                  <Label htmlFor="customerPhone">เบอร์โทร</Label>
                  <Input id="customerPhone" value={newBill.customerPhone} onChange={(e) => setNewBill({ ...newBill, customerPhone: e.target.value })} placeholder="เบอร์โทรศัพท์" />
                </div>
              </div>

              {/* Items */}
              <div>
                <Label>รายการสินค้า</Label>
                {newBill.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-2">
                    <Input placeholder="ชื่อสินค้า" value={item.productName} onChange={(e) => setNewBill({ ...newBill, items: newBill.items.map((it, i) => (i === index ? { ...it, productName: e.target.value } : it)) })} />
                    <Input placeholder="ลายผ้า" value={item.fabricPattern} onChange={(e) => setNewBill({ ...newBill, items: newBill.items.map((it, i) => (i === index ? { ...it, fabricPattern: e.target.value } : it)) })} />
                    <Input type="number" placeholder="จำนวน" value={item.quantity} onChange={(e) => setNewBill({ ...newBill, items: newBill.items.map((it, i) => (i === index ? { ...it, quantity: Number.parseInt(e.target.value) || 1 } : it)) })} />
                    <Input type="number" placeholder="ราคา" value={item.unitPrice} onChange={(e) => setNewBill({ ...newBill, items: newBill.items.map((it, i) => (i === index ? { ...it, unitPrice: Number.parseFloat(e.target.value) || 0 } : it)) })} />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => setNewBill({ ...newBill, items: [...newBill.items, { productName: "", fabricPattern: "", quantity: 1, unitPrice: 0 }] })} className="mt-2 bg-transparent">
                  เพิ่มรายการ
                </Button>
              </div>

              {/* Total */}
              <div className="text-right">
                <p className="text-lg font-bold text-burgundy-600">
                  ยอดรวม: {newBill.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toLocaleString()} บาท
                </p>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">หมายเหตุ</Label>
                <Textarea id="notes" value={newBill.notes} onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })} placeholder="หมายเหตุเพิ่มเติม" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateBill(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={createQuickBill} className="bg-burgundy-600 hover:bg-burgundy-700" disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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
                <p className="text-2xl font-bold text-blue-600">{bills.filter((b) => b.status === "sent" || b.status === "pending").length}</p>
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
              <option value="pending">รอชำระ</option>
              <option value="paid">ชำระแล้ว</option>
              <option value="overdue">เกินกำหนด</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>รายการบิล</CardTitle>
          {loading ? (
            <div className="inline-flex items-center text-sm text-gray-500"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> กำลังโหลด</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : null}
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
                      <span className="font-semibold text-gray-900">{bill.billNumber || bill.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{bill.customerName}</h4>
                        {bill.customerPhone ? <p className="text-sm text-gray-500">{bill.customerPhone}</p> : null}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-burgundy-600">{formatCurrency(bill.totalAmount)}</span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(bill.status)}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{new Date(bill.createdAt).toLocaleDateString("th-TH")}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{new Date(bill.dueDate).toLocaleDateString("th-TH")}</span>
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

                {!loading && filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">ไม่พบบิลที่ตรงกับการค้นหา</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
