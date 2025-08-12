"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Package, Truck, Home, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const { user } = useAuth()
  const [order, setOrder] = useState<any>(null)

  const orderId = searchParams.get("orderId")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (!orderId) {
      router.push("/")
      return
    }

    // Load order from localStorage
    const orders = JSON.parse(localStorage.getItem("user_orders") || "[]")
    const foundOrder = orders.find((o: any) => o.id === orderId)

    if (foundOrder) {
      setOrder(foundOrder)
    } else {
      router.push("/")
    }
  }, [orderId, router, user])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === "th" ? "สั่งซื้อสำเร็จ!" : "Order Successful!"}
          </h1>
          <p className="text-gray-600">
            {language === "th"
              ? "ขอบคุณสำหรับการสั่งซื้อ เราจะดำเนินการจัดส่งสินค้าให้คุณโดยเร็วที่สุด"
              : "Thank you for your order. We'll process and ship your items as soon as possible."}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    {language === "th" ? "รายละเอียดคำสั่งซื้อ" : "Order Details"}
                  </span>
                  <Badge className="bg-green-100 text-green-800">{language === "th" ? "ยืนยันแล้ว" : "Confirmed"}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{language === "th" ? "หมายเลขคำสั่งซื้อ:" : "Order Number:"}</span>
                    <p className="font-medium">{order.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{language === "th" ? "วันที่สั่งซื้อ:" : "Order Date:"}</span>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{language === "th" ? "ยอดรวม:" : "Total Amount:"}</span>
                    <p className="font-medium text-primary">{formatPrice(order.totalPrice)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{language === "th" ? "วิธีการชำระเงิน:" : "Payment Method:"}</span>
                    <p className="font-medium">
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
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "th" ? "สินค้าที่สั่งซื้อ" : "Ordered Items"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color}`}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg?height=64&width=64&text=Product"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        {(item.size || item.color) && (
                          <div className="flex gap-2 text-sm text-gray-600 mt-1">
                            {item.size && (
                              <span>
                                {language === "th" ? "ขนาด:" : "Size:"} {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span>
                                {language === "th" ? "สี:" : "Color:"} {item.color}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          {language === "th" ? "จำนวน:" : "Quantity:"} {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  {language === "th" ? "ข้อมูลการจัดส่ง" : "Shipping Information"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">
                    {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                  </p>
                  <p className="text-gray-600">{order.shippingInfo.phone}</p>
                  <p className="text-gray-600">{order.shippingInfo.email}</p>
                  <p className="text-gray-600">
                    {order.shippingInfo.address}, {order.shippingInfo.city} {order.shippingInfo.postalCode}
                  </p>
                  {order.shippingInfo.notes && (
                    <p className="text-gray-600 mt-2">
                      <span className="font-medium">{language === "th" ? "หมายเหตุ:" : "Notes:"}</span>{" "}
                      {order.shippingInfo.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === "th" ? "ขั้นตอนถัดไป" : "What's Next?"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">{language === "th" ? "ยืนยันคำสั่งซื้อ" : "Order Confirmation"}</p>
                      <p className="text-gray-600">{language === "th" ? "เสร็จสิ้นแล้ว" : "Completed"}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium">{language === "th" ? "เตรียมสินค้า" : "Preparing Items"}</p>
                      <p className="text-gray-600">{language === "th" ? "1-2 วันทำการ" : "1-2 business days"}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium">{language === "th" ? "จัดส่งสินค้า" : "Shipping"}</p>
                      <p className="text-gray-600">{language === "th" ? "2-5 วันทำการ" : "2-5 business days"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{language === "th" ? "การดำเนินการ" : "Actions"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/orders">
                    <Package className="w-4 h-4 mr-2" />
                    {language === "th" ? "ดูคำสั่งซื้อทั้งหมด" : "View All Orders"}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => window.print()}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {language === "th" ? "พิมพ์ใบเสร็จ" : "Print Receipt"}
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/products">
                    <Home className="w-4 h-4 mr-2" />
                    {language === "th" ? "ช้อปต่อ" : "Continue Shopping"}
                  </a>
                </Button>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-gray-600 p-4 bg-accent rounded-lg">
              <p className="mb-2">{language === "th" ? "ต้องการความช่วยเหลือ?" : "Need Help?"}</p>
              <Button variant="link" className="text-primary p-0 h-auto" asChild>
                <a href="/contact">{language === "th" ? "ติดต่อเรา" : "Contact Us"}</a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
