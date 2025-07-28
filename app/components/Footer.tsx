"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

export default function Footer() {
  const { language } = useLanguage()

  const quickLinks = [
    { href: "/", label: language === "th" ? "หน้าแรก" : "Home" },
    { href: "/products", label: language === "th" ? "สินค้า" : "Products" },
    { href: "/fabric-collections", label: language === "th" ? "คอลเลกชันผ้า" : "Fabric Collections" },
    { href: "/custom-covers", label: language === "th" ? "ผ้าคลุมตามสั่ง" : "Custom Covers" },
    { href: "/about", label: language === "th" ? "เกี่ยวกับเรา" : "About Us" },
    { href: "/contact", label: language === "th" ? "ติดต่อเรา" : "Contact Us" },
  ]

  const customerService = [
    { href: "/shipping", label: language === "th" ? "การจัดส่ง" : "Shipping Info" },
    { href: "/returns", label: language === "th" ? "การคืนสินค้า" : "Returns" },
    { href: "/warranty", label: language === "th" ? "การรับประกัน" : "Warranty" },
    { href: "/size-guide", label: language === "th" ? "คู่มือขนาด" : "Size Guide" },
    { href: "/care-instructions", label: language === "th" ? "วิธีดูแล" : "Care Instructions" },
    { href: "/faq", label: language === "th" ? "คำถามที่พบบ่อย" : "FAQ" },
  ]

  const categories = [
    { href: "/products?category=3-seater", label: language === "th" ? "โซฟา 3 ที่นั่ง" : "3-Seater Covers" },
    { href: "/products?category=2-seater", label: language === "th" ? "โซฟา 2 ที่นั่ง" : "2-Seater Covers" },
    { href: "/products?category=l-shape", label: language === "th" ? "โซฟา L-Shape" : "L-Shape Covers" },
    { href: "/products?category=armchair", label: language === "th" ? "เก้าอี้เดี่ยว" : "Armchair Covers" },
    { href: "/products?category=accessories", label: language === "th" ? "อุปกรณ์เสริม" : "Accessories" },
    { href: "/products?category=cushions", label: language === "th" ? "เบาะรองนั่ง" : "Cushion Pads" },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-blue-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {language === "th" ? "รับข่าวสารและโปรโมชั่นพิเศษ" : "Get News & Special Promotions"}
              </h3>
              <p className="text-blue-100">
                {language === "th"
                  ? "สมัครรับข่าวสารเพื่อรับส่วนลดพิเศษและข้อมูลสินค้าใหม่ก่อนใคร"
                  : "Subscribe to get special discounts and new product updates first"}
              </p>
            </div>
            <div className="flex w-full md:w-auto max-w-md gap-2">
              <Input
                type="email"
                placeholder={language === "th" ? "อีเมลของคุณ" : "Your email"}
                className="bg-white text-gray-900 border-0"
              />
              <Button className="bg-blue-800 hover:bg-blue-900 whitespace-nowrap">
                {language === "th" ? "สมัคร" : "Subscribe"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="font-bold text-xl">{language === "th" ? "โซฟาคัฟเวอร์โปร" : "SofaCover Pro"}</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {language === "th"
                ? "ผู้นำด้านผ้าคลุมโซฟาคุณภาพสูงในประเทศไทย ด้วยประสบการณ์กว่า 10 ปี และลูกค้าที่ไว้วางใจมากกว่า 50,000 คน"
                : "Thailand's leading premium sofa cover provider with over 10 years of experience and 50,000+ satisfied customers"}
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>02-123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>info@sofacoverpro.com</span>
              </div>
              <div className="flex items-start space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>
                  {language === "th"
                    ? "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
                    : "123 Sukhumvit Road, Khlong Toei, Bangkok 10110"}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{language === "th" ? "จันทร์-เสาร์ 9:00-18:00" : "Mon-Sat 9:00-18:00"}</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{language === "th" ? "ลิงก์ด่วน" : "Quick Links"}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{language === "th" ? "บริการลูกค้า" : "Customer Service"}</h3>
            <ul className="space-y-2">
              {customerService.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{language === "th" ? "หมวดหมู่สินค้า" : "Product Categories"}</h3>
            <ul className="space-y-2">
              {categories.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            © 2024 SofaCover Pro. {language === "th" ? "สงวนลิขสิทธิ์" : "All rights reserved."}
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {language === "th" ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy"}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {language === "th" ? "ข้อกำหนดการใช้งาน" : "Terms of Service"}
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              {language === "th" ? "นโยบายคุกกี้" : "Cookie Policy"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
