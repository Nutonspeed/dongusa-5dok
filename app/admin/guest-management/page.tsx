"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, Package, UserCheck, Search, Download, Trash2, Eye, Edit } from "lucide-react"

interface GuestUser {
  id: string
  session_id: string
  email?: string
  full_name?: string
  phone?: string
  status: "active" | "converted" | "expired"
  created_at: string
  last_activity: string
  notes?: string
}

interface GuestOrder {
  id: string
  guest_user_id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  payment_status: string
}

export default function GuestManagementPage() {
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([])
  const [guestOrders, setGuestOrders] = useState<GuestOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedGuest, setSelectedGuest] = useState<GuestUser | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockGuestUsers: GuestUser[] = [
      {
        id: "1",
        session_id: "guest_1234567890_abc123",
        email: "guest1@example.com",
        full_name: "สมชาย ใจดี",
        phone: "081-234-5678",
        status: "active",
        created_at: "2024-01-15T10:30:00Z",
        last_activity: "2024-01-15T14:20:00Z",
        notes: "ลูกค้าสนใจผ้าคลุมโซฟาลายดอกไม้",
      },
      {
        id: "2",
        session_id: "guest_0987654321_xyz789",
        email: "guest2@example.com",
        full_name: "สมหญิง รักสวย",
        phone: "082-345-6789",
        status: "converted",
        created_at: "2024-01-14T09:15:00Z",
        last_activity: "2024-01-14T16:45:00Z",
        notes: "แปลงเป็นสมาชิกแล้ว หลังจากสั่งซื้อ",
      },
      {
        id: "3",
        session_id: "guest_1122334455_def456",
        full_name: "วิชัย มั่นคง",
        phone: "083-456-7890",
        status: "active",
        created_at: "2024-01-13T11:00:00Z",
        last_activity: "2024-01-13T11:30:00Z",
        notes: "ดูสินค้าแต่ยังไม่ได้สั่งซื้อ",
      },
    ]

    const mockGuestOrders: GuestOrder[] = [
      {
        id: "1",
        guest_user_id: "1",
        order_number: "GO-2024-001",
        status: "confirmed",
        total_amount: 1250,
        created_at: "2024-01-15T12:00:00Z",
        payment_status: "paid",
      },
      {
        id: "2",
        guest_user_id: "2",
        order_number: "GO-2024-002",
        status: "delivered",
        total_amount: 890,
        created_at: "2024-01-14T14:30:00Z",
        payment_status: "paid",
      },
    ]

    setGuestUsers(mockGuestUsers)
    setGuestOrders(mockGuestOrders)
    setLoading(false)
  }, [])

  const filteredUsers = guestUsers.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      converted: "bg-blue-100 text-blue-800",
      expired: "bg-gray-100 text-gray-800",
    }

    const labels = {
      active: "ใช้งานอยู่",
      converted: "แปลงแล้ว",
      expired: "หมดอายุ",
    }

    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const handleEditGuest = (guest: GuestUser) => {
    setSelectedGuest(guest)
    setIsEditDialogOpen(true)
  }

  const handleSaveGuest = () => {
    // Implementation for saving guest user data
    setIsEditDialogOpen(false)
    setSelectedGuest(null)
  }

  const stats = {
    totalGuests: guestUsers.length,
    activeGuests: guestUsers.filter((u) => u.status === "active").length,
    convertedGuests: guestUsers.filter((u) => u.status === "converted").length,
    totalOrders: guestOrders.length,
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการผู้ใช้แขก</h1>
          <p className="text-gray-600">จัดการข้อมูลผู้ใช้ที่ยังไม่ได้ลงทะเบียน</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            ส่งออกข้อมูล
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            ล้างข้อมูลเก่า
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ใช้แขกทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ใช้งานอยู่</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeGuests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">แปลงเป็นสมาชิก</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.convertedGuests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คำสั่งซื้อ</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">ผู้ใช้แขก</TabsTrigger>
          <TabsTrigger value="orders">คำสั่งซื้อ</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาด้วยชื่อ, อีเมล, หรือเบอร์โทร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">ใช้งานอยู่</option>
              <option value="converted">แปลงแล้ว</option>
              <option value="expired">หมดอายุ</option>
            </select>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>รายชื่อผู้ใช้แขก</CardTitle>
              <CardDescription>ผู้ใช้ที่เข้าชมและใช้งานเว็บไซต์โดยไม่ได้ลงทะเบียน</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>เบอร์โทร</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>วันที่สร้าง</TableHead>
                    <TableHead>กิจกรรมล่าสุด</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || "ไม่ระบุชื่อ"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString("th-TH")}</TableCell>
                      <TableCell>{new Date(user.last_activity).toLocaleDateString("th-TH")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditGuest(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>คำสั่งซื้อจากผู้ใช้แขก</CardTitle>
              <CardDescription>คำสั่งซื้อที่สั่งโดยผู้ใช้ที่ยังไม่ได้ลงทะเบียน</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>หมายเลขคำสั่งซื้อ</TableHead>
                    <TableHead>ผู้สั่ง</TableHead>
                    <TableHead>จำนวนเงิน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การชำระเงิน</TableHead>
                    <TableHead>วันที่สั่ง</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guestOrders.map((order) => {
                    const guestUser = guestUsers.find((u) => u.id === order.guest_user_id)
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{guestUser?.full_name || "ไม่ระบุชื่อ"}</TableCell>
                        <TableCell>฿{order.total_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              order.payment_status === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {order.payment_status === "paid" ? "ชำระแล้ว" : "รอชำระ"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString("th-TH")}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Guest Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้ใช้แขก</DialogTitle>
            <DialogDescription>อัปเดตข้อมูลของผู้ใช้แขกและเพิ่มหมายเหตุ</DialogDescription>
          </DialogHeader>
          {selectedGuest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="full_name" className="text-right">
                  ชื่อ
                </Label>
                <Input id="full_name" defaultValue={selectedGuest.full_name || ""} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  อีเมล
                </Label>
                <Input id="email" type="email" defaultValue={selectedGuest.email || ""} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  เบอร์โทร
                </Label>
                <Input id="phone" defaultValue={selectedGuest.phone || ""} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  หมายเหตุ
                </Label>
                <Textarea id="notes" defaultValue={selectedGuest.notes || ""} className="col-span-3" rows={3} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveGuest}>บันทึก</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
