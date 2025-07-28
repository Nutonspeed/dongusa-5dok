"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ruler, Palette, ArrowRight, CheckCircle, MessageCircle, Camera, Calculator } from "lucide-react"

const steps = [
  {
    step: 1,
    icon: Camera,
    title: "ส่งรูปโซฟา",
    description: "ถ่ายรูปโซฟาของคุณ หรือส่งขนาดที่ต้องการ",
    color: "bg-blue-500",
    time: "1 นาที",
  },
  {
    step: 2,
    icon: Palette,
    title: "เลือกผ้าและสี",
    description: "เลือกลายผ้าและสีที่ชอบจากคอลเลกชันของเรา",
    color: "bg-purple-500",
    time: "5 นาที",
  },
  {
    step: 3,
    icon: Calculator,
    title: "รับใบเสนอราคา",
    description: "ได้รับใบเสนอราคาและรายละเอียดทันที",
    color: "bg-green-500",
    time: "ทันที",
  },
]

const benefits = ["วัดขนาดแม่นยำ 100%", "เลือกผ้าได้ตามใจชอบ", "ราคาโปร่งใส ไม่มีค่าซ่อนเร้น", "จัดส่งและติดตั้งฟรี", "รับประกันคุณภาพ 2 ปี"]

export default function CustomCoverSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <Badge className="bg-white/20 text-white border-white/30">
                <Ruler className="w-4 h-4 mr-2" />
                บริการสั่งทำพิเศษ
              </Badge>

              <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                รับผ้าคลุมตามสั่ง
                <span className="block text-yellow-300">ที่สมบูรณ์แบบ</span>
              </h2>

              <p className="text-xl text-blue-100 leading-relaxed">
                ทำตามขั้นตอนง่ายๆ 3 ขั้นตอน รับผ้าคลุมโซฟาที่เหมาะกับบ้านคุณ พร้อมบริการวัดขนาดและติดตั้งโดยช่างผู้เชี่ยวชาญ
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/custom-covers">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  เริ่มสั่งทำเลย
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10 bg-transparent"
                >
                  ปรึกษาฟรี
                </Button>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="flex items-center space-x-6 text-blue-100">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Line: @sofacover</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span>02-123-4567</span>
              </div>
            </div>
          </div>

          {/* Right Content - Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Step Icon */}
                    <div
                      className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-gray-600">
                            ขั้นตอน {step.step}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">{step.time}</Badge>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>

                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>

                    {/* Arrow for non-last steps */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block">
                        <ArrowRight className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Final CTA */}
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">พร้อมเริ่มต้นแล้วใช่ไหม?</h3>
                <p className="text-yellow-100 mb-4">รับคำปรึกษาฟรี และใบเสนอราคาทันที</p>
                <Link href="/custom-covers">
                  <Button className="bg-white text-orange-600 hover:bg-orange-50">
                    เริ่มสั่งทำเลย
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
