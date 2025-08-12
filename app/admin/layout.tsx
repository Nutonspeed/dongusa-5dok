"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  TestTube,
  FileText,
  Truck,
  MessageSquare,
  ImageIcon,
  Shield,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, permission: "view_analytics" },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart, permission: "view_orders" },
  { name: "Bills", href: "/admin/bills", icon: FileText, permission: "view_orders" },
  { name: "Customers", href: "/admin/customers", icon: Users, permission: "view_customers" },
  { name: "Products", href: "/admin/products", icon: Package, permission: "view_products" },
  { name: "Fabric Gallery", href: "/admin/fabric-gallery", icon: ImageIcon, permission: "manage_fabric_gallery" },
  { name: "Storefront Manager", href: "/admin/storefront", icon: Settings, permission: "manage_storefront" },
  { name: "Shipping", href: "/admin/shipping", icon: Truck, permission: "manage_shipping" },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare, permission: "view_orders" },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "view_analytics" },
  { name: "Settings", href: "/admin/settings", icon: Settings, permission: "view_settings" },
  { name: "Demo", href: "/admin/demo", icon: TestTube, permission: "view_analytics" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isAuthenticated, isAdmin, hasPermission, logout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=" + encodeURIComponent(pathname))
      return
    }

    if (!isAdmin) {
      router.push("/")
      return
    }
  }, [isAuthenticated, isAdmin, pathname, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const filteredNavigation = navigation.filter((item) => !item.permission || hasPermission(item.permission))

  // Show loading or redirect if not authenticated/authorized
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {!isAuthenticated ? "Authentication Required" : "Access Denied"}
          </h2>
          <p className="text-gray-600 mb-4">
            {!isAuthenticated
              ? "Please log in to access the admin dashboard."
              : "You don't have permission to access this area."}
          </p>
          <Button onClick={() => router.push("/login")} className="bg-primary">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent">
      <Alert className="m-4 border-primary bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary">
          Admin Mode: You are logged in as {user?.firstName} {user?.lastName} with administrative privileges.
        </AlertDescription>
      </Alert>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-20 left-4 z-40 md:hidden bg-transparent">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-6 border-b bg-primary">
              <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive ? "bg-accent text-primary" : "text-gray-600 hover:bg-accent hover:text-primary"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t p-4">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-primary text-primary hover:bg-accent"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:top-16">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 burgundy-shadow">
          <div className="flex h-16 items-center px-6 border-b bg-primary">
            <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive ? "bg-accent text-primary" : "text-gray-600 hover:bg-accent hover:text-primary"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent border-primary text-primary hover:bg-accent"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 pt-16">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
