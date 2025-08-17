"use client"
import { logger } from '@/lib/logger';

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Fabric {
  id: string
  collection: string
  nameTH: string
  image: string
}

interface Collection {
  slug: string
  nameTH: string
  cover: string
  count: number
}

export default function CollectionDetailPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()!

  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedFabric, setCopiedFabric] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fabricsResponse, collectionsResponse] = await Promise.all([
          fetch("/data/storefront/fabrics.json"),
          fetch("/data/storefront/collections.json"),
        ])

        const fabricsData = await fabricsResponse.json()
        const collectionsData = await collectionsResponse.json()

        const collectionData = collectionsData.find((c: Collection) => c.slug === slug)
        const collectionFabrics = fabricsData.filter((f: Fabric) => f.collection === slug)

        if (!collectionData) {
          toast.error("ไม่พบคอลเลกชันที่ระบุ")
          router.push("/collections")
          return
        }

        setCollection(collectionData)
        setFabrics(collectionFabrics)
      } catch (error) {
        logger.error("Failed to load data:", error)
        toast.error("ไม่สามารถโหลดข้อมูลได้")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug, router])

  const handleSelectFabric = (fabric: Fabric) => {
    const selectedFabric = {
      id: fabric.id,
      slug: fabric.collection,
    }

    localStorage.setItem("selectedFabric", JSON.stringify(selectedFabric))
    toast.success(`เลือกผ้า "${fabric.nameTH}" แล้ว`)
  }

  const handleCopyLink = async (fabricId: string) => {
    const currentUrl = window.location.href
    const linkWithFabric = `${currentUrl}?fabric=${fabricId}`

    try {
      await navigator.clipboard.writeText(linkWithFabric)
      setCopiedFabric(fabricId)
      toast.success("คัดลอกลิงก์แล้ว")

      setTimeout(() => {
        setCopiedFabric(null)
      }, 2000)
    } catch (error) {
      toast.error("ไม่สามารถคัดลอกลิงก์ได้")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-600">กำลังโหลดลายผ้า...</p>
        </div>
      </div>
    )
  }

  if (!collection) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/collections"
            className="inline-flex items-center text-rose-600 hover:text-rose-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            กลับไปคอลเลกชัน
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-rose-800 mb-2">{collection.nameTH}</h1>
            <p className="text-rose-600">{fabrics.length} ลายผ้าในคอลเลกชันนี้</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {fabrics.map((fabric) => (
            <div
              key={fabric.id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/50"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={fabric.image || `/placeholder.svg?height=300&width=300&query=${fabric.nameTH} fabric pattern`}
                  alt={fabric.nameTH}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4">
                <div className="text-center mb-3">
                  <p className="text-sm text-rose-600 font-medium">{fabric.id}</p>
                  <h3 className="text-lg font-semibold text-rose-800">{fabric.nameTH}</h3>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleSelectFabric(fabric)}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 px-4 rounded-xl transition-colors font-medium"
                  >
                    เลือกผ้านี้
                  </button>

                  <button
                    onClick={() => handleCopyLink(fabric.id)}
                    className="w-full bg-white/80 hover:bg-white text-rose-600 py-2 px-4 rounded-xl transition-colors font-medium border border-rose-200 flex items-center justify-center"
                  >
                    {copiedFabric === fabric.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        คัดลอกแล้ว
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        คัดลอกลิงก์
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {fabrics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-rose-600 text-lg">ไม่พบลายผ้าในคอลเลกชันนี้</p>
          </div>
        )}
      </div>
    </div>
  )
}
