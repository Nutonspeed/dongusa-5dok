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
  Cog,
  Brain,
  Facebook,
  HelpCircle,
  Activity,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/app/contexts/AuthContext"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Bills", href: "/admin/bills", icon: FileText },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Fabric Gallery", href: "/admin/fabric-gallery", icon: ImageIcon },
  { name: "Storefront Manager", href: "/admin/storefront", icon: Settings },
  { name: "Shipping", href: "/admin/shipping", icon: Truck },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "AI Chat", href: "/admin/ai-chat", icon: Brain },
  { name: "Facebook Ads", href: "/admin/facebook-ads", icon: Facebook },
  { name: "Intelligent Monitoring", href: "/admin/intelligent-monitoring", icon: Activity },
  { name: "Business Intelligence", href: "/admin/business-intelligence", icon: BarChart3 },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "System Config", href: "/admin/system-config", icon: Cog },
  { name: "Guided Config", href: "/admin/guided-config", icon: HelpCircle },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Demo", href: "/admin/demo", icon: TestTube },
]

const AdminLayoutClient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, profile, isAuthenticated, isAdmin, isLoading, signOut } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/auth/login?redirect=" + encodeURIComponent(pathname))
      return
    }

    if (!isAdmin) {
      router.push("/")
      return
    }
  }, [isAuthenticated, isAdmin, isLoading, pathname, router])

  const handleLogout = () => {
    signOut()
    router.push("/")
  }

  const filteredNavigation: NavItem[] = navigation

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-serif font-semibold text-foreground mb-2">Loading...</h2>
          <p className="text-muted-foreground font-sans">Checking authentication status...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
            {!isAuthenticated ? "Authentication Required" : "Access Denied"}
          </h2>
          <p className="text-muted-foreground mb-4 font-sans">
            {!isAuthenticated
              ? "Please log in to access the admin dashboard."
              : "You don't have permission to access this area."}
          </p>
          <Button onClick={() => router.push("/auth/login")} className="bg-primary font-serif">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Alert className="m-2 sm:m-4 border-primary bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary font-sans text-sm sm:text-base">
          <span className="block sm:inline">Admin Mode: You are logged in as </span>
          <span className="font-medium">{user?.full_name || profile?.full_name || user?.email}</span>
          <span className="block sm:inline"> with administrative privileges.</span>
        </AlertDescription>
      </Alert>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-20 left-2 sm:left-4 z-40 lg:hidden bg-card border-border primary-shadow"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-card">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center px-6 border-b bg-primary">
              <h1 className="text-xl font-serif font-semibold text-primary-foreground">Admin Panel</h1>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
              {filteredNavigation.map((item: NavItem) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-3 text-sm font-medium font-sans rounded-md transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="border-t p-4">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent border-primary text-primary hover:bg-accent font-serif"
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:top-16">
        <div className="flex flex-col flex-grow bg-card border-r border-border primary-shadow">
          <div className="flex h-16 items-center px-6 border-b bg-primary">
            <h1 className="text-xl font-serif font-semibold text-primary-foreground">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {filteredNavigation.map((item: NavItem) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium font-sans rounded-md transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent border-primary text-primary hover:bg-accent font-serif"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 pt-16">
        <main className="py-4 sm:py-6">
          <div className="mx-auto max-w-7xl px-2 sm:px-4 md:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayoutClient
