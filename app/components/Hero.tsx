"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Shield, Truck, Clock } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-pink-50 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=400')] bg-repeat opacity-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Star className="w-3 h-3 mr-1 fill-current" />
                ผู้เชี่ยวชาญอันดับ 1
              </Badge>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <span>4.9/5 จาก 2,500+ รีวิว</span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                เปลี่ยนโฉม
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">
                  พื้นที่นั่งเล่น
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-lg">
                ผ้าคลุมโซฟาพรีเมียมที่ปกป้องและเพิ่มความสวยงามให้เฟอร์นิเจอร์ของคุณ หาคุณสีสันด้วยความแม่นยำ จัดส่งรวดเร็ว ใสใจ
              </p>
            </div>

            {/* Feature Points */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">คุณภาพพรีเมียม</h3>
                <p className="text-xs text-gray-600 mt-1">วัสดุคุณภาพ</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">จัดส่งรวดเร็ว</h3>
                <p className="text-xs text-gray-600 mt-1">จัดส่ง 2-3 วัน</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">ดีลเลอร์มาตรฐาน</h3>
                <p className="text-xs text-gray-600 mt-1">ให้บริการ 24/7</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  ช้อปเลย
                </Button>
              </Link>
              <Link href="/custom-covers">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-gray-300 hover:bg-gray-50 bg-transparent"
                >
                  สั่งทำพิเศษ
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">ลูกค้าพอใจ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">ลายผ้า</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">บริการ</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1753730407887.jpg-zNiqK3ORdtjj4ROXOsK8K5lfzYLF0Z.jpeg"
                alt="ผ้าคลุมโซฟาสวยงาม"
                className="w-full h-auto rounded-2xl shadow-2xl"
                loading="eager"
              />
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-60 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
