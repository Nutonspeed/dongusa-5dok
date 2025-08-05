"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Language = "th" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  th: {
    // Navigation
    "nav.home": "หน้าหลัก",
    "nav.products": "สินค้า",
    "nav.fabric-gallery": "แกลเลอรี่ผ้า",
    "nav.custom-covers": "สั่งทำพิเศษ",
    "nav.about": "เกี่ยวกับเรา",
    "nav.contact": "ติดต่อ",
    "nav.cart": "ตะกร้า",
    "nav.login": "เข้าสู่ระบบ",
    "nav.logout": "ออกจากระบบ",
    "nav.profile": "โปรไฟล์",
    "nav.admin": "จัดการระบบ",

    // Hero Section
    "hero.title": "ผ้าคลุมโซฟาคุณภาพสูง",
    "hero.subtitle": "สั่งทำตามขนาด ผ้ากันน้ำ กันคราบ ดูแลง่าย",
    "hero.cta": "เลือกซื้อเลย",
    "hero.learn-more": "เรียนรู้เพิ่มเติม",

    // Products
    "products.title": "สินค้าแนะนำ",
    "products.view-all": "ดูทั้งหมด",
    "products.add-to-cart": "เพิ่มลงตะกร้า",
    "products.price": "ราคา",
    "products.baht": "บาท",

    // Why Choose Us
    "why.title": "ทำไมต้องเลือกเรา",
    "why.quality.title": "คุณภาพสูง",
    "why.quality.desc": "ผ้าคุณภาพพรีเมียม ทนทาน กันน้ำ กันคราบ",
    "why.custom.title": "สั่งทำตามขนาด",
    "why.custom.desc": "วัดขนาดและสั่งทำตามโซฟาของคุณ",
    "why.delivery.title": "จัดส่งฟรี",
    "why.delivery.desc": "จัดส่งฟรีทั่วประเทศ รับประกันคุณภาพ",
    "why.service.title": "บริการหลังการขาย",
    "why.service.desc": "ให้คำปรึกษาและดูแลหลังการขาย",

    // Footer
    "footer.company": "บริษัท",
    "footer.products": "สินค้า",
    "footer.support": "ช่วยเหลือ",
    "footer.contact": "ติดต่อเรา",
    "footer.rights": "สงวนลิขสิทธิ์",

    // Common
    "common.loading": "กำลังโหลด...",
    "common.error": "เกิดข้อผิดพลาด",
    "common.success": "สำเร็จ",
    "common.cancel": "ยกเลิก",
    "common.confirm": "ยืนยัน",
    "common.save": "บันทึก",
    "common.edit": "แก้ไข",
    "common.delete": "ลบ",
    "common.search": "ค้นหา",
    "common.filter": "กรอง",
    "common.sort": "เรียง",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.fabric-gallery": "Fabric Gallery",
    "nav.custom-covers": "Custom Covers",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.cart": "Cart",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.profile": "Profile",
    "nav.admin": "Admin",

    // Hero Section
    "hero.title": "Premium Sofa Covers",
    "hero.subtitle": "Custom-made, waterproof, stain-resistant, easy care",
    "hero.cta": "Shop Now",
    "hero.learn-more": "Learn More",

    // Products
    "products.title": "Featured Products",
    "products.view-all": "View All",
    "products.add-to-cart": "Add to Cart",
    "products.price": "Price",
    "products.baht": "THB",

    // Why Choose Us
    "why.title": "Why Choose Us",
    "why.quality.title": "High Quality",
    "why.quality.desc": "Premium fabric, durable, waterproof, stain-resistant",
    "why.custom.title": "Custom Made",
    "why.custom.desc": "Measured and made to fit your sofa perfectly",
    "why.delivery.title": "Free Delivery",
    "why.delivery.desc": "Free nationwide delivery with quality guarantee",
    "why.service.title": "After-sales Service",
    "why.service.desc": "Consultation and after-sales support",

    // Footer
    "footer.company": "Company",
    "footer.products": "Products",
    "footer.support": "Support",
    "footer.contact": "Contact Us",
    "footer.rights": "All rights reserved",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error occurred",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("th")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "th" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
