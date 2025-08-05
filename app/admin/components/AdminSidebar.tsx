"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  TrendingUp,
  WarehouseIcon as Inventory,
  MessageSquare,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Store,
  CreditCard,
  Truck,
  Tag,
  Image,
  Database,
  Shield,
  Mail,
  Calendar,
  PieChart,
  Activity,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface MenuItem {
  title: string
  icon: any
  href?: string
  badge?: string | number
  children?: MenuItem[]
  permissions?: string[]
}

const menuItems: MenuItem[] = [
  {
    title: "แดชบอร์ด",
    icon: BarChart3,
    href: "/admin/dashboard",
    permissions: ["read:dashboard"],
  },
  {
    title: "การขาย",
    icon: TrendingUp,
    children: [
      {
        title: "คำสั่งซื้อ",
        icon: ShoppingCart,
        href: "/admin/orders",
        badge: 8,
        permissions: ["read:orders"],
      },
      {
        title: "ใบแจ้งหนี้",
        icon: FileText,
        href: "/admin/bills",
        badge: 3,
        permissions: ["read:bills"],
      },
      {
        title: "การชำระเงิน",
        icon: CreditCard,
        href: "/admin/payments",
        permissions: ["read:payments"],
      },
      {
        title: "การจัดส่ง",
        icon: Truck,
        href: "/admin/shipping",
        permissions: ["read:shipping"],
      },
    ],
  },
  {
    title: "สินค้า",
    icon: Package,
    children: [
      {
        title: "จัดการสินค้า",
        icon: Package,
        href: "/admin/products",
        permissions: ["read:products"],
      },
      {
        title: "คลังสินค้า",
        icon: Inventory,
        href: "/admin/inventory",
        permissions: ["read:inventory"],
      },
      {
        title: "หมวดหมู่",
        icon: Tag,
        href: "/admin/categories",
        permissions: ["read:categories"],
      },
      {
        title: "แกลเลอรี่",
        icon: Image,
        href: "/admin/gallery",
        permissions: ["read:gallery"],
      },
    ],
  },
  {
    title: "ลูกค้า",
    icon: Users,
    children: [
      {
        title: "จัดการลูกค้า",
        icon: Users,
        href: "/admin/customers",
        permissions: ["read:customers"],
      },
      {
        title: "กลุ่มลูกค้า",
        icon: Users,
        href: "/admin/customer-groups",
        permissions: ["read:customers"],
      },
      {
        title: "รีวิวและคะแนน",
        icon: MessageSquare,
        href: "/admin/reviews",
        permissions: ["read:reviews"],
      },
    ],
  },
  {
    title: "รายงาน",
    icon: PieChart,
    children: [
      {
        title: "สถิติการขาย",
        icon: TrendingUp,
        href: "/admin/analytics",
        permissions: ["read:analytics"],
      },
      {
        title: "รายงานสินค้า",
        icon: Package,
        href: "/admin/reports/products",
        permissions: ["read:reports"],
      },
      {
        title: "รายงานลูกค้า",
        icon: Users,
        href: "/admin/reports/customers",
        permissions: ["read:reports"],
      },
      {
        title: "รายงานการเงิน",
        icon: CreditCard,
        href: "/admin/reports/financial",
        permissions: ["read:reports"],
      },
    ],
  },
  {
    title: "การตลาด",
    icon: Zap,
    children: [
      {
        title: "โปรโมชั่น",
        icon: Tag,
        href: "/admin/promotions",
        permissions: ["read:promotions"],
      },
      {
        title: "คูปอง",
        icon: Tag,
        href: "/admin/coupons",
        permissions: ["read:coupons"],
      },
      {
        title: "อีเมลมาร์เก็ตติ้ง",
        icon: Mail,
        href: "/admin/email-marketing",
        permissions: ["read:marketing"],
      },
      {
        title: "แคมเปญ",
        icon: Calendar,
        href: "/admin/campaigns",
        permissions: ["read:campaigns"],
      },
    ],
  },
  {
    title: "เนื้อหา",
    icon: FileText,
    children: [
      {
        title: "หน้าเว็บ",
        icon: FileText,
        href: "/admin/pages",
        permissions: ["read:pages"],
      },
      {
        title: "บล็อก",
        icon: FileText,
        href: "/admin/blog",
        permissions: ["read:blog"],
      },
      {
        title: "แบนเนอร์",
        icon: Image,
        href: "/admin/banners",
        permissions: ["read:banners"],
      },
      {
        title: "FAQ",
        icon: HelpCircle,
        href: "/admin/faq",
        permissions: ["read:faq"],
      },
    ],
  },
  {
    title: "ระบบ",
    icon: Settings,
    children: [
      {
        title: "การตั้งค่า",
        icon: Settings,
        href: "/admin/settings",
        permissions: ["read:settings"],
      },
      {
        title: "ผู้ใช้งาน",
        icon: Shield,
        href: "/admin/users",
        permissions: ["read:users"],
      },
      {
        title: "สิทธิ์การเข้าถึง",
        icon: Shield,
        href: "/admin/permissions",
        permissions: ["read:permissions"],
      },
      {
        title: "ฐานข้อมูล",
        icon: Database,
        href: "/admin/database",
        permissions: ["read:database"],
      },
      {
        title: "กิจกรรมระบบ",
        icon: Activity,
        href: "/admin/activity-logs",
        permissions: ["read:logs"],
      },
    ],
  },
]

export function AdminSidebar() {
  const { user, logout, hasPermission } = useAuth()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const hasMenuPermission = (item: MenuItem): boolean => {
    if (!item.permissions || item.permissions.length === 0) return true
    return item.permissions.some((permission) => hasPermission(permission))
  }

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter((item) => {
      if (!hasMenuPermission(item)) return false
      if (item.children) {
        item.children = filterMenuItems(item.children)
        return item.children.length > 0
      }
      return true
    })
  }

  const filteredMenuItems = filterMenuItems(menuItems)

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.title)
    const isActive = item.href === pathname
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren) {
      return (
        <Collapsible key={item.title} open={isExpanded} onOpenChange={() => toggleExpanded(item.title)}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className={cn("w-full justify-between", level > 0 && "ml-4")}>
                <div className="flex items-center">
                  <item.icon className="w-4 h-4 mr-3" />
                  <span>{item.title}</span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.children?.map((child) => (
                  <SidebarMenuSubItem key={child.title}>
                    <SidebarMenuSubButton asChild isActive={child.href === pathname}>
                      <Link href={child.href || "#"} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <child.icon className="w-4 h-4 mr-3" />
                          <span>{child.title}</span>
                        </div>
                        {child.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {child.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link href={item.href || "#"} className="flex items-center justify-between">
            <div className="flex items-center">
              <item.icon className="w-4 h-4 mr-3" />
              <span>{item.title}</span>
            </div>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">SofaCover Pro</h2>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{filteredMenuItems.map((item) => renderMenuItem(item))}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel>ช่วยเหลือ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/help">
                    <HelpCircle className="w-4 h-4 mr-3" />
                    <span>ช่วยเหลือ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/support">
                    <MessageSquare className="w-4 h-4 mr-3" />
                    <span>ติดต่อสนับสนุน</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <img src={user?.avatar || "/placeholder-user.jpg"} alt={user?.name} className="w-8 h-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
