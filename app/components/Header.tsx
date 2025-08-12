"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, ShoppingCart, User, Search, Globe, LogOut, Settings, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { language, setLanguage } = useLanguage()
  const { items } = useCart()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const router = useRouter()

  const navigation = [
    {
      name: { en: "Home", th: "หน้าแรก" },
      href: "/",
    },
    {
      name: { en: "Products", th: "สินค้า" },
      href: "/products",
    },
    {
      name: { en: "Custom Covers", th: "ผ้าคลุมตามสั่ง" },
      href: "/custom-covers",
    },
    {
      name: { en: "Fabric Gallery", th: "แกลเลอรี่ผ้า" },
      href: "/fabric-gallery",
    },
    {
      name: { en: "Collections", th: "คอลเลกชัน" },
      href: "/fabric-collections",
    },
    {
      name: { en: "About", th: "เกี่ยวกับเรา" },
      href: "/about",
    },
    {
      name: { en: "Contact", th: "ติดต่อ" },
      href: "/contact",
    },
  ]

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "th" : "en")
  }

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsSearchOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {language === "en" ? "SofaCover Pro" : "โซฟาคัฟเวอร์ โปร"}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name[language]}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === "en" ? "Search products..." : "ค้นหาสินค้า..."}
                    className="w-48 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    autoFocus
                    onBlur={() => {
                      setTimeout(() => setIsSearchOpen(false), 200)
                    }}
                  />
                  <Button type="submit" variant="ghost" size="sm" className="ml-1">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => setIsSearchOpen(true)}>
                  <Search className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Language Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs bg-primary">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  {isAuthenticated && (
                    <span className="hidden sm:block text-sm">
                      {user?.firstName}
                      {isAdmin && <Shield className="w-3 h-3 ml-1 text-primary inline" />}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-1.5 text-sm text-gray-500 border-b">
                      {user?.email}
                      {isAdmin && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {language === "en" ? "Profile" : "โปรไฟล์"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {language === "en" ? "My Orders" : "คำสั่งซื้อของฉัน"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        {language === "en" ? "Settings" : "ตั้งค่า"}
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center text-primary">
                            <Shield className="w-4 h-4 mr-2" />
                            {language === "en" ? "Admin Dashboard" : "แดชบอร์ดแอดมิน"}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      {language === "en" ? "Logout" : "ออกจากระบบ"}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {language === "en" ? "Login" : "เข้าสู่ระบบ"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {language === "en" ? "Register" : "สมัครสมาชิก"}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-accent rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name[language]}
                </Link>
              ))}
            </div>

            {/* Mobile Search */}
            <div className="mt-4 px-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === "en" ? "Search products..." : "ค้นหาสินค้า..."}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
