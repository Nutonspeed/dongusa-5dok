"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Star, Shield, Truck, MessageCircle, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "../contexts/LanguageContext"

export default function Hero() {
  const { language } = useLanguage()
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const handleGetQuote = () => {
    const message =
      language === "th"
        ? "สวัสดีครับ/ค่ะ! ผมสนใจผ้าคลุมโซฟาตัดตามขนาด ช่วยให้คำแนะนำและประเมินราคาให้หน่อยครับ/ค่ะ"
        : "Hello! I'm interested in custom sofa covers. Could you please provide advice and a price estimate?"

    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/modern-minimalist-fabric-pattern-1.png')] bg-repeat opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              {language === "th" ? "ผ้าคลุมโซฟาอันดับ 1 ในไทย" : "#1 Sofa Covers in Thailand"}
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {language === "th" ? (
                <>
                  ผ้าคลุมโซฟา
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                    ตัดตามขนาด
                  </span>
                  <br />
                  คุณภาพพรีเมียม
                </>
              ) : (
                <>
                  Premium
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                    Custom-Fit
                  </span>
                  <br />
                  Sofa Covers
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              {language === "th"
                ? "ปกป้องและเปลี่ยนโฉมโซฟาของคุณด้วยผ้าคลุมคุณภาพสูง ตัดตามขนาดพอดี พร้อมลายผ้าสวยงามกว่า 1,000 แบบ"
                : "Transform and protect your sofa with premium quality custom-fit covers. Choose from over 1,000 beautiful fabric patterns."}
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8">
              <div className="flex items-center text-gray-700">
                <Shield className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium">{language === "th" ? "รับประกัน 1 ปี" : "1 Year Warranty"}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Truck className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium">{language === "th" ? "จัดส่งฟรี" : "Free Delivery"}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium">{language === "th" ? "คะแนน 4.9/5" : "4.9/5 Rating"}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={handleGetQuote}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {language === "th" ? "ขอใบเสนอราคาฟรี" : "Get Free Quote"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Link href="/fabric-gallery">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold border-2 border-gray-300 hover:border-pink-500 hover:text-pink-600 transition-all duration-300 bg-white"
                >
                  {language === "th" ? "ดูลายผ้าทั้งหมด" : "Browse Fabrics"}
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                {language === "th" ? "ไว้วางใจโดยลูกค้ากว่า 10,000+ ราย" : "Trusted by 10,000+ customers"}
              </p>
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {language === "th" ? "จากรีวิว 2,847 รายการ" : "from 2,847 reviews"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Video */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
              {!isVideoPlaying ? (
                <div className="relative">
                  <img
                    src="/modern-living-room-sofa-covers.png"
                    alt={language === "th" ? "ผ้าคลุมโซฟาในห้องนั่งเล่น" : "Sofa covers in living room"}
                    className="w-full h-auto rounded-xl"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-xl">
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110"
                    >
                      <Play className="w-8 h-8 text-pink-600 ml-1" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video">
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="Sofa Cover Demo"
                    className="w-full h-full rounded-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              {language === "th" ? "ส่งฟรี!" : "Free Shipping!"}
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4 border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {language === "th" ? "รับประกันคุณภาพ" : "Quality Guarantee"}
                  </p>
                  <p className="text-xs text-gray-500">{language === "th" ? "ผลิตจากวัสดุพรีเมียม" : "Premium materials"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
