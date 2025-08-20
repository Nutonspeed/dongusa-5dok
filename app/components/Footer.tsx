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
    <footer className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center primary-shadow">
                <span className="text-primary-foreground font-serif font-bold text-lg tracking-wider">ELF</span>
              </div>
              <span className="text-lg sm:text-xl font-serif font-bold bg-gradient-to-r from-accent to-primary-foreground bg-clip-text text-transparent">
                {language === "en" ? "ELF SofaCover Pro" : "ELF โซฟาคัฟเวอร์ โปร"}
              </span>
            </div>
            <p className="text-primary-foreground/90 mb-6 text-sm sm:text-base leading-relaxed font-sans">
              {language === "en"
                ? "Premium quality sofa covers and custom furniture protection solutions. Transform your living space with our beautiful, durable covers."
                : "ผ้าคลุมโซฟาคุณภาพพรีเมียมและโซลูชันป้องกันเฟอร์นิเจอร์ตามสั่ง เปลี่ยนพื้นที่นั่งเล่นของคุณด้วยผ้าคลุมที่สวยงามและทนทาน"}
            </p>

            {/* Social Media */}
            <div className="flex space-x-4 sm:space-x-6">
              <a
                href="https://facebook.com"
                className="text-primary-foreground/70 hover:text-accent transition-colors transform hover:scale-110 duration-200 p-2 -m-2"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://instagram.com"
                className="text-primary-foreground/70 hover:text-accent transition-colors transform hover:scale-110 duration-200 p-2 -m-2"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://twitter.com"
                className="text-primary-foreground/70 hover:text-accent transition-colors transform hover:scale-110 duration-200 p-2 -m-2"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key} className="min-w-0">
              <h3 className="text-base sm:text-lg font-serif font-semibold mb-3 sm:mb-4 text-accent">
                {section.title[language]}
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-primary-foreground/80 hover:text-accent transition-colors text-sm sm:text-base hover:underline font-sans block py-1"
                    >
                      {link.name[language]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Information */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-serif font-semibold mb-3 sm:mb-4 text-accent">
              {language === "en" ? "Contact Info" : "ข้อมูลติดต่อ"}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent mt-1 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm sm:text-base font-sans leading-relaxed">
                  {contactInfo.address[language]}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="text-primary-foreground/80 hover:text-accent text-sm sm:text-base transition-colors font-sans"
                >
                  {contactInfo.phone}
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-primary-foreground/80 hover:text-accent text-sm sm:text-base transition-colors font-sans break-all"
                >
                  {contactInfo.email}
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent mt-1 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm sm:text-base font-sans leading-relaxed">
                  {contactInfo.hours[language]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
            <p className="text-primary-foreground/70 text-sm sm:text-base font-sans text-center sm:text-left">
              © 2024 {language === "en" ? "ELF SofaCover Pro" : "ELF โซฟาคัฟเวอร์ โปร"}.{" "}
              {language === "en" ? "All rights reserved." : "สงวนลิขสิทธิ์"}
            </p>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              <Link
                href="/privacy"
                className="text-primary-foreground/70 hover:text-accent text-sm sm:text-base transition-colors font-sans py-1"
              >
                {language === "en" ? "Privacy Policy" : "นโยบายความเป็นส่วนตัว"}
              </Link>
              <Link
                href="/terms"
                className="text-primary-foreground/70 hover:text-accent text-sm sm:text-base transition-colors font-sans py-1"
              >
                {language === "en" ? "Terms of Service" : "ข้อกำหนดการใช้งาน"}
              </Link>
              <Link
                href="/cookies"
                className="text-primary-foreground/70 hover:text-accent text-sm sm:text-base transition-colors font-sans py-1"
              >
                {language === "en" ? "Cookie Policy" : "นโยบายคุกกี้"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
