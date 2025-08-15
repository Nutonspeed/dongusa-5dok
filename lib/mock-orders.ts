import { OrderStatus } from "./i18n/status"

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  channel: OrderChannel
  notes: string
  createdAt: Date
  updatedAt: Date
  shippingInfo?: ShippingInfo
  timeline: OrderTimeline[]
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  fabricPattern: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customizations?: string
}

export interface ShippingInfo {
  provider: string
  trackingNumber?: string
  shippingCost: number
  estimatedDelivery?: Date
  actualDelivery?: Date
}

export interface OrderTimeline {
  id: string
  status: OrderStatus
  timestamp: Date
  notes?: string
  updatedBy: string
}

export enum OrderChannel {
  WEBSITE = "WEBSITE",
  FACEBOOK = "FACEBOOK",
  LINE = "LINE",
  PHONE = "PHONE",
  WALK_IN = "WALK_IN",
}

export const channelLabelTH: Record<OrderChannel, string> = {
  [OrderChannel.WEBSITE]: "เว็บไซต์",
  [OrderChannel.FACEBOOK]: "Facebook",
  [OrderChannel.LINE]: "LINE",
  [OrderChannel.PHONE]: "โทรศัพท์",
  [OrderChannel.WALK_IN]: "หน้าร้าน",
}

// Mock data
export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerId: "CUST-001",
    customerName: "สมชาย ใจดี",
    customerPhone: "081-234-5678",
    customerAddress: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    items: [
      {
        id: "ITEM-001",
        productId: "PROD-001",
        productName: "ผ้าคลุมโซฟา 3 ที่นั่ง",
        fabricPattern: "ลายดอกไม้สีฟ้า",
        quantity: 1,
        unitPrice: 2500,
        totalPrice: 2500,
        customizations: "เพิ่มกระเป๋าข้าง",
      },
    ],
    totalAmount: 2500,
    status: OrderStatus.PAID,
    channel: OrderChannel.WEBSITE,
    notes: "ลูกค้าต้องการรับเร็ว",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-16"),
    shippingInfo: {
      provider: "Kerry Express",
      shippingCost: 50,
      estimatedDelivery: new Date("2024-01-20"),
    },
    timeline: [
      {
        id: "TL-001",
        status: OrderStatus.PENDING,
        timestamp: new Date("2024-01-15T10:00:00"),
        notes: "รับออร์เดอร์",
        updatedBy: "admin",
      },
      {
        id: "TL-002",
        status: OrderStatus.PAID,
        timestamp: new Date("2024-01-16T14:30:00"),
        notes: "ลูกค้าโอนเงินแล้ว",
        updatedBy: "admin",
      },
    ],
  },
  {
    id: "ORD-002",
    customerId: "CUST-002",
    customerName: "สมหญิง รักสวย",
    customerPhone: "082-345-6789",
    customerAddress: "456 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900",
    items: [
      {
        id: "ITEM-002",
        productId: "PROD-002",
        productName: "ผ้าคลุมโซฟา L-Shape",
        fabricPattern: "ลายทางสีเทา",
        quantity: 1,
        unitPrice: 3500,
        totalPrice: 3500,
      },
    ],
    totalAmount: 3500,
    status: OrderStatus.IN_PRODUCTION,
    channel: OrderChannel.FACEBOOK,
    notes: "",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-17"),
    timeline: [
      {
        id: "TL-003",
        status: OrderStatus.PENDING,
        timestamp: new Date("2024-01-14T09:15:00"),
        notes: "รับออร์เดอร์จาก Facebook",
        updatedBy: "admin",
      },
      {
        id: "TL-004",
        status: OrderStatus.PAID,
        timestamp: new Date("2024-01-15T11:00:00"),
        notes: "ชำระผ่านพร้อมเพย์",
        updatedBy: "admin",
      },
      {
        id: "TL-005",
        status: OrderStatus.IN_PRODUCTION,
        timestamp: new Date("2024-01-17T08:00:00"),
        notes: "เริ่มตัดผ้า",
        updatedBy: "production",
      },
    ],
  },
]

// Mock functions
export const getOrders = async (filters?: {
  status?: OrderStatus
  channel?: OrderChannel
  dateFrom?: Date
  dateTo?: Date
  search?: string
}): Promise<Order[]> => {
  let filteredOrders = [...mockOrders]

  if (filters?.status) {
    filteredOrders = filteredOrders.filter((order) => order.status === filters.status)
  }

  if (filters?.channel) {
    filteredOrders = filteredOrders.filter((order) => order.channel === filters.channel)
  }

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.customerPhone.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm),
    )
  }

  if (filters?.dateFrom) {
    filteredOrders = filteredOrders.filter((order) => order.createdAt >= filters.dateFrom!)
  }

  if (filters?.dateTo) {
    filteredOrders = filteredOrders.filter((order) => order.createdAt <= filters.dateTo!)
  }

  return filteredOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export const getOrderById = async (id: string): Promise<Order | null> => {
  return mockOrders.find((order) => order.id === id) || null
}

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  notes?: string,
): Promise<Order | null> => {
  const order = mockOrders.find((o) => o.id === orderId)
  if (!order) return null

  order.status = status
  order.updatedAt = new Date()

  order.timeline.push({
    id: `TL-${Date.now()}`,
    status,
    timestamp: new Date(),
    notes,
    updatedBy: "admin",
  })

  return order
}

export const createOrder = async (
  orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "timeline">,
): Promise<Order> => {
  const newOrder: Order = {
    ...orderData,
    id: `ORD-${String(mockOrders.length + 1).padStart(3, "0")}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    timeline: [
      {
        id: `TL-${Date.now()}`,
        status: orderData.status,
        timestamp: new Date(),
        notes: "สร้างออร์เดอร์",
        updatedBy: "admin",
      },
    ],
  }

  mockOrders.push(newOrder)
  return newOrder
}
