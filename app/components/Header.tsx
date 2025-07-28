"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingCart, User, Search, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Shield, Heart, LogOut } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, setLanguage } = useLanguage()
  const { items } = useCart()

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

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
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
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name[language]}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Search className="w-4 h-4" />
            </Button>

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
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs bg-blue-600">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{language === "en" ? "My Account" : "บัญชีของฉัน"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  {language === "en" ? "Profile" : "โปรไฟล์"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {language === "en" ? "My Orders" : "คำสั่งซื้อของฉัน"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Heart className="w-4 h-4 mr-2" />
                  {language === "en" ? "Wishlist" : "รายการโปรด"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/login" className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    {language === "en" ? "Admin Panel" : "เข้าสู่ระบบผู้ดูแล"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="w-4 h-4 mr-2" />
                  {language === "en" ? "Sign Out" : "ออกจากระบบ"}
                </DropdownMenuItem>
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
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name[language]}
                </Link>
              ))}
            </div>

            {/* Mobile Search */}
            <div className="mt-4 px-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === "en" ? "Search products..." : "ค้นหาสินค้า..."}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
