"use client"

import Link from "next/link"
import { Facebook, Instagram, PenLineIcon as Line, Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

export default function Footer() {
  const { language } = useLanguage()

  const quickLinks = [
    { name: { th: "หน้าแรก", en: "Home" }, href: "/" },
    { name: { th: "สินค้า", en: "Products" }, href: "/products" },
    { name: { th: "ลายผ้า", en: "Fabric Gallery" }, href: "/fabric-gallery" },
    { name: { th: "ตัดตามขนาด", en: "Custom Covers" }, href: "/custom-covers" },
    { name: { th: "เกี่ยวกับเรา", en: "About" }, href: "/about" },
    { name: { th: "ติดต่อ", en: "Contact" }, href: "/contact" },
  ]

  const services = [
    { name: { th: "ผ้าคลุมโซฟาตัดตามขนาด", en: "Custom Sofa Covers" } },
    { name: { th: "หมอนอิงและอุปกรณ์เสริม", en: "Pillows & Accessories" } },
    { name: { th: "บริการวัดและติดตั้ง", en: "Measurement & Installation" } },
    { name: { th: "ปรึกษาการเลือกผ้า", en: "Fabric Consultation" } },
    { name: { th: "ซ่อมแซมและดูแลรักษา", en: "Repair & Maintenance" } },
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
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/placeholder-logo.svg" alt="Logo" className="h-8 w-8 filter brightness-0 invert" />
              <span className="text-xl font-bold">{language === "th" ? "ผ้าคลุมโซฟา" : "SofaCover"}</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {language === "th"
                ? "ผู้เชี่ยวชาญด้านผ้าคลุมโซฟาตัดตามขนาด ด้วยประสบการณ์กว่า 10 ปี และลูกค้าไว้วางใจมากกว่า 10,000 ราย"
                : "Specialists in custom sofa covers with over 10 years of experience and 10,000+ satisfied customers"}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                <Line className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{language === "th" ? "ลิงก์ด่วน" : "Quick Links"}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-300 hover:text-pink-500 transition-colors text-sm">
                    {link.name[language]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{language === "th" ? "บริการของเรา" : "Our Services"}</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="text-gray-300 text-sm">{service.name[language]}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{language === "th" ? "ติดต่อเรา" : "Contact Us"}</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p>123 ถนนสุขุมวิท แขวงคลองตัน</p>
                  <p>เขตวัฒนา กรุงเทพฯ 10110</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-pink-500" />
                <span className="text-sm text-gray-300">02-123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-pink-500" />
                <span className="text-sm text-gray-300">info@sofacover.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p>{language === "th" ? "จันทร์-เสาร์: 9:00-18:00" : "Mon-Sat: 9:00-18:00"}</p>
                  <p>{language === "th" ? "อาทิตย์: 10:00-16:00" : "Sun: 10:00-16:00"}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleContactClick}
              className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {language === "th" ? "แชทเลย" : "Chat Now"}
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 {language === "th" ? "ผ้าคลุมโซฟา" : "SofaCover"}.{" "}
              {language === "th" ? "สงวนลิขสิทธิ์" : "All rights reserved"}.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-pink-500 text-sm transition-colors">
                {language === "th" ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy"}
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-pink-500 text-sm transition-colors">
                {language === "th" ? "ข้อกำหนดการใช้งาน" : "Terms of Service"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
