"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star, Shield, Truck, RefreshCw, Play } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

export default function Hero() {
  const { language } = useLanguage()
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const features = [
    {
      icon: Shield,
      title: language === "th" ? "รับประกันคุณภาพ" : "Quality Guarantee",
      description: language === "th" ? "รับประกัน 1 ปี" : "1 Year Warranty",
    },
    {
      icon: Truck,
      title: language === "th" ? "จัดส่งฟรี" : "Free Shipping",
      description: language === "th" ? "สั่งซื้อขั้นต่ำ 1,000 บาท" : "Orders over ฿1,000",
    },
    {
      icon: RefreshCw,
      title: language === "th" ? "เปลี่ยนคืนได้" : "Easy Returns",
      description: language === "th" ? "ภายใน 30 วัน" : "Within 30 days",
    },
  ]

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100&text=Pattern')] bg-repeat"></div>
      </div>

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                <Star className="w-3 h-3 mr-1 fill-current" />
                {language === "th" ? "อันดับ 1 ในไทย" : "#1 in Thailand"}
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-700">
                {language === "th" ? "ใหม่" : "New"}
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {language === "th" ? (
                  <>
                    <span className="text-blue-600">ผ้าคลุมโซฟา</span>
                    <br />
                    คุณภาพพรีเมียม
                  </>
                ) : (
                  <>
                    <span className="text-blue-600">Premium</span>
                    <br />
                    Sofa Covers
                  </>
                )}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {language === "th"
                  ? "เปลี่ยนโฉมพื้นที่นั่งเล่นของคุณด้วยผ้าคลุมโซฟาตามสั่งที่ออกแบบเฉพาะ พร้อมการันตีความพอดีแบบสมบูรณ์แบบ"
                  : "Transform your living space with custom-designed sofa covers. Perfect fit guaranteed with premium materials and fast delivery."}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">50,000+</div>
                <div className="text-sm text-gray-600">{language === "th" ? "ลูกค้าพอใจ" : "Happy Customers"}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4.9/5</div>
                <div className="text-sm text-gray-600">{language === "th" ? "คะแนนรีวิว" : "Review Score"}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24h</div>
                <div className="text-sm text-gray-600">{language === "th" ? "จัดส่งเร็ว" : "Fast Delivery"}</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  {language === "th" ? "เลือกซื้อสินค้า" : "Shop Now"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/custom-covers">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 bg-transparent"
                >
                  {language === "th" ? "สั่งทำตามแบบ" : "Custom Order"}
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-200">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{feature.title}</div>
                    <div className="text-xs text-gray-600">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Image/Video */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/modern-living-room-sofa-covers.png"
                alt={language === "th" ? "ผ้าคลุมโซฟาพรีเมียม" : "Premium Sofa Covers"}
                width={600}
                height={400}
                className="w-full h-auto"
                priority
              />

              {/* Video Play Button Overlay */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Button
                  size="lg"
                  className="bg-white/90 text-gray-900 hover:bg-white rounded-full w-16 h-16 p-0"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <Play className="w-6 h-6 ml-1" />
                </Button>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4 hidden lg:block">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{language === "th" ? "พร้อมส่ง" : "In Stock"}</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 hidden lg:block">
              <div className="text-sm font-medium">{language === "th" ? "ส่วนลดพิเศษ" : "Special Offer"}</div>
              <div className="text-2xl font-bold">30% OFF</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 fill-white">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
        </svg>
      </div>
    </section>
  )
}
