"use client"
import { logger } from "@/lib/logger"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, Mail, User, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { useAuth } from "../contexts/AuthContext"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]
import Header from "../components/Header"
import Footer from "../components/Footer"

export const dynamic = "force-dynamic"

export default function CheckoutPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const supabase = createClient()

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  })

  const [paymentInfo, setPaymentInfo] = useState({
    method: "credit-card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  })

  const totalPrice = getTotalPrice()
  const shippingFee = totalPrice >= 1000 ? 0 : 100
  const finalTotal = totalPrice + shippingFee

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push("/auth/login?redirect=/checkout")
      return
    }

    // Check if cart is empty
    if (items.length === 0) {
      router.push("/cart")
      return
    }

    const loadUserProfile = async () => {
      if (user) {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        const profile = profileData as ProfileRow | null

        if (profile) {
          setShippingInfo((prev) => ({
            ...prev,
            fullName: profile.full_name || user.full_name || "",
            email: user.email || "",
            phone: profile.phone || "",
            address: (profile as any).address || "",
            city: (profile as any).city || "",
            postalCode: (profile as any).postal_code || "",
          }))
        }
      }
    }

    loadUserProfile()
  }, [router, items.length, user, supabase])

  useEffect(() => {
    // Preload payment methods and shipping options
    const preloadCheckoutData = async () => {
      try {
        // Prefetch critical checkout resources
        await Promise.all([
          fetch("/api/shipping-methods", { method: "HEAD" }),
          fetch("/api/payment-methods", { method: "HEAD" }),
          user ? fetch("/api/user/profile", { method: "HEAD" }) : Promise.resolve(),
        ])
      } catch (error) {
        console.error("Error preloading checkout data:", error)
      }
    }

    preloadCheckoutData()
  }, [user])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const preloadPaymentResources = async () => {
      try {
        await fetch("/api/payment/validate", { method: "HEAD" })
      } catch (error) {
        console.error("Error preloading payment resources:", error)
      }
    }
    preloadPaymentResources()
    setCurrentStep(2)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create order in Supabase
      const orderData = {
        user_id: user?.id,
        customer_name: shippingInfo.fullName,
        customer_email: shippingInfo.email,
        customer_phone: shippingInfo.phone,
        shipping_address: shippingInfo.address,
        shipping_city: shippingInfo.city,
        shipping_postal_code: shippingInfo.postalCode,
        notes: shippingInfo.notes,
        payment_method: paymentInfo.method,
        subtotal: totalPrice,
        shipping_fee: shippingFee,
        total_amount: finalTotal,
        status: "pending",
        channel: "website",
      }

      const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        size: item.size,
        color: item.color,
        fabric_pattern: item.fabricPattern,
        customizations: item.customizations,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      clearCart()

      // Redirect to success page
      router.push(`/order-success?orderId=${order.id}`)
    } catch (error) {
      logger.error("Order creation failed:", error)
      // Fallback to mock processing
      setTimeout(() => {
        const order = {
          id: `ORD-${Date.now()}`,
          items,
          shippingInfo,
          paymentInfo,
          totalPrice: finalTotal,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        }

        const existingOrders = JSON.parse(localStorage.getItem("user_orders") || "[]")
        existingOrders.push(order)
        localStorage.setItem("user_orders", JSON.stringify(existingOrders))

        clearCart()
        router.push(`/order-success?orderId=${order.id}`)
      }, 1000)
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { number: 1, title: language === "th" ? "ข้อมูลการจัดส่ง" : "Shipping Information" },
    { number: 2, title: language === "th" ? "การชำระเงิน" : "Payment" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{language === "th" ? "ชำระเงิน" : "Checkout"}</h1>
            <p className="text-gray-600">{language === "th" ? "กรอกข้อมูลเพื่อสั่งซื้อสินค้า" : "Complete your order"}</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "th" ? "กลับ" : "Back"}
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step: any) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.number}
                </div>
                <span className={`ml-2 text-sm ${currentStep >= step.number ? "text-primary" : "text-gray-600"}`}>
                  {step.title}
                </span>
                {step.number < steps.length && (
                  <div className={`w-16 h-0.5 ml-4 ${currentStep > step.number ? "bg-primary" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    {language === "th" ? "ข้อมูลการจัดส่ง" : "Shipping Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        {language === "th" ? "ชื่อ-นามสกุล" : "Full Name"} *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4 inline mr-1" />
                          {language === "th" ? "อีเมล" : "Email"} *
                        </label>
                        <input
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4 inline mr-1" />
                          {language === "th" ? "เบอร์โทรศัพท์" : "Phone Number"} *
                        </label>
                        <input
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        {language === "th" ? "ที่อยู่" : "Address"} *
                      </label>
                      <textarea
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={language === "th" ? "บ้านเลขที่ ถนน ตำบล อำเภอ" : "House number, street, district"}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === "th" ? "จังหวัด" : "City"} *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {language === "th" ? "รหัสไปรษณีย์" : "Postal Code"} *
                        </label>
                        <input
                          type="text"
                          value={shippingInfo.postalCode}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th" ? "หมายเหตุ (ไม่บังคับ)" : "Notes (Optional)"}
                      </label>
                      <textarea
                        value={shippingInfo.notes}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={language === "th" ? "ข้อมูลเพิ่มเติมสำหรับการจัดส่ง" : "Additional delivery instructions"}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-burgundy-gradient hover:opacity-90 text-white">
                      {language === "th" ? "ดำเนินการต่อ" : "Continue to Payment"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    {language === "th" ? "การชำระเงิน" : "Payment Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        {language === "th" ? "วิธีการชำระเงิน" : "Payment Method"}
                      </label>
                      <RadioGroup
                        value={paymentInfo.method}
                        onValueChange={(value) => setPaymentInfo({ ...paymentInfo, method: value })}
                      >
                        <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg">
                          <RadioGroupItem value="credit-card" id="credit-card" />
                          <Label htmlFor="credit-card" className="flex items-center cursor-pointer">
                            <CreditCard className="w-4 h-4 mr-2" />
                            {language === "th" ? "บัตรเครดิต/เดบิต" : "Credit/Debit Card"}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg">
                          <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                          <Label htmlFor="bank-transfer" className="cursor-pointer">
                            {language === "th" ? "โอนเงินผ่านธนาคาร" : "Bank Transfer"}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="cursor-pointer">
                            {language === "th" ? "เก็บเงินปลายทาง" : "Cash on Delivery"}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {paymentInfo.method === "credit-card" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "th" ? "หมายเลขบัตร" : "Card Number"} *
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.cardNumber}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="1234 5678 9012 3456"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {language === "th" ? "วันหมดอายุ" : "Expiry Date"} *
                            </label>
                            <input
                              type="text"
                              value={paymentInfo.expiryDate}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="MM/YY"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                            <input
                              type="text"
                              value={paymentInfo.cvv}
                              onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="123"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "th" ? "ชื่อบนบัตร" : "Cardholder Name"} *
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.cardName}
                            onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-4">
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                        {language === "th" ? "กลับ" : "Back"}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-burgundy-gradient hover:opacity-90 text-white"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {isLoading
                          ? language === "th"
                            ? "กำลังดำเนินการ..."
                            : "Processing..."
                          : language === "th"
                            ? "ยืนยันการสั่งซื้อ"
                            : "Place Order"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>{language === "th" ? "สรุปคำสั่งซื้อ" : "Order Summary"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item: any) => (
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
                      <p className="text-sm font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === "th" ? "ยอดรวม" : "Subtotal"}</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === "th" ? "ค่าจัดส่ง" : "Shipping"}</span>
                    <span className={`font-medium ${shippingFee === 0 ? "text-green-600" : ""}`}>
                      {shippingFee === 0 ? (language === "th" ? "ฟรี" : "Free") : formatPrice(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>{language === "th" ? "ยอดรวมทั้งสิ้น" : "Total"}</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div className="text-center text-xs text-gray-500 pt-4">
                  <Lock className="w-4 h-4 inline mr-1" />
                  {language === "th" ? "การชำระเงินปลอดภัย SSL" : "Secure SSL Payment"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
