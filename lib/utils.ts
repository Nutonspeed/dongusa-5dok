import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "THB"): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("th-TH").format(num)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} วินาทีที่แล้ว`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} นาทีที่แล้ว`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ชั่วโมงที่แล้ว`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} วันที่แล้ว`
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function generateQRCode(billId: string, amount: number): string {
  // In a real application, this would generate an actual QR code
  // For demo purposes, we'll return a placeholder
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="20" y="20" width="160" height="160" fill="black"/>
      <rect x="40" y="40" width="120" height="120" fill="white"/>
      <text x="100" y="105" text-anchor="middle" font-size="12" fill="black">
        Bill: ${billId}
      </text>
      <text x="100" y="125" text-anchor="middle" font-size="10" fill="black">
        Amount: ฿${amount}
      </text>
    </svg>
  `)}`
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+66|0)[0-9]{8,9}$/
  return phoneRegex.test(phone.replace(/[-\s]/g, ""))
}

export function calculateDaysUntilDue(dueDate: Date): number {
  const now = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getBillStatusColor(status: string): string {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200"
    case "sent":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "partially_paid":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200"
    case "cancelled":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "draft":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function calculateTax(amount: number, taxRate = 7): number {
  return (amount * taxRate) / 100
}

export function calculateDiscount(amount: number, discountRate: number): number {
  return (amount * discountRate) / 100
}

export function isOverdue(dueDate: Date): boolean {
  return new Date() > new Date(dueDate)
}

export function getProgressPercentage(progress: any[]): number {
  const totalSteps = 7 // pending, confirmed, tailoring, packing, shipped, delivered, completed
  const currentStep = progress.length
  return Math.min((currentStep / totalSteps) * 100, 100)
}
