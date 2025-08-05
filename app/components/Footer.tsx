"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

const footerLinks = {
  company: [
    { name: "เกี่ยวกับเรา", href: "/about" },
    { name: "ข่าวสาร", href: "/news" },
    { name: "ร่วมงานกับเรา", href: "/careers" },
    { name: "นักลงทุนสัมพันธ์", href: "/investors" },
  ],
  products: [
    { name: "ผ้าคลุมโซฟา 2 ที่นั่ง", href: "/products?category=2-seater" },
    { name: "ผ้าคลุมโซฟา 3 ที่นั่ง", href: "/products?category=3-seater" },
    { name: "ผ้าคลุมโซฟา L-Shape", href: "/products?category=l-shape" },
    { name: "คอลเลกชันพรีเมียม", href: "/products?category=premium" },
  ],
  support: [
    { name: "ศูนย์ช่วยเหลือ", href: "/help" },
    { name: "คู่มือการใช้งาน", href: "/guide" },
    { name: "การจัดส่งและคืนสินค้า", href: "/shipping" },
    { name: "รับประกันสินค้า", href: "/warranty" },
  ],
  legal: [
    { name: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
    { name: "ข้อกำหนดการใช้งาน", href: "/terms" },
    { name: "นโยบายคุกกี้", href: "/cookies" },
    { name: "ข้อกำหนดการขาย", href: "/sales-terms" },
  ],
}

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">รับข่าวสารและโปรโมชั่นพิเศษ</h3>
            <p className="text-gray-400 mb-6">สมัครรับข่าวสารเพื่อได้รับส่วนลดพิเศษ และข้อมูลสินค้าใหม่ก่อนใคร</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="กรอกอีเมลของคุณ"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
              <Button className="bg-pink-600 hover:bg-pink-700 whitespace-nowrap">สมัครรับข่าวสาร</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                SofaCover Pro
              </span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              ผู้เชี่ยวชาญด้านผ้าคลุมโซฟาคุณภาพสูง มีประสบการณ์กว่า 10 ปี พร้อมให้บริการลูกค้าทั่วประเทศไทยด้วยสินค้าคุณภาพและบริการที่เป็นเลิศ
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-5 h-5" />
                <span>02-123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-5 h-5" />
                <span>info@sofacoverpro.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>123 ถนนสุขุมวิท กรุงเทพฯ 10110</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4 mt-6">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t("footer.company")}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t("footer.products")}</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t("footer.support")}</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">© 2024 SofaCover Pro. {t("footer.rights")}</div>
            <div className="flex flex-wrap gap-6 text-sm">
              {footerLinks.legal.map((link) => (
                <Link key={link.name} href={link.href} className="text-gray-400 hover:text-white transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
