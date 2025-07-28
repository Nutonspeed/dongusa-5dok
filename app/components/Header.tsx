"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingCart, Search, Globe, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, toggleLanguage } = useLanguage()
  const { items } = useCart()

  const navigation = [
    { name: { th: "หน้าแรก", en: "Home" }, href: "/" },
    { name: { th: "สินค้า", en: "Products" }, href: "/products" },
    { name: { th: "ลายผ้า", en: "Fabric Gallery" }, href: "/fabric-gallery" },
    { name: { th: "ตัดตามขนาด", en: "Custom Covers" }, href: "/custom-covers" },
    { name: { th: "เกี่ยวกับเรา", en: "About" }, href: "/about" },
    { name: { th: "ติดต่อ", en: "Contact" }, href: "/contact" },
  ]

  const handleContactClick = () => {
    const message =
      language === "th"
        ? "สวัสดีครับ/ค่ะ! ผมสนใจผ้าคลุมโซฟา ต้องการสอบถามข้อมูลเพิ่มเติมครับ/ค่ะ"
        : "Hello! I'm interested in sofa covers. I'd like to know more information."

    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/placeholder-logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-900">{language === "th" ? "ผ้าคลุมโซฟา" : "SofaCover"}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-pink-600 font-medium transition-colors"
              >
                {item.name[language]}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
              title={language === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
            >
              <Globe className="w-5 h-5" />
              <span className="ml-1 text-sm font-medium">{language === "th" ? "EN" : "TH"}</span>
            </button>

            {/* Search */}
            <Link href="/products" className="p-2 text-gray-600 hover:text-pink-600 transition-colors">
              <Search className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Contact Button */}
            <Button
              onClick={handleContactClick}
              size="sm"
              className="hidden md:flex bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {language === "th" ? "แชท" : "Chat"}
            </Button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-pink-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-pink-600 font-medium transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name[language]}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    handleContactClick()
                    setIsMenuOpen(false)
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {language === "th" ? "ติดต่อเรา" : "Contact Us"}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Top Bar with Contact Info */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                <span>02-123-4567</span>
              </div>
              <div className="hidden sm:block">{language === "th" ? "จัดส่งฟรีทั่วประเทศ" : "Free nationwide delivery"}</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">{language === "th" ? "รับประกัน 1 ปี" : "1 year warranty"}</div>
              <button onClick={handleContactClick} className="flex items-center hover:underline">
                <MessageCircle className="w-4 h-4 mr-1" />
                {language === "th" ? "แชทเลย" : "Chat now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
