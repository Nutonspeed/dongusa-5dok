"use client"

import { useState } from "react"
import Link from "next/link"
import { Calculator, MessageCircle, CheckCircle, ArrowRight, Ruler, Palette, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "../contexts/LanguageContext"

export default function CustomCoverSection() {
  const { language } = useLanguage()
  const [activeStep, setActiveStep] = useState(1)

  const steps = [
    {
      id: 1,
      icon: Ruler,
      title: { th: "วัดขนาดโซฟา", en: "Measure Your Sofa" },
      description: {
        th: "วัดความกว้าง ยาว สูง และส่งรูปโซฟาให้เรา",
        en: "Measure width, length, height and send us photos",
      },
    },
    {
      id: 2,
      icon: Palette,
      title: { th: "เลือกลายผ้า", en: "Choose Fabric Pattern" },
      description: {
        th: "เลือกจากลายผ้ากว่า 1,000 แบบ หรือให้เราแนะนำ",
        en: "Choose from 1,000+ patterns or get our recommendations",
      },
    },
    {
      id: 3,
      icon: Scissors,
      title: { th: "ผลิตและจัดส่ง", en: "Production & Delivery" },
      description: {
        th: "ผลิตตามขนาด 7-14 วัน จัดส่งฟรีทั่วประเทศ",
        en: "Custom production 7-14 days, free nationwide delivery",
      },
    },
  ]

  const benefits = [
    {
      icon: CheckCircle,
      title: { th: "พอดีทุกรูปทรง", en: "Perfect Fit Guaranteed" },
      description: {
        th: "ตัดตามขนาดโซฟาของคุณเป๊ะ ไม่หลวม ไม่คับ",
        en: "Custom-cut to your sofa's exact measurements",
      },
    },
    {
      icon: CheckCircle,
      title: { th: "ผ้าคุณภาพพรีเมียม", en: "Premium Quality Fabrics" },
      description: {
        th: "ผ้าคุณภาพสูง ทนทาน กันน้ำ ง่ายต่อการดูแล",
        en: "High-quality, durable, water-resistant, easy care",
      },
    },
    {
      icon: CheckCircle,
      title: { th: "ราคาคุ้มค่า", en: "Great Value" },
      description: {
        th: "ราคาเริ่มต้นเพียง 990 บาท ถูกกว่าซื้อโซฟาใหม่",
        en: "Starting from ฿990, cheaper than buying new sofa",
      },
    },
  ]

  const handleGetCustomQuote = () => {
    const message =
      language === "th"
        ? "สวัสดีครับ/ค่ะ! ผมต้องการสั่งผ้าคลุมโซฟาตัดตามขนาด ช่วยแนะนำขั้นตอนและประเมินราคาให้หน่อยครับ/ค่ะ"
        : "Hello! I want to order a custom sofa cover. Could you guide me through the process and provide a quote?"

    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {language === "th" ? "ผ้าคลุมโซฟาตัดตามขนาด" : "Custom Sofa Covers"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "th"
              ? "ได้ผ้าคลุมโซฟาที่พอดีกับโซฟาของคุณ 100% พร้อมลายผ้าสวยงามที่คุณชื่นชอบ"
              : "Get a perfectly fitted sofa cover with beautiful patterns you love"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Process Steps */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              {language === "th" ? "ขั้นตอนการสั่งทำ" : "How It Works"}
            </h3>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 cursor-pointer ${
                    activeStep === step.id
                      ? "bg-white shadow-lg border-l-4 border-pink-500"
                      : "hover:bg-white hover:shadow-md"
                  }`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      activeStep === step.id
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{step.title[language]}</h4>
                    <p className="text-gray-600 text-sm">{step.description[language]}</p>
                  </div>
                  <div className={`text-2xl font-bold ${activeStep === step.id ? "text-pink-500" : "text-gray-300"}`}>
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleGetCustomQuote}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4"
              >
                <Calculator className="w-5 h-5 mr-2" />
                {language === "th" ? "ขอใบเสนอราคา" : "Get Custom Quote"}
              </Button>

              <Link href="/custom-covers">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white bg-white"
                >
                  {language === "th" ? "เริ่มออกแบบ" : "Start Designing"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Benefits & Visual */}
          <div className="space-y-8">
            {/* Sample Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src="/modern-minimalist-fabric-pattern-1.png"
                  alt="Modern fabric pattern"
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
                <img
                  src="/classic-elegant-fabric-pattern-1.png"
                  alt="Classic fabric pattern"
                  className="w-full h-40 object-cover rounded-lg shadow-md"
                />
              </div>
              <div className="space-y-4 pt-8">
                <img
                  src="/bohemian-chic-fabric-pattern-1.png"
                  alt="Bohemian fabric pattern"
                  className="w-full h-40 object-cover rounded-lg shadow-md"
                />
                <img
                  src="/classic-elegant-fabric-pattern-2.png"
                  alt="Elegant fabric pattern"
                  className="w-full h-32 object-cover rounded-lg shadow-md"
                />
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-gray-900">
                {language === "th" ? "ทำไมต้องเลือกเรา?" : "Why Choose Us?"}
              </h4>
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <benefit.icon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">{benefit.title[language]}</h5>
                        <p className="text-sm text-gray-600">{benefit.description[language]}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500">
              <div className="flex items-center space-x-3 mb-3">
                <MessageCircle className="w-6 h-6 text-green-600" />
                <h5 className="font-semibold text-gray-900">
                  {language === "th" ? "ปรึกษาฟรี 24/7" : "Free Consultation 24/7"}
                </h5>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {language === "th"
                  ? "ทีมผู้เชี่ยวชาญพร้อมให้คำแนะนำเรื่องการเลือกผ้าและการวัดขนาดโซฟา"
                  : "Our experts are ready to help with fabric selection and sofa measurements"}
              </p>
              <Button
                onClick={handleGetCustomQuote}
                variant="outline"
                size="sm"
                className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white bg-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {language === "th" ? "แชทเลย" : "Chat Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
