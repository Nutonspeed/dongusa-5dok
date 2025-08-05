"use client"

import { Shield, Ruler, Truck, HeadphonesIcon, Award, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "../contexts/LanguageContext"

const features = [
  {
    icon: Shield,
    title: "คุณภาพพรีเมียม",
    description: "ผ้ากันน้ำ 100% กันคราบ ทนทาน ใช้งานได้นาน",
    color: "text-green-600 bg-green-100",
  },
  {
    icon: Ruler,
    title: "สั่งทำตามขนาด",
    description: "วัดขนาดและสั่งทำตามโซฟาของคุณ ฟิตพอดี 100%",
    color: "text-blue-600 bg-blue-100",
  },
  {
    icon: Truck,
    title: "จัดส่งฟรีทั่วไทย",
    description: "จัดส่งฟรีทุกออเดอร์ ได้รับภายใน 3-7 วันทำการ",
    color: "text-purple-600 bg-purple-100",
  },
  {
    icon: HeadphonesIcon,
    title: "บริการหลังการขาย",
    description: "ให้คำปรึกษาและดูแลหลังการขาย ตลอด 24 ชั่วโมง",
    color: "text-pink-600 bg-pink-100",
  },
  {
    icon: Award,
    title: "รับประกันคุณภาพ",
    description: "รับประกันคุณภาพ 1 ปีเต็ม เปลี่ยนใหม่หากมีปัญหา",
    color: "text-orange-600 bg-orange-100",
  },
  {
    icon: Clock,
    title: "ประสบการณ์ 10+ ปี",
    description: "ประสบการณ์กว่า 10 ปี ลูกค้าพึงพอใจมากกว่า 50,000 ราย",
    color: "text-indigo-600 bg-indigo-100",
  },
]

export default function WhyChooseUs() {
  const { t } = useLanguage()

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{t("why.title")}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            เราคือผู้เชี่ยวชาญด้านผ้าคลุมโซฟาที่มีประสบการณ์มากกว่า 10 ปี พร้อมให้บริการที่ดีที่สุดแก่ลูกค้าทุกท่าน
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 rounded-full ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">50,000+</div>
              <div className="text-pink-100">ลูกค้าพึงพอใจ</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-pink-100">คะแนนรีวิว</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">10+</div>
              <div className="text-pink-100">ปีประสบการณ์</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">99%</div>
              <div className="text-pink-100">ความพึงพอใจ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
