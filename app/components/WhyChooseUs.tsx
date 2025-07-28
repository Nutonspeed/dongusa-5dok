"use client"

import type React from "react"

import { Shield, Award, Truck, HeartHandshake, Clock, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "../contexts/LanguageContext"

interface Feature {
  icon: React.ElementType
  title: {
    en: string
    th: string
  }
  description: {
    en: string
    th: string
  }
  stats?: {
    value: string
    label: {
      en: string
      th: string
    }
  }
}

const features: Feature[] = [
  {
    icon: Shield,
    title: {
      en: "Premium Quality Guarantee",
      th: "รับประกันคุณภาพพรีเมียม",
    },
    description: {
      en: "All our sofa covers are made from high-quality, durable materials that are tested for longevity and comfort.",
      th: "ผ้าคลุมโซฟาทุกชิ้นของเราทำจากวัสดุคุณภาพสูงที่ทนทาน ผ่านการทดสอบความคงทนและความสบาย",
    },
    stats: {
      value: "2 Years",
      label: {
        en: "Warranty",
        th: "รับประกัน",
      },
    },
  },
  {
    icon: Award,
    title: {
      en: "Expert Craftsmanship",
      th: "ฝีมือผู้เชี่ยวชาญ",
    },
    description: {
      en: "Our skilled artisans have over 15 years of experience in creating perfect-fit sofa covers with attention to detail.",
      th: "ช่างฝีมือของเรามีประสบการณ์กว่า 15 ปีในการสร้างผ้าคลุมโซฟาที่พอดีสมบูรณ์แบบด้วยความใส่ใจในรายละเอียด",
    },
    stats: {
      value: "15+",
      label: {
        en: "Years Experience",
        th: "ปีประสบการณ์",
      },
    },
  },
  {
    icon: Truck,
    title: {
      en: "Fast & Free Delivery",
      th: "จัดส่งรวดเร็วและฟรี",
    },
    description: {
      en: "Enjoy free delivery nationwide with express shipping options. Most orders arrive within 2-3 business days.",
      th: "เพลิดเพลินกับการจัดส่งฟรีทั่วประเทศพร้อมตัวเลือกจัดส่งด่วน คำสั่งซื้อส่วนใหญ่จะมาถึงภายใน 2-3 วันทำการ",
    },
    stats: {
      value: "2-3 Days",
      label: {
        en: "Delivery",
        th: "จัดส่ง",
      },
    },
  },
  {
    icon: HeartHandshake,
    title: {
      en: "Customer Satisfaction",
      th: "ความพึงพอใจของลูกค้า",
    },
    description: {
      en: "We're committed to your satisfaction with 24/7 customer support and hassle-free returns within 30 days.",
      th: "เรามุ่งมั่นให้คุณพึงพอใจด้วยการสนับสนุนลูกค้า 24/7 และการคืนสินค้าที่ไม่ยุ่งยากภายใน 30 วัน",
    },
    stats: {
      value: "98%",
      label: {
        en: "Satisfaction Rate",
        th: "อัตราความพึงพอใจ",
      },
    },
  },
  {
    icon: Clock,
    title: {
      en: "Custom Made to Order",
      th: "ทำตามสั่งเฉพาะ",
    },
    description: {
      en: "Every cover is made specifically for your furniture with precise measurements and your choice of fabric and color.",
      th: "ผ้าคลุมทุกชิ้นทำเฉพาะสำหรับเฟอร์นิเจอร์ของคุณด้วยการวัดขนาดที่แม่นยำและการเลือกผ้าและสีตามใจคุณ",
    },
    stats: {
      value: "7-14 Days",
      label: {
        en: "Production Time",
        th: "เวลาผลิต",
      },
    },
  },
  {
    icon: Star,
    title: {
      en: "Trusted by Thousands",
      th: "ได้รับความไว้วางใจจากหลายพัน",
    },
    description: {
      en: "Join over 10,000 satisfied customers who have transformed their living spaces with our premium sofa covers.",
      th: "เข้าร่วมกับลูกค้าที่พึงพอใจกว่า 10,000 คนที่ได้เปลี่ยนโฉมพื้นที่นั่งเล่นด้วยผ้าคลุมโซฟาพรีเมียมของเรา",
    },
    stats: {
      value: "10,000+",
      label: {
        en: "Happy Customers",
        th: "ลูกค้าพอใจ",
      },
    },
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "Bangkok",
    rating: 5,
    comment: {
      en: "Amazing quality and perfect fit! The custom cover transformed my old sofa completely.",
      th: "คุณภาพยอดเยี่ยมและพอดีสมบูรณ์แบบ! ผ้าคลุมตามสั่งเปลี่ยนโซฟาเก่าของฉันได้อย่างสมบูรณ์",
    },
  },
  {
    name: "Michael Chen",
    location: "Chiang Mai",
    rating: 5,
    comment: {
      en: "Excellent service and fast delivery. The fabric quality exceeded my expectations.",
      th: "บริการยอดเยี่ยมและจัดส่งรวดเร็ว คุณภาพผ้าเกินความคาดหมายของฉัน",
    },
  },
  {
    name: "Ploy Siriporn",
    location: "Phuket",
    rating: 5,
    comment: {
      en: "Beautiful designs and professional installation. Highly recommended!",
      th: "การออกแบบที่สวยงามและการติดตั้งแบบมืออาชีพ แนะนำอย่างยิ่ง!",
    },
  },
]

export default function WhyChooseUs() {
  const { language } = useLanguage()

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Why Choose SofaCover Pro?" : "ทำไมต้องเลือก โซฟาคัฟเวอร์ โปร?"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "en"
              ? "We're committed to providing the highest quality sofa covers with exceptional service and customer satisfaction."
              : "เรามุ่งมั่นที่จะให้ผ้าคลุมโซฟาคุณภาพสูงสุดพร้อมบริการที่ยอดเยี่ยมและความพึงพอใจของลูกค้า"}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-8 text-center">
                {/* Icon */}
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title[language]}</h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description[language]}</p>

                {/* Stats */}
                {feature.stats && (
                  <div className="border-t border-gray-100 pt-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{feature.stats.value}</div>
                    <div className="text-sm text-gray-500 font-medium">{feature.stats.label[language]}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {language === "en" ? "What Our Customers Say" : "ลูกค้าของเราพูดว่าอย่างไร"}
            </h3>
            <p className="text-gray-600">
              {language === "en"
                ? "Real reviews from satisfied customers who love their new sofa covers"
                : "รีวิวจริงจากลูกค้าที่พึงพอใจที่รักผ้าคลุมโซฟาใหม่ของพวกเขา"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-0 shadow-md">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 mb-6 italic">"{testimonial.comment[language]}"</p>

                  {/* Customer Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {language === "en" ? "Ready to Transform Your Sofa?" : "พร้อมที่จะเปลี่ยนโฉมโซฟาของคุณแล้วหรือยัง?"}
            </h3>
            <p className="text-xl mb-8 text-white/90">
              {language === "en"
                ? "Join thousands of satisfied customers and give your furniture the protection and style it deserves."
                : "เข้าร่วมกับลูกค้าที่พึงพอใจหลายพันคนและให้เฟอร์นิเจอร์ของคุณได้รับการปกป้องและสไตล์ที่สมควรได้รับ"}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const message =
                    language === "th"
                      ? "สวัสดีครับ/ค่ะ! สนใจผ้าคลุมโซฟาของ SofaCover Pro ต้องการปรึกษาและดูตัวอย่างสินค้าครับ/ค่ะ"
                      : "Hi! I'm interested in SofaCover Pro's sofa covers. I'd like to consult and see product samples."

                  const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
                  window.open(facebookUrl, "_blank")
                }}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors duration-300"
              >
                {language === "en" ? "Get Free Consultation" : "รับคำปรึกษาฟรี"}
              </button>

              <button
                onClick={() => {
                  const message =
                    language === "th"
                      ? "สวัสดีครับ/ค่ะ! ต้องการขอใบเสนอราคาผ้าคลุมโซฟาตามสั่งครับ/ค่ะ"
                      : "Hi! I'd like to request a quote for custom sofa covers."

                  const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
                  window.open(facebookUrl, "_blank")
                }}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-lg transition-colors duration-300"
              >
                {language === "en" ? "Request Quote" : "ขอใบเสนอราคา"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
