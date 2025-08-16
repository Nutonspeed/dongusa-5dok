"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Clock } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

export default function Footer() {
  const { language } = useLanguage()

  const footerSections = {
    company: {
      title: { en: "Company", th: "บริษัท" },
      links: [
        { name: { en: "About Us", th: "เกี่ยวกับเรา" }, href: "/about" },
        { name: { en: "Our Story", th: "เรื่องราวของเรา" }, href: "/about#story" },
        { name: { en: "Careers", th: "ร่วมงานกับเรา" }, href: "/careers" },
        { name: { en: "Press", th: "ข่าวสาร" }, href: "/press" },
      ],
    },
    products: {
      title: { en: "Products", th: "สินค้า" },
      links: [
        { name: { en: "Sofa Covers", th: "ผ้าคลุมโซฟา" }, href: "/products" },
        { name: { en: "Custom Covers", th: "ผ้าคลุมตามสั่ง" }, href: "/custom-covers" },
        { name: { en: "Fabric Collections", th: "คอลเลกชันผ้า" }, href: "/fabric-collections" },
        { name: { en: "Accessories", th: "อุปกรณ์เสริม" }, href: "/products?category=accessories" },
      ],
    },
    support: {
      title: { en: "Support", th: "ช่วยเหลือ" },
      links: [
        { name: { en: "Contact Us", th: "ติดต่อเรา" }, href: "/contact" },
        { name: { en: "Size Guide", th: "คู่มือขนาด" }, href: "/size-guide" },
        { name: { en: "Care Instructions", th: "วิธีดูแล" }, href: "/care-guide" },
        { name: { en: "Returns", th: "การคืนสินค้า" }, href: "/returns" },
      ],
    },
  }

  const contactInfo = {
    address: {
      en: "123 Fabric Street, Bangkok 10110, Thailand",
      th: "123 ถนนผ้า กรุงเทพฯ 10110 ประเทศไทย",
    },
    phone: "+66 2 123 4567",
    email: "info@sofacoverpro.com",
    hours: {
      en: "Mon-Fri: 9AM-6PM, Sat: 9AM-4PM",
      th: "จ-ศ: 9:00-18:00, ส: 9:00-16:00",
    },
  }

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="text-xl font-bold">{language === "en" ? "SofaCover Pro" : "โซฟาคัฟเวอร์ โปร"}</span>
            </div>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              {language === "en"
                ? "Premium quality sofa covers and custom furniture protection solutions. Transform your living space with our beautiful, durable covers."
                : "ผ้าคลุมโซฟาคุณภาพพรีเมียมและโซลูชันป้องกันเฟอร์นิเจอร์ตามสั่ง เปลี่ยนพื้นที่นั่งเล่นของคุณด้วยผ้าคลุมที่สวยงามและทนทาน"}
            </p>

            {/* Social Media */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-lg font-semibold mb-4 text-primary">{section.title[language]}</h3>
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-gray-300 hover:text-primary transition-colors text-sm">
                      {link.name[language]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">
              {language === "en" ? "Contact Info" : "ข้อมูลติดต่อ"}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{contactInfo.address[language]}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="text-gray-300 hover:text-primary text-sm">
                  {contactInfo.phone}
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="text-gray-300 hover:text-primary text-sm">
                  {contactInfo.email}
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{contactInfo.hours[language]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 {language === "en" ? "SofaCover Pro" : "โซฟาคัฟเวอร์ โปร"}.{" "}
              {language === "en" ? "All rights reserved." : "สงวนลิขสิทธิ์"}
            </p>

            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-primary text-sm transition-colors">
                {language === "en" ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"}
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-primary text-sm transition-colors">
                {language === "en" ? "Terms of Service" : "ข้อกำหนดการใช้งาน"}
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-primary text-sm transition-colors">
                {language === "en" ? "Cookie Policy" : "นโยบายคุกกี้"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
