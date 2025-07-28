"use client"

import React from "react"

// Comprehensive internationalization system
import { createContext, useContext } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "your-select-component-library" // Import your select component library here

// Supported locales
export const SUPPORTED_LOCALES = {
  en: {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    dir: "ltr",
  },
  th: {
    code: "th",
    name: "ไทย",
    flag: "🇹🇭",
    dir: "ltr",
  },
  zh: {
    code: "zh",
    name: "中文",
    flag: "🇨🇳",
    dir: "ltr",
  },
  ar: {
    code: "ar",
    name: "العربية",
    flag: "🇸🇦",
    dir: "rtl",
  },
} as const

export type SupportedLocale = keyof typeof SUPPORTED_LOCALES

// Translation keys type
export interface TranslationKeys {
  // Navigation
  "nav.home": string
  "nav.products": string
  "nav.custom": string
  "nav.about": string
  "nav.contact": string
  "nav.cart": string
  "nav.admin": string
  "nav.dashboard": string
  "nav.bills": string
  "nav.customers": string
  "nav.analytics": string
  "nav.settings": string

  // Common
  "common.loading": string
  "common.error": string
  "common.success": string
  "common.warning": string
  "common.info": string
  "common.save": string
  "common.cancel": string
  "common.delete": string
  "common.edit": string
  "common.view": string
  "common.create": string
  "common.update": string
  "common.search": string
  "common.filter": string
  "common.sort": string
  "common.export": string
  "common.import": string
  "common.print": string
  "common.download": string
  "common.upload": string
  "common.yes": string
  "common.no": string
  "common.confirm": string
  "common.back": string
  "common.next": string
  "common.previous": string
  "common.close": string
  "common.open": string
  "common.select": string
  "common.clear": string
  "common.reset": string
  "common.apply": string
  "common.submit": string
  "common.required": string
  "common.optional": string
  "common.all": string
  "common.none": string
  "common.other": string

  // Authentication
  "auth.login": string
  "auth.logout": string
  "auth.register": string
  "auth.email": string
  "auth.password": string
  "auth.confirmPassword": string
  "auth.forgotPassword": string
  "auth.resetPassword": string
  "auth.rememberMe": string
  "auth.loginSuccess": string
  "auth.loginError": string
  "auth.logoutSuccess": string
  "auth.invalidCredentials": string
  "auth.passwordMismatch": string
  "auth.weakPassword": string
  "auth.emailRequired": string
  "auth.passwordRequired": string

  // Bills
  "bills.title": string
  "bills.create": string
  "bills.edit": string
  "bills.view": string
  "bills.delete": string
  "bills.billNumber": string
  "bills.customer": string
  "bills.amount": string
  "bills.status": string
  "bills.dueDate": string
  "bills.createdAt": string
  "bills.updatedAt": string
  "bills.items": string
  "bills.subtotal": string
  "bills.tax": string
  "bills.discount": string
  "bills.total": string
  "bills.notes": string
  "bills.tags": string
  "bills.progress": string
  "bills.qrCode": string
  "bills.paymentLink": string
  "bills.sendNotification": string
  "bills.markAsPaid": string
  "bills.generateQR": string
  "bills.downloadPDF": string
  "bills.printBill": string
  "bills.duplicateBill": string
  "bills.status.draft": string
  "bills.status.sent": string
  "bills.status.paid": string
  "bills.status.overdue": string
  "bills.status.cancelled": string
  "bills.progress.pending": string
  "bills.progress.confirmed": string
  "bills.progress.tailoring": string
  "bills.progress.packing": string
  "bills.progress.shipped": string
  "bills.progress.delivered": string
  "bills.progress.completed": string
  "bills.createSuccess": string
  "bills.updateSuccess": string
  "bills.deleteSuccess": string
  "bills.deleteConfirm": string
  "bills.notificationSent": string
  "bills.qrGenerated": string
  "bills.noBillsFound": string
  "bills.searchPlaceholder": string

  // Customers
  "customers.title": string
  "customers.create": string
  "customers.edit": string
  "customers.view": string
  "customers.delete": string
  "customers.name": string
  "customers.email": string
  "customers.phone": string
  "customers.address": string
  "customers.totalOrders": string
  "customers.totalSpent": string
  "customers.lastOrder": string
  "customers.preferences": string
  "customers.language": string
  "customers.currency": string
  "customers.notifications": string
  "customers.emailNotifications": string
  "customers.smsNotifications": string
  "customers.createSuccess": string
  "customers.updateSuccess": string
  "customers.deleteSuccess": string
  "customers.deleteConfirm": string
  "customers.noCustomersFound": string
  "customers.searchPlaceholder": string

  // Products
  "products.title": string
  "products.create": string
  "products.edit": string
  "products.view": string
  "products.delete": string
  "products.name": string
  "products.description": string
  "products.category": string
  "products.price": string
  "products.images": string
  "products.specifications": string
  "products.customizable": string
  "products.inStock": string
  "products.stockQuantity": string
  "products.customizationOptions": string
  "products.createSuccess": string
  "products.updateSuccess": string
  "products.deleteSuccess": string
  "products.deleteConfirm": string
  "products.noProductsFound": string
  "products.searchPlaceholder": string
  "products.addToCart": string
  "products.outOfStock": string
  "products.customize": string

  // Analytics
  "analytics.title": string
  "analytics.revenue": string
  "analytics.orders": string
  "analytics.customers": string
  "analytics.growth": string
  "analytics.thisMonth": string
  "analytics.lastMonth": string
  "analytics.topProducts": string
  "analytics.revenueChart": string
  "analytics.ordersChart": string
  "analytics.customersChart": string
  "analytics.dateRange": string
  "analytics.last7Days": string
  "analytics.last30Days": string
  "analytics.last90Days": string
  "analytics.lastYear": string
  "analytics.custom": string
  "analytics.noData": string
  "analytics.loading": string
  "analytics.error": string

  // Errors
  "errors.generic": string
  "errors.network": string
  "errors.notFound": string
  "errors.unauthorized": string
  "errors.forbidden": string
  "errors.validation": string
  "errors.serverError": string
  "errors.timeout": string
  "errors.rateLimited": string
  "errors.tryAgain": string
  "errors.contactSupport": string

  // Validation
  "validation.required": string
  "validation.email": string
  "validation.phone": string
  "validation.minLength": string
  "validation.maxLength": string
  "validation.min": string
  "validation.max": string
  "validation.pattern": string
  "validation.numeric": string
  "validation.positive": string
  "validation.integer": string
  "validation.url": string
  "validation.date": string
  "validation.future": string
  "validation.past": string

  // Notifications
  "notifications.title": string
  "notifications.markAllRead": string
  "notifications.clear": string
  "notifications.noNotifications": string
  "notifications.newBill": string
  "notifications.billPaid": string
  "notifications.billOverdue": string
  "notifications.newCustomer": string
  "notifications.orderShipped": string
  "notifications.orderDelivered": string

  // Settings
  "settings.title": string
  "settings.profile": string
  "settings.preferences": string
  "settings.notifications": string
  "settings.security": string
  "settings.language": string
  "settings.theme": string
  "settings.currency": string
  "settings.timezone": string
  "settings.dateFormat": string
  "settings.timeFormat": string
  "settings.numberFormat": string
  "settings.save": string
  "settings.saved": string
  "settings.error": string

  // Date and Time
  "date.today": string
  "date.yesterday": string
  "date.tomorrow": string
  "date.thisWeek": string
  "date.lastWeek": string
  "date.thisMonth": string
  "date.lastMonth": string
  "date.thisYear": string
  "date.lastYear": string
  "date.daysAgo": string
  "date.hoursAgo": string
  "date.minutesAgo": string
  "date.justNow": string

  // Currency and Numbers
  "currency.symbol": string
  "currency.code": string
  "number.thousand": string
  "number.million": string
  "number.billion": string
  "number.decimal": string
  "number.percent": string
}

// Translation data
const translations: Record<SupportedLocale, TranslationKeys> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.custom": "Custom Covers",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.cart": "Cart",
    "nav.admin": "Admin",
    "nav.dashboard": "Dashboard",
    "nav.bills": "Bills",
    "nav.customers": "Customers",
    "nav.analytics": "Analytics",
    "nav.settings": "Settings",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.warning": "Warning",
    "common.info": "Information",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.create": "Create",
    "common.update": "Update",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.export": "Export",
    "common.import": "Import",
    "common.print": "Print",
    "common.download": "Download",
    "common.upload": "Upload",
    "common.yes": "Yes",
    "common.no": "No",
    "common.confirm": "Confirm",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.close": "Close",
    "common.open": "Open",
    "common.select": "Select",
    "common.clear": "Clear",
    "common.reset": "Reset",
    "common.apply": "Apply",
    "common.submit": "Submit",
    "common.required": "Required",
    "common.optional": "Optional",
    "common.all": "All",
    "common.none": "None",
    "common.other": "Other",

    // Authentication
    "auth.login": "Login",
    "auth.logout": "Logout",
    "auth.register": "Register",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.forgotPassword": "Forgot Password",
    "auth.resetPassword": "Reset Password",
    "auth.rememberMe": "Remember Me",
    "auth.loginSuccess": "Login successful",
    "auth.loginError": "Login failed",
    "auth.logoutSuccess": "Logout successful",
    "auth.invalidCredentials": "Invalid email or password",
    "auth.passwordMismatch": "Passwords do not match",
    "auth.weakPassword": "Password is too weak",
    "auth.emailRequired": "Email is required",
    "auth.passwordRequired": "Password is required",

    // Bills
    "bills.title": "Bills",
    "bills.create": "Create Bill",
    "bills.edit": "Edit Bill",
    "bills.view": "View Bill",
    "bills.delete": "Delete Bill",
    "bills.billNumber": "Bill Number",
    "bills.customer": "Customer",
    "bills.amount": "Amount",
    "bills.status": "Status",
    "bills.dueDate": "Due Date",
    "bills.createdAt": "Created At",
    "bills.updatedAt": "Updated At",
    "bills.items": "Items",
    "bills.subtotal": "Subtotal",
    "bills.tax": "Tax",
    "bills.discount": "Discount",
    "bills.total": "Total",
    "bills.notes": "Notes",
    "bills.tags": "Tags",
    "bills.progress": "Progress",
    "bills.qrCode": "QR Code",
    "bills.paymentLink": "Payment Link",
    "bills.sendNotification": "Send Notification",
    "bills.markAsPaid": "Mark as Paid",
    "bills.generateQR": "Generate QR Code",
    "bills.downloadPDF": "Download PDF",
    "bills.printBill": "Print Bill",
    "bills.duplicateBill": "Duplicate Bill",
    "bills.status.draft": "Draft",
    "bills.status.sent": "Sent",
    "bills.status.paid": "Paid",
    "bills.status.overdue": "Overdue",
    "bills.status.cancelled": "Cancelled",
    "bills.progress.pending": "Pending",
    "bills.progress.confirmed": "Confirmed",
    "bills.progress.tailoring": "Tailoring",
    "bills.progress.packing": "Packing",
    "bills.progress.shipped": "Shipped",
    "bills.progress.delivered": "Delivered",
    "bills.progress.completed": "Completed",
    "bills.createSuccess": "Bill created successfully",
    "bills.updateSuccess": "Bill updated successfully",
    "bills.deleteSuccess": "Bill deleted successfully",
    "bills.deleteConfirm": "Are you sure you want to delete this bill?",
    "bills.notificationSent": "Notification sent successfully",
    "bills.qrGenerated": "QR code generated successfully",
    "bills.noBillsFound": "No bills found",
    "bills.searchPlaceholder": "Search bills...",

    // Customers
    "customers.title": "Customers",
    "customers.create": "Create Customer",
    "customers.edit": "Edit Customer",
    "customers.view": "View Customer",
    "customers.delete": "Delete Customer",
    "customers.name": "Name",
    "customers.email": "Email",
    "customers.phone": "Phone",
    "customers.address": "Address",
    "customers.totalOrders": "Total Orders",
    "customers.totalSpent": "Total Spent",
    "customers.lastOrder": "Last Order",
    "customers.preferences": "Preferences",
    "customers.language": "Language",
    "customers.currency": "Currency",
    "customers.notifications": "Notifications",
    "customers.emailNotifications": "Email Notifications",
    "customers.smsNotifications": "SMS Notifications",
    "customers.createSuccess": "Customer created successfully",
    "customers.updateSuccess": "Customer updated successfully",
    "customers.deleteSuccess": "Customer deleted successfully",
    "customers.deleteConfirm": "Are you sure you want to delete this customer?",
    "customers.noCustomersFound": "No customers found",
    "customers.searchPlaceholder": "Search customers...",

    // Products
    "products.title": "Products",
    "products.create": "Create Product",
    "products.edit": "Edit Product",
    "products.view": "View Product",
    "products.delete": "Delete Product",
    "products.name": "Name",
    "products.description": "Description",
    "products.category": "Category",
    "products.price": "Price",
    "products.images": "Images",
    "products.specifications": "Specifications",
    "products.customizable": "Customizable",
    "products.inStock": "In Stock",
    "products.stockQuantity": "Stock Quantity",
    "products.customizationOptions": "Customization Options",
    "products.createSuccess": "Product created successfully",
    "products.updateSuccess": "Product updated successfully",
    "products.deleteSuccess": "Product deleted successfully",
    "products.deleteConfirm": "Are you sure you want to delete this product?",
    "products.noProductsFound": "No products found",
    "products.searchPlaceholder": "Search products...",
    "products.addToCart": "Add to Cart",
    "products.outOfStock": "Out of Stock",
    "products.customize": "Customize",

    // Analytics
    "analytics.title": "Analytics",
    "analytics.revenue": "Revenue",
    "analytics.orders": "Orders",
    "analytics.customers": "Customers",
    "analytics.growth": "Growth",
    "analytics.thisMonth": "This Month",
    "analytics.lastMonth": "Last Month",
    "analytics.topProducts": "Top Products",
    "analytics.revenueChart": "Revenue Chart",
    "analytics.ordersChart": "Orders Chart",
    "analytics.customersChart": "Customers Chart",
    "analytics.dateRange": "Date Range",
    "analytics.last7Days": "Last 7 Days",
    "analytics.last30Days": "Last 30 Days",
    "analytics.last90Days": "Last 90 Days",
    "analytics.lastYear": "Last Year",
    "analytics.custom": "Custom",
    "analytics.noData": "No data available",
    "analytics.loading": "Loading analytics...",
    "analytics.error": "Failed to load analytics",

    // Errors
    "errors.generic": "An unexpected error occurred",
    "errors.network": "Network error. Please check your connection.",
    "errors.notFound": "The requested resource was not found",
    "errors.unauthorized": "You are not authorized to perform this action",
    "errors.forbidden": "Access denied",
    "errors.validation": "Please check your input and try again",
    "errors.serverError": "Server error. Please try again later.",
    "errors.timeout": "Request timeout. Please try again.",
    "errors.rateLimited": "Too many requests. Please try again later.",
    "errors.tryAgain": "Try Again",
    "errors.contactSupport": "Contact Support",

    // Validation
    "validation.required": "This field is required",
    "validation.email": "Please enter a valid email address",
    "validation.phone": "Please enter a valid phone number",
    "validation.minLength": "Must be at least {min} characters",
    "validation.maxLength": "Must be no more than {max} characters",
    "validation.min": "Must be at least {min}",
    "validation.max": "Must be no more than {max}",
    "validation.pattern": "Invalid format",
    "validation.numeric": "Must be a number",
    "validation.positive": "Must be a positive number",
    "validation.integer": "Must be a whole number",
    "validation.url": "Please enter a valid URL",
    "validation.date": "Please enter a valid date",
    "validation.future": "Date must be in the future",
    "validation.past": "Date must be in the past",

    // Notifications
    "notifications.title": "Notifications",
    "notifications.markAllRead": "Mark All Read",
    "notifications.clear": "Clear All",
    "notifications.noNotifications": "No notifications",
    "notifications.newBill": "New bill created",
    "notifications.billPaid": "Bill payment received",
    "notifications.billOverdue": "Bill is overdue",
    "notifications.newCustomer": "New customer registered",
    "notifications.orderShipped": "Order has been shipped",
    "notifications.orderDelivered": "Order has been delivered",

    // Settings
    "settings.title": "Settings",
    "settings.profile": "Profile",
    "settings.preferences": "Preferences",
    "settings.notifications": "Notifications",
    "settings.security": "Security",
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.currency": "Currency",
    "settings.timezone": "Timezone",
    "settings.dateFormat": "Date Format",
    "settings.timeFormat": "Time Format",
    "settings.numberFormat": "Number Format",
    "settings.save": "Save Settings",
    "settings.saved": "Settings saved successfully",
    "settings.error": "Failed to save settings",

    // Date and Time
    "date.today": "Today",
    "date.yesterday": "Yesterday",
    "date.tomorrow": "Tomorrow",
    "date.thisWeek": "This Week",
    "date.lastWeek": "Last Week",
    "date.thisMonth": "This Month",
    "date.lastMonth": "Last Month",
    "date.thisYear": "This Year",
    "date.lastYear": "Last Year",
    "date.daysAgo": "{count} days ago",
    "date.hoursAgo": "{count} hours ago",
    "date.minutesAgo": "{count} minutes ago",
    "date.justNow": "Just now",

    // Currency and Numbers
    "currency.symbol": "$",
    "currency.code": "USD",
    "number.thousand": "K",
    "number.million": "M",
    "number.billion": "B",
    "number.decimal": ".",
    "number.percent": "%",
  },

  th: {
    // Navigation
    "nav.home": "หน้าหลัก",
    "nav.products": "สินค้า",
    "nav.custom": "ผ้าคลุมตามสั่ง",
    "nav.about": "เกี่ยวกับเรา",
    "nav.contact": "ติดต่อ",
    "nav.cart": "ตะกร้า",
    "nav.admin": "ผู้ดูแล",
    "nav.dashboard": "แดชบอร์ด",
    "nav.bills": "บิล",
    "nav.customers": "ลูกค้า",
    "nav.analytics": "การวิเคราะห์",
    "nav.settings": "การตั้งค่า",

    // Common
    "common.loading": "กำลังโหลด...",
    "common.error": "ข้อผิดพลาด",
    "common.success": "สำเร็จ",
    "common.warning": "คำเตือน",
    "common.info": "ข้อมูล",
    "common.save": "บันทึก",
    "common.cancel": "ยกเลิก",
    "common.delete": "ลบ",
    "common.edit": "แก้ไข",
    "common.view": "ดู",
    "common.create": "สร้าง",
    "common.update": "อัปเดต",
    "common.search": "ค้นหา",
    "common.filter": "กรอง",
    "common.sort": "เรียง",
    "common.export": "ส่งออก",
    "common.import": "นำเข้า",
    "common.print": "พิมพ์",
    "common.download": "ดาวน์โหลด",
    "common.upload": "อัปโหลด",
    "common.yes": "ใช่",
    "common.no": "ไม่",
    "common.confirm": "ยืนยัน",
    "common.back": "กลับ",
    "common.next": "ถัดไป",
    "common.previous": "ก่อนหน้า",
    "common.close": "ปิด",
    "common.open": "เปิด",
    "common.select": "เลือก",
    "common.clear": "ล้าง",
    "common.reset": "รีเซ็ต",
    "common.apply": "ใช้",
    "common.submit": "ส่ง",
    "common.required": "จำเป็น",
    "common.optional": "ไม่บังคับ",
    "common.all": "ทั้งหมด",
    "common.none": "ไม่มี",
    "common.other": "อื่นๆ",

    // Authentication
    "auth.login": "เข้าสู่ระบบ",
    "auth.logout": "ออกจากระบบ",
    "auth.register": "สมัครสมาชิก",
    "auth.email": "อีเมล",
    "auth.password": "รหัสผ่าน",
    "auth.confirmPassword": "ยืนยันรหัสผ่าน",
    "auth.forgotPassword": "ลืมรหัสผ่าน",
    "auth.resetPassword": "รีเซ็ตรหัสผ่าน",
    "auth.rememberMe": "จดจำฉัน",
    "auth.loginSuccess": "เข้าสู่ระบบสำเร็จ",
    "auth.loginError": "เข้าสู่ระบบไม่สำเร็จ",
    "auth.logoutSuccess": "ออกจากระบบสำเร็จ",
    "auth.invalidCredentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth.passwordMismatch": "รหัสผ่านไม่ตรงกัน",
    "auth.weakPassword": "รหัสผ่านไม่แข็งแรงพอ",
    "auth.emailRequired": "กรุณากรอกอีเมล",
    "auth.passwordRequired": "กรุณากรอกรหัสผ่าน",

    // Bills
    "bills.title": "บิล",
    "bills.create": "สร้างบิล",
    "bills.edit": "แก้ไขบิล",
    "bills.view": "ดูบิล",
    "bills.delete": "ลบบิล",
    "bills.billNumber": "หมายเลขบิล",
    "bills.customer": "ลูกค้า",
    "bills.amount": "จำนวนเงิน",
    "bills.status": "สถานะ",
    "bills.dueDate": "วันครบกำหนด",
    "bills.createdAt": "วันที่สร้าง",
    "bills.updatedAt": "วันที่อัปเดต",
    "bills.items": "รายการ",
    "bills.subtotal": "ยอดรวมย่อย",
    "bills.tax": "ภาษี",
    "bills.discount": "ส่วนลด",
    "bills.total": "ยอดรวม",
    "bills.notes": "หมายเหตุ",
    "bills.tags": "แท็ก",
    "bills.progress": "ความคืบหน้า",
    "bills.qrCode": "QR Code",
    "bills.paymentLink": "ลิงก์ชำระเงิน",
    "bills.sendNotification": "ส่งการแจ้งเตือน",
    "bills.markAsPaid": "ทำเครื่องหมายว่าชำระแล้ว",
    "bills.generateQR": "สร้าง QR Code",
    "bills.downloadPDF": "ดาวน์โหลด PDF",
    "bills.printBill": "พิมพ์บิล",
    "bills.duplicateBill": "ทำสำเนาบิล",
    "bills.status.draft": "ร่าง",
    "bills.status.sent": "ส่งแล้ว",
    "bills.status.paid": "ชำระแล้ว",
    "bills.status.overdue": "เกินกำหนด",
    "bills.status.cancelled": "ยกเลิก",
    "bills.progress.pending": "รอดำเนินการ",
    "bills.progress.confirmed": "ยืนยันแล้ว",
    "bills.progress.tailoring": "กำลังตัด",
    "bills.progress.packing": "กำลังแพ็ค",
    "bills.progress.shipped": "จัดส่งแล้ว",
    "bills.progress.delivered": "ส่งมอบแล้ว",
    "bills.progress.completed": "เสร็จสิ้น",
    "bills.createSuccess": "สร้างบิลสำเร็จ",
    "bills.updateSuccess": "อัปเดตบิลสำเร็จ",
    "bills.deleteSuccess": "ลบบิลสำเร็จ",
    "bills.deleteConfirm": "คุณแน่ใจหรือไม่ที่จะลบบิลนี้?",
    "bills.notificationSent": "ส่งการแจ้งเตือนสำเร็จ",
    "bills.qrGenerated": "สร้าง QR Code สำเร็จ",
    "bills.noBillsFound": "ไม่พบบิล",
    "bills.searchPlaceholder": "ค้นหาบิล...",

    // Customers
    "customers.title": "ลูกค้า",
    "customers.create": "สร้างลูกค้า",
    "customers.edit": "แก้ไขลูกค้า",
    "customers.view": "ดูลูกค้า",
    "customers.delete": "ลบลูกค้า",
    "customers.name": "ชื่อ",
    "customers.email": "อีเมล",
    "customers.phone": "โทรศัพท์",
    "customers.address": "ที่อยู่",
    "customers.totalOrders": "คำสั่งซื้อทั้งหมด",
    "customers.totalSpent": "ยอดใช้จ่ายทั้งหมด",
    "customers.lastOrder": "คำสั่งซื้อล่าสุด",
    "customers.preferences": "การตั้งค่า",
    "customers.language": "ภาษา",
    "customers.currency": "สกุลเงิน",
    "customers.notifications": "การแจ้งเตือน",
    "customers.emailNotifications": "การแจ้งเตือนทางอีเมล",
    "customers.smsNotifications": "การแจ้งเตือนทาง SMS",
    "customers.createSuccess": "สร้างลูกค้าสำเร็จ",
    "customers.updateSuccess": "อัปเดตลูกค้าสำเร็จ",
    "customers.deleteSuccess": "ลบลูกค้าสำเร็จ",
    "customers.deleteConfirm": "คุณแน่ใจหรือไม่ที่จะลบลูกค้านี้?",
    "customers.noCustomersFound": "ไม่พบลูกค้า",
    "customers.searchPlaceholder": "ค้นหาลูกค้า...",

    // Products
    "products.title": "สินค้า",
    "products.create": "สร้างสินค้า",
    "products.edit": "แก้ไขสินค้า",
    "products.view": "ดูสินค้า",
    "products.delete": "ลบสินค้า",
    "products.name": "ชื่อ",
    "products.description": "คำอธิบาย",
    "products.category": "หมวดหมู่",
    "products.price": "ราคา",
    "products.images": "รูปภาพ",
    "products.specifications": "ข้อมูลจำเพาะ",
    "products.customizable": "ปรับแต่งได้",
    "products.inStock": "มีสินค้า",
    "products.stockQuantity": "จำนวนสต็อก",
    "products.customizationOptions": "ตัวเลือกการปรับแต่ง",
    "products.createSuccess": "สร้างสินค้าสำเร็จ",
    "products.updateSuccess": "อัปเดตสินค้าสำเร็จ",
    "products.deleteSuccess": "ลบสินค้าสำเร็จ",
    "products.deleteConfirm": "คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?",
    "products.noProductsFound": "ไม่พบสินค้า",
    "products.searchPlaceholder": "ค้นหาสินค้า...",
    "products.addToCart": "เพิ่มลงตะกร้า",
    "products.outOfStock": "สินค้าหมด",
    "products.customize": "ปรับแต่ง",

    // Analytics
    "analytics.title": "การวิเคราะห์",
    "analytics.revenue": "รายได้",
    "analytics.orders": "คำสั่งซื้อ",
    "analytics.customers": "ลูกค้า",
    "analytics.growth": "การเติบโต",
    "analytics.thisMonth": "เดือนนี้",
    "analytics.lastMonth": "เดือนที่แล้ว",
    "analytics.topProducts": "สินค้ายอดนิยม",
    "analytics.revenueChart": "กราฟรายได้",
    "analytics.ordersChart": "กราฟคำสั่งซื้อ",
    "analytics.customersChart": "กราฟลูกค้า",
    "analytics.dateRange": "ช่วงวันที่",
    "analytics.last7Days": "7 วันที่ผ่านมา",
    "analytics.last30Days": "30 วันที่ผ่านมา",
    "analytics.last90Days": "90 วันที่ผ่านมา",
    "analytics.lastYear": "ปีที่แล้ว",
    "analytics.custom": "กำหนดเอง",
    "analytics.noData": "ไม่มีข้อมูล",
    "analytics.loading": "กำลังโหลดการวิเคราะห์...",
    "analytics.error": "โหลดการวิเคราะห์ไม่สำเร็จ",

    // Errors
    "errors.generic": "เกิดข้อผิดพลาดที่ไม่คาดคิด",
    "errors.network": "ข้อผิดพลาดเครือข่าย กรุณาตรวจสอบการเชื่อมต่อ",
    "errors.notFound": "ไม่พบทรัพยากรที่ร้องขอ",
    "errors.unauthorized": "คุณไม่ได้รับอนุญาตให้ดำเนินการนี้",
    "errors.forbidden": "การเข้าถึงถูกปฏิเสธ",
    "errors.validation": "กรุณาตรวจสอบข้อมูลและลองใหม่",
    "errors.serverError": "ข้อผิดพลาดเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง",
    "errors.timeout": "หมดเวลาการร้องขอ กรุณาลองใหม่",
    "errors.rateLimited": "คำขอมากเกินไป กรุณาลองใหม่ภายหลัง",
    "errors.tryAgain": "ลองใหม่",
    "errors.contactSupport": "ติดต่อฝ่ายสนับสนุน",

    // Validation
    "validation.required": "ฟิลด์นี้จำเป็น",
    "validation.email": "กรุณากรอกอีเมลที่ถูกต้อง",
    "validation.phone": "กรุณากรอกหมายเลขโทรศัพท์ที่ถูกต้อง",
    "validation.minLength": "ต้องมีอย่างน้อย {min} ตัวอักษร",
    "validation.maxLength": "ต้องไม่เกิน {max} ตัวอักษร",
    "validation.min": "ต้องมีค่าอย่างน้อย {min}",
    "validation.max": "ต้องไม่เกิน {max}",
    "validation.pattern": "รูปแบบไม่ถูกต้อง",
    "validation.numeric": "ต้องเป็นตัวเลข",
    "validation.positive": "ต้องเป็นตัวเลขบวก",
    "validation.integer": "ต้องเป็นจำนวนเต็ม",
    "validation.url": "กรุณากรอก URL ที่ถูกต้อง",
    "validation.date": "กรุณากรอกวันที่ที่ถูกต้อง",
    "validation.future": "วันที่ต้องเป็นอนาคต",
    "validation.past": "วันที่ต้องเป็นอดีต",

    // Notifications
    "notifications.title": "การแจ้งเตือน",
    "notifications.markAllRead": "ทำเครื่องหมายอ่านทั้งหมด",
    "notifications.clear": "ล้างทั้งหมด",
    "notifications.noNotifications": "ไม่มีการแจ้งเตือน",
    "notifications.newBill": "สร้างบิลใหม่",
    "notifications.billPaid": "ได้รับการชำระเงิน",
    "notifications.billOverdue": "บิลเกินกำหนด",
    "notifications.newCustomer": "ลูกค้าใหม่สมัครสมาชิก",
    "notifications.orderShipped": "คำสั่งซื้อถูกจัดส่งแล้ว",
    "notifications.orderDelivered": "คำสั่งซื้อถูกส่งมอบแล้ว",

    // Settings
    "settings.title": "การตั้งค่า",
    "settings.profile": "โปรไฟล์",
    "settings.preferences": "การตั้งค่า",
    "settings.notifications": "การแจ้งเตือน",
    "settings.security": "ความปลอดภัย",
    "settings.language": "ภาษา",
    "settings.theme": "ธีม",
    "settings.currency": "สกุลเงิน",
    "settings.timezone": "เขตเวลา",
    "settings.dateFormat": "รูปแบบวันที่",
    "settings.timeFormat": "รูปแบบเวลา",
    "settings.numberFormat": "รูปแบบตัวเลข",
    "settings.save": "บันทึกการตั้งค่า",
    "settings.saved": "บันทึกการตั้งค่าสำเร็จ",
    "settings.error": "บันทึกการตั้งค่าไม่สำเร็จ",

    // Date and Time
    "date.today": "วันนี้",
    "date.yesterday": "เมื่อวาน",
    "date.tomorrow": "พรุ่งนี้",
    "date.thisWeek": "สัปดาห์นี้",
    "date.lastWeek": "สัปดาห์ที่แล้ว",
    "date.thisMonth": "เดือนนี้",
    "date.lastMonth": "เดือนที่แล้ว",
    "date.thisYear": "ปีนี้",
    "date.lastYear": "ปีที่แล้ว",
    "date.daysAgo": "{count} วันที่แล้ว",
    "date.hoursAgo": "{count} ชั่วโมงที่แล้ว",
    "date.minutesAgo": "{count} นาทีที่แล้ว",
    "date.justNow": "เมื่อสักครู่",

    // Currency and Numbers
    "currency.symbol": "฿",
    "currency.code": "THB",
    "number.thousand": "พัน",
    "number.million": "ล้าน",
    "number.billion": "พันล้าน",
    "number.decimal": ".",
    "number.percent": "%",
  },

  zh: {
    // Navigation
    "nav.home": "首页",
    "nav.products": "产品",
    "nav.custom": "定制套罩",
    "nav.about": "关于我们",
    "nav.contact": "联系我们",
    "nav.cart": "购物车",
    "nav.admin": "管理员",
    "nav.dashboard": "仪表板",
    "nav.bills": "账单",
    "nav.customers": "客户",
    "nav.analytics": "分析",
    "nav.settings": "设置",

    // Common
    "common.loading": "加载中...",
    "common.error": "错误",
    "common.success": "成功",
    "common.warning": "警告",
    "common.info": "信息",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.delete": "删除",
    "common.edit": "编辑",
    "common.view": "查看",
    "common.create": "创建",
    "common.update": "更新",
    "common.search": "搜索",
    "common.filter": "筛选",
    "common.sort": "排序",
    "common.export": "导出",
    "common.import": "导入",
    "common.print": "打印",
    "common.download": "下载",
    "common.upload": "上传",
    "common.yes": "是",
    "common.no": "否",
    "common.confirm": "确认",
    "common.back": "返回",
    "common.next": "下一步",
    "common.previous": "上一步",
    "common.close": "关闭",
    "common.open": "打开",
    "common.select": "选择",
    "common.clear": "清除",
    "common.reset": "重置",
    "common.apply": "应用",
    "common.submit": "提交",
    "common.required": "必填",
    "common.optional": "可选",
    "common.all": "全部",
    "common.none": "无",
    "common.other": "其他",

    // Authentication
    "auth.login": "登录",
    "auth.logout": "退出",
    "auth.register": "注册",
    "auth.email": "邮箱",
    "auth.password": "密码",
    "auth.confirmPassword": "确认密码",
    "auth.forgotPassword": "忘记密码",
    "auth.resetPassword": "重置密码",
    "auth.rememberMe": "记住我",
    "auth.loginSuccess": "登录成功",
    "auth.loginError": "登录失败",
    "auth.logoutSuccess": "退出成功",
    "auth.invalidCredentials": "邮箱或密码错误",
    "auth.passwordMismatch": "密码不匹配",
    "auth.weakPassword": "密码强度不够",
    "auth.emailRequired": "请输入邮箱",
    "auth.passwordRequired": "请输入密码",

    // Bills
    "bills.title": "账单",
    "bills.create": "创建账单",
    "bills.edit": "编辑账单",
    "bills.view": "查看账单",
    "bills.delete": "删除账单",
    "bills.billNumber": "账单号",
    "bills.customer": "客户",
    "bills.amount": "金额",
    "bills.status": "状态",
    "bills.dueDate": "到期日期",
    "bills.createdAt": "创建时间",
    "bills.updatedAt": "更新时间",
    "bills.items": "项目",
    "bills.subtotal": "小计",
    "bills.tax": "税费",
    "bills.discount": "折扣",
    "bills.total": "总计",
    "bills.notes": "备注",
    "bills.tags": "标签",
    "bills.progress": "进度",
    "bills.qrCode": "二维码",
    "bills.paymentLink": "支付链接",
    "bills.sendNotification": "发送通知",
    "bills.markAsPaid": "标记为已付",
    "bills.generateQR": "生成二维码",
    "bills.downloadPDF": "下载PDF",
    "bills.printBill": "打印账单",
    "bills.duplicateBill": "复制账单",
    "bills.status.draft": "草稿",
    "bills.status.sent": "已发送",
    "bills.status.paid": "已付款",
    "bills.status.overdue": "逾期",
    "bills.status.cancelled": "已取消",
    "bills.progress.pending": "待处理",
    "bills.progress.confirmed": "已确认",
    "bills.progress.tailoring": "裁剪中",
    "bills.progress.packing": "包装中",
    "bills.progress.shipped": "已发货",
    "bills.progress.delivered": "已送达",
    "bills.progress.completed": "已完成",
    "bills.createSuccess": "账单创建成功",
    "bills.updateSuccess": "账单更新成功",
    "bills.deleteSuccess": "账单删除成功",
    "bills.deleteConfirm": "确定要删除此账单吗？",
    "bills.notificationSent": "通知发送成功",
    "bills.qrGenerated": "二维码生成成功",
    "bills.noBillsFound": "未找到账单",
    "bills.searchPlaceholder": "搜索账单...",

    // Customers
    "customers.title": "客户",
    "customers.create": "创建客户",
    "customers.edit": "编辑客户",
    "customers.view": "查看客户",
    "customers.delete": "删除客户",
    "customers.name": "姓名",
    "customers.email": "邮箱",
    "customers.phone": "电话",
    "customers.address": "地址",
    "customers.totalOrders": "总订单数",
    "customers.totalSpent": "总花费",
    "customers.lastOrder": "最新订单",
    "customers.preferences": "偏好设置",
    "customers.language": "语言",
    "customers.currency": "货币",
    "customers.notifications": "通知",
    "customers.emailNotifications": "电子邮件通知",
    "customers.smsNotifications": "短信通知",
    "customers.createSuccess": "客户创建成功",
    "customers.updateSuccess": "客户更新成功",
    "customers.deleteSuccess": "客户删除成功",
    "customers.deleteConfirm": "确定要删除此客户吗？",
    "customers.noCustomersFound": "未找到客户",
    "customers.searchPlaceholder": "搜索客户...",

    // Products
    "products.title": "产品",
    "products.create": "创建产品",
    "products.edit": "编辑产品",
    "products.view": "查看产品",
    "products.delete": "删除产品",
    "products.name": "名称",
    "products.description": "描述",
    "products.category": "类别",
    "products.price": "价格",
    "products.images": "图片",
    "products.specifications": "规格",
    "products.customizable": "可定制",
    "products.inStock": "有库存",
    "products.stockQuantity": "库存数量",
    "products.customizationOptions": "定制选项",
    "products.createSuccess": "产品创建成功",
    "products.updateSuccess": "产品更新成功",
    "products.deleteSuccess": "产品删除成功",
    "products.deleteConfirm": "确定要删除此产品吗？",
    "products.noProductsFound": "未找到产品",
    "products.searchPlaceholder": "搜索产品...",
    "products.addToCart": "添加到购物车",
    "products.outOfStock": "无库存",
    "products.customize": "定制",

    // Analytics
    "analytics.title": "分析",
    "analytics.revenue": "收入",
    "analytics.orders": "订单",
    "analytics.customers": "客户",
    "analytics.growth": "增长",
    "analytics.thisMonth": "本月",
    "analytics.lastMonth": "上月",
    "analytics.topProducts": "畅销产品",
    "analytics.revenueChart": "收入图表",
    "analytics.ordersChart": "订单图表",
    "analytics.customersChart": "客户图表",
    "analytics.dateRange": "日期范围",
    "analytics.last7Days": "最近7天",
    "analytics.last30Days": "最近30天",
    "analytics.last90Days": "最近90天",
    "analytics.lastYear": "去年",
    "analytics.custom": "自定义",
    "analytics.noData": "无数据",
    "analytics.loading": "加载分析中...",
    "analytics.error": "加载分析失败",

    // Errors
    "errors.generic": "发生意外错误",
    "errors.network": "网络错误，请检查您的连接",
    "errors.notFound": "请求的资源未找到",
    "errors.unauthorized": "您无权执行此操作",
    "errors.forbidden": "访问被拒绝",
    "errors.validation": "请检查输入并重试",
    "errors.serverError": "服务器错误，请稍后再试",
    "errors.timeout": "请求超时，请重试",
    "errors.rateLimited": "请求过多，请稍后再试",
    "errors.tryAgain": "重试",
    "errors.contactSupport": "联系支持",

    // Validation
    "validation.required": "此字段必填",
    "validation.email": "请输入有效的电子邮件地址",
    "validation.phone": "请输入有效的电话号码",
    "validation.minLength": "至少需要 {min} 个字符",
    "validation.maxLength": "最多需要 {max} 个字符",
    "validation.min": "至少需要 {min}",
    "validation.max": "最多需要 {max}",
    "validation.pattern": "格式无效",
    "validation.numeric": "必须是数字",
    "validation.positive": "必须是正数",
    "validation.integer": "必须是整数",
    "validation.url": "请输入有效的URL",
    "validation.date": "请输入有效的日期",
    "validation.future": "日期必须在未来",
    "validation.past": "日期必须在过去",

    // Notifications
    "notifications.title": "通知",
    "notifications.markAllRead": "全部标记为已读",
    "notifications.clear": "全部清除",
    "notifications.noNotifications": "无通知",
    "notifications.newBill": "创建了新账单",
    "notifications.billPaid": "收到账单支付",
    "notifications.billOverdue": "账单已逾期",
    "notifications.newCustomer": "新客户注册",
    "notifications.orderShipped": "订单已发货",
    "notifications.orderDelivered": "订单已送达",

    // Settings
    "settings.title": "设置",
    "settings.profile": "个人资料",
    "settings.preferences": "偏好设置",
    "settings.notifications": "通知",
    "settings.security": "安全",
    "settings.language": "语言",
    "settings.theme": "主题",
    "settings.currency": "货币",
    "settings.timezone": "时区",
    "settings.dateFormat": "日期格式",
    "settings.timeFormat": "时间格式",
    "settings.numberFormat": "数字格式",
    "settings.save": "保存设置",
    "settings.saved": "设置保存成功",
    "settings.error": "设置保存失败",

    // Date and Time
    "date.today": "今天",
    "date.yesterday": "昨天",
    "date.tomorrow": "明天",
    "date.thisWeek": "本周",
    "date.lastWeek": "上周",
    "date.thisMonth": "本月",
    "date.lastMonth": "上月",
    "date.thisYear": "今年",
    "date.lastYear": "去年",
    "date.daysAgo": "{count} 天前",
    "date.hoursAgo": "{count} 小时前",
    "date.minutesAgo": "{count} 分钟前",
    "date.justNow": "刚刚",

    // Currency and Numbers
    "currency.symbol": "¥",
    "currency.code": "CNY",
    "number.thousand": "千",
    "number.million": "百万",
    "number.billion": "十亿",
    "number.decimal": ".",
    "number.percent": "%",
  },

  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.products": "المنتجات",
    "nav.custom": "أغطية مخصصة",
    "nav.about": "حولنا",
    "nav.contact": "اتصل بنا",
    "nav.cart": "السلة",
    "nav.admin": "المدير",
    "nav.dashboard": "لوحة التحكم",
    "nav.bills": "الفواتير",
    "nav.customers": "العملاء",
    "nav.analytics": "التحليلات",
    "nav.settings": "الإعدادات",

    // Common
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "common.success": "نجح",
    "common.warning": "تحذير",
    "common.info": "معلومات",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.view": "عرض",
    "common.create": "إنشاء",
    "common.update": "تحديث",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.sort": "ترتيب",
    "common.export": "تصدير",
    "common.import": "استيراد",
    "common.print": "طباعة",
    "common.download": "تحميل",
    "common.upload": "رفع",
    "common.yes": "نعم",
    "common.no": "لا",
    "common.confirm": "تأكيد",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.previous": "السابق",
    "common.close": "إغلاق",
    "common.open": "فتح",
    "common.select": "اختيار",
    "common.clear": "مسح",
    "common.reset": "إعادة تعيين",
    "common.apply": "تطبيق",
    "common.submit": "إرسال",
    "common.required": "مطلوب",
    "common.optional": "اختياري",
    "common.all": "الكل",
    "common.none": "لا شيء",
    "common.other": "أخرى",

    // Authentication
    "auth.login": "تسجيل الدخول",
    "auth.logout": "تسجيل الخروج",
    "auth.register": "التسجيل",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.confirmPassword": "تأكيد كلمة المرور",
    "auth.forgotPassword": "نسيت كلمة المرور",
    "auth.resetPassword": "إعادة تعيين كلمة المرور",
    "auth.rememberMe": "تذكرني",
    "auth.loginSuccess": "تم تسجيل الدخول بنجاح",
    "auth.loginError": "فشل تسجيل الدخول",
    "auth.logoutSuccess": "تم تسجيل الخروج بنجاح",
    "auth.invalidCredentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    "auth.passwordMismatch": "كلمات المرور غير متطابقة",
    "auth.weakPassword": "كلمة المرور ضعيفة",
    "auth.emailRequired": "البريد الإلكتروني مطلوب",
    "auth.passwordRequired": "كلمة المرور مطلوبة",

    // Bills
    "bills.title": "الفواتير",
    "bills.create": "إنشاء فاتورة",
    "bills.edit": "تحرير فاتورة",
    "bills.view": "عرض فاتورة",
    "bills.delete": "حذف فاتورة",
    "bills.billNumber": "رقم الفاتورة",
    "bills.customer": "العميل",
    "bills.amount": "المبلغ",
    "bills.status": "الحالة",
    "bills.dueDate": "تاريخ الاستحقاق",
    "bills.createdAt": "تاريخ الإنشاء",
    "bills.updatedAt": "تاريخ التحديث",
    "bills.items": "العناصر",
    "bills.subtotal": "المجموع الفرعي",
    "bills.tax": "الضريبة",
    "bills.discount": "الخصم",
    "bills.total": "المجموع الكلي",
    "bills.notes": "ملاحظات",
    "bills.tags": "العلامات",
    "bills.progress": "التقدم",
    "bills.qrCode": "رمز الاستجابة السريعة",
    "bills.paymentLink": "رابط الدفع",
    "bills.sendNotification": "إرسال الإشعار",
    "bills.markAsPaid": "وضع علامة دفعت",
    "bills.generateQR": "إنشاء رمز الاستجابة السريعة",
    "bills.downloadPDF": "تحميل PDF",
    "bills.printBill": "طباعة الفاتورة",
    "bills.duplicateBill": "نسخ الفاتورة",
    "bills.status.draft": "مسودة",
    "bills.status.sent": "تم الإرسال",
    "bills.status.paid": "تم الدفع",
    "bills.status.overdue": "متأخرة",
    "bills.status.cancelled": "ملغاة",
    "bills.progress.pending": "قيد الانتظار",
    "bills.progress.confirmed": "مؤكدة",
    "bills.progress.tailoring": "التقسيم",
    "bills.progress.packing": "التعبئة",
    "bills.progress.shipped": "تم الشحن",
    "bills.progress.delivered": "تم التوصيل",
    "bills.progress.completed": "مكتملة",
    "bills.createSuccess": "تم إنشاء الفاتورة بنجاح",
    "bills.updateSuccess": "تم تحديث الفاتورة بنجاح",
    "bills.deleteSuccess": "تم حذف الفاتورة بنجاح",
    "bills.deleteConfirm": "هل أنت متأكد من أنك تريد حذف هذه الفاتورة؟",
    "bills.notificationSent": "تم إرسال الإشعار بنجاح",
    "bills.qrGenerated": "تم إنشاء رمز الاستجابة السريعة بنجاح",
    "bills.noBillsFound": "لم يتم العثور على فواتير",
    "bills.searchPlaceholder": "بحث عن فواتير...",

    // Customers
    "customers.title": "العملاء",
    "customers.create": "إنشاء عميل",
    "customers.edit": "تحرير عميل",
    "customers.view": "عرض العميل",
    "customers.delete": "حذف العميل",
    "customers.name": "الاسم",
    "customers.email": "البريد الإلكتروني",
    "customers.phone": "رقم الهاتف",
    "customers.address": "العنوان",
    "customers.totalOrders": "عدد الطلبات الكلي",
    "customers.totalSpent": "المبلغ الكلي",
    "customers.lastOrder": "آخر طلب",
    "customers.preferences": "التفضيلات",
    "customers.language": "اللغة",
    "customers.currency": "العملة",
    "customers.notifications": "الإشعارات",
    "customers.emailNotifications": "إشعارات البريد الإلكتروني",
    "customers.smsNotifications": "إشعارات الرسائل النصية",
    "customers.createSuccess": "تم إنشاء العميل بنجاح",
    "customers.updateSuccess": "تم تحديث العميل بنجاح",
    "customers.deleteSuccess": "تم حذف العميل بنجاح",
    "customers.deleteConfirm": "هل أنت متأكد من أنك تريد حذف هذا العميل؟",
    "customers.noCustomersFound": "لم يتم العثور على عملاء",
    "customers.searchPlaceholder": "بحث عن عملاء...",

    // Products
    "products.title": "المنتجات",
    "products.create": "إنشاء منتج",
    "products.edit": "تحرير منتج",
    "products.view": "عرض منتج",
    "products.delete": "حذف منتج",
    "products.name": "الاسم",
    "products.description": "الوصف",
    "products.category": "التصنيف",
    "products.price": "السعر",
    "products.images": "الصور",
    "products.specifications": "المواصفات",
    "products.customizable": "قابل للخصيص",
    "products.inStock": "في المخزون",
    "products.stockQuantity": "كمية المخزون",
    "products.customizationOptions": "خيارات التخصيص",
    "products.createSuccess": "تم إنشاء المنتج بنجاح",
    "products.updateSuccess": "تم تحديث المنتج بنجاح",
    "products.deleteSuccess": "تم حذف المنتج بنجاح",
    "products.deleteConfirm": "هل أنت متأكد من أنك تريد حذف هذا المنتج؟",
    "products.noProductsFound": "لم يتم العثور على منتجات",
    "products.searchPlaceholder": "بحث عن منتجات...",
    "products.addToCart": "إضافة إلى السلة",
    "products.outOfStock": "إنتهى المخزون",
    "products.customize": "خصيص",

    // Analytics
    "analytics.title": "التحليلات",
    "analytics.revenue": "الدخل",
    "analytics.orders": "الطلبات",
    "analytics.customers": "العملاء",
    "analytics.growth": "النمو",
    "analytics.thisMonth": "هذا الشهر",
    "analytics.lastMonth": "الشهر السابق",
    "analytics.topProducts": "المنتجات الأكثر مبيعًا",
    "analytics.revenueChart": "مخطط الدخل",
    "analytics.ordersChart": "مخطط الطلبات",
    "analytics.customersChart": "مخطط العملاء",
    "analytics.dateRange": "نطاق التاريخ",
    "analytics.last7Days": "7 أيام مضت",
    "analytics.last30Days": "30 يومًا مضت",
    "analytics.last90Days": "90 يومًا مضت",
    "analytics.lastYear": "العام السابق",
    "analytics.custom": "مخصص",
    "analytics.noData": "لا توجد بيانات",
    "analytics.loading": "جاري تحميل التحليلات...",
    "analytics.error": "فشل تحميل التحليلات",

    // Errors
    "errors.generic": "حدث خطأ غير متوقع",
    "errors.network": "خطأ في الشبكة. يرجى التحقق من اتصالك",
    "errors.notFound": "لم يتم العثور على المورد المطلوب",
    "errors.unauthorized": "لا تمتلك الصلاحيات لتنفيذ هذا الإجراء",
    "errors.forbidden": "تم رفض الوصول",
    "errors.validation": "يرجى التحقق من الإدخال وحاول مرة أخرى",
    "errors.serverError": "خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا",
    "errors.timeout": "انتهاء وقت الطلب. يرجى المحاولة مرة أخرى",
    "errors.rateLimited": "طلبات متعددة. يرجى المحاولة مرة أخرى لاحقًا",
    "errors.tryAgain": "حاول مرة أخرى",
    "errors.contactSupport": "اتصل بالدعم الفني",

    // Validation
    "validation.required": "هذا الحقل مطلوب",
    "validation.email": "يرجى إدخال عنوان بريد إلكتروني صالح",
    "validation.phone": "يرجى إدخال رقم هاتف صالح",
    "validation.minLength": "يجب أن يكون على الأقل {min} حرف",
    "validation.maxLength": "يجب أن لا يتجاوز {max} حرف",
    "validation.min": "يجب أن يكون على الأقل {min}",
    "validation.max": "يجب أن لا يتجاوز {max}",
    "validation.pattern": "تنسيق غير صالح",
    "validation.numeric": "يجب أن يكون رقمًا",
    "validation.positive": "يجب أن يكون رقمًا إيجابيًا",
    "validation.integer": "يجب أن يكون رقمًا صحيحًا",
    "validation.url": "يرجى إدخال رابط صالح",
    "validation.date": "يرجى إدخال تاريخ صالح",
    "validation.future": "يجب أن يكون التاريخ في المستقبل",
    "validation.past": "يجب أن يكون التاريخ في الماضي",

    // Notifications
    "notifications.title": "الإشعارات",
    "notifications.markAllRead": "وضع علامة على جميع الإشعارات كمقروءة",
    "notifications.clear": "مسح جميع الإشعارات",
    "notifications.noNotifications": "لا توجد إشعارات",
    "notifications.newBill": "تم إنشاء فاتورة جديدة",
    "notifications.billPaid": "تم استلام دفع الفاتورة",
    "notifications.billOverdue": "الفاتورة متأخرة",
    "notifications.newCustomer": "تم تسجيل عميل جديد",
    "notifications.orderShipped": "تم شحن الطلب",
    "notifications.orderDelivered": "تم تسليم الطلب",

    // Settings
    "settings.title": "الإعدادات",
    "settings.profile": "الملف الشخصي",
    "settings.preferences": "التفضيلات",
    "settings.notifications": "الإشعارات",
    "settings.security": "الأمان",
    "settings.language": "اللغة",
    "settings.theme": "السمة",
    "settings.currency": "العملة",
    "settings.timezone": "المنطقة الزمنية",
    "settings.dateFormat": "تنسيق التاريخ",
    "settings.timeFormat": "تنسيق الوقت",
    "settings.numberFormat": "تنسيق الأرقام",
    "settings.save": "حفظ الإعدادات",
    "settings.saved": "تم حفظ الإعدادات بنجاح",
    "settings.error": "فشل حفظ الإعدادات",

    // Date and Time
    "date.today": "اليوم",
    "date.yesterday": "เมื่وقد",
    "date.tomorrow": "غدا",
    "date.thisWeek": "هذا الأسبوع",
    "date.lastWeek": "الأسبوع السابق",
    "date.thisMonth": "هذا الشهر",
    "date.lastMonth": "الشهر السابق",
    "date.thisYear": "هذا العام",
    "date.lastYear": "العام السابق",
    "date.daysAgo": "{count} أيام مضت",
    "date.hoursAgo": "{count} ساعات مضت",
    "date.minutesAgo": "{count} دقائق مضت",
    "date.justNow": "للحظة",

    // Currency and Numbers
    "currency.symbol": "ر.س",
    "currency.code": "SAR",
    "number.thousand": "ألف",
    "number.million": "مليون",
    "number.billion": "مليار",
    "number.decimal": ".",
    "number.percent": "%",
  },
}

// Internationalization Context
interface I18nContextType {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  t: (key: keyof TranslationKeys, params?: Record<string, string | number>) => string
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (value: number, currency?: string) => string
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string
  formatRelativeTime: (date: Date | string) => string
  dir: "ltr" | "rtl"
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Translation function with parameter interpolation
function translateWithParams(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}

// Number formatting utilities
function createNumberFormatter(locale: SupportedLocale, options?: Intl.NumberFormatOptions) {
  const localeMap = {
    en: "en-US",
    th: "th-TH",
    zh: "zh-CN",
    ar: "ar-SA",
  }

  return new Intl.NumberFormat(localeMap[locale], options)
}

function createDateFormatter(locale: SupportedLocale, options?: Intl.DateTimeFormatOptions) {
  const localeMap = {
    en: "en-US",
    th: "th-TH",
    zh: "zh-CN",
    ar: "ar-SA",
  }

  return new Intl.DateTimeFormat(localeMap[locale], options)
}

// Relative time formatting
function formatRelativeTime(date: Date | string, locale: SupportedLocale): string {
  const now = new Date()
  const targetDate = typeof date === "string" ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  const t = (key: keyof TranslationKeys, params?: Record<string, string | number>) => {
    const template = translations[locale][key]
    return translateWithParams(template, params)
  }

  if (diffInSeconds < 60) {
    return t("date.justNow")
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return t("date.minutesAgo", { count: minutes })
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return t("date.hoursAgo", { count: hours })
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return t("date.daysAgo", { count: days })
  } else {
    // For older dates, use standard date formatting
    return createDateFormatter(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(targetDate)
  }
}

// I18n Provider Component
export function I18nProvider({
  children,
  defaultLocale = "en",
}: {
  children: React.ReactNode
  defaultLocale?: SupportedLocale
}) {
  const [locale, setLocale] = React.useState<SupportedLocale>(defaultLocale)

  React.useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem("locale") as SupportedLocale
    if (savedLocale && SUPPORTED_LOCALES[savedLocale]) {
      setLocale(savedLocale)
    }
  }, [])

  React.useEffect(() => {
    // Save locale to localStorage
    localStorage.setItem("locale", locale)

    // Update document attributes
    document.documentElement.lang = locale
    document.documentElement.dir = SUPPORTED_LOCALES[locale].dir
  }, [locale])

  const t = React.useCallback(
    (key: keyof TranslationKeys, params?: Record<string, string | number>): string => {
      const template = translations[locale][key]
      if (!template) {
        console.warn(`Translation missing for key: ${key} in locale: ${locale}`)
        return key
      }
      return translateWithParams(template, params)
    },
    [locale],
  )

  const formatNumber = React.useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      return createNumberFormatter(locale, options).format(value)
    },
    [locale],
  )

  const formatCurrency = React.useCallback(
    (value: number, currency?: string): string => {
      const currencyCode = currency || translations[locale]["currency.code"]
      return createNumberFormatter(locale, {
        style: "currency",
        currency: currencyCode,
      }).format(value)
    },
    [locale],
  )

  const formatDate = React.useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      const targetDate = typeof date === "string" ? new Date(date) : date
      return createDateFormatter(locale, options).format(targetDate)
    },
    [locale],
  )

  const formatRelativeTimeCallback = React.useCallback(
    (date: Date | string): string => {
      return formatRelativeTime(date, locale)
    },
    [locale],
  )

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime: formatRelativeTimeCallback,
    dir: SUPPORTED_LOCALES[locale].dir,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// Hook to use i18n
export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

// Utility hooks
export function useTranslation() {
  const { t } = useI18n()
  return { t }
}

export function useLocale() {
  const { locale, setLocale } = useI18n()
  return { locale, setLocale }
}

export function useFormatters() {
  const { formatNumber, formatCurrency, formatDate, formatRelativeTime } = useI18n()
  return { formatNumber, formatCurrency, formatDate, formatRelativeTime }
}

// Language Selector Component
export function LanguageSelector({
  className,
}: {
  className?: string
}) {
  const { locale, setLocale } = useI18n()
  const { t } = useTranslation()

  return (
    <Select value={locale} onValueChange={(value: SupportedLocale) => setLocale(value)}>
      <SelectTrigger className={className}>
        <SelectValue>
          <div className="flex items-center gap-2">
            <span>{SUPPORTED_LOCALES[locale].flag}</span>
            <span>{SUPPORTED_LOCALES[locale].name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SUPPORTED_LOCALES).map(([code, info]) => (
          <SelectItem key={code} value={code}>
            <div className="flex items-center gap-2">
              <span>{info.flag}</span>
              <span>{info.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Text direction utilities
export function useTextDirection() {
  const { dir } = useI18n()
  return dir
}

// RTL-aware className utility
export function rtlClass(ltrClass: string, rtlClass: string) {
  const dir = useTextDirection()
  return dir === "rtl" ? rtlClass : ltrClass
}

// Export types and utilities
export type { SupportedLocale, TranslationKeys, I18nContextType }
export { translations }
