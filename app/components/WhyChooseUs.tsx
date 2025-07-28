"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Truck, Clock, Award, Users, Headphones, CheckCircle, Star } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "คุณภาพพรีเมียม",
    description: "ผ้าคุณภาพสูง ทนทาน กันน้ำ และง่ายต่อการดูแล",
    color: "bg-blue-500",
    stats: "รับประกัน 2 ปี",
  },
  {
    icon: Truck,
    title: "จัดส่งรวดเร็ว",
    description: "จัดส่งทั่วประเทศ 2-3 วัน พร้อมบริการติดตั้งถึงบ้าน",
    color: "bg-green-500",
    stats: "ฟรีจัดส่ง >฿1,000",
  },
  {
    icon: Clock,
    title: "บริการ 24/7",
    description: "ทีมงานพร้อมให้คำปรึกษาและดูแลลูกค้าตลอด 24 ชั่วโมง",
    color: "bg-purple-500",
    stats: "ตอบกลับใน 5 นาที",
  },
  {
    icon: Award,
    title: "ช่างผู้เชี่ยวชาญ",
    description: "ทีมช่างมืออาชีพ ประสบการณ์กว่า 10 ปี",
    color: "bg-orange-500",
    stats: "ช่าง 50+ คน",
  },
  {
    icon: Users,
    title: "ลูกค้าพึงพอใจ",
    description: "ลูกค้ากว่า 10,000+ คน ให้ความไว้วางใจ",
    color: "bg-pink-500",
    stats: "4.9/5 ดาว",
  },
  {
    icon: Headphones,
    title: "หลังการขาย",
    description: "บริการหลังการขาย ดูแลและซ่อมแซมตลอดอายุการใช้งาน",
    color: "bg-indigo-500",
    stats: "บริการฟรี 1 ปี",
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              ความเป็นเลิศ
            </Badge>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            ทำไมต้องเลือก <span className="text-blue-600">โซฟาคัฟเวอร์โปร?</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            เรามุ่งมั่นที่จะให้ผ้าคลุมโซฟาคุณภาพสูงสุด พร้อมบริการที่เหนือความคาดหมาย เพื่อให้คุณได้รับประสบการณ์ที่ดีที่สุด
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
            >
              <CardContent className="p-8">
                {/* Icon */}
                <div
                  className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {feature.stats}
                    </Badge>
                  </div>

                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>

                {/* Hover Effect */}
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">10K+</div>
              <div className="text-sm text-gray-600">ลูกค้าพอใจ</div>
              <div className="flex items-center justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-sm text-gray-600">ลายผ้าให้เลือก</div>
              <div className="text-xs text-gray-500">อัปเดตใหม่ทุกเดือน</div>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-600">บริการลูกค้า</div>
              <div className="text-xs text-gray-500">ตอบกลับเร็วใน 5 นาที</div>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">2 ปี</div>
              <div className="text-sm text-gray-600">รับประกันคุณภาพ</div>
              <div className="text-xs text-gray-500">เปลี่ยนใหม่หากมีปัญหา</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
