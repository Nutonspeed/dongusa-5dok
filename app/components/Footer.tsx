"use client"

import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/app/contexts/LanguageContext"

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Us */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">เกี่ยวกับเรา</h3>
          <p className="text-sm leading-relaxed">
            เราคือผู้เชี่ยวชาญด้านผ้าคลุมโซฟาคุณภาพสูง ที่พร้อมเนรมิตโซฟาตัวโปรดของคุณให้กลับมาใหม่และสวยงามอีกครั้ง
            ด้วยประสบการณ์และความใส่ใจในทุกรายละเอียด
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">ลิงก์ด่วน</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/products" className="hover:text-pink-500 transition-colors">
                สินค้า
              </Link>
            </li>
            <li>
              <Link href="/custom-covers" className="hover:text-pink-500 transition-colors">
                สั่งทำพิเศษ
              </Link>
            </li>
            <li>
              <Link href="/fabric-gallery" className="hover:text-pink-500 transition-colors">
                แกลเลอรีผ้า
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-pink-500 transition-colors">
                เกี่ยวกับเรา
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-pink-500 transition-colors">
                ติดต่อเรา
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">ติดต่อเรา</h3>
          <ul className="space-y-3">
            <li className="flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-pink-500" />
              <p className="text-sm">123 ถนนสุขุมวิท, แขวงคลองเตย, เขตคลองเตย, กรุงเทพฯ 10110</p>
            </li>
            <li className="flex items-center">
              <Phone className="w-5 h-5 mr-3 text-pink-500" />
              <p className="text-sm">02-123-4567</p>
            </li>
            <li className="flex items-center">
              <Mail className="w-5 h-5 mr-3 text-pink-500" />
              <p className="text-sm">info@sofacovers.com</p>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">รับข่าวสาร</h3>
          <p className="text-sm mb-4">สมัครรับข่าวสารและโปรโมชั่นพิเศษจากเรา</p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="อีเมลของคุณ"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-pink-500"
            />
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">สมัคร</Button>
          </div>
          <div className="flex space-x-4 mt-6">
            <a href="#" aria-label="Facebook" className="hover:text-pink-500 transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-pink-500 transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-pink-500 transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" aria-label="Youtube" className="hover:text-pink-500 transition-colors">
              <Youtube className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} SofaCovers.com. All rights reserved.</p>
      </div>
    </footer>
  )
}
