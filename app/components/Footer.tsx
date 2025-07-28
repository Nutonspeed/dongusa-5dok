"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock, Send } from "lucide-react"

const footerLinks = {
  company: [
    { name: "เกี่ยวกับเรา", href: "/about" },
    { name: "ข่าวสาร", href: "/news" },
    { name: "ร่วมงานกับเรา", href: "/careers" },
    { name: "นักลงทุนสัมพันธ์", href: "/investors" },
  ],
  products: [
    { name: "ผ้าคลุมโซฟา", href: "/products" },
    { name: "คอลเลกชันผ้า", href: "/fabric-collections" },
    { name: "สั่งทำพิเศษ", href: "/custom-covers" },
    { name: "อุปกรณ์เสริม", href: "/accessories" },
  ],
  support: [
    { name: "ศูนย์ช่วยเหลือ", href: "/help" },
    { name: "วิธีการสั่งซื้อ", href: "/how-to-order" },
    { name: "การจัดส่ง", href: "/shipping" },
    { name: "การคืนสินค้า", href: "/returns" },
  ],
  legal: [
    { name: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
    { name: "ข้อกำหนดการใช้งาน", href: "/terms" },
    { name: "นโยบายคุกกี้", href: "/cookies" },
    { name: "ข้อมูลทางกฎหมาย", href: "/legal" },
  ],
}

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/sofacover", color: "hover:text-blue-600" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/sofacover", color: "hover:text-pink-600" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/sofacover", color: "hover:text-blue-400" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/sofacover", color: "hover:text-red-600" },
]

export default function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SC</span>
              </div>
              <span className="text-2xl font-bold">โซฟาคัฟเวอร์โปร</span>
            </div>

            <p className="text-gray-300 leading-relaxed">
              ผู้เชี่ยวชาญด้านผ้าคลุมโซฟาคุณภาพสูง ให้บริการสั่งทำตามขนาดและดีไซน์ที่คุณต้องการ พร้อมจัดส่งทั่วประเทศไทย
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300">123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">02-123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">info@sofacover.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span className="text-gray-300">จันทร์-เสาร์ 9:00-18:00 น.</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center transition-colors ${social.color}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">บริษัท</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">สินค้า</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">ช่วยเหลือ</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">กฎหมาย</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-semibold mb-4">รับข่าวสารและโปรโมชั่น</h3>
            <p className="text-gray-300 mb-6">สมัครรับจดหมายข่าวเพื่อรับข้อมูลสินค้าใหม่และส่วนลดพิเศษ</p>
            <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
              <Input
                type="email"
                placeholder="อีเมลของคุณ"
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                required
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">© 2024 โซฟาคัฟเวอร์โปร สงวนลิขสิทธิ์</div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>ออกแบบและพัฒนาโดย โซฟาคัฟเวอร์โปร</span>
              <Separator orientation="vertical" className="h-4 bg-gray-700" />
              <span>เวอร์ชั่น 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
