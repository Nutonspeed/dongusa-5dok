"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import Header from "../components/Header"
import Footer from "../components/Footer"

export const dynamic = "force-dynamic"

export default function CartPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const totalPrice = getTotalPrice()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const handleApplyPromo = () => {
    // Mock promo code logic
    if (promoCode.toLowerCase() === "save10") {
      setDiscount(totalPrice * 0.1)
    } else if (promoCode.toLowerCase() === "welcome") {
      setDiscount(200)
    } else {
      setDiscount(0)
    }
  }

  const shippingFee = totalPrice >= 1000 ? 0 : 100
  const finalTotal = totalPrice - discount + shippingFee

  const handleCheckout = () => {
    const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("user_token")
    if (!isLoggedIn) {
      router.push("/login?redirect=/checkout")
    } else {
      router.push("/checkout")
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-gray-400 text-8xl mb-6">🛒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "th" ? "ตะกร้าสินค้าว่าง" : "Your cart is empty"}
            </h1>
            <p className="text-gray-600 mb-8">
              {language === "th" ? "เริ่มช้อปปิ้งและเพิ่มสินค้าลงในตะกร้า" : "Start shopping and add items to your cart"}
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white">
                <ShoppingBag className="w-5 h-5 mr-2" />
                {language === "th" ? "เริ่มช้อปปิ้ง" : "Start Shopping"}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{language === "th" ? "ตะกร้าสินค้า" : "Shopping Cart"}</h1>
            <p className="text-gray-600">{language === "th" ? `${items.length} รายการ` : `${items.length} items`}</p>
          </div>
          <Link href="/products">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "th" ? "ช้อปต่อ" : "Continue Shopping"}
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.id}-${item.size}-${item.color}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg?height=96&width=96&text=Product"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                      {(item.size || item.color) && (
                        <div className="flex gap-2 text-sm text-gray-600">
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
                      <p className="text-pink-600 font-bold">{formatPrice(item.price)}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(`${item.id}-${item.size}-${item.color}`, item.quantity - 1)}
                            className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(`${item.id}-${item.size}-${item.color}`, item.quantity + 1)}
                            className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(`${item.id}-${item.size}-${item.color}`)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart */}
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {language === "th" ? "ล้างตะกร้า" : "Clear Cart"}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">{language === "th" ? "สรุปคำสั่งซื้อ" : "Order Summary"}</h2>

                {/* Promo Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {language === "th" ? "รหัสส่วนลด" : "Promo Code"}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={language === "th" ? "ใส่รหัสส่วนลด" : "Enter promo code"}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <Button onClick={handleApplyPromo} variant="outline" size="sm">
                      {language === "th" ? "ใช้" : "Apply"}
                    </Button>
                  </div>
                  {discount > 0 && (
                    <p className="text-sm text-green-600">
                      {language === "th" ? "ส่วนลด" : "Discount"}: -{formatPrice(discount)}
                    </p>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === "th" ? "ยอดรวม" : "Subtotal"}</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>

                  {/* Discount */}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{language === "th" ? "ส่วนลด" : "Discount"}</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === "th" ? "ค่าจัดส่ง" : "Shipping"}</span>
                    <span className={`font-medium ${shippingFee === 0 ? "text-green-600" : ""}`}>
                      {shippingFee === 0 ? (language === "th" ? "ฟรี" : "Free") : formatPrice(shippingFee)}
                    </span>
                  </div>

                  {totalPrice < 1000 && (
                    <p className="text-xs text-gray-500">
                      {language === "th"
                        ? `ซื้อเพิ่ม ${formatPrice(1000 - totalPrice)} เพื่อจัดส่งฟรี`
                        : `Add ${formatPrice(1000 - totalPrice)} more for free shipping`}
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{language === "th" ? "ยอดรวมทั้งสิ้น" : "Total"}</span>
                    <span className="text-pink-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                >
                  {language === "th" ? "ดำเนินการชำระเงิน" : "Proceed to Checkout"}
                </Button>

                {/* Payment Methods */}
                <div className="text-center text-sm text-gray-500">
                  <p className="mb-2">{language === "th" ? "ช่องทางการชำระเงิน" : "Payment Methods"}</p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                      VISA
                    </div>
                    <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center">
                      MC
                    </div>
                    <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center">
                      PP
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="text-center text-xs text-gray-500">
                  🔒 {language === "th" ? "การชำระเงินปลอดภัย SSL" : "Secure SSL Payment"}
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
