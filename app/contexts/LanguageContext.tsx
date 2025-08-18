"use client"
import { logger } from "@/lib/logger"

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
    // Navigation
    home: "Home",
    products: "Products",
    about: "About",
    contact: "Contact",
    cart: "Cart",

    // Hero Section
    heroTitle: "Transform Your Living Space",
    heroSubtitle: "Premium sofa covers that protect and beautify your furniture",
    shopNow: "Shop Now",
    customOrder: "Custom Order",

    // Featured Products
    featuredProductsTitle: "Featured Products",
    featuredProductsSubtitle:
      "Discover our most popular sofa covers, carefully selected for their quality, style, and customer satisfaction.",
    addToCart: "Add to Cart",
    viewAllProducts: "View All Products",
    newLabel: "New",
    featuredLabel: "Featured",
    colorsLabel: "Colors:",

    // Fabric Collections
    fabricCollectionsTitle: "Fabric Collections",
    fabricCollectionsSubtitle: "Explore our curated collections of premium fabrics",
    searchCollections: "Search collections...",
    patternsAvailable: "patterns available",
    viewAllPatterns: "View All Patterns",
    getQuoteOnFacebook: "Get Quote",

    // Why Choose Us
    whyChooseUsTitle: "Why Choose SofaCover Pro?",
    whyChooseUsSubtitle: "We're committed to providing the highest quality sofa covers",

    // Custom Cover Section
    customCoverTitle: "Get Your Perfect Custom Cover",
    customCoverSubtitle: "Follow our simple 3-step process",

    // Profile Page
    profileUpdateSuccess: "Profile Updated",
    profileUpdateSuccessDesc: "Your profile has been updated.",
    profileUpdateFailed: "Update Failed",
    profileUpdateFailedDesc: "Could not update your profile.",
    myProfile: "My Profile",
    profileSubtitle: "Manage your personal information and account settings",
    personalInformation: "Personal Information",
    accountStats: "Account Stats",
    totalOrders: "Total Orders",
    totalSpent: "Total Spent",
    memberSince: "Member Since",
    vipCustomer: "VIP Customer",
    quickActions: "Quick Actions",
    viewOrders: "View Orders",
    accountSettings: "Account Settings",
    contactUs: "Contact Us",
    emailCannotChange: "Email cannot be changed",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    saving: "Saving...",
    delete: "Delete",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    price: "Price",
    name: "Name",
    category: "Category",
    description: "Description",
    quantity: "Quantity",
    total: "Total",
    subtotal: "Subtotal",
    shipping: "Shipping",
    tax: "Tax",
    checkout: "Checkout",
    continueShopping: "Continue Shopping",
    fullName: "Full Name",
    email: "Email",
    phoneNumber: "Phone Number",
    address: "Address",
    notProvided: "Not provided",

    // Product Details
    productDetails: "Product Details",
    specifications: "Specifications",
    reviews: "Reviews",
    relatedProducts: "Related Products",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    addToWishlist: "Add to Wishlist",
    shareProduct: "Share Product",

    // Footer
    companyInfo: "Company Information",
    customerService: "Customer Service",
    followUs: "Follow Us",
    newsletter: "Newsletter",
    subscribeNewsletter: "Subscribe to our newsletter",
    allRightsReserved: "All rights reserved",
  },
  th: {
    // Navigation
    home: "หน้าแรก",
    products: "สินค้า",
    about: "เกี่ยวกับเรา",
    contact: "ติดต่อ",
    cart: "ตะกร้า",

    // Hero Section
    heroTitle: "เปลี่ยนโฉมพื้นที่นั่งเล่น",
    heroSubtitle: "ผ้าคลุมโซฟาพรีเมียมที่ปกป้องและเพิ่มความสวยงาม",
    shopNow: "ช้อปเลย",
    customOrder: "สั่งทำพิเศษ",

    // Featured Products
    featuredProductsTitle: "สินค้าแนะนำ",
    featuredProductsSubtitle: "ค้นพบผ้าคลุมโซฟายอดนิยมของเรา ที่คัดสรรมาอย่างพิถีพิถันด้วยคุณภาพ สไตล์ และความพึงพอใจของลูกค้า",
    addToCart: "เพิ่มลงตะกร้า",
    viewAllProducts: "ดูสินค้าทั้งหมด",
    newLabel: "ใหม่",
    featuredLabel: "แนะนำ",
    colorsLabel: "สี:",

    // Fabric Collections
    fabricCollectionsTitle: "คอลเลกชันผ้า",
    fabricCollectionsSubtitle: "สำรวจคอลเลกชันผ้าพรีเมียมที่คัดสรรมาแล้ว",
    searchCollections: "ค้นหาคอลเลกชัน...",
    patternsAvailable: "ลายที่มีให้เลือก",
    viewAllPatterns: "ดูลายทั้งหมด",
    getQuoteOnFacebook: "รับใบเสนอราคา",

    // Why Choose Us
    whyChooseUsTitle: "ทำไมต้องเลือก โซฟาคัฟเวอร์ โปร?",
    whyChooseUsSubtitle: "เรามุ่งมั่นที่จะให้ผ้าคลุมโซฟาคุณภาพสูงสุด",

    // Custom Cover Section
    customCoverTitle: "รับผ้าคลุมตามสั่งที่สมบูรณ์แบบ",
    customCoverSubtitle: "ทำตามขั้นตอนง่ายๆ 3 ขั้นตอน",

    // Profile Page
    profileUpdateSuccess: "บันทึกสำเร็จ",
    profileUpdateSuccessDesc: "อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว",
    profileUpdateFailed: "เกิดข้อผิดพลาด",
    profileUpdateFailedDesc: "ไม่สามารถอัปเดตโปรไฟล์ได้",
    myProfile: "โปรไฟล์ของฉัน",
    profileSubtitle: "จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี",
    personalInformation: "ข้อมูลส่วนตัว",
    accountStats: "สถิติบัญชี",
    totalOrders: "คำสั่งซื้อทั้งหมด",
    totalSpent: "ยอดซื้อทั้งหมด",
    memberSince: "สมาชิกตั้งแต่",
    vipCustomer: "ลูกค้า VIP",
    quickActions: "การดำเนินการด่วน",
    viewOrders: "ดูคำสั่งซื้อ",
    accountSettings: "ตั้งค่าบัญชี",
    contactUs: "ติดต่อเรา",
    emailCannotChange: "ไม่สามารถแก้ไขอีเมลได้",

    // Common
    loading: "กำลังโหลด...",
    error: "ข้อผิดพลาด",
    success: "สำเร็จ",
    cancel: "ยกเลิก",
    save: "บันทึก",
    edit: "แก้ไข",
    saving: "กำลังบันทึก...",
    delete: "ลบ",
    search: "ค้นหา",
    filter: "กรอง",
    sort: "เรียง",
    price: "ราคา",
    name: "ชื่อ",
    category: "หมวดหมู่",
    description: "รายละเอียด",
    quantity: "จำนวน",
    total: "รวม",
    subtotal: "รวมย่อย",
    shipping: "ค่าจัดส่ง",
    tax: "ภาษี",
    checkout: "ชำระเงิน",
    continueShopping: "ช้อปต่อ",
    fullName: "ชื่อ-นามสกุล",
    email: "อีเมล",
    phoneNumber: "เบอร์โทรศัพท์",
    address: "ที่อยู่",
    notProvided: "ไม่ได้ระบุ",

    // Product Details
    productDetails: "รายละเอียดสินค้า",
    specifications: "ข้อมูลจำเพาะ",
    reviews: "รีวิว",
    relatedProducts: "สินค้าที่เกี่ยวข้อง",
    inStock: "มีสินค้า",
    outOfStock: "สินค้าหมด",
    addToWishlist: "เพิ่มในรายการโปรด",
    shareProduct: "แชร์สินค้า",

    // Footer
    companyInfo: "ข้อมูลบริษัท",
    customerService: "บริการลูกค้า",
    followUs: "ติดตามเรา",
    newsletter: "จดหมายข่าว",
    subscribeNewsletter: "สมัครรับจดหมายข่าว",
    allRightsReserved: "สงวนลิขสิทธิ์",
  },
}

const defaultContextValue: LanguageContextType = {
  language: "th",
  setLanguage: () => {},
  t: (key: string) => {
    return translations.th[key as keyof typeof translations.th] || key
  },
}

export const LanguageContext = createContext<LanguageContextType>(defaultContextValue)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("th")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)

    const loadLanguageData = () => {
      try {
        if (typeof window === "undefined") return

        const savedLanguage = localStorage.getItem("language") as Language
        if (savedLanguage && (savedLanguage === "en" || savedLanguage === "th")) {
          setLanguage(savedLanguage)
        }
      } catch (error) {
        logger.error("Error loading language from localStorage:", error)
      }
    }

    loadLanguageData()
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("language", lang)
      } catch (error) {
        logger.error("Error saving language to localStorage:", error)
      }
    }
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  const contextValue: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
  }

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (typeof window === "undefined") {
    return defaultContextValue
  }

  if (context === undefined) {
    return defaultContextValue
  }

  return context
}
