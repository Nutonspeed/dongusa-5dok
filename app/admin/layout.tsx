"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Beaker,
  Warehouse,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "แดชบอร์ด", href: "/admin", icon: Home },
  { name: "รายงานและสถิติ", href: "/admin/analytics", icon: BarChart3 },
  { name: "จัดการสินค้า", href: "/admin/products", icon: Package },
  { name: "จัดการคำสั่งซื้อ", href: "/admin/orders", icon: ShoppingCart },
  { name: "จัดการลูกค้า", href: "/admin/customers", icon: Users },
  { name: "จัดการสต็อก", href: "/admin/inventory", icon: Warehouse },
  { name: "Demo Control", href: "/admin/demo", icon: Beaker },
  { name: "ตั้งค่าระบบ", href: "/admin/settings", icon: Settings },
]

interface AdminUser {
  email: string
  name: string
  role: string
  loginTime: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    // ตรวจสอบการล็อกอิน
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("admin_token")
        const userStr = localStorage.getItem("admin_user")

        console.log("🔍 Checking authentication...")
        console.log("Token:", token ? "exists" : "missing")
        console.log("User data:", userStr ? "exists" : "missing")

        if (!token || !userStr) {
          console.log("❌ No authentication found")
          if (pathname !== "/admin/login") {
            console.log("🔄 Redirecting to login...")
            router.push("/admin/login")
          }
          setIsAuthenticated(false)
          setAdminUser(null)
        } else {
          try {
            const user = JSON.parse(userStr) as AdminUser
            console.log("✅ Authentication valid for:", user.email)
            setIsAuthenticated(true)
            setAdminUser(user)
          } catch (parseError) {
            console.error("❌ Invalid user data:", parseError)
            localStorage.removeItem("admin_token")
            localStorage.removeItem("admin_user")
            if (pathname !== "/admin/login") {
              router.push("/admin/login")
            }
            setIsAuthenticated(false)
            setAdminUser(null)
          }
        }
      } catch (error) {
        console.error("❌ Auth check error:", error)
        setIsAuthenticated(false)
        setAdminUser(null)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  const handleLogout = () => {
    console.log("🚪 Logging out...")
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    setIsAuthenticated(false)
    setAdminUser(null)
    router.push("/admin/login")
    router.refresh()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  // Login page - don't wrap with admin layout
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Not authenticated - show nothing (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">กำลังเปลี่ยนเส้นทางไปหน้าล็อกอิน...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive ? "bg-pink-100 text-pink-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive ? "text-pink-500" : "text-gray-400 group-hover:text-gray-500"}`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{adminUser?.name}</p>
                <p className="text-xs text-gray-500">{adminUser?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-gray-600 hover:text-gray-900 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive ? "bg-pink-100 text-pink-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive ? "text-pink-500" : "text-gray-400 group-hover:text-gray-500"}`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{adminUser?.name}</p>
                <p className="text-xs text-gray-500">{adminUser?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-gray-600 hover:text-gray-900 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find((item) => item.href === pathname)?.name || "Admin Panel"}
              </h2>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden sm:flex sm:items-center sm:gap-x-2">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-pink-600" />
                </div>
                <span className="text-sm text-gray-700">{adminUser?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
