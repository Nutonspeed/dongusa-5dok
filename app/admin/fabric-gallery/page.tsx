"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Plus, Search, Eye, Edit, Trash2, Grid, List, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FabricCollection {
  id: string
  name: string
  slug: string
  description: string
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
  fabricCount: number
}

interface FabricPattern {
  id: string
  name: string
  collectionId: string
  collectionName: string
  imageUrl: string
  description: string
  price: number
  sku: string
  isVisible: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const mockCollections: FabricCollection[] = [
  {
    id: "COL-001",
    name: "คอลเลกชั่นพรีเมียม",
    slug: "premium-collection",
    description: "ผ้าคุณภาพสูงสำหรับลูกค้าพิเศษ",
    isVisible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    fabricCount: 12,
  },
  {
    id: "COL-002",
    name: "คอลเลกชั่นคลาสสิก",
    slug: "classic-collection",
    description: "ลายผ้าคลาสสิกที่เป็นที่นิยม",
    isVisible: true,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-20"),
    fabricCount: 8,
  },
]

const mockFabrics: FabricPattern[] = [
  {
    id: "FAB-001",
    name: "ลายดอกไม้สีฟ้า",
    collectionId: "COL-001",
    collectionName: "คอลเลกชั่นพรีเมียม",
    imageUrl: "/blue-floral-fabric.png",
    description: "ลายดอกไม้สีฟ้าอ่อน เหมาะสำหรับห้องนั่งเล่น",
    price: 2500,
    sku: "PREM-001",
    isVisible: true,
    tags: ["ดอกไม้", "สีฟ้า", "พรีเมียม"],
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "FAB-002",
    name: "ลายทางสีเทา",
    collectionId: "COL-002",
    collectionName: "คอลเลกชั่นคลาสสิก",
    imageUrl: "/gray-stripe-fabric.png",
    description: "ลายทางสีเทาสไตล์โมเดิร์น",
    price: 1800,
    sku: "CLAS-001",
    isVisible: true,
    tags: ["ทาง", "สีเทา", "โมเดิร์น"],
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-18"),
  },
]

export default function FabricGalleryManagement() {
  const { toast } = useToast()
  const [collections, setCollections] = useState<FabricCollection[]>(mockCollections)
  const [fabrics, setFabrics] = useState<FabricPattern[]>(mockFabrics)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [showCreateCollection, setShowCreateCollection] = useState(false)
  const [showCreateFabric, setShowCreateFabric] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const [newCollection, setNewCollection] = useState({
    name: "",
    slug: "",
    description: "",
    isVisible: true,
  })

  const [newFabric, setNewFabric] = useState({
    name: "",
    collectionId: "",
    description: "",
    price: 0,
    sku: "",
    isVisible: true,
    tags: "",
  })

  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesSearch =
      fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCollection = selectedCollection === "all" || fabric.collectionId === selectedCollection
    return matchesSearch && matchesCollection
  })

  const createCollection = () => {
    const collection: FabricCollection = {
      id: `COL-${String(collections.length + 1).padStart(3, "0")}`,
      ...newCollection,
      slug: newCollection.name.toLowerCase().replace(/\s+/g, "-"),
      createdAt: new Date(),
      updatedAt: new Date(),
      fabricCount: 0,
    }

    setCollections([...collections, collection])
    setShowCreateCollection(false)
    setNewCollection({ name: "", slug: "", description: "", isVisible: true })

    toast({
      title: "สร้างคอลเลกชั่นสำเร็จ",
      description: `คอลเลกชั่น "${collection.name}" ถูกสร้างแล้ว`,
    })
  }

  const createFabric = () => {
    const fabric: FabricPattern = {
      id: `FAB-${String(fabrics.length + 1).padStart(3, "0")}`,
      ...newFabric,
      collectionName: collections.find((c) => c.id === newFabric.collectionId)?.name || "",
      imageUrl: `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(newFabric.name)}`,
      tags: newFabric.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setFabrics([...fabrics, fabric])
    setShowCreateFabric(false)
    setNewFabric({
      name: "",
      collectionId: "",
      description: "",
      price: 0,
      sku: "",
      isVisible: true,
      tags: "",
    })

    // Update collection fabric count
    setCollections(
      collections.map((col) =>
        col.id === newFabric.collectionId ? { ...col, fabricCount: col.fabricCount + 1 } : col,
      ),
    )

    toast({
      title: "เพิ่มลายผ้าสำเร็จ",
      description: `ลายผ้า "${fabric.name}" ถูกเพิ่มแล้ว`,
    })
  }

  const toggleVisibility = (type: "collection" | "fabric", id: string) => {
    if (type === "collection") {
      setCollections(
        collections.map((col) => (col.id === id ? { ...col, isVisible: !col.isVisible, updatedAt: new Date() } : col)),
      )
    } else {
      setFabrics(
        fabrics.map((fab) => (fab.id === id ? { ...fab, isVisible: !fab.isVisible, updatedAt: new Date() } : fab)),
      )
    }

    toast({
      title: "อัปเดตสถานะสำเร็จ",
      description: "เปลี่ยนสถานะการแสดงผลแล้ว",
    })
  }

  const deleteItem = (type: "collection" | "fabric", id: string) => {
    if (type === "collection") {
      setCollections(collections.filter((col) => col.id !== id))
      setFabrics(fabrics.filter((fab) => fab.collectionId !== id))
    } else {
      const fabric = fabrics.find((f) => f.id === id)
      setFabrics(fabrics.filter((fab) => fab.id !== id))
      if (fabric) {
        setCollections(
          collections.map((col) =>
            col.id === fabric.collectionId ? { ...col, fabricCount: Math.max(0, col.fabricCount - 1) } : col,
          ),
        )
      }
    }

    toast({
      title: "ลบสำเร็จ",
      description: "รายการถูกลบแล้ว",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-burgundy-800">จัดการแกเลอรี่ผ้า</h1>
          <p className="text-gray-600 mt-1">จัดการคอลเลกชั่นและลายผ้าทั้งหมด</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Dialog open={showCreateCollection} onOpenChange={setShowCreateCollection}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มคอลเลกชั่น
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>สร้างคอลเลกชั่นใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="collectionName">ชื่อคอลเลกชั่น</Label>
                  <Input
                    id="collectionName"
                    value={newCollection.name}
                    onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                    placeholder="ชื่อคอลเลกชั่น"
                  />
                </div>
                <div>
                  <Label htmlFor="collectionDesc">คำอธิบาย</Label>
                  <Textarea
                    id="collectionDesc"
                    value={newCollection.description}
                    onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                    placeholder="คำอธิบายคอลเลกชั่น"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="collectionVisible"
                    checked={newCollection.isVisible}
                    onChange={(e) => setNewCollection({ ...newCollection, isVisible: e.target.checked })}
                  />
                  <Label htmlFor="collectionVisible">แสดงในหน้าเว็บ</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateCollection(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={createCollection} className="bg-burgundy-600 hover:bg-burgundy-700">
                    สร้างคอลเลกชั่น
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateFabric} onOpenChange={setShowCreateFabric}>
            <DialogTrigger asChild>
              <Button className="bg-burgundy-600 hover:bg-burgundy-700">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มลายผ้า
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มลายผ้าใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fabricName">ชื่อลายผ้า</Label>
                  <Input
                    id="fabricName"
                    value={newFabric.name}
                    onChange={(e) => setNewFabric({ ...newFabric, name: e.target.value })}
                    placeholder="ชื่อลายผ้า"
                  />
                </div>
                <div>
                  <Label htmlFor="fabricCollection">คอลเลกชั่น</Label>
                  <Select
                    value={newFabric.collectionId}
                    onValueChange={(value) => setNewFabric({ ...newFabric, collectionId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกคอลเลกชั่น" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fabricPrice">ราคา (บาท)</Label>
                    <Input
                      id="fabricPrice"
                      type="number"
                      value={newFabric.price}
                      onChange={(e) => setNewFabric({ ...newFabric, price: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="ราคา"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fabricSku">รหัสสินค้า</Label>
                    <Input
                      id="fabricSku"
                      value={newFabric.sku}
                      onChange={(e) => setNewFabric({ ...newFabric, sku: e.target.value })}
                      placeholder="รหัสสินค้า"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fabricDesc">คำอธิบาย</Label>
                  <Textarea
                    id="fabricDesc"
                    value={newFabric.description}
                    onChange={(e) => setNewFabric({ ...newFabric, description: e.target.value })}
                    placeholder="คำอธิบายลายผ้า"
                  />
                </div>
                <div>
                  <Label htmlFor="fabricTags">แท็ก (คั่นด้วยจุลภาค)</Label>
                  <Input
                    id="fabricTags"
                    value={newFabric.tags}
                    onChange={(e) => setNewFabric({ ...newFabric, tags: e.target.value })}
                    placeholder="เช่น ดอกไม้, สีฟ้า, พรีเมียม"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fabricVisible"
                    checked={newFabric.isVisible}
                    onChange={(e) => setNewFabric({ ...newFabric, isVisible: e.target.checked })}
                  />
                  <Label htmlFor="fabricVisible">แสดงในหน้าเว็บ</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateFabric(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={createFabric} className="bg-burgundy-600 hover:bg-burgundy-700">
                    เพิ่มลายผ้า
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Collections Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <Card key={collection.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{collection.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={collection.isVisible ? "default" : "secondary"}>
                    {collection.isVisible ? "แสดง" : "ซ่อน"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => toggleVisibility("collection", collection.id)}>
                    {collection.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteItem("collection", collection.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{collection.description}</p>
              <p className="text-sm font-medium">{collection.fabricCount} ลายผ้า</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and View Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาลายผ้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500"
            >
              <option value="all">ทุกคอลเลกชั่น</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fabrics Display */}
      <Card>
        <CardHeader>
          <CardTitle>ลายผ้าทั้งหมด ({filteredFabrics.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFabrics.map((fabric) => (
                <div key={fabric.id} className="border rounded-lg overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={fabric.imageUrl || "/placeholder.svg"}
                      alt={fabric.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button variant="secondary" size="sm" onClick={() => toggleVisibility("fabric", fabric.id)}>
                        {fabric.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => deleteItem("fabric", fabric.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{fabric.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{fabric.collectionName}</p>
                    <p className="text-sm text-gray-500 mb-2">{fabric.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-burgundy-600">{fabric.price.toLocaleString()} บาท</span>
                      <Badge variant={fabric.isVisible ? "default" : "secondary"}>
                        {fabric.isVisible ? "แสดง" : "ซ่อน"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {fabric.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">รูปภาพ</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ชื่อ</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">คอลเลกชั่น</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ราคา</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">รหัส</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">สถานะ</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFabrics.map((fabric) => (
                    <tr key={fabric.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <img
                          src={fabric.imageUrl || "/placeholder.svg"}
                          alt={fabric.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{fabric.name}</h4>
                          <p className="text-sm text-gray-500">{fabric.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">{fabric.collectionName}</td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-burgundy-600">{fabric.price.toLocaleString()} บาท</span>
                      </td>
                      <td className="py-4 px-4">{fabric.sku}</td>
                      <td className="py-4 px-4">
                        <Badge variant={fabric.isVisible ? "default" : "secondary"}>
                          {fabric.isVisible ? "แสดง" : "ซ่อน"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => toggleVisibility("fabric", fabric.id)}>
                            {fabric.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteItem("fabric", fabric.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredFabrics.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบลายผ้า</h3>
              <p className="text-gray-600">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
