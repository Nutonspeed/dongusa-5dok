"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Truck, RefreshCw, Award, Users, Clock, Palette, Scissors, CheckCircle } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

interface Reason {
  icon: React.ElementType
  title: string
  title_en: string
  description: string
  description_en: string
  highlight?: boolean
}

const reasons: Reason[] = [
  {
    icon: Shield,
    title: "รับประกันคุณภาพ",
    title_en: "Quality Guarantee",
    description: "ผลิตจากวัสดุคุณภาพสูง รับประกัน 1 ปีเต็ม หากไม่พอใจคืนเงิน 100%",
    description_en: "Made from premium materials with 1-year warranty. 100% money-back guarantee if not satisfied",
    highlight: true,
  },
  {
    icon: Scissors,
    title: "ตัดเย็บตามสั่ง",
    title_en: "Custom Tailored",
    description: "วัดขนาดและตัดเย็บเฉพาะสำหรับโซฟาของคุณ ความพอดีแบบสมบูรณ์แบบ",
    description_en: "Measured and tailored specifically for your sofa. Perfect fit guaranteed",
  },
  {
    icon: Truck,
    title: "จัดส่งรวดเร็ว",
    title_en: "Fast Delivery",
    description: "จัดส่งฟรีทั่วประเทศ ภายใน 24-48 ชั่วโมง พร้อมติดตามสถานะ",
    description_en: "Free nationwide delivery within 24-48 hours with tracking",
  },
  {
    icon: Palette,
    title: "ลายผ้าหลากหลาย",
    title_en: "Diverse Patterns",
    description: "เลือกจากลายผ้ากว่า 200+ แบบ อัปเดตคอลเลกชันใหม่ทุกเดือน",
    description_en: "Choose from 200+ fabric patterns. New collections updated monthly",
  },
  {
    icon: RefreshCw,
    title: "เปลี่ยนคืนง่าย",
    title_en: "Easy Returns",
    description: "เปลี่ยนหรือคืนสินค้าได้ภายใน 30 วัน ไม่มีค่าใช้จ่ายเพิ่มเติม",
    description_en: "Exchange or return within 30 days with no additional charges",
  },
  {
    icon: Users,
    title: "ลูกค้า 50,000+ คน",
    title_en: "50,000+ Customers",
    description: "ลูกค้าไว้วางใจมากกว่า 50,000 คน คะแนนรีวิวเฉลี่ย 4.9/5 ดาว",
    description_en: "Trusted by 50,000+ customers with 4.9/5 star average rating",
    highlight: true,
  },
  {
    icon: Clock,
    title: "บริการ 24/7",
    title_en: "24/7 Service",
    description: "ทีมงานพร้อมให้คำปรึกษาตลอด 24 ชั่วโมง ผ่านไลน์ เฟซบุ๊ก หรือโทร",
    description_en: "24/7 customer support via Line, Facebook, or phone call",
  },
  {
    icon: Award,
    title: "รางวัลคุณภาพ",
    title_en: "Quality Awards",
    description: "ได้รับรางวัลสินค้าคุณภาพดีเด่น 3 ปีซ้อน จากสมาคมผู้บริโภค",
    description_en: "Winner of Outstanding Quality Product Award for 3 consecutive years",
  },
  {
    icon: CheckCircle,
    title: "ติดตั้งง่าย",
    title_en: "Easy Installation",
    description: "ใส่ได้ง่ายภายใน 5 นาที พร้อมคู่มือและวิดีโอสอนการใช้งาน",
    description_en: "Easy 5-minute installation with manual and tutorial videos",
  },
]

export default function WhyChooseUs() {
  const { language } = useLanguage()

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 mb-4">
            {language === "th" ? "ทำไมต้องเลือกเรา" : "Why Choose Us"}
          </Badge>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {language === "th" ? "9 เหตุผลที่ลูกค้าเลือกเรา" : "9 Reasons Why Customers Choose Us"}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === "th"
              ? "ด้วยประสบการณ์กว่า 10 ปี เราคือผู้นำด้านผ้าคลุมโซฟาคุณภาพสูงในประเทศไทย"
              : "With over 10 years of experience, we are Thailand's leading premium sofa cover provider"}
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <Card
              key={index}
              className={`group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                reason.highlight ? "ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-white" : "hover:shadow-md"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                      reason.highlight
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                    }`}
                  >
                    <reason.icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {language === "th" ? reason.title : reason.title_en}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {language === "th" ? reason.description : reason.description_en}
                    </p>
                  </div>
                </div>

                {/* Highlight Badge */}
                {reason.highlight && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-xs">
                      {language === "th" ? "จุดเด่นพิเศษ" : "Special Highlight"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-sm text-gray-600">{language === "th" ? "ลูกค้าพอใจ" : "Happy Customers"}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-sm text-gray-600">{language === "th" ? "ลายผ้า" : "Fabric Patterns"}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5</div>
              <div className="text-sm text-gray-600">{language === "th" ? "คะแนนรีวิว" : "Review Score"}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">24h</div>
              <div className="text-sm text-gray-600">{language === "th" ? "จัดส่งเร็ว" : "Fast Delivery"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
