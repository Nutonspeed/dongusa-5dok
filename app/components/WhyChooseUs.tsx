"use client"

import { CheckCircle, Award, Users, Star } from "lucide-react"
import { useLanguage } from "@/app/contexts/LanguageContext"

export default function WhyChooseUs() {
  const { t } = useLanguage()

  const features = [
    {
      icon: <CheckCircle className="w-8 h-8 text-pink-600" />,
      title: "คุณภาพพรีเมียม",
      description: "เราใช้ผ้าคุณภาพสูงและงานฝีมือประณีต เพื่อความทนทานและสวยงาม",
    },
    {
      icon: <Award className="w-8 h-8 text-pink-600" />,
      title: "ประสบการณ์กว่า 10 ปี",
      description: "ทีมงานของเรามีประสบการณ์ยาวนานในการผลิตผ้าคลุมโซฟาที่สมบูรณ์แบบ",
    },
    {
      icon: <Users className="w-8 h-8 text-pink-600" />,
      title: "บริการลูกค้าเป็นเลิศ",
      description: "เราพร้อมให้คำปรึกษาและบริการหลังการขาย เพื่อความพึงพอใจสูงสุดของคุณ",
    },
    {
      icon: <Star className="w-8 h-8 text-pink-600" />,
      title: "รีวิว 5 ดาว",
      description: "ลูกค้าของเราพึงพอใจและให้คะแนนรีวิวสูงสุดในทุกแพลตฟอร์ม",
    },
  ]

  const stats = [
    { value: "10+", label: "ปีแห่งประสบการณ์" },
    { value: "5000+", label: "ผ้าคลุมที่ผลิต" },
    { value: "99%", label: "ความพึงพอใจลูกค้า" },
    { value: "100%", label: "รับประกันความพอดี" },
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-white to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{t("why-choose-us.title")}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">เหตุผลที่ลูกค้าไว้วางใจให้เราดูแลโซฟาตัวโปรดของพวกเขา</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-center"
            >
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-pink-600 text-white rounded-lg p-8 md:p-12 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-lg opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
