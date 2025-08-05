"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  MessageSquare,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface Notification {
  id: string
  type: "order" | "payment" | "inventory" | "system" | "customer"
  title: string
  message: string
  time: string
  read: boolean
  priority: "low" | "medium" | "high"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "คำสั่งซื้อใหม่",
    message: "คำสั่งซื้อ #ORD-001 จากคุณสมชาย ใจดี",
    time: "5 นาทีที่แล้ว",
    read: false,
    priority: "high",
  },
  {
    id: "2",
    type: "payment",
    title: "การชำระเงิน",
    message: "ได้รับการชำระเงิน ฿2,890 สำหรับคำสั่งซื้อ #ORD-002",
    time: "15 นาทีที่แล้ว",
    read: false,
    priority: "medium",
  },
  {
    id: "3",
    type: "inventory",
    title: "สต็อกต่ำ",
    message: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม เหลือเพียง 3 ชิ้น",
    time: "30 นาทีที่แล้ว",
    read: true,
    priority: "medium",
  },
  {
    id: "4",
    type: "customer",
    title: "รีวิวใหม่",
    message: "คุณสมหญิง ให้คะแนน 5 ดาว พร้อมรีวิว",
    time: "1 ชั่วโมงที่แล้ว",
    read: true,
    priority: "low",
  },
  {
    id: "5",
    type: "system",
    title: "อัปเดตระบบ",
    message: "ระบบได้รับการอัปเดตเป็นเวอร์ชั่น 2.1.0",
    time: "2 ชั่วโมงที่แล้ว",
    read: true,
    priority: "low",
  },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "order":
      return <ShoppingCart className="w-4 h-4 text-blue-600" />
    case "payment":
      return <DollarSign className="w-4 h-4 text-green-600" />
    case "inventory":
      return <Package className="w-4 h-4 text-orange-600" />
    case "customer":
      return <Users className="w-4 h-4 text-purple-600" />
    case "system":
      return <Settings className="w-4 h-4 text-gray-600" />
    default:
      return <Bell className="w-4 h-4 text-gray-600" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 border-red-200"
    case "medium":
      return "bg-yellow-100 border-yellow-200"
    case "low":
      return "bg-gray-100 border-gray-200"
    default:
      return "bg-gray-100 border-gray-200"
  }
}

export function AdminHeader() {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log("Searching for:", searchQuery)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Sidebar Trigger */}
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="ค้นหาคำสั่งซื้อ, ลูกค้า, สินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-4 mr-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">฿45,230</span>
              </div>
              <span className="text-gray-500">วันนี้</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-blue-600">
                <ShoppingCart className="w-4 h-4" />
                <span className="font-semibold">23</span>
              </div>
              <span className="text-gray-500">คำสั่งซื้อ</span>
            </div>
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-semibold">การแจ้งเตือน</h4>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                    อ่านทั้งหมด
                  </Button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>ไม่มีการแจ้งเตือน</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                        !notification.read ? "bg-blue-50" : ""
                      } ${getPriorityColor(notification.priority)}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    ดูการแจ้งเตือนทั้งหมด
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                <img
                  src={user?.avatar || "/placeholder-user.jpg"}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  <Badge variant="outline" className="w-fit mt-1 capitalize">
                    {user?.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>โปรไฟล์</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>การตั้งค่า</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>ข้อความ</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {unreadCount}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
