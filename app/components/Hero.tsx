"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Award, Shield, Star, Truck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
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
    <section className="relative bg-gradient-to-br from-background via-card to-muted overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="flex items-center space-x-2">
              <Badge className="bg-accent text-accent-foreground border-accent/20 font-serif font-semibold">
                {language === "en" ? "🎉 New Collection" : "🎉 คอลเลกชันใหม่"}
              </Badge>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
                <span className="text-sm text-muted-foreground ml-2 font-sans">
                  {language === "en" ? "4.9/5 from 2,500+ reviews" : "4.9/5 จาก 2,500+ รีวิว"}
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
                {language === "en" ? (
                  <>
                    Transform Your
                    <span className="text-primary-gradient block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Living Space
                    </span>
                  </>
                ) : (
                  <>
                    เปลี่ยนโฉม
                    <span className="text-primary-gradient block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      พื้นที่นั่งเล่น
                    </span>
                  </>
                )}
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg font-sans">
                {language === "en"
                  ? "Premium sofa covers that protect and beautify your furniture. Custom-made with precision, delivered with care."
                  : "ผ้าคลุมโซฟาพรีเมียมที่ปกป้องและเพิ่มความสวยงามให้เฟอร์นิเจอร์ของคุณ ทำตามสั่งด้วยความแม่นยำ จัดส่งด้วยความใส่ใจ"}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="text-center group hover-lift">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-accent-foreground group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <h3 className="font-serif font-semibold text-foreground text-sm">{feature.title[language]}</h3>
                  <p className="text-xs text-muted-foreground font-sans">{feature.description[language]}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg w-full sm:w-auto btn-enhanced font-serif font-semibold"
                >
                  {language === "en" ? "Shop Now" : "ช้อปเลย"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Link href="/custom-covers">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-accent hover:text-accent-foreground px-8 py-4 text-lg w-full sm:w-auto bg-transparent font-serif font-semibold"
                >
                  {language === "en" ? "Custom Order" : "สั่งทำพิเศษ"}
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground font-sans">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>{language === "en" ? "2-Year Warranty" : "รับประกัน 2 ปี"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>{language === "en" ? "Free Shipping" : "ส่งฟรี"}</span>
              </div>
            </div>
          </div>

          {/* Right Content - Image Carousel */}
          <div className="relative animate-scale-in">
            <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden primary-shadow-lg">
              <Image
                src={heroImages[currentImageIndex] || "/placeholder.svg"}
                alt="Sofa Cover Showcase"
                width={600}
                height={500}
                className="w-full h-full object-cover transition-opacity duration-1000 fabric-image-zoom"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />

              {/* Overlay with stats */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 border border-border">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground font-serif">10K+</div>
                      <div className="text-sm text-muted-foreground font-sans">
                        {language === "en" ? "Happy Customers" : "ลูกค้าพอใจ"}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground font-serif">500+</div>
                      <div className="text-sm text-muted-foreground font-sans">
                        {language === "en" ? "Fabric Options" : "ตัวเลือกผ้า"}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground font-serif">24/7</div>
                      <div className="text-sm text-muted-foreground font-sans">
                        {language === "en" ? "Support" : "ช่วยเหลือ"}
                      </div>
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
                    index === currentImageIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent/10 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
    </section>
  )
}
