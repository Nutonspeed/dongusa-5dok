"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "th"

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
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
    search: "Search",
    login: "Login",
    register: "Register",

    // Hero Section
    heroTitle: "Transform Your Living Space",
    heroSubtitle: "Premium sofa covers that protect and beautify your furniture",
    shopNow: "Shop Now",
    customOrder: "Custom Order",

    // Featured Products
    featuredProductsTitle: "Featured Products",
    featuredProductsSubtitle: "Discover our most popular sofa covers",
    addToCart: "Add to Cart",
    viewAllProducts: "View All Products",

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

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
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
    search: "ค้นหา",
    login: "เข้าสู่ระบบ",
    register: "สมัครสมาชิก",

    // Hero Section
    heroTitle: "เปลี่ยนโฉมพื้นที่นั่งเล่น",
    heroSubtitle: "ผ้าคลุมโซฟาพรีเมียมที่ปกป้องและเพิ่มความสวยงาม",
    shopNow: "ช้อปเลย",
    customOrder: "สั่งทำพิเศษ",

    // Featured Products
    featuredProductsTitle: "สินค้าแนะนำ",
    featuredProductsSubtitle: "ค้นพบผ้าคลุมโซฟายอดนิยมของเรา",
    addToCart: "เพิ่มลงตะกร้า",
    viewAllProducts: "ดูสินค้าทั้งหมด",

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

    // Common
    loading: "กำลังโหลด...",
    error: "ข้อผิดพลาด",
    success: "สำเร็จ",
    cancel: "ยกเลิก",
    save: "บันทึก",
    edit: "แก้ไข",
    delete: "ลบ",
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

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("th")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "th")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "th" ? "en" : "th"))
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.th] || key
  }

  return <LanguageContext.Provider value={{ language, toggleLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
