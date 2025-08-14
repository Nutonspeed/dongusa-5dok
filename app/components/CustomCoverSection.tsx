"use client"

import type React from "react"

import { useState } from "react"
import { Ruler, Palette, MessageCircle, CheckCircle, ArrowRight, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"

interface MeasurementStep {
  id: string
  title: {
    en: string
    th: string
  }
  description: {
    en: string
    th: string
  }
  icon: React.ElementType
  isCompleted: boolean
}

const measurementSteps: MeasurementStep[] = [
  {
    id: "measure",
    title: {
      en: "Measure Your Sofa",
      th: "วัดขนาดโซฟา",
    },
    description: {
      en: "Use our detailed guide to measure your sofa accurately",
      th: "ใช้คู่มือโดยละเอียดของเราเพื่อวัดโซฟาให้แม่นยำ",
    },
    icon: Ruler,
    isCompleted: false,
  },
  {
    id: "fabric",
    title: {
      en: "Choose Fabric",
      th: "เลือกผ้า",
    },
    description: {
      en: "Select from our premium fabric collection",
      th: "เลือกจากคอลเลกชันผ้าพรีเมียมของเรา",
    },
    icon: Palette,
    isCompleted: false,
  },
  {
    id: "quote",
    title: {
      en: "Get Quote",
      th: "รับใบเสนอราคา",
    },
    description: {
      en: "Receive instant pricing via Facebook Messenger",
      th: "รับราคาทันทีผ่าน Facebook Messenger",
    },
    icon: MessageCircle,
    isCompleted: false,
  },
]

export function CustomCoverSection() {
  const { language } = useLanguage()
  const [activeStep, setActiveStep] = useState(0)
  const [measurements, setMeasurements] = useState({
    width: "",
    height: "",
    depth: "",
    armHeight: "",
    backHeight: "",
    seatDepth: "",
  })

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateEstimatedPrice = () => {
    const basePrice = 2500
    const width = Number.parseFloat(measurements.width) || 0
    const height = Number.parseFloat(measurements.height) || 0
    const depth = Number.parseFloat(measurements.depth) || 0

    if (width === 0 || height === 0 || depth === 0) return basePrice

    const area = (width * height + width * depth + height * depth) / 10000 // Convert to square meters
    const estimatedPrice = Math.round(basePrice + area * 500)

    return estimatedPrice
  }

  const generateFacebookQuote = () => {
    const estimatedPrice = calculateEstimatedPrice()
    const measurementText = Object.entries(measurements)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}cm`)
      .join(", ")

    const message =
      language === "th"
        ? `สวัสดีครับ/ค่ะ! ต้องการสั่งทำผ้าคลุมโซฟาตามสั่ง

ขนาดที่วัดได้:
${measurementText}

ราคาประมาณ: ${estimatedPrice.toLocaleString()} บาท

ต้องการปรึกษาเพิ่มเติมและดูตัวอย่างผ้าครับ/ค่ะ`
        : `Hi! I'd like to order a custom sofa cover.

Measurements:
${measurementText}

Estimated Price: ฿${estimatedPrice.toLocaleString()}

I'd like to consult further and see fabric samples.`

    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    if (typeof window !== "undefined") {
      window.open(facebookUrl, "_blank")
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-accent via-white to-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-accent text-primary border-primary/20 mb-4">
            {language === "en" ? "🎯 Custom Made" : "🎯 ทำตามสั่ง"}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Get Your Perfect Custom Cover" : "รับผ้าคลุมตามสั่งที่สมบูรณ์แบบ"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "en"
              ? "Follow our simple 3-step process to get a custom sofa cover that fits perfectly and matches your style."
              : "ทำตามขั้นตอนง่ายๆ 3 ขั้นตอนของเราเพื่อรับผ้าคลุมโซฟาตามสั่งที่พอดีสมบูรณ์แบบและเข้ากับสไตล์ของคุณ"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Process Steps */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {language === "en" ? "How It Works" : "วิธีการทำงาน"}
            </h3>

            {measurementSteps.map((step, index) => (
              <Card
                key={step.id}
                className={`cursor-pointer transition-all duration-300 ${
                  activeStep === index
                    ? "border-primary shadow-lg bg-accent"
                    : "border-gray-200 hover:border-primary/50 hover:shadow-md"
                }`}
                onClick={() => setActiveStep(index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        activeStep === index ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{step.title[language]}</h4>
                        <Badge variant="outline" className="text-xs">
                          {language === "en" ? `Step ${index + 1}` : `ขั้นตอน ${index + 1}`}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{step.description[language]}</p>
                    </div>

                    {step.isCompleted && <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Side - Interactive Form */}
          <div className="space-y-6">
            {activeStep === 0 && (
              <Card className="border-0 burgundy-shadow-lg">
                <CardHeader className="bg-burgundy-gradient text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Ruler className="w-6 h-6" />
                    <span>{language === "en" ? "Sofa Measurements" : "การวัดขนาดโซฟา"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Width (cm)" : "ความกว้าง (ซม.)"}
                      </label>
                      <input
                        type="number"
                        value={measurements.width}
                        onChange={(e) => handleMeasurementChange("width", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="180"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Height (cm)" : "ความสูง (ซม.)"}
                      </label>
                      <input
                        type="number"
                        value={measurements.height}
                        onChange={(e) => handleMeasurementChange("height", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="85"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Depth (cm)" : "ความลึก (ซม.)"}
                      </label>
                      <input
                        type="number"
                        value={measurements.depth}
                        onChange={(e) => handleMeasurementChange("depth", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="90"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Arm Height (cm)" : "ความสูงแขน (ซม.)"}
                      </label>
                      <input
                        type="number"
                        value={measurements.armHeight}
                        onChange={(e) => handleMeasurementChange("armHeight", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="65"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Back Height (cm)" : "ความสูงพนักพิง (ซม.)"}
                      </label>
                      <input
                        type="number"
                        value={measurements.backHeight}
                        onChange={(e) => handleMeasurementChange("backHeight", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="85"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Seat Depth (cm)" : "ความลึกที่นั่ง (ซม.)"}
                      </label>
                      <input
                        type="number"
                        value={measurements.seatDepth}
                        onChange={(e) => handleMeasurementChange("seatDepth", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="55"
                      />
                    </div>
                  </div>

                  {/* Estimated Price */}
                  <div className="bg-accent rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-primary">
                        {language === "en" ? "Estimated Price" : "ราคาประมาณ"}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-primary">฿{calculateEstimatedPrice().toLocaleString()}</div>
                    <p className="text-sm text-primary/80 mt-1">
                      {language === "en"
                        ? "Final price may vary based on fabric selection and additional features"
                        : "ราคาสุดท้ายอาจแตกต่างขึ้นอยู่กับการเลือกผ้าและคุณสมบัติเพิ่มเติม"}
                    </p>
                  </div>

                  <Button
                    onClick={() => setActiveStep(1)}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    size="lg"
                  >
                    {language === "en" ? "Next: Choose Fabric" : "ถัดไป: เลือกผ้า"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeStep === 1 && (
              <Card className="border-0 burgundy-shadow-lg">
                <CardHeader className="bg-burgundy-gradient text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-6 h-6" />
                    <span>{language === "en" ? "Fabric Selection" : "การเลือกผ้า"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border-2 border-primary rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
                      <img
                        src="/modern-minimalist-fabric-pattern-1.png"
                        alt="Modern Minimalist"
                        className="w-full h-24 object-cover rounded mb-3"
                      />
                      <h4 className="font-semibold text-gray-900">
                        {language === "en" ? "Modern Minimalist" : "โมเดิร์นมินิมอล"}
                      </h4>
                      <p className="text-sm text-gray-600">฿2,490 - ฿3,490</p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <img
                        src="/classic-elegant-fabric-pattern-1.png"
                        alt="Classic Elegant"
                        className="w-full h-24 object-cover rounded mb-3"
                      />
                      <h4 className="font-semibold text-gray-900">
                        {language === "en" ? "Classic Elegant" : "คลาสสิกหรูหรา"}
                      </h4>
                      <p className="text-sm text-gray-600">฿3,290 - ฿4,990</p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <img
                        src="/bohemian-chic-fabric-pattern-1.png"
                        alt="Bohemian Chic"
                        className="w-full h-24 object-cover rounded mb-3"
                      />
                      <h4 className="font-semibold text-gray-900">
                        {language === "en" ? "Bohemian Chic" : "โบฮีเมียนชิค"}
                      </h4>
                      <p className="text-sm text-gray-600">฿2,890 - ฿3,990</p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <img
                        src="/modern-minimalist-fabric-pattern-2.png"
                        alt="Luxury Premium"
                        className="w-full h-24 object-cover rounded mb-3"
                      />
                      <h4 className="font-semibold text-gray-900">
                        {language === "en" ? "Luxury Premium" : "ลักชูรี่พรีเมียม"}
                      </h4>
                      <p className="text-sm text-gray-600">฿4,290 - ฿7,990</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setActiveStep(2)}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    size="lg"
                  >
                    {language === "en" ? "Next: Get Quote" : "ถัดไป: รับใบเสนอราคา"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeStep === 2 && (
              <Card className="border-0 burgundy-shadow-lg">
                <CardHeader className="bg-burgundy-gradient text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-6 h-6" />
                    <span>{language === "en" ? "Get Your Quote" : "รับใบเสนอราคา"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {language === "en" ? "Ready for Your Quote!" : "พร้อมรับใบเสนอราคาแล้ว!"}
                    </h3>
                    <p className="text-gray-600">
                      {language === "en"
                        ? "Click the button below to send your measurements and fabric preferences via Facebook Messenger. Our team will respond with a detailed quote within 2 hours."
                        : "คลิกปุ่มด้านล่างเพื่อส่งขนาดและความชอบผ้าผ่าน Facebook Messenger ทีมของเราจะตอบกลับด้วยใบเสนอราคาโดยละเอียดภายใน 2 ชั่วโมง"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {language === "en" ? "Your Selection Summary:" : "สรุปการเลือกของคุณ:"}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{language === "en" ? "Estimated Price:" : "ราคาประมาณ:"}</span>
                        <span className="font-semibold">฿{calculateEstimatedPrice().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === "en" ? "Fabric Collection:" : "คอลเลกชันผ้า:"}</span>
                        <span>{language === "en" ? "Modern Minimalist" : "โมเดิร์นมินิมอล"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === "en" ? "Production Time:" : "เวลาผลิต:"}</span>
                        <span>7-14 {language === "en" ? "days" : "วัน"}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={generateFacebookQuote}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    size="lg"
                  >
                    <MessageCircle className="mr-2 w-5 h-5" />
                    {language === "en" ? "Get Quote on Facebook" : "รับใบเสนอราคาใน Facebook"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    {language === "en"
                      ? "By clicking above, you'll be redirected to Facebook Messenger with your details pre-filled."
                      : "เมื่อคลิกข้างต้น คุณจะถูกเปลี่ยนเส้นทางไปยัง Facebook Messenger พร้อมรายละเอียดที่กรอกไว้แล้ว"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Ruler className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === "en" ? "Perfect Fit Guarantee" : "รับประกันความพอดี"}
            </h3>
            <p className="text-gray-600 text-sm">
              {language === "en"
                ? "Our precision measurement system ensures a perfect fit every time"
                : "ระบบการวัดที่แม่นยำของเรารับประกันความพอดีทุกครั้ง"}
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === "en" ? "Quality Materials" : "วัสดุคุณภาพ"}
            </h3>
            <p className="text-gray-600 text-sm">
              {language === "en"
                ? "Premium fabrics that are durable, comfortable, and easy to maintain"
                : "ผ้าพรีเมียมที่ทนทาน สะดวกสบาย และดูแลง่าย"}
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === "en" ? "Expert Support" : "การสนับสนุนจากผู้เชี่ยวชาญ"}
            </h3>
            <p className="text-gray-600 text-sm">
              {language === "en"
                ? "Our team provides personalized guidance throughout the entire process"
                : "ทีมของเราให้คำแนะนำส่วนบุคคลตลอดกระบวนการทั้งหมด"}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
