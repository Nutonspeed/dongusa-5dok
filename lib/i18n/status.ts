export type OrderStatusString = "pending" | "confirmed" | "production" | "ready" | "shipped" | "delivered" | "cancelled"

export type OrderChannelString = "facebook" | "line" | "tiktok" | "lazada" | "shopee" | "walkin" | "other"

export const statusLabelTH: Record<OrderStatusString, string> = {
  pending: "รอดำเนินการ",
  confirmed: "ยืนยันแล้ว",
  production: "กำลังผลิต",
  ready: "พร้อมจัดส่ง",
  shipped: "จัดส่งแล้ว",
  delivered: "ส่งมอบแล้ว",
  cancelled: "ยกเลิก",
}

export const channelLabelTH: Record<OrderChannelString, string> = {
  facebook: "Facebook",
  line: "LINE",
  tiktok: "TikTok",
  lazada: "Lazada",
  shopee: "Shopee",
  walkin: "หน้าร้าน",
  other: "อื่น ๆ",
}

export type PaymentStatusString = "pending" | "paid" | "refunded"
export const paymentStatusLabelTH: Record<PaymentStatusString, string> = {
  pending: "รอชำระเงิน",
  paid: "ชำระเงินแล้ว",
  refunded: "คืนเงินแล้ว",
}

export type ProductStatusString = "active" | "draft" | "low_stock" | "out_of_stock"
export const productStatusLabelTH: Record<ProductStatusString, string> = {
  active: "เปิดขาย",
  draft: "แบบร่าง",
  low_stock: "สต็อกต่ำ",
  out_of_stock: "หมด",
}

export type UrgencyString = "normal" | "urgent" | "express"
export const urgencyLabelTH: Record<UrgencyString, string> = {
  normal: "ปกติ (7-14 วัน)",
  urgent: "เร่งด่วน (3-7 วัน)",
  express: "ด่วนพิเศษ (1-3 วัน)",
}

export type PaymentMethodString =
  | "bank_transfer"
  | "promptpay"
  | "cod"
  | "credit_card"
export const paymentMethodLabelTH: Record<PaymentMethodString, string> = {
  bank_transfer: "โอนเงินผ่านธนาคาร",
  promptpay: "พร้อมเพย์",
  cod: "เก็บเงินปลายทาง",
  credit_card: "บัตรเครดิต/เดบิต",
}

// fallback helpers (กันกรณีสตริงนอก enum)
export function toStatusLabelTH(v?: string) {
  const key = (v || "pending").toLowerCase() as OrderStatusString
  return statusLabelTH[key] ?? "รอดำเนินการ"
}

export function toChannelLabelTH(v?: string) {
  const key = (v || "other").toLowerCase() as OrderChannelString
  return channelLabelTH[key] ?? "อื่น ๆ"
}

// UI variant helper
export function statusBadgeVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
  const s = (status || "").toLowerCase()
  if (s === "pending") return "outline"
  if (s === "confirmed" || s === "production" || s === "ready") return "secondary"
  if (s === "shipped" || s === "delivered") return "default"
  if (s === "cancelled") return "destructive"
  return "default"
}
