"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Palette, Ruler, Scissors } from "lucide-react"
import Link from "next/link"

const customSteps = [
  {
    step: 1,
    icon: Ruler,
    title: "วัดขนาด",
    description: "วัดขนาดโซฟาของคุณตามคู่มือที่เราให้",
    color: "bg-blue-100 text-blue-600",
  },
  {
    step: 2,
    icon: Palette,
    title: "เลือกผ้า",
    description: "เลือกผ้าและสีที่ต้องการจากคอลเลกชันของเรา",
    color: "bg-purple-100 text-purple-600",
  },
  {
    step: 3,
    icon: Scissors,
    title: "ตัดเย็บ",
    description: "ช่างผู้เชี่ยวชาญตัดเย็บตามขนาดที่คุณต้องการ",
    color: "bg-pink-100 text-pink-600",
  },
  {
    step: 4,
    icon: CheckCircle,
    title: "จัดส่ง",
    description: "จัดส่งถึงบ้านคุณภายใน 7-14 วันทำการ",
    color: "bg-green-100 text-green-600",
  },
]

const customOptions = [
  "เลือกผ้าจากคอลเลกชันพิเศษ 50+ แบบ",
  "ปรับขนาดได้ตามโซฟาทุกรุ่น",
  "เพิ่มกระเป๋าเก็บของด้านข้าง",
  "เลือกสีเย็บขอบตามต้องการ",
  "รับประกันความพอดี 100%",
  "บริการวัดขนาดถึงบ้าน (กรุงเทพฯ)",
]

export default function CustomCoverSection() {
  const [selectedImage, setSelectedImage] = useState(0)

  const images = [
    "/modern-living-room-sofa-covers.png",
    "/classic-elegant-fabric-pattern-3.png",
    "/modern-minimalist-fabric-pattern-2.png",
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white">บริการพิเศษ</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                สั่งทำผ้าคลุมโซฟา
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  ตามขนาดที่คุณต้องการ
                </span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                ไม่ว่าโซฟาของคุณจะเป็นรุ่นไหน ขนาดเท่าไหร่ เราสามารถสั่งทำผ้าคลุมให้พอดีกับโซฟาของคุณได้ 100%
              </p>
            </div>

            {/* Custom Options */}
            <div className="space-y-3">
              {customOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{option}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                <Link href="/custom-covers">
                  เริ่มสั่งทำเลย
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/fabric-gallery">ดูคอลเลกชันผ้า</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Process Steps */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">ขั้นตอนการสั่งทำ</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <Card
                    key={index}
                    className="relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">ขั้นตอนที่ {step.step}</div>
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                    </CardContent>

                    {/* Step connector line */}
                    {index < customSteps.length - 1 && index % 2 === 0 && (
                      <div className="hidden sm:block absolute -right-2 top-1/2 w-4 h-0.5 bg-gradient-to-r from-pink-300 to-purple-300"></div>
                    )}
                  </Card>
                )
              })}
            </div>

            {/* Image Gallery */}
            <div className="mt-8">
              <div className="aspect-video rounded-xl overflow-hidden mb-4">
                <img
                  src={images[selectedImage] || "/placeholder.svg"}
                  alt="Custom Sofa Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex space-x-2 justify-center">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      selectedImage === index ? "bg-pink-600" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
