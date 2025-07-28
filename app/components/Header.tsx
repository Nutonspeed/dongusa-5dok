"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, ShoppingCart, User, Search, Globe, LogIn, LogOut, Settings, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { items } = useCart()
  const { user, isAuthenticated, logout, isBackendUser } = useAuth()
  const router = useRouter()

  const navigation = [
    { name: language === "th" ? "หน้าหลัก" : "Home", href: "/" },
    { name: language === "th" ? "สินค้า" : "Products", href: "/products" },
    { name: language === "th" ? "คอลเลกชัน" : "Collections", href: "/fabric-collections" },
    { name: language === "th" ? "แกลเลอรี่" : "Gallery", href: "/fabric-gallery" },
    { name: language === "th" ? "สั่งทำพิเศษ" : "Custom", href: "/custom-covers" },
    { name: language === "th" ? "เกี่ยวกับเรา" : "About", href: "/about" },
    { name: language === "th" ? "ติดต่อ" : "Contact", href: "/contact" },
  ]

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = () => {
    logout()
    router.push("/")
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
      case "customer":
        return "bg-purple-100 text-purple-800"
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
      case "customer":
        return "ลูกค้า"
      default:
        return "ผู้ใช้งาน"
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">SofaCover</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-pink-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "th" ? "en" : "th")}
              className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
              title={language === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
            >
              <Globe className="w-5 h-5" />
            </button>

            {/* Search */}
            <button className="p-2 text-gray-600 hover:text-pink-600 transition-colors lg:hidden">
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-pink-600 hover:bg-pink-600">
                  {totalItems}
                </Badge>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-pink-100 text-pink-600">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <Badge className={`${getRoleColor(user.role)} w-fit mt-1`}>{getRoleLabel(user.role)}</Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>โปรไฟล์</span>
                    </Link>
                  </DropdownMenuItem>
                  {isBackendUser() && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>ระบบจัดการ</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ออกจากระบบ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/login" className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                </Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-pink-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-pink-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
