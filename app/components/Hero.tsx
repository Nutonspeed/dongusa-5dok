"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star, Shield, Truck, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"

const heroImages = [
  "/modern-living-room-sofa-covers.png",
  "/modern-minimalist-fabric-pattern-1.png",
  "/classic-elegant-fabric-pattern-1.png",
]

const features = [
  {
    icon: Shield,
    title: { en: "Premium Quality", th: "คุณภาพพรีเมียม" },
    description: { en: "Durable materials", th: "วัสดุทนทาน" },
  },
  {
    icon: Truck,
    title: { en: "Fast Delivery", th: "จัดส่งรวดเร็ว" },
    description: { en: "2-3 days shipping", th: "จัดส่ง 2-3 วัน" },
  },
  {
    icon: Award,
    title: { en: "Custom Fit", th: "ตัดตามขนาด" },
    description: { en: "Perfect measurements", th: "วัดขนาดแม่นยำ" },
  },
]

export default function Hero() {
  const { language } = useLanguage()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative bg-gradient-to-br from-accent via-white to-secondary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="flex items-center space-x-2">
              <Badge className="bg-accent text-primary border-primary/20">
                {language === "en" ? "🎉 New Collection" : "🎉 คอลเลกชันใหม่"}
              </Badge>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  {language === "en" ? "4.9/5 from 2,500+ reviews" : "4.9/5 จาก 2,500+ รีวิว"}
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {language === "en" ? (
                  <>
                    Transform Your
                    <span className="text-primary block">Living Space</span>
                  </>
                ) : (
                  <>
                    เปลี่ยนโฉม
                    <span className="text-primary block">พื้นที่นั่งเล่น</span>
                  </>
                )}
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                {language === "en"
                  ? "Premium sofa covers that protect and beautify your furniture. Custom-made with precision, delivered with care."
                  : "ผ้าคลุมโซฟาพรีเมียมที่ปกป้องและเพิ่มความสวยงามให้เฟอร์นิเจอร์ของคุณ ทำตามสั่งด้วยความแม่นยำ จัดส่งด้วยความใส่ใจ"}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{feature.title[language]}</h3>
                  <p className="text-xs text-gray-600">{feature.description[language]}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg w-full sm:w-auto burgundy-shadow"
                >
                  {language === "en" ? "Shop Now" : "ช้อปเลย"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Link href="/custom-covers">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-accent px-8 py-4 text-lg w-full sm:w-auto bg-transparent"
                >
                  {language === "en" ? "Custom Order" : "สั่งทำพิเศษ"}
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>{language === "en" ? "2-Year Warranty" : "รับประกัน 2 ปี"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>{language === "en" ? "Free Shipping" : "ส่งฟรี"}</span>
              </div>
            </div>
          </div>

          {/* Right Content - Image Carousel */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden burgundy-shadow-lg">
              <Image
                src={heroImages[currentImageIndex] || "/placeholder.svg"}
                alt="Sofa Cover Showcase"
                width={600}
                height={500}
                className="w-full h-full object-cover transition-opacity duration-1000"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />

              {/* Overlay with stats */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">10K+</div>
                      <div className="text-sm text-gray-600">{language === "en" ? "Happy Customers" : "ลูกค้าพอใจ"}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">500+</div>
                      <div className="text-sm text-gray-600">{language === "en" ? "Fabric Options" : "ตัวเลือกผ้า"}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">24/7</div>
                      <div className="text-sm text-gray-600">{language === "en" ? "Support" : "ช่วยเหลือ"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/10 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
    </section>
  )
}
