"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, ShoppingCart, User, Globe, Heart, Package, Shield, LogOut } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"

export default function Header() {
  const { language, toggleLanguage, t } = useLanguage()
  const { items } = useCart()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const navigationItems = [
    {
      href: "/",
      label: language === "th" ? "หน้าแรก" : "Home",
    },
    {
      href: "/products",
      label: language === "th" ? "สินค้า" : "Products",
    },
    {
      href: "/fabric-collections",
      label: language === "th" ? "คอลเลกชันผ้า" : "Fabric Collections",
    },
    {
      href: "/custom-covers",
      label: language === "th" ? "ผ้าคลุมตามสั่ง" : "Custom Covers",
    },
    {
      href: "/about",
      label: language === "th" ? "เกี่ยวกับเรา" : "About",
    },
    {
      href: "/contact",
      label: language === "th" ? "ติดต่อ" : "Contact",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              {language === "th" ? "โซฟาคัฟเวอร์โปร" : "SofaCover Pro"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="hidden sm:flex">
              <Globe className="w-4 h-4 mr-1" />
              {language === "th" ? "EN" : "TH"}
            </Button>

            {/* Search */}
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="w-4 h-4" />
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {language === "th" ? "โปรไฟล์" : "Profile"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    {language === "th" ? "คำสั่งซื้อของฉัน" : "My Orders"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist" className="flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    {language === "th" ? "รายการโปรด" : "Wishlist"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/login" className="flex items-center text-blue-600">
                    <Shield className="w-4 h-4 mr-2" />
                    {language === "th" ? "เข้าสู่ระบบผู้ดูแล" : "Admin Panel"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  {language === "th" ? "ออกจากระบบ" : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Language Toggle Mobile */}
                  <Button variant="ghost" onClick={toggleLanguage} className="justify-start">
                    <Globe className="w-4 h-4 mr-2" />
                    {language === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
                  </Button>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-2">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-md hover:bg-gray-100"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile User Actions */}
                  <div className="border-t pt-4 space-y-2">
                    <Link
                      href="/profile"
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-md hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {language === "th" ? "โปรไฟล์" : "Profile"}
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2 px-3 rounded-md hover:bg-gray-100"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {language === "th" ? "คำสั่งซื้อของฉัน" : "My Orders"}
                    </Link>
                    <Link
                      href="/admin/login"
                      className="flex items-center text-sm font-medium text-blue-600 py-2 px-3 rounded-md hover:bg-blue-50"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {language === "th" ? "เข้าสู่ระบบผู้ดูแล" : "Admin Panel"}
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar (when open) */}
        {isSearchOpen && (
          <div className="border-t py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={language === "th" ? "ค้นหาสินค้า..." : "Search products..."}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
