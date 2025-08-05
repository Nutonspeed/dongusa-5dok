"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Ruler, Palette, WashingMachineIcon as SewingMachine } from "lucide-react"
import { useLanguage } from "@/app/contexts/LanguageContext"

export default function CustomCoverSection() {
  const { t } = useLanguage()

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{t("custom-cover-section.title")}</h2>
            <p className="text-lg text-gray-600 mb-8">
              ไม่ว่าโซฟาของคุณจะมีขนาดหรือรูปทรงแบบไหน เราก็สามารถสร้างผ้าคลุมที่พอดีเป๊ะให้คุณได้ เลือกผ้าและดีไซน์ที่คุณต้องการ
              แล้วให้เราเนรมิตโซฟาตัวโปรดของคุณให้กลับมาใหม่!
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <Ruler className="w-6 h-6 text-pink-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-xl">วัดขนาดง่ายๆ</h3>
                  <p className="text-gray-600">ทำตามคู่มือการวัดของเรา หรือให้ทีมงานช่วยแนะนำผ่านวิดีโอคอล</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Palette className="w-6 h-6 text-pink-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-xl">เลือกผ้าและสี</h3>
                  <p className="text-gray-600">มีผ้าหลากหลายชนิดและสีสันให้เลือก เพื่อให้เข้ากับสไตล์บ้านของคุณ</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <SewingMachine className="w-6 h-6 text-pink-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-xl">ตัดเย็บโดยผู้เชี่ยวชาญ</h3>
                  <p className="text-gray-600">ช่างฝีมือของเราจะตัดเย็บผ้าคลุมให้พอดีกับโซฟาของคุณอย่างแม่นยำ</p>
                </div>
              </div>
            </div>

            <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700 text-white">
              <Link href="/custom-covers">
                {t("custom-cover-section.get-quote")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Right Image */}
          <div className="relative">
            <img
              src="/modern-living-room-sofa-covers.png"
              alt="โซฟาพร้อมผ้าคลุมสั่งทำพิเศษ"
              className="rounded-lg shadow-2xl w-full h-auto object-cover"
            />
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg text-center">
              <p className="text-2xl font-bold text-pink-600">฿3,500+</p>
              <p className="text-gray-600 text-sm">ราคาเริ่มต้น</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
