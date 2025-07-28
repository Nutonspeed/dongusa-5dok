"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useMemo } from "react"

type Language = "th"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Static translations to prevent re-creation
const translations = {
  th: {
    // Navigation
    home: "หน้าแรก",
    products: "สินค้า",
    collections: "คอลเลกชัน",
    about: "เกี่ยวกับเรา",
    contact: "ติดต่อเรา",
    cart: "ตะกร้า",
    login: "เข้าสู่ระบบ",
    logout: "ออกจากระบบ",
    register: "สมัครสมาชิก",

    // Common
    loading: "กำลังโหลด...",
    error: "เกิดข้อผิดพลาด",
    success: "สำเร็จ",
    cancel: "ยกเลิก",
    confirm: "ยืนยัน",
    save: "บันทึก",
    edit: "แก้ไข",
    delete: "ลบ",
    search: "ค้นหา",
    filter: "กรอง",
    sort: "เรียง",

    // Hero Section
    heroTitle: "เปลี่ยนโฉมพื้นที่นั่งเล่น",
    heroSubtitle: "ผ้าคลุมโซฟาพรีเมียมที่ปกป้องและเพิ่มความสวยงามให้เฟอร์นิเจอร์ของคุณ หาคุณสีสันด้วยความแม่นยำ จัดส่งรวดเร็ว",

    // Features
    qualityTitle: "คุณภาพพรีเมียม",
    qualityDesc: "วัสดุคุณภาพ",
    deliveryTitle: "จัดส่วยเร็ว",
    deliveryDesc: "จัดส่ง 2-3 วัน",
    serviceTitle: "ดีลายมาตรา",
    serviceDesc: "ให้บริการ 24/7",

    // Products
    addToCart: "เพิ่มลงตะกร้า",
    buyNow: "ซื้อเลย",
    viewDetails: "ดูรายละเอียด",
    outOfStock: "สินค้าหมด",
    inStock: "มีสินค้า",

    // Footer
    companyInfo: "บริษัท โซฟาคัฟเวอร์ จำกัด",
    address: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    phone: "โทร: 02-123-4567",
    email: "อีเมล: info@sofacover.com",

    // Demo
    demoMode: "โหมดสาธิต",
    demoDescription: "นี่คือเว็บไซต์สาธิต บริการทั้งหมดจำลองขึ้นเพื่อการแสดง",
    demoControls: "ควบคุมการสาธิต",
  },
} as const

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language] = useState<Language>("th")

  // Memoize the translation function to prevent re-creation
  const t = useCallback(
    (key: string): string => {
      return translations[language][key as keyof typeof translations.th] || key
    },
    [language],
  )

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      language,
      setLanguage: () => {}, // No-op since we only support Thai
      t,
    }),
    [language, t],
  )

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
