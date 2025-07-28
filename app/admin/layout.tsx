"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  FileText,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ShoppingCart,
  TrendingUp,
  Bot,
  Bell,
  Search,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ProtectedRoute from "../components/ProtectedRoute"
import { useAuth } from "../contexts/AuthContext"
import { Suspense } from "react"

const navigation = [
  { name: "ภาพรวม", href: "/admin", icon: BarChart3, permissions: ["analytics.view"] },
  { name: "ใบแจ้งหนี้", href: "/admin/bills", icon: FileText, permissions: ["invoices.view"] },
  { name: "สินค้า", href: "/admin/products", icon: Package, permissions: ["products.view"] },
  { name: "ลูกค้า", href: "/admin/customers", icon: Users, permissions: ["users.view"] },
  { name: "คำสั่งซื้อ", href: "/admin/orders", icon: ShoppingCart, permissions: ["orders.view"] },
  { name: "รายงาน", href: "/admin/analytics", icon: TrendingUp, permissions: ["reports.view"] },
  { name: "AI ผู้ช่วย", href: "/admin/ai", icon: Bot, permissions: ["ai.use"] },
  { name: "การตั้งค่า", href: "/admin/settings", icon: Settings, permissions: ["settings.view"] },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, hasAnyPermission } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "staff":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "ผู้ดูแลระบบ"
      case "manager":
        return "ผู้จัดการ"
      case "staff":
        return "พนักงาน"
      default:
        return "ผู้ใช้งาน"
    }
  }

  return (
    <ProtectedRoute requireBackendAccess>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen bg-gray-50">
          {/* Mobile sidebar */}
          <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
              <div className="flex h-16 items-center justify-between px-4">
                <h2 className="text-lg font-semibold text-gray-900">เมนู</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                  if (!hasAnyPermission(item.permissions)) return null

                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                        isActive ? "bg-pink-100 text-pink-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
              <div className="flex items-center flex-shrink-0 px-4 py-4">
                <Link href="/admin" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Admin Panel</span>
                </Link>
              </div>
              <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                  if (!hasAnyPermission(item.permissions)) return null

                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                        isActive ? "bg-pink-100 text-pink-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:pl-64">
            {/* Top navigation */}
            <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
              <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
                  >
                    <Menu className="h-6 w-6" />
                  </button>

                  <div className="hidden sm:block">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input placeholder="ค้นหา..." className="pl-10 w-64" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <Home className="w-5 h-5" />
                  </Link>

                  <button className="relative text-gray-500 hover:text-gray-700">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                          <AvatarFallback className="bg-pink-100 text-pink-600">
                            {user ? getUserInitials(user.name) : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                          <Badge className={`${getRoleColor(user?.role || "")} w-fit mt-1`}>
                            {getRoleLabel(user?.role || "")}
                          </Badge>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>โปรไฟล์</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>การตั้งค่า</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>ออกจากระบบ</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Page content */}
            <main className="py-8">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
          </div>
        </div>
      </Suspense>
    </ProtectedRoute>
  )
}
