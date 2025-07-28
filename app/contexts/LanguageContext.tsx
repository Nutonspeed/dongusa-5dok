"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "th" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: string) => string
}

const translations = {
  th: {
    // Navigation
    "nav.home": "หน้าแรก",
    "nav.products": "สินค้า",
    "nav.fabricCollections": "คอลเลกชันผ้า",
    "nav.customCovers": "ผ้าคลุมตามสั่ง",
    "nav.about": "เกี่ยวกับเรา",
    "nav.contact": "ติดต่อ",

    // Common
    account: "บัญชี",
    myAccount: "บัญชีของฉัน",
    profile: "โปรไฟล์",
    settings: "ตั้งค่า",
    adminLogin: "เข้าสู่ระบบผู้ดูแล",
    logout: "ออกจากระบบ",
    cart: "ตะกร้า",
    tagline: "ผ้าคลุมโซฟาคุณภาพสูง",

    // Admin Login
    "admin.login.title": "เข้าสู่ระบบผู้ดูแล",
    "admin.login.subtitle": "กรุณาเข้าสู่ระบบเพื่อจัดการร้านค้า",
    "admin.login.email": "อีเมล",
    "admin.login.password": "รหัสผ่าน",
    "admin.login.button": "เข้าสู่ระบบ",
    "admin.login.loading": "กำลังเข้าสู่ระบบ...",
    "admin.login.demo.title": "ข้อมูลสำหรับทดสอบ:",
    "admin.login.demo.email": "อีเมล: admin@sofacover.com",
    "admin.login.demo.password": "รหัสผ่าน: admin123",
    "admin.login.error.invalid": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.fabricCollections": "Fabric Collections",
    "nav.customCovers": "Custom Covers",
    "nav.about": "About",
    "nav.contact": "Contact",

    // Common
    account: "Account",
    myAccount: "My Account",
    profile: "Profile",
    settings: "Settings",
    adminLogin: "Admin Login",
    logout: "Logout",
    cart: "Cart",
    tagline: "Premium Sofa Covers",

    // Admin Login
    "admin.login.title": "Admin Login",
    "admin.login.subtitle": "Please login to manage the store",
    "admin.login.email": "Email",
    "admin.login.password": "Password",
    "admin.login.button": "Login",
    "admin.login.loading": "Logging in...",
    "admin.login.demo.title": "Demo Credentials:",
    "admin.login.demo.email": "Email: admin@sofacover.com",
    "admin.login.demo.password": "Password: admin123",
    "admin.login.error.invalid": "Invalid email or password",
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

  const toggleLanguage = () => {
    const newLang = language === "th" ? "en" : "th"
    handleSetLanguage(newLang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        toggleLanguage,
        t,
      }}
    >
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
