"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowRight, Palette } from "lucide-react"

const fabricCollections = [
  {
    id: "modern-minimalist",
    name: "โมเดิร์นมินิมอล",
    description: "ลายเรียบง่าย เหมาะกับบ้านสไตล์โมเดิร์น",
    image: "/modern-minimalist-fabric-pattern-1.png",
    patterns: 24,
    colors: ["#F5F5F5", "#E8E8E8", "#D3D3D3", "#C0C0C0"],
    popular: true,
  },
  {
    id: "classic-elegant",
    name: "คลาสสิกหรูหรา",
    description: "ลายดั้งเดิมที่เหนือกาลเวลา",
    image: "/classic-elegant-fabric-pattern-1.png",
    patterns: 18,
    colors: ["#8B0000", "#000080", "#006400", "#4B0082"],
    popular: false,
  },
  {
    id: "bohemian-chic",
    name: "โบฮีเมียนชิค",
    description: "ลายเก๋ไก๋ สีสันสดใส",
    image: "/bohemian-chic-fabric-pattern-1.png",
    patterns: 15,
    colors: ["#CD853F", "#DEB887", "#F4A460", "#D2691E"],
    popular: false,
  },
]

export default function FabricCollections() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCollections = fabricCollections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Palette className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">คอลเลกชันผ้า</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            สำรวจคอลเลกชันผ้าพรีเมียมที่คัดสรรมาแล้ว เพื่อให้เข้ากับสไตล์การตกแต่งของคุณ
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="ค้นหาคอลเลกชัน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredCollections.map((collection) => (
            <Card
              key={collection.id}
              className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Collection Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Popular Badge */}
                  {collection.popular && (
                    <Badge className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                      ยอดนิยม
                    </Badge>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Quick View Button */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button className="w-full bg-white text-gray-900 hover:bg-gray-100">
                      ดูลายทั้งหมด
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Collection Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{collection.name}</h3>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {collection.patterns} ลาย
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">{collection.description}</p>

                  {/* Color Palette */}
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-sm font-medium text-gray-700">สีที่มี:</span>
                    <div className="flex space-x-2">
                      {collection.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: color }}
                          title={`สี ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Link href={`/fabric-collections/${collection.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        ดูลายทั้งหมด
                      </Button>
                    </Link>
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      รับใบเสนอราคา
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredCollections.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบคอลเลกชันที่ค้นหา</h3>
            <p className="text-gray-600 mb-4">ลองค้นหาด้วยคำอื่น หรือดูคอลเลกชันทั้งหมด</p>
            <Button onClick={() => setSearchQuery("")} variant="outline">
              ดูทั้งหมด
            </Button>
          </div>
        )}

        {/* View All Collections */}
        {filteredCollections.length > 0 && (
          <div className="text-center">
            <Link href="/fabric-collections">
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                ดูคอลเลกชันทั้งหมด
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
