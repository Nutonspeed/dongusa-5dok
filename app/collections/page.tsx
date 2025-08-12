"use client"
import { logger } from '@/lib/logger';

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface Collection {
  slug: string
  nameTH: string
  cover: string
  count: number
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const response = await fetch("/data/storefront/collections.json")
        const data = await response.json()
        setCollections(data)
      } catch (error) {
        logger.error("Failed to load collections:", error)
        toast.error("ไม่สามารถโหลดคอลเลกชันได้")
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-600">กำลังโหลดคอลเลกชัน...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-rose-800 mb-4">เลือกคอลเลกชันผ้า</h1>
          <p className="text-xl text-rose-600 max-w-3xl mx-auto">
            เลือกคอลเลกชันผ้าที่คุณชื่นชอบ แล้วค้นหาลายผ้าที่เหมาะกับโซฟาของคุณ
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link key={collection.slug} href={`/collections/${collection.slug}`} className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/50">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={
                      collection.cover ||
                      `/placeholder.svg?height=300&width=400&query=${collection.nameTH} fabric collection`
                    }
                    alt={collection.nameTH}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-rose-800">{collection.nameTH}</h3>
                    <span className="text-sm text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
                      {collection.count} ลาย
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-rose-600">ดูลายผ้าทั้งหมด</span>
                    <ArrowRight className="w-5 h-5 text-rose-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {collections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-rose-600 text-lg">ไม่พบคอลเลกชันผ้า</p>
          </div>
        )}
      </div>
    </div>
  )
}
