"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "th"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.custom": "Custom Covers",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.cart": "Cart",
    "nav.admin": "Admin",
    "admin.login.title": "Admin Login",
    "admin.login.subtitle": "Please login to manage your store",
    "admin.login.email": "Email",
    "admin.login.password": "Password",
    "admin.login.button": "Login",
    "admin.login.loading": "Logging in...",
    "admin.login.error.invalid": "Invalid email or password",
    "admin.login.demo.title": "Demo Credentials:",
    "admin.login.demo.email": "Email: admin@sofacover.com",
    "admin.login.demo.password": "Password: admin123",
    "hero.title": "Transform Your Sofa with Premium Covers",
    "hero.subtitle": "Discover our collection of high-quality, custom-fit sofa covers",
    "hero.cta.shop": "Shop Now",
    "hero.cta.custom": "Custom Order",
  },
  th: {
    "nav.home": "หน้าหลัก",
    "nav.products": "สินค้า",
    "nav.custom": "ผ้าคลุมตามสั่ง",
    "nav.about": "เกี่ยวกับเรา",
    "nav.contact": "ติดต่อ",
    "nav.cart": "ตะกร้า",
    "nav.admin": "ผู้ดูแล",
    "admin.login.title": "เข้าสู่ระบบผู้ดูแล",
    "admin.login.subtitle": "กรุณาเข้าสู่ระบบเพื่อจัดการร้านค้า",
    "admin.login.email": "อีเมล",
    "admin.login.password": "รหัสผ่าน",
    "admin.login.button": "เข้าสู่ระบบ",
    "admin.login.loading": "กำลังเข้าสู่ระบบ...",
    "admin.login.error.invalid": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "admin.login.demo.title": "ข้อมูลสำหรับทดสอบ:",
    "admin.login.demo.email": "อีเมล: admin@sofacover.com",
    "admin.login.demo.password": "รหัสผ่าน: admin123",
    "hero.title": "เปลี่ยนโซฟาของคุณด้วยผ้าคลุมพรีเมียม",
    "hero.subtitle": "ค้นพบคอลเลกชันผ้าคลุมโซฟาคุณภาพสูงที่พอดีกับโซฟาของคุณ",
    "hero.cta.shop": "ช้อปเลย",
    "hero.cta.custom": "สั่งทำพิเศษ",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("th")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "th")) {
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
