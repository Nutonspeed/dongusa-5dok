"use client"

import type React from "react"
import Link from "next/link"
import { User, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/context/LanguageContext"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Shield, Heart, LogOut } from "lucide-react"

const Header: React.FC = () => {
  const { language } = useLanguage()

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto py-4 px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          E-Commerce
        </Link>

        <nav className="space-x-4">
          <Link href="/" className="text-gray-600 hover:text-gray-800">
            {language === "th" ? "หน้าหลัก" : "Home"}
          </Link>
          <Link href="/products" className="text-gray-600 hover:text-gray-800">
            {language === "th" ? "สินค้า" : "Products"}
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-800">
            {language === "th" ? "เกี่ยวกับเรา" : "About"}
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-800">
            {language === "th" ? "ติดต่อ" : "Contact"}
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {/* User Account Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{language === "th" ? "บัญชีของฉัน" : "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>{language === "th" ? "โปรไฟล์" : "Profile"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>{language === "th" ? "คำสั่งซื้อของฉัน" : "My Orders"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Heart className="mr-2 h-4 w-4" />
                <span>{language === "th" ? "รายการโปรด" : "Wishlist"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/login">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>{language === "th" ? "เข้าสู่ระบบผู้ดูแล" : "Admin Panel"}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{language === "th" ? "ออกจากระบบ" : "Sign Out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header
