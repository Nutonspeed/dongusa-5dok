"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSearchParams, Suspense } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications] = useState([
    { id: 1, message: "คำสั่งซื้อใหม่ #1234", time: "5 นาทีที่แล้ว", unread: true },
    { id: 2, message: "สินค้าใกล้หมด: หมอนอิง", time: "1 ชั่วโมงที่แล้ว", unread: true },
    { id: 3, message: "รีวิวใหม่ 5 ดาว", time: "2 ชั่วโมงที่แล้ว", unread: false },
  ])

  const menuItems = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      label: "แดชบอร์ด",
      badge: null,
    },
    {
      href: "/admin/products",
      icon: Package,
      label: "จัดการสินค้า",
      badge: null,
    },
    {
      href: "/admin/orders",
      icon: ShoppingCart,
      label: "คำสั่งซื้อ",
      badge: "12",
    },
    {
      href: "/admin/customers",
      icon: Users,
      label: "ลูกค้า",
      badge: null,
    },
    {
      href: "/admin/analytics",
      icon: BarChart3,
      label: "รายงานและสถิติ",
      badge: null,
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: "ตั้งค่า",
      badge: null,
    },
  ]

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const adminToken = localStorage.getItem("admin_token")
      if (adminToken) {
        setIsAuthenticated(true)
      } else {
        router.push("/admin/login")
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    router.push("/admin/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gray-100">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:static lg:inset-0`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="mt-6">
            <div className="px-3">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 mt-1 text-gray-700 rounded-lg hover:bg-gray-100 group"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.badge && <Badge className="bg-pink-600 text-white text-xs">{item.badge}</Badge>}
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="px-3">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  ออกจากระบบ
                </Button>
              </div>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="lg:ml-64">
          {/* Top bar */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden mr-2">
                  <Menu className="w-5 h-5" />
                </Button>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ค้นหา..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-64"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                    {notifications.filter((n) => n.unread).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    )}
                  </Button>
                </div>

                {/* Admin profile */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">ผู้ดูแลระบบ</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </Suspense>
  )
}
