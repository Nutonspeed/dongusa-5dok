"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, Eye, Truck, Clock, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"
import Header from "../components/Header"
import Footer from "../components/Footer"

export const dynamic = "force-dynamic"

export default function OrdersPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("user_token")
    if (!token) {
      router.push("/login?redirect=/orders")
      return
    }

    // Load orders from localStorage
    const userOrders = JSON.parse(localStorage.getItem("user_orders") || "[]")
    setOrders(userOrders.reverse()) // Show newest first
    setIsLoading(false)
  }, [router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          label: language === "th" ? "ยืนยันแล้ว" : "Confirmed",
          color: "bg-blue-100 text-blue-800",
          icon: Clock,
        }
      case "preparing":
        return {
          label: language === "th" ? "กำลังเตรียม" : "Preparing",
          color: "bg-yellow-100 text-yellow-800",
          icon: Package,
        }
      case "shipped":
        return {
          label: language === "th" ? "จัดส่งแล้ว" : "Shipped",
          color: "bg-purple-100 text-purple-800",
          icon: Truck,
        }
      case "delivered":
        return {
          label: language === "th" ? "จัดส่งสำเร็จ" : "Delivered",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
        }
      case "cancelled":
        return {
          label: language === "th" ? "ยกเลิก" : "Cancelled",
          color: "bg-red-100 text-red-800",
          icon: X,
        }
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-800",
          icon: Package,
        }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{language === "th" ? "กำลังโหลด..." : "Loading..."}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{language === "th" ? "คำสั่งซื้อของฉัน" : "My Orders"}</h1>
          <p className="text-gray-600 mt-2">
            {language === "th" ? "ติดตามสถานะคำสั่งซื้อและประวัติการสั่งซื้อ" : "Track your orders and purchase history"}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-8xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "th" ? "ยังไม่มีคำสั่งซื้อ" : "No Orders Yet"}
            </h2>
            <p className="text-gray-600 mb-8">
              {language === "th" ? "เริ่มช้อปปิ้งและสั่งซื้อสินค้าแรกของคุณ" : "Start shopping and place your first order"}
            </p>
            <Button
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
              asChild
            >
              <a href="/products">
                <Package className="w-5 h-5 mr-2" />
                {language === "th" ? "เริ่มช้อปปิ้ง" : "Start Shopping"}
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              const StatusIcon = statusInfo.icon

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.id}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {language === "th" ? "สั่งซื้อเมื่อ" : "Ordered on"} {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <p className="text-lg font-bold text-pink-600 mt-1">{formatPrice(order.totalPrice)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Items */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          {language === "th" ? "สินค้า" : "Items"} ({order.items.length})
                        </h4>
                        <div className="space-y-2">
                          {order.items.slice(0, 2).map((item: any) => (
                            <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={item.image || "/placeholder.svg?height=48&width=48&text=Product"}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  {language === "th" ? "จำนวน:" : "Qty:"} {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-gray-500">
                              {language === "th" ? "และอีก" : "and"} {order.items.length - 2}{" "}
                              {language === "th" ? "รายการ" : "more items"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          {language === "th" ? "ข้อมูลการจัดส่ง" : "Shipping Info"}
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                          </p>
                          <p>{order.shippingInfo.phone}</p>
                          <p className="truncate">
                            {order.shippingInfo.address}, {order.shippingInfo.city}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        {language === "th" ? "วิธีการชำระเงิน:" : "Payment:"}{" "}
                        {order.paymentInfo.method === "credit-card"
                          ? language === "th"
                            ? "บัตรเครดิต"
                            : "Credit Card"
                          : order.paymentInfo.method === "bank-transfer"
                            ? language === "th"
                              ? "โอนเงินผ่านธนาคาร"
                              : "Bank Transfer"
                            : language === "th"
                              ? "เก็บเงินปลายทาง"
                              : "Cash on Delivery"}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/order-success?orderId=${order.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          {language === "th" ? "ดูรายละเอียด" : "View Details"}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
