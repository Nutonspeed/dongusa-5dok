"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Grid,
  List,
  EyeOff,
  MoreHorizontal,
  FolderPlus,
  FileImage,
} from "lucide-react"
import Image from "next/image"
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
  thumbnail?: string
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
  colors: string[]
  material: string
  dimensions: string
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
    thumbnail: "/placeholder-15r1g.png",
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
    thumbnail: "/classic-fabric-patterns.png",
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
    colors: ["#87CEEB", "#4682B4", "#FFFFFF"],
    material: "Cotton Blend",
    dimensions: "150x200 cm",
  },
  {
    id: "FAB-002",
    name: "ลายทางสีเทา",
    collectionId: "COL-002",
    collectionName: "คอลเลกชั่นคลาสสิก",
    imageUrl: "/placeholder-fjq8q.png",
    description: "ลายทางสีเทาสไตล์โมเดิร์น",
    price: 1800,
    sku: "CLAS-001",
    isVisible: true,
    tags: ["ทาง", "สีเทา", "โมเดิร์น"],
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-18"),
    colors: ["#808080", "#D3D3D3", "#FFFFFF"],
    material: "Polyester",
    dimensions: "140x180 cm",
  },
]

export default function AdvancedFabricManagementDashboard() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [collections, setCollections] = useState<FabricCollection[]>(mockCollections)
  const [fabrics, setFabrics] = useState<FabricPattern[]>(mockFabrics)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([])
  const [showCreateCollection, setShowCreateCollection] = useState(false)
  const [showCreateFabric, setShowCreateFabric] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

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
    material: "",
    dimensions: "",
    colors: "",
  })

  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesSearch =
      fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCollection = selectedCollection === "all" || fabric.collectionId === selectedCollection
    return matchesSearch && matchesCollection
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    await handleFileUpload(files)
  }, [])

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("collection", "general")
      formData.append("category", "fabric")

      try {
        const response = await fetch("/api/fabric/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const uploadedFile = await response.json()

          const newFabric: FabricPattern = {
            id: `FAB-${Date.now()}-${i}`,
            name: file.name.replace(/\.[^/.]+$/, ""),
            collectionId: "COL-001",
            collectionName: "คอลเลกชั่นพรีเมียม",
            imageUrl: uploadedFile.url,
            description: "อัปโหลดใหม่",
            price: 0,
            sku: `AUTO-${Date.now()}`,
            isVisible: false,
            tags: ["ใหม่"],
            createdAt: new Date(),
            updatedAt: new Date(),
            colors: [],
            material: "ไม่ระบุ",
            dimensions: "ไม่ระบุ",
          }

          setFabrics((prev) => [...prev, newFabric])
        }
      } catch (error) {
        console.error("Upload failed:", error)
      }

      setUploadProgress(((i + 1) / files.length) * 100)
    }

    setIsUploading(false)
    toast({
      title: "อัปโหลดสำเร็จ",
      description: `อัปโหลดไฟล์ ${files.length} ไฟล์เรียบร้อยแล้ว`,
    })
  }

  const createCollection = () => {
    const collection: FabricCollection = {
      id: `COL-${String(collections.length + 1).padStart(3, "0")}`,
      ...newCollection,
      slug: newCollection.name.toLowerCase().replace(/\s+/g, "-"),
      createdAt: new Date(),
      updatedAt: new Date(),
      fabricCount: 0,
      thumbnail: `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(newCollection.name)}`,
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
      imageUrl: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(newFabric.name)}`,
      tags: newFabric.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      colors: newFabric.colors
        .split(",")
        .map((color) => color.trim())
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
      material: "",
      dimensions: "",
      colors: "",
    })

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

  const toggleFabricSelection = (fabricId: string) => {
    setSelectedFabrics((prev) => (prev.includes(fabricId) ? prev.filter((id) => id !== fabricId) : [...prev, fabricId]))
  }

  const selectAllFabrics = () => {
    setSelectedFabrics(filteredFabrics.map((f) => f.id))
  }

  const clearSelection = () => {
    setSelectedFabrics([])
  }

  const bulkDelete = () => {
    setFabrics((prev) => prev.filter((f) => !selectedFabrics.includes(f.id)))
    setSelectedFabrics([])
    toast({
      title: "ลบสำเร็จ",
      description: `ลบลายผ้า ${selectedFabrics.length} รายการแล้ว`,
    })
  }

  const bulkToggleVisibility = (visible: boolean) => {
    setFabrics((prev) =>
      prev.map((f) => (selectedFabrics.includes(f.id) ? { ...f, isVisible: visible, updatedAt: new Date() } : f)),
    )
    setSelectedFabrics([])
    toast({
      title: "อัปเดตสำเร็จ",
      description: `อัปเดตสถานะ ${selectedFabrics.length} รายการแล้ว`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-admin-fabric-gradient">จัดการแกเลอรี่ผ้า</h1>
          <p className="text-muted-foreground mt-1">จัดการคอลเลกชั่นและลายผ้าทั้งหมดอย่างมีประสิทธิภาพ</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Dialog open={showCreateCollection} onOpenChange={setShowCreateCollection}>
            <DialogTrigger asChild>
              <Button variant="outline" className="admin-fabric-shadow bg-transparent">
                <FolderPlus className="w-4 h-4 mr-2" />
                เพิ่มคอลเลกชั่น
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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
                  <Checkbox
                    id="collectionVisible"
                    checked={newCollection.isVisible}
                    onCheckedChange={(checked) => setNewCollection({ ...newCollection, isVisible: !!checked })}
                  />
                  <Label htmlFor="collectionVisible">แสดงในหน้าเว็บ</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateCollection(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={createCollection} className="bg-primary hover:bg-primary/90">
                    สร้างคอลเลกชั่น
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateFabric} onOpenChange={setShowCreateFabric}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 admin-fabric-shadow">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มลายผ้า
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>เพิ่มลายผ้าใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                  <div>
                    <Label htmlFor="fabricMaterial">วัสดุ</Label>
                    <Input
                      id="fabricMaterial"
                      value={newFabric.material}
                      onChange={(e) => setNewFabric({ ...newFabric, material: e.target.value })}
                      placeholder="เช่น Cotton, Polyester"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fabricTags">แท็ก (คั่นด้วยจุลภาค)</Label>
                    <Input
                      id="fabricTags"
                      value={newFabric.tags}
                      onChange={(e) => setNewFabric({ ...newFabric, tags: e.target.value })}
                      placeholder="เช่น ดอกไม้, สีฟ้า, พรีเมียม"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fabricColors">สี (คั่นด้วยจุลภาค)</Label>
                    <Input
                      id="fabricColors"
                      value={newFabric.colors}
                      onChange={(e) => setNewFabric({ ...newFabric, colors: e.target.value })}
                      placeholder="เช่น #FF0000, #00FF00, #0000FF"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fabricVisible"
                    checked={newFabric.isVisible}
                    onCheckedChange={(checked) => setNewFabric({ ...newFabric, isVisible: !!checked })}
                  />
                  <Label htmlFor="fabricVisible">แสดงในหน้าเว็บ</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateFabric(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={createFabric} className="bg-primary hover:bg-primary/90">
                    เพิ่มลายผ้า
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Upload Zone */}
      <Card className="admin-fabric-shadow">
        <CardContent className="p-6">
          <div
            className={`fabric-upload-zone rounded-lg p-8 text-center ${dragOver ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFileUpload(Array.from(e.target.files))
                }
              }}
            />
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">อัปโหลดลายผ้า</h3>
            <p className="text-muted-foreground mb-4">ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
            <p className="text-sm text-muted-foreground">รองรับไฟล์ JPG, PNG, WebP ขนาดไม่เกิน 10MB</p>
            {isUploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">กำลังอัปโหลด... {Math.round(uploadProgress)}%</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Collections Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">คอลเลกชั่นทั้งหมด</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="fabric-card-interactive admin-fabric-shadow">
              <CardContent className="p-4">
                <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden relative">
                  <Image src={collection.thumbnail || "/placeholder.svg"} alt={collection.name} fill className="object-cover" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{collection.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={collection.isVisible ? "default" : "secondary"}>
                        {collection.isVisible ? "แสดง" : "ซ่อน"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{collection.fabricCount} ลายผ้า</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="admin-fabric-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="ค้นหาลายผ้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="เลือกคอลเลกชั่น" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกคอลเลกชั่น</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      {/* Bulk Actions Bar */}
      {selectedFabrics.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bulk-action-bar rounded-lg px-6 py-3 flex items-center gap-4">
            <span className="text-sm font-medium">เลือกแล้ว {selectedFabrics.length} รายการ</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => bulkToggleVisibility(true)}>
                <Eye className="w-4 h-4 mr-1" />
                แสดง
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulkToggleVisibility(false)}>
                <EyeOff className="w-4 h-4 mr-1" />
                ซ่อน
              </Button>
              <Button size="sm" variant="destructive" onClick={bulkDelete}>
                <Trash2 className="w-4 h-4 mr-1" />
                ลบ
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                ยกเลิก
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Fabrics Display */}
      <Card className="admin-fabric-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ลายผ้าทั้งหมด ({filteredFabrics.length})</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={selectAllFabrics}>
                เลือกทั้งหมด
              </Button>
              <Button size="sm" variant="outline" onClick={clearSelection}>
                ยกเลิกการเลือก
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFabrics.map((fabric) => (
                <div key={fabric.id} className="fabric-card-interactive border rounded-lg overflow-hidden">
            <div className="aspect-square bg-muted relative">
              <Image src={fabric.imageUrl || "/placeholder.svg"} alt={fabric.name} fill className="object-cover" />
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedFabrics.includes(fabric.id)}
                        onCheckedChange={() => toggleFabricSelection(fabric.id)}
                        className="bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant={fabric.isVisible ? "default" : "secondary"} className="text-xs">
                        {fabric.isVisible ? "แสดง" : "ซ่อน"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{fabric.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{fabric.collectionName}</p>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{fabric.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-primary">{fabric.price.toLocaleString()} บาท</span>
                      <span className="text-xs text-muted-foreground">{fabric.sku}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {fabric.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {fabric.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{fabric.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-destructive hover:text-destructive bg-transparent"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">
                      <Checkbox
                        checked={selectedFabrics.length === filteredFabrics.length && filteredFabrics.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            selectAllFabrics()
                          } else {
                            clearSelection()
                          }
                        }}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">รูปภาพ</th>
                    <th className="text-left py-3 px-4 font-semibold">ชื่อ</th>
                    <th className="text-left py-3 px-4 font-semibold">คอลเลกชั่น</th>
                    <th className="text-left py-3 px-4 font-semibold">ราคา</th>
                    <th className="text-left py-3 px-4 font-semibold">รหัส</th>
                    <th className="text-left py-3 px-4 font-semibold">สถานะ</th>
                    <th className="text-left py-3 px-4 font-semibold">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFabrics.map((fabric) => (
                    <tr key={fabric.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <Checkbox
                          checked={selectedFabrics.includes(fabric.id)}
                          onCheckedChange={() => toggleFabricSelection(fabric.id)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 relative rounded overflow-hidden">
                          <Image src={fabric.imageUrl || "/placeholder.svg"} alt={fabric.name} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <h4 className="font-semibold">{fabric.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{fabric.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">{fabric.collectionName}</td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-primary">{fabric.price.toLocaleString()} บาท</span>
                      </td>
                      <td className="py-4 px-4">{fabric.sku}</td>
                      <td className="py-4 px-4">
                        <Badge variant={fabric.isVisible ? "default" : "secondary"}>
                          {fabric.isVisible ? "แสดง" : "ซ่อน"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
              <FileImage className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">ไม่พบลายผ้า</h3>
              <p className="text-muted-foreground">ลองเปลี่ยนคำค้นหาหรือตัวกรองดู</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
