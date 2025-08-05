"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Calculator, MessageCircle, CheckCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/app/contexts/LanguageContext" // Assuming LanguageContext is available

export default function CustomCoversPage() {
  const { t } = useLanguage() // Use translation hook

  const [measurements, setMeasurements] = useState({
    sofaType: "",
    width: "",
    depth: "",
    height: "",
    armHeight: "",
    backHeight: "",
    additionalNotes: "",
  })

  const [selectedFabric, setSelectedFabric] = useState("")
  const [estimatedPrice, setEstimatedPrice] = useState(0)

  const sofaTypes = [
    { value: "single", label: "Single Seat / Armchair", basePrice: 89 },
    { value: "loveseat", label: "2-Seat Loveseat", basePrice: 129 },
    { value: "sofa", label: "3-Seat Sofa", basePrice: 149 },
    { value: "sectional-small", label: "Small Sectional", basePrice: 199 },
    { value: "sectional-large", label: "Large Sectional", basePrice: 249 },
    { value: "recliner", label: "Recliner", basePrice: 99 },
    { value: "chaise", label: "Chaise Lounge", basePrice: 119 },
  ]

  const fabricTypes = [
    { value: "cotton", label: "Cotton Blend", multiplier: 1.0 },
    { value: "linen", label: "Linen", multiplier: 1.2 },
    { value: "velvet", label: "Velvet", multiplier: 1.5 },
    { value: "leather-look", label: "Faux Leather", multiplier: 1.3 },
    { value: "performance", label: "Performance Fabric", multiplier: 1.4 },
    { value: "outdoor", label: "Outdoor Fabric", multiplier: 1.6 },
  ]

  // Effect to recalculate price whenever measurements or fabric change
  useEffect(() => {
    calculatePrice()
  }, [measurements, selectedFabric])

  const calculatePrice = () => {
    const sofaTypeData = sofaTypes.find((type) => type.value === measurements.sofaType)
    const fabricTypeData = fabricTypes.find((type) => type.value === selectedFabric)

    if (sofaTypeData && fabricTypeData) {
      let price = sofaTypeData.basePrice * fabricTypeData.multiplier

      // Add complexity based on measurements (example logic)
      const width = Number.parseFloat(measurements.width) || 0
      const depth = Number.parseFloat(measurements.depth) || 0

      if (width > 90 || depth > 40) {
        price *= 1.2 // 20% surcharge for oversized
      }

      setEstimatedPrice(Math.round(price * 35)) // Convert to THB (example rate)
    } else {
      setEstimatedPrice(0)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const orderDetails = `
คำขอสั่งทำผ้าคลุมโซฟาแบบพิเศษ:

ประเภทโซฟา: ${sofaTypes.find((type) => type.value === measurements.sofaType)?.label || "ไม่ได้ระบุ"}
ประเภทผ้า: ${fabricTypes.find((type) => type.value === selectedFabric)?.label || "ไม่ได้ระบุ"}

ขนาด:
- ความกว้าง: ${measurements.width || "ไม่ได้ระบุ"} นิ้ว
- ความลึก: ${measurements.depth || "ไม่ได้ระบุ"} นิ้ว
- ความสูงโดยรวม: ${measurements.height || "ไม่ได้ระบุ"} นิ้ว
- ความสูงที่วางแขน: ${measurements.armHeight || "ไม่ได้ระบุ"} นิ้ว
- ความสูงพนักพิง: ${measurements.backHeight || "ไม่ได้ระบุ"} นิ้ว

หมายเหตุเพิ่มเติม: ${measurements.additionalNotes || "ไม่มี"}

ราคาประมาณการ: ${estimatedPrice > 0 ? `฿${estimatedPrice}` : "ยังไม่สามารถประมาณการได้"}

กรุณาให้ใบเสนอราคาและระยะเวลาการผลิตสำหรับคำสั่งซื้อพิเศษนี้
    `

    // Replace 'your-facebook-page' with your actual Facebook page ID or username
    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(orderDetails)}`
    window.open(facebookUrl, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">สั่งทำผ้าคลุมโซฟาแบบพิเศษ</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            รับผ้าคลุมที่พอดีเป๊ะสำหรับโซฟาของคุณโดยเฉพาะ กรอกแบบฟอร์มด้านล่างเพื่อรับใบเสนอราคาแบบกำหนดเอง
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Measurement Form */}
          <Card className="bg-white rounded-lg shadow-xl p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                ขนาดและรายละเอียด
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="sofaType" className="mb-2">
                    ประเภทโซฟา *
                  </Label>
                  <Select
                    value={measurements.sofaType}
                    onValueChange={(value) => setMeasurements({ ...measurements, sofaType: value })}
                    required
                  >
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="เลือกประเภทโซฟาของคุณ" />
                    </SelectTrigger>
                    <SelectContent>
                      {sofaTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} (เริ่มต้น ฿{Math.round(type.basePrice * 35)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fabricType" className="mb-2">
                    ประเภทผ้า *
                  </Label>
                  <Select value={selectedFabric} onValueChange={setSelectedFabric} required>
                    <SelectTrigger className="w-full p-3">
                      <SelectValue placeholder="เลือกประเภทผ้า" />
                    </SelectTrigger>
                    <SelectContent>
                      {fabricTypes.map((fabric) => (
                        <SelectItem key={fabric.value} value={fabric.value}>
                          {fabric.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width" className="mb-2">
                      ความกว้าง (นิ้ว) *
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      value={measurements.width}
                      onChange={(e) => setMeasurements({ ...measurements, width: e.target.value })}
                      placeholder="เช่น 84"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="depth" className="mb-2">
                      ความลึก (นิ้ว) *
                    </Label>
                    <Input
                      id="depth"
                      type="number"
                      value={measurements.depth}
                      onChange={(e) => setMeasurements({ ...measurements, depth: e.target.value })}
                      placeholder="เช่น 36"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="height" className="mb-2">
                      ความสูงโดยรวม (นิ้ว)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={measurements.height}
                      onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                      placeholder="เช่น 32"
                    />
                  </div>
                  <div>
                    <Label htmlFor="armHeight" className="mb-2">
                      ความสูงที่วางแขน (นิ้ว)
                    </Label>
                    <Input
                      id="armHeight"
                      type="number"
                      value={measurements.armHeight}
                      onChange={(e) => setMeasurements({ ...measurements, armHeight: e.target.value })}
                      placeholder="เช่น 24"
                    />
                  </div>
                  <div>
                    <Label htmlFor="backHeight" className="mb-2">
                      ความสูงพนักพิง (นิ้ว)
                    </Label>
                    <Input
                      id="backHeight"
                      type="number"
                      value={measurements.backHeight}
                      onChange={(e) => setMeasurements({ ...measurements, backHeight: e.target.value })}
                      placeholder="เช่น 32"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="additionalNotes" className="mb-2">
                    หมายเหตุเพิ่มเติม
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    value={measurements.additionalNotes}
                    onChange={(e) => setMeasurements({ ...measurements, additionalNotes: e.target.value })}
                    rows={4}
                    placeholder="ความต้องการพิเศษ, คุณสมบัติที่ผิดปกติ, หรือคำถาม..."
                  />
                </div>

                {estimatedPrice > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <h3 className="text-2xl font-bold text-blue-900 mb-2">ราคาประมาณการ: ฿{estimatedPrice}</h3>
                    <p className="text-blue-700 text-sm">
                      นี่คือราคาประมาณการเบื้องต้น ราคาจริงจะได้รับการยืนยันหลังจากตรวจสอบรายละเอียดของคุณ
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center text-lg"
                  disabled={!measurements.sofaType || !selectedFabric || !measurements.width || !measurements.depth}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  รับใบเสนอราคาผ่าน Facebook
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right Column: Measurement Guide & Additional Info */}
          <div className="space-y-8">
            <Card className="bg-white rounded-lg shadow-xl p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">วิธีวัดขนาดโซฟาของคุณ</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-6">
                  <div>
                    <img
                      src="/sofa-measurement-guide.png"
                      alt="คู่มือการวัดขนาดโซฟา"
                      className="w-full rounded-lg mb-4 shadow-md"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">ความกว้าง</h3>
                      <p className="text-gray-600">วัดจากด้านนอกของที่วางแขนด้านหนึ่งไปยังด้านนอกของที่วางแขนอีกด้านหนึ่ง</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">ความลึก</h3>
                      <p className="text-gray-600">วัดจากขอบด้านหน้าของเบาะนั่งไปจนถึงด้านหลังสุดของโซฟา</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">ความสูง</h3>
                      <p className="text-gray-600">วัดจากพื้นถึงจุดที่สูงที่สุดของพนักพิง</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border border-green-200 rounded-lg shadow-xl p-6">
              <CardTitle className="text-xl font-semibold text-green-900 mb-3 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                ต้องการความช่วยเหลือในการวัดขนาด?
              </CardTitle>
              <CardContent className="p-0">
                <p className="text-green-700 mb-4">
                  ทีมงานของเราสามารถแนะนำคุณตลอดกระบวนการวัดขนาดผ่านวิดีโอคอล หรือให้คำแนะนำโดยละเอียด
                </p>
                <Button
                  onClick={() => {
                    const message = "สวัสดีครับ! ผมต้องการความช่วยเหลือในการวัดขนาดโซฟาสำหรับผ้าคลุมแบบพิเศษครับ"
                    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
                    window.open(facebookUrl, "_blank")
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  รับความช่วยเหลือในการวัดขนาด
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-lg shadow-xl p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-xl font-bold text-gray-900">สิ่งที่คุณจะได้รับ</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    รับประกันความพอดี 100%
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    ผ้าพรีเมียมที่คุณเลือก
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    การตัดเย็บโดยช่างมืออาชีพ
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    คำแนะนำการติดตั้งที่ง่ายดาย
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    ระยะเวลาผลิต 7-10 วันทำการ
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                    จัดส่งฟรีสำหรับคำสั่งซื้อเกิน ฿3,500
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
