"use client"

import type React from "react"

import { useAuth } from "@/app/contexts/AuthContext"
import { useCart } from "@/app/contexts/CartContext"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe, LogOut, Menu, Search, Settings, Shield, ShoppingCart, User, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface NavItem {
  name: { en: string; th: string }
  href: string
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { language, setLanguage } = useLanguage()
  const { items } = useCart()
  const { user, isAuthenticated, isAdmin, signOut } = useAuth()
  const router = useRouter()

  const navigation: NavItem[] = [
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

  const cartItemCount = items.reduce((total: number, item: any) => total + item.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsSearchOpen(false)
      setIsMenuOpen(false) // Close mobile menu after search
    }
  }

  const handleLogout = () => {
    signOut()
    router.push("/")
  }

  return (
    <header className="bg-background primary-shadow border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center primary-shadow transform hover:scale-105 transition-transform duration-200">
                <span className="text-primary-foreground font-serif font-bold text-sm sm:text-lg tracking-wider">
                  ELF
                </span>
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-serif font-bold text-foreground truncate max-w-[120px] sm:max-w-none">
                {language === "en" ? "ELF SofaCover Pro" : "ELF โซฟาคัฟเวอร์ โปร"}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            {navigation.map((item: NavItem) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground/70 hover:text-primary px-2 xl:px-3 py-2 text-sm font-medium font-sans transition-all duration-200 hover:bg-primary/10 rounded-lg"
              >
                {item.name[language]}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search - Desktop */}
            <div className="relative hidden sm:block">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    placeholder={language === "en" ? "Search products..." : "ค้นหาสินค้า..."}
                    className="w-32 md:w-48 px-3 py-1 border-2 border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-sm transition-all duration-200 bg-background text-foreground font-sans"
                    autoFocus
                    onBlur={() => {
                      setTimeout(() => setIsSearchOpen(false), 200)
                    }}
                  />
                  <Button type="submit" variant="ghost" size="sm" className="ml-1 text-primary hover:text-primary">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-primary hover:text-primary hover:bg-primary/10 px-2 sm:px-3"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium font-sans">{language.toUpperCase()}</span>
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative text-primary hover:text-primary hover:bg-primary/10 px-2 sm:px-3"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-1 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground font-serif">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Account - Desktop */}
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1 text-primary hover:text-primary hover:bg-primary/10 px-2 sm:px-3"
                  >
                    <User className="w-4 h-4" />
                    {isAuthenticated && (
                      <span className="hidden md:block text-sm font-sans truncate max-w-[100px] lg:max-w-none">
                        {user?.full_name}
                        {isAdmin && <Shield className="w-3 h-3 ml-1 text-primary inline" />}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  {isAuthenticated ? (
                    <>
                      <div className="px-2 py-1.5 text-sm text-muted-foreground border-b font-sans">
                        <div className="truncate">{user?.email}</div>
                        {isAdmin && (
                          <Badge variant="secondary" className="mt-1 text-xs font-serif">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center font-sans">
                          <User className="w-4 h-4 mr-2" />
                          {language === "en" ? "Profile" : "โปรไฟล์"}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="flex items-center font-sans">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {language === "en" ? "My Orders" : "คำสั่งซื้อของฉัน"}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center font-sans">
                          <Settings className="w-4 h-4 mr-2" />
                          {language === "en" ? "Settings" : "ตั้งค่า"}
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center text-primary font-sans">
                              <Shield className="w-4 h-4 mr-2" />
                              {language === "en" ? "Admin Dashboard" : "แดชบอร์ดแอดมิน"}
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive font-sans">
                        <LogOut className="w-4 h-4 mr-2" />
                        {language === "en" ? "Logout" : "ออกจากระบบ"}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/login" className="flex items-center font-sans">
                          <User className="w-4 h-4 mr-2" />
                          {language === "en" ? "Login" : "เข้าสู่ระบบ"}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/sign-up" className="flex items-center font-sans">
                          <User className="w-4 h-4 mr-2" />
                          {language === "en" ? "Register" : "สมัครสมาชิก"}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-primary hover:text-primary px-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 bg-card/95 backdrop-blur-sm">
            <div className="space-y-1">
              {navigation.map((item: NavItem) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-foreground/70 hover:text-primary hover:bg-primary/10 rounded-md transition-colors font-sans text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name[language]}
                </Link>
              ))}
            </div>

            {/* Mobile User Menu */}
            <div className="mt-4 pt-4 border-t border-border px-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground font-sans mb-3">
                    <div className="font-medium text-foreground">{user?.full_name}</div>
                    <div className="truncate">{user?.email}</div>
                    {isAdmin && (
                      <Badge variant="secondary" className="mt-1 text-xs font-serif">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 text-foreground hover:bg-primary/10 rounded-md font-sans"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    {language === "en" ? "Profile" : "โปรไฟล์"}
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center px-3 py-2 text-foreground hover:bg-primary/10 rounded-md font-sans"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-3" />
                    {language === "en" ? "My Orders" : "คำสั่งซื้อของฉัน"}
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-3 py-2 text-foreground hover:bg-primary/10 rounded-md font-sans"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    {language === "en" ? "Settings" : "ตั้งค่า"}
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center px-3 py-2 text-primary hover:bg-primary/10 rounded-md font-sans"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4 mr-3" />
                      {language === "en" ? "Admin Dashboard" : "แดชบอร์ดแอดมิน"}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center w-full px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md font-sans"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    {language === "en" ? "Logout" : "ออกจากระบบ"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    className="flex items-center px-3 py-2 text-foreground hover:bg-primary/10 rounded-md font-sans"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    {language === "en" ? "Login" : "เข้าสู่ระบบ"}
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="flex items-center px-3 py-2 text-foreground hover:bg-primary/10 rounded-md font-sans"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    {language === "en" ? "Register" : "สมัครสมาชิก"}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Search */}
            <div className="mt-4 px-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    placeholder={language === "en" ? "Search products..." : "ค้นหาสินค้า..."}
                    className="w-full pl-10 pr-4 py-3 border-2 border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground font-sans text-base"
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
