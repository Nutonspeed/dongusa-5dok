import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting
export function formatCurrency(amount: number, currency = "THB"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(amount)
}

// Number formatting
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}

// Date formatting
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Status color helpers
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
    default:
      return "bg-purple-100 text-purple-800 border-purple-200"
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800"
    case "high":
      return "bg-orange-100 text-orange-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Progress stage helpers
export function getProgressStageColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "pending":
      return "bg-gray-100 text-gray-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Text truncation
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-$$$$]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
}

// Search helpers
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text

  const regex = new RegExp(`(${searchTerm})`, "gi")
  return text.replace(regex, "<mark>$1</mark>")
}

// Array helpers
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    },
    {} as Record<string, T[]>,
  )
}

export function sortBy<T>(array: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal < bVal) return direction === "asc" ? -1 : 1
    if (aVal > bVal) return direction === "asc" ? 1 : -1
    return 0
  })
}

// Color generation for charts
export function generateColors(count: number): string[] {
  const colors = [
    "#EC4899", // Pink
    "#8B5CF6", // Purple
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#3B82F6", // Blue
    "#F97316", // Orange
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#A855F7", // Violet
  ]

  const result = []
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length])
  }

  return result
}

// QR Code generation helper
export function generateQRCodeData(billId: string, amount: number): string {
  // This would typically generate a payment QR code
  // For now, return a simple data string
  return `BILL:${billId}:AMOUNT:${amount}`
}

// Export helpers
export function downloadAsCSV(data: any[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          return typeof value === "string" && value.includes(",") ? `"${value}"` : value
        })
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

// Local storage helpers
export function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error("Failed to load from localStorage:", error)
    return defaultValue
  }
}

// Performance monitoring
export function measurePerformance<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
  const start = performance.now()
  const result = fn()

  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now()
      console.log(`${name} took ${end - start} milliseconds`)
    })
  } else {
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
    return result
  }
}

// Time ago formatting
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? "s" : ""} ago`
  } else {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} month${months > 1 ? "s" : ""} ago`
  }
}

// Calculate days until due date
export function calculateDaysUntilDue(dueDate: Date | string): number {
  const now = new Date()
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate
  const diffTime = due.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Generate QR Code (mock implementation)
export function generateQRCode(billId: string, amount: number): string {
  // In a real application, this would generate an actual QR code
  // For demo purposes, we'll return a placeholder SVG
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white" stroke="black" stroke-width="2"/>
      <rect x="20" y="20" width="160" height="160" fill="black"/>
      <rect x="40" y="40" width="120" height="120" fill="white"/>
      <text x="100" y="105" text-anchor="middle" font-size="12" fill="black">
        Bill: ${billId}
      </text>
      <text x="100" y="125" text-anchor="middle" font-size="10" fill="black">
        Amount: ${formatCurrency(amount)}
      </text>
    </svg>
  `)}`
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Calculate progress percentage for order tracking
export function getProgressPercentage(progress: any[]): number {
  if (!progress || progress.length === 0) return 0

  const totalSteps = 7 // pending, confirmed, tailoring, packing, shipped, delivered, completed
  const currentStep = progress.length
  return Math.min((currentStep / totalSteps) * 100, 100)
}
