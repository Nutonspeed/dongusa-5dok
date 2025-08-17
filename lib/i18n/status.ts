export enum OrderStatus {
  PENDING = "PENDING",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  IN_PRODUCTION = "IN_PRODUCTION",
  READY_TO_SHIP = "READY_TO_SHIP",
  SHIPPED = "SHIPPED",
  DONE = "DONE",
  CANCELLED = "CANCELLED",
}

export const statusLabelTH: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "รอดำเนินการ",
  [OrderStatus.PENDING_PAYMENT]: "รอชำระเงิน",
  [OrderStatus.PAID]: "ชำระแล้ว",
  [OrderStatus.IN_PRODUCTION]: "กำลังผลิต",
  [OrderStatus.READY_TO_SHIP]: "พร้อมส่ง",
  [OrderStatus.SHIPPED]: "จัดส่งแล้ว",
  [OrderStatus.DONE]: "เสร็จสิ้น",
  [OrderStatus.CANCELLED]: "ยกเลิก",
}

export type OrderChannelString =
  | "facebook"
  | "line"
  | "tiktok"
  | "lazada"
  | "shopee"
  | "walkin"
  | "other"

export const channelLabelTH: Record<OrderChannelString, string> = {
  facebook: "Facebook",
  line: "LINE",
  tiktok: "TikTok",
  lazada: "Lazada",
  shopee: "Shopee",
  walkin: "หน้าร้าน",
  other: "อื่น ๆ",
}

export function toStatusLabelTH(v?: string) {
  const key = (v || OrderStatus.PENDING).toUpperCase() as OrderStatus
  return statusLabelTH[key] ?? statusLabelTH[OrderStatus.PENDING]
}

export function toChannelLabelTH(v?: string) {
  const key = (v || "other").toLowerCase() as OrderChannelString
  return channelLabelTH[key] ?? channelLabelTH.other
}

export function statusBadgeVariant(
  status?: string,
): "default" | "secondary" | "destructive" | "outline" {
  const s = (status || "").toUpperCase()
  if (s === OrderStatus.PENDING || s === OrderStatus.PENDING_PAYMENT) return "outline"
  if (
    s === OrderStatus.PAID ||
    s === OrderStatus.IN_PRODUCTION ||
    s === OrderStatus.READY_TO_SHIP
  )
    return "secondary"
  if (s === OrderStatus.SHIPPED || s === OrderStatus.DONE) return "default"
  if (s === OrderStatus.CANCELLED) return "destructive"
  return "default"
}
