"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Save, Eye, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"

interface Collection {
  slug: string
  nameTH: string
  cover: string
  count: number
  enabled?: boolean
  order?: number
}

interface Fabric {
  id: string
  collection: string
  nameTH: string
  image: string
  enabled?: boolean
  order?: number
}

interface HomepageBlock {
  id: string
  type: "banner" | "featured_collection" | "text"
  title?: string
  content?: string
  image?: string
  collectionSlug?: string
  enabled?: boolean
  order?: number
}

export default function StorefrontManagerPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [homepageBlocks, setHomepageBlocks] = useState<HomepageBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("collections")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Load data on component mount
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [collectionsRes, fabricsRes] = await Promise.all([
        fetch("/data/storefront/collections.json").catch(() => ({ json: () => [] })),
        fetch("/data/storefront/fabrics.json").catch(() => ({ json: () => [] })),
      ])

      const collectionsData = await collectionsRes.json()
      const fabricsData = await fabricsRes.json()

      setCollections(
        collectionsData.map((c: Collection, index: number) => ({
          ...c,
          enabled: c.enabled ?? true,
          order: c.order ?? index,
        })),
      )
      setFabrics(
        fabricsData.map((f: Fabric, index: number) => ({
          ...f,
          enabled: f.enabled ?? true,
          order: f.order ?? index,
        })),
      )

      // Mock homepage blocks
      setHomepageBlocks([
        {
          id: "hero-banner",
          type: "banner",
          title: "แบนเนอร์หลัก",
          content: "ผ้าคลุมโซฟาคุณภาพสูง",
          image: "/hero-banner.jpg",
          enabled: true,
          order: 0,
        },
        {
          id: "featured-linen",
          type: "featured_collection",
          title: "คอลเลกชันเด่น",
          collectionSlug: "linen",
          enabled: true,
          order: 1,
        },
      ])
    } catch (error) {
      console.error("Failed to load data:", error)
      toast.error("ไม่สามารถโหลดข้อมูลได้")
    } finally {
      setLoading(false)
    }
  }

  const validateData = (type: string, data: any): string[] => {
    const errors: string[] = []

    if (type === "collection") {
      if (!data.slug) errors.push("ต้องระบุ slug")
      if (!data.nameTH) errors.push("ต้องระบุชื่อภาษาไทย")
      if (!data.cover) errors.push("เตือน: ไม่มีรูปปก")

      // Check for duplicate slug
      const existingSlugs = collections.filter((c) => c.slug !== editingItem?.slug).map((c) => c.slug)
      if (existingSlugs.includes(data.slug)) {
        errors.push("slug ซ้ำกับที่มีอยู่แล้ว")
      }
    }

    if (type === "fabric") {
      if (!data.id) errors.push("ต้องระบุรหัสผ้า")
      if (!data.nameTH) errors.push("ต้องระบุชื่อภาษาไทย")
      if (!data.collection) errors.push("ต้องเลือกคอลเลกชัน")
      if (!data.image) errors.push("เตือน: ไม่มีรูปผ้า")
    }

    return errors
  }

  const saveData = async (type: "collections" | "fabrics" | "homepage") => {
    setSaving(true)
    try {
      let dataToSave: any
      let filename: string

      switch (type) {
        case "collections":
          dataToSave = collections.sort((a, b) => (a.order || 0) - (b.order || 0))
          filename = "collections.json"
          break
        case "fabrics":
          dataToSave = fabrics.sort((a, b) => (a.order || 0) - (b.order || 0))
          filename = "fabrics.json"
          break
        case "homepage":
          dataToSave = homepageBlocks.sort((a, b) => (a.order || 0) - (b.order || 0))
          filename = "homepage.json"
          break
      }

      // Mock save operation
      console.log(`Saving ${filename}:`, dataToSave)

      // Mock audit log
      const auditEntry = {
        timestamp: new Date().toISOString(),
        action: `save_${type}`,
        user: "admin",
        data: { filename, recordCount: dataToSave.length },
      }
      console.log("Audit log entry:", auditEntry)

      toast.success(`บันทึก ${filename} สำเร็จ`)
    } catch (error) {
      console.error("Save failed:", error)
      toast.error("บันทึกไม่สำเร็จ")
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    const previewUrl = `${window.location.origin}/?preview=1`
    window.open(previewUrl, "_blank")
    toast.success("เปิดหน้าพรีวิวแล้ว")
  }

  const moveItem = (items: any[], index: number, direction: "up" | "down") => {
    const newItems = [...items]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < newItems.length) {
      ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]

      // Update order values
      newItems.forEach((item, idx) => {
        item.order = idx
      })
    }

    return newItems
  }

  const openEditDialog = (item: any, type: string) => {
    setEditingItem({ ...item, _type: type })
    setIsDialogOpen(true)
  }

  const handleSaveItem = () => {
    if (!editingItem) return

    const errors = validateData(editingItem._type, editingItem)
    if (errors.length > 0) {
      toast.error(errors.join(", "))
      return
    }

    const { _type, ...itemData } = editingItem

    if (_type === "collection") {
      const existingIndex = collections.findIndex((c) => c.slug === itemData.slug)
      if (existingIndex >= 0) {
        const newCollections = [...collections]
        newCollections[existingIndex] = itemData
        setCollections(newCollections)
      } else {
        setCollections([...collections, { ...itemData, order: collections.length }])
      }
    } else if (_type === "fabric") {
      const existingIndex = fabrics.findIndex((f) => f.id === itemData.id)
      if (existingIndex >= 0) {
        const newFabrics = [...fabrics]
        newFabrics[existingIndex] = itemData
        setFabrics(newFabrics)
      } else {
        setFabrics([...fabrics, { ...itemData, order: fabrics.length }])
      }
    }

    setIsDialogOpen(false)
    setEditingItem(null)
    toast.success("บันทึกรายการสำเร็จ")
  }

  const deleteItem = (id: string, type: string) => {
    if (type === "collection") {
      setCollections(collections.filter((c) => c.slug !== id))
    } else if (type === "fabric") {
      setFabrics(fabrics.filter((f) => f.id !== id))
    }
    toast.success("ลบรายการสำเร็จ")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Storefront Manager</h1>
          <p className="text-gray-600">จัดการเนื้อหาหน้าบ้านโดยไม่ต้องแก้โค้ด</p>
        </div>
        <Button onClick={handlePreview} className="bg-green-600 hover:bg-green-700">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collections">Collections ({collections.length})</TabsTrigger>
          <TabsTrigger value="fabrics">Fabrics ({fabrics.length})</TabsTrigger>
          <TabsTrigger value="homepage">Homepage ({homepageBlocks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">จัดการคอลเลกชัน</h2>
            <div className="space-x-2">
              <Button onClick={() => openEditDialog({}, "collection")}>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มคอลเลกชัน
              </Button>
              <Button onClick={() => saveData("collections")} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ลำดับ</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>ชื่อไทย</TableHead>
                    <TableHead>จำนวนลาย</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((collection, index) => (
                    <TableRow key={collection.slug}>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCollections(moveItem(collections, index, "up"))}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCollections(moveItem(collections, index, "down"))}
                            disabled={index === collections.length - 1}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <span className="text-sm">{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{collection.slug}</TableCell>
                      <TableCell>{collection.nameTH}</TableCell>
                      <TableCell>{collection.count}</TableCell>
                      <TableCell>
                        <Badge variant={collection.enabled ? "default" : "secondary"}>
                          {collection.enabled ? "เปิด" : "ปิด"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(collection, "collection")}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteItem(collection.slug, "collection")}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fabrics" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">จัดการลายผ้า</h2>
            <div className="space-x-2">
              <Button onClick={() => openEditDialog({}, "fabric")}>
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มลายผ้า
              </Button>
              <Button onClick={() => saveData("fabrics")} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ลำดับ</TableHead>
                    <TableHead>รหัส</TableHead>
                    <TableHead>ชื่อไทย</TableHead>
                    <TableHead>คอลเลกชัน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fabrics.map((fabric, index) => (
                    <TableRow key={fabric.id}>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setFabrics(moveItem(fabrics, index, "up"))}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setFabrics(moveItem(fabrics, index, "down"))}
                            disabled={index === fabrics.length - 1}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <span className="text-sm">{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{fabric.id}</TableCell>
                      <TableCell>{fabric.nameTH}</TableCell>
                      <TableCell>{fabric.collection}</TableCell>
                      <TableCell>
                        <Badge variant={fabric.enabled ? "default" : "secondary"}>
                          {fabric.enabled ? "เปิด" : "ปิด"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(fabric, "fabric")}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteItem(fabric.id, "fabric")}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">จัดการหน้าแรก</h2>
            <Button onClick={() => saveData("homepage")} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>

          <div className="grid gap-4">
            {homepageBlocks.map((block, index) => (
              <Card key={block.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{block.title}</CardTitle>
                    <Badge variant={block.enabled ? "default" : "secondary"}>{block.enabled ? "เปิด" : "ปิด"}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">ประเภท: {block.type}</p>
                    {block.content && <p className="text-sm">{block.content}</p>}
                    {block.collectionSlug && <p className="text-sm">คอลเลกชัน: {block.collectionSlug}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem?._type === "collection" ? "แก้ไขคอลเลกชัน" : "แก้ไขลายผ้า"}</DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4">
              {editingItem._type === "collection" ? (
                <>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={editingItem.slug || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                      placeholder="linen"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameTH">ชื่อภาษาไทย</Label>
                    <Input
                      id="nameTH"
                      value={editingItem.nameTH || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, nameTH: e.target.value })}
                      placeholder="ผ้าลินิน"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cover">รูปปก (URL)</Label>
                    <Input
                      id="cover"
                      value={editingItem.cover || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, cover: e.target.value })}
                      placeholder="/linen-collection-cover.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="count">จำนวนลาย</Label>
                    <Input
                      id="count"
                      type="number"
                      value={editingItem.count || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, count: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="id">รหัสผ้า</Label>
                    <Input
                      id="id"
                      value={editingItem.id || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })}
                      placeholder="LN001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameTH">ชื่อภาษาไทย</Label>
                    <Input
                      id="nameTH"
                      value={editingItem.nameTH || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, nameTH: e.target.value })}
                      placeholder="ลินินขาวธรรมชาติ"
                    />
                  </div>
                  <div>
                    <Label htmlFor="collection">คอลเลกชัน</Label>
                    <Select
                      value={editingItem.collection || ""}
                      onValueChange={(value) => setEditingItem({ ...editingItem, collection: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกคอลเลกชัน" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection) => (
                          <SelectItem key={collection.slug} value={collection.slug}>
                            {collection.nameTH}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="image">รูปผ้า (URL)</Label>
                    <Input
                      id="image"
                      value={editingItem.image || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                      placeholder="/fabrics/linen-natural-white.jpg"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={editingItem.enabled ?? true}
                  onChange={(e) => setEditingItem({ ...editingItem, enabled: e.target.checked })}
                />
                <Label htmlFor="enabled">เปิดใช้งาน</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSaveItem}>บันทึก</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
