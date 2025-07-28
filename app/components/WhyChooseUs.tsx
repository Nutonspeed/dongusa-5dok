"use client"

import { Shield, Truck, RotateCcw, Award, Users, Clock, Palette, Scissors } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "../contexts/LanguageContext"

export default function WhyChooseUs() {
  const { language } = useLanguage()

  const features = [
    {
      icon: Shield,
      title: { th: "รับประกันคุณภาพ 1 ปี", en: "1 Year Quality Guarantee" },
      description: {
        th: "มั่นใจในคุณภาพผลิตภัณฑ์ หากมีปัญหาเราพร้อมแก้ไขหรือเปลี่ยนใหม่ให้ฟรี",
        en: "Confident in product quality. Free repair or replacement if any issues arise.",
      },
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Truck,
      title: { th: "จัดส่งฟรีทั่วประเทศ", en: "Free Nationwide Delivery" },
      description: {
        th: "ส่งถึงบ้านฟรีทุกจังหวัด พร้อมบริการติดตั้งและคำแนะนำการใช้งาน",
        en: "Free home delivery nationwide with installation service and usage guidance.",
      },
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: RotateCcw,
      title: { th: "เปลี่ยนคืนได้ 30 วัน", en: "30-Day Return Policy" },
      description: {
        th: "ไม่พอใจสามารถเปลี่ยนหรือคืนสินค้าได้ภายใน 30 วัน โดยไม่มีเงื่อนไข",
        en: "Unsatisfied? Return or exchange within 30 days with no conditions.",
      },
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Award,
      title: { th: "ผู้เชี่ยวชาญมากกว่า 10 ปี", en: "10+ Years of Expertise" },
      description: {
        th: "ประสบการณ์ยาวนานในการผลิตผ้าคลุมโซฟา ด้วยทีมช่างฝีมือระดับมืออาชีพ",
        en: "Long experience in sofa cover production with professional craftsmen.",
      },
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Users,
      title: { th: "ลูกค้าไว้วางใจ 10,000+ ราย", en: "10,000+ Satisfied Customers" },
      description: {
        th: "ได้รับความไว้วางใจจากลูกค้าทั่วประเทศ พร้อมรีวิวดีๆ มากมาย",
        en: "Trusted by customers nationwide with numerous positive reviews.",
      },
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      icon: Clock,
      title: { th: "ผลิตเร็ว 7-14 วัน", en: "Fast Production 7-14 Days" },
      description: {
        th: "ระบบการผลิตที่มีประสิทธิภาพ ส่งมอบงานคุณภาพในเวลาที่รวดเร็ว",
        en: "Efficient production system delivering quality work in fast turnaround time.",
      },
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: Palette,
      title: { th: "ลายผ้า 1,000+ แบบ", en: "1,000+ Fabric Patterns" },
      description: {
        th: "คอลเลกชันลายผ้าหลากหลาย อัปเดตใหม่ทุกเดือน ให้คุณเลือกได้ไม่จำกัด",
        en: "Diverse fabric collection updated monthly for unlimited choices.",
      },
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      icon: Scissors,
      title: { th: "ตัดตามขนาดเป๊ะ", en: "Perfect Custom Fit" },
      description: {
        th: "เทคโนโลยีการตัดที่แม่นยำ ทำให้ผ้าคลุมพอดีกับโซฟาของคุณทุกรูปทรง",
        en: "Precise cutting technology ensures perfect fit for any sofa shape.",
      },
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  const stats = [
    {
      number: "10,000+",
      label: { th: "ลูกค้าพึงพอใจ", en: "Happy Customers" },
    },
    {
      number: "1,000+",
      label: { th: "ลายผ้า", en: "Fabric Patterns" },
    },
    {
      number: "10+",
      label: { th: "ปีประสบการณ์", en: "Years Experience" },
    },
    {
      number: "4.9/5",
      label: { th: "คะแนนรีวิว", en: "Review Rating" },
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {language === "th" ? "ทำไมต้องเลือกเรา?" : "Why Choose Us?"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "th"
              ? "เราคือผู้เชี่ยวชาญด้านผ้าคลุมโซฟาที่ได้รับความไว้วางใจจากลูกค้าทั่วประเทศ"
              : "We are sofa cover specialists trusted by customers nationwide"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-pink-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label[language]}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${feature.bgColor} mb-4`}
                >
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">{feature.title[language]}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description[language]}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            {language === "th" ? "พร้อมเปลี่ยนโฉมโซฟาของคุณแล้วหรือยัง?" : "Ready to Transform Your Sofa?"}
          </h3>
          <p className="text-lg mb-6 opacity-90">
            {language === "th"
              ? "เริ่มต้นด้วยการปรึกษาฟรีกับทีมผู้เชี่ยวชาญของเรา"
              : "Start with a free consultation with our expert team"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                const message =
                  language === "th"
                    ? "สวัสดีครับ/ค่ะ! ผมสนใจผ้าคลุมโซฟา ต้องการปรึกษาและขอใบเสนอราคาครับ/ค่ะ"
                    : "Hello! I'm interested in sofa covers. I'd like consultation and a quote please."

                const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
                window.open(facebookUrl, "_blank")
              }}
              className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {language === "th" ? "ปรึกษาฟรีเลย" : "Free Consultation"}
            </button>
            <button
              onClick={() => {
                const message =
                  language === "th"
                    ? "สวัสดีครับ/ค่ะ! ต้องการดูตัวอย่างผ้าและลายผ้าต่างๆ ครับ/ค่ะ"
                    : "Hello! I'd like to see fabric samples and different patterns."

                const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
                window.open(facebookUrl, "_blank")
              }}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-pink-600 transition-colors"
            >
              {language === "th" ? "ขอตัวอย่างผ้า" : "Request Samples"}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
