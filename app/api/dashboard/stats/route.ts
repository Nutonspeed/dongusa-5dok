import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Loading dashboard statistics...")

    // Mock dashboard statistics
    const stats = {
      timestamp: new Date().toISOString(),
      sales: {
        today: {
          amount: 45230,
          currency: "THB",
          change: 12.5,
          orders: 23,
        },
        thisMonth: {
          amount: 1250000,
          currency: "THB",
          change: 8.3,
          orders: 456,
        },
      },
      customers: {
        total: 1247,
        new: 12,
        active: 89,
        change: -2.1,
      },
      products: {
        total: 156,
        inStock: 142,
        lowStock: 8,
        outOfStock: 6,
      },
      orders: {
        pending: 15,
        processing: 8,
        shipped: 12,
        completed: 234,
        cancelled: 3,
      },
      topProducts: [
        {
          id: "prod-001",
          name: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
          sales: 45,
          revenue: 130050,
          trend: "up",
        },
        {
          id: "prod-002",
          name: "ผ้าคลุมโซฟากันน้ำ",
          sales: 38,
          revenue: 74100,
          trend: "up",
        },
        {
          id: "prod-003",
          name: "หมอนอิงลายเดียวกัน",
          sales: 67,
          revenue: 23450,
          trend: "down",
        },
        {
          id: "prod-004",
          name: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
          sales: 12,
          revenue: 50400,
          trend: "up",
        },
      ],
      recentOrders: [
        {
          id: "ORD-001",
          customer: "คุณสมชาย ใจดี",
          product: "ผ้าคลุมโซฟากำมะหยี่พรีเมียม",
          amount: 2890,
          status: "pending",
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
        {
          id: "ORD-002",
          customer: "คุณสมหญิง รักสวย",
          product: "ผ้าคลุมโซฟากันน้ำ + หมอนอิง",
          amount: 1950,
          status: "processing",
          createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        },
        {
          id: "ORD-003",
          customer: "คุณสมศักดิ์ มีเงิน",
          product: "ผ้าคลุมโซฟาเซ็กชั่นแนล",
          amount: 4200,
          status: "shipped",
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
      ],
      activities: [
        {
          type: "order",
          message: "คำสั่งซื้อใหม่ #ORD-001 จากคุณสมชาย",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          type: "review",
          message: "รีวิว 5 ดาวจากคุณสมหญิง",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          type: "inquiry",
          message: "คำถามใหม่เกี่ยวกับผ้าคลุมโซฟาลินิน",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          type: "stock",
          message: "สินค้า 'คลิปยึดผ้า' ใกล้หมด (เหลือ 5 ชิ้น)",
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
      ],
    }

    console.log("✅ Dashboard statistics loaded successfully")

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("❌ Error loading dashboard statistics:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load dashboard statistics",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return NextResponse.json({ message: "Dashboard stats endpoint - use GET method" }, { status: 405 })
}
