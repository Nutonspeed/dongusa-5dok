"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { dynamicConfig, useConfigCategory } from "@/lib/dynamic-config-system"
import type { ConfigField, ConfigCategory } from "@/lib/types/dynamic-config"
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Settings,
  DollarSign,
  Building,
  Palette,
  Bell,
  AlertTriangle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function DynamicConfigPage() {
  const [categories, setCategories] = useState<ConfigCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("pricing")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ConfigField | null>(null)
  const [newConfig, setNewConfig] = useState({
    key: "",
    value: "",
    type: "string" as ConfigField["type"],
    category: "pricing",
    description: "",
    validation: {
      required: false,
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      pattern: "",
      enum: [] as string[],
    },
  })

  const configs = useConfigCategory(selectedCategory)

  useEffect(() => {
    setCategories(dynamicConfig.getCategories())
  }, [])

  const handleAddConfig = async () => {
    try {
      let processedValue = newConfig.value

      // Process value based on type
      switch (newConfig.type) {
        case "number":
          processedValue = Number.parseFloat(newConfig.value)
          break
        case "boolean":
          processedValue = newConfig.value === "true"
          break
        case "json":
          processedValue = JSON.parse(newConfig.value)
          break
        case "array":
          processedValue = newConfig.value.split(",").map((v) => v.trim())
          break
        case "date":
          processedValue = new Date(newConfig.value)
          break
      }

      await dynamicConfig.setConfig(newConfig.key, processedValue, {
        category: newConfig.category,
        description: newConfig.description,
        validation: {
          required: newConfig.validation.required,
          min: newConfig.validation.min,
          max: newConfig.validation.max,
          pattern: newConfig.validation.pattern || undefined,
          enum: newConfig.validation.enum.length > 0 ? newConfig.validation.enum : undefined,
        },
        userId: "admin", // In real app, get from auth context
      })

      setIsAddDialogOpen(false)
      setNewConfig({
        key: "",
        value: "",
        type: "string",
        category: selectedCategory,
        description: "",
        validation: {
          required: false,
          min: undefined,
          max: undefined,
          pattern: "",
          enum: [],
        },
      })

      toast({
        title: "สำเร็จ",
        description: "เพิ่มการตั้งค่าใหม่เรียบร้อยแล้ว",
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถเพิ่มการตั้งค่าได้",
        variant: "destructive",
      })
    }
  }

  const handleUpdateConfig = async (config: ConfigField, newValue: any) => {
    try {
      await dynamicConfig.setConfig(config.key, newValue, {
        category: config.category,
        description: config.description,
        validation: config.validation,
        userId: "admin",
      })

      toast({
        title: "สำเร็จ",
        description: "อัปเดตการตั้งค่าเรียบร้อยแล้ว",
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถอัปเดตการตั้งค่าได้",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfig = async (key: string) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบการตั้งค่านี้?")) {
      try {
        dynamicConfig.deleteConfig(key, "admin")
        toast({
          title: "สำเร็จ",
          description: "ลบการตั้งค่าเรียบร้อยแล้ว",
        })
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบการตั้งค่าได้",
          variant: "destructive",
        })
      }
    }
  }

  const handleExport = () => {
    const data = dynamicConfig.exportConfig()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `config-export-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string
          dynamicConfig.importConfig(data, "admin")
          toast({
            title: "สำเร็จ",
            description: "นำเข้าการตั้งค่าเรียบร้อยแล้ว",
          })
        } catch (error) {
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไฟล์การตั้งค่าไม่ถูกต้อง",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "pricing":
        return <DollarSign className="h-4 w-4" />
      case "business":
        return <Building className="h-4 w-4" />
      case "features":
        return <Settings className="h-4 w-4" />
      case "ui":
        return <Palette className="h-4 w-4" />
      case "notifications":
        return <Bell className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const renderConfigValue = (config: ConfigField) => {
    switch (config.type) {
      case "boolean":
        return <Switch checked={config.value} onCheckedChange={(checked) => handleUpdateConfig(config, checked)} />
      case "number":
        return (
          <Input
            type="number"
            value={config.value}
            onChange={(e) => handleUpdateConfig(config, Number.parseFloat(e.target.value))}
            className="w-32"
          />
        )
      case "string":
        return (
          <Input value={config.value} onChange={(e) => handleUpdateConfig(config, e.target.value)} className="w-64" />
        )
      case "json":
      case "array":
        return (
          <Textarea
            value={typeof config.value === "string" ? config.value : JSON.stringify(config.value, null, 2)}
            onChange={(e) => {
              try {
                const parsed =
                  config.type === "array" ? e.target.value.split(",").map((v) => v.trim()) : JSON.parse(e.target.value)
                handleUpdateConfig(config, parsed)
              } catch (error) {
                // Handle parsing error
              }
            }}
            className="w-64 h-20"
          />
        )
      default:
        return <span>{String(config.value)}</span>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">การตั้งค่าแบบไดนามิก</h1>
          <p className="text-muted-foreground">จัดการการตั้งค่าต่างๆ ของระบบแบบเรียลไทม์</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            ส่งออก
          </Button>
          <Button variant="outline" asChild>
            <label>
              <Upload className="h-4 w-4 mr-2" />
              นำเข้า
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มการตั้งค่า
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>เพิ่มการตั้งค่าใหม่</DialogTitle>
                <DialogDescription>กรอกข้อมูลการตั้งค่าที่ต้องการเพิ่ม</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="key">คีย์</Label>
                    <Input
                      id="key"
                      value={newConfig.key}
                      onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                      placeholder="เช่น pricing.delivery_fee"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">ประเภท</Label>
                    <Select
                      value={newConfig.type}
                      onValueChange={(value: ConfigField["type"]) => setNewConfig({ ...newConfig, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">ข้อความ</SelectItem>
                        <SelectItem value="number">ตัวเลข</SelectItem>
                        <SelectItem value="boolean">จริง/เท็จ</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="array">อาร์เรย์</SelectItem>
                        <SelectItem value="date">วันที่</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">หมวดหมู่</Label>
                  <Select
                    value={newConfig.category}
                    onValueChange={(value) => setNewConfig({ ...newConfig, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">ค่า</Label>
                  <Input
                    id="value"
                    value={newConfig.value}
                    onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                    placeholder="ค่าที่ต้องการตั้ง"
                  />
                </div>
                <div>
                  <Label htmlFor="description">คำอธิบาย</Label>
                  <Textarea
                    id="description"
                    value={newConfig.description}
                    onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                    placeholder="อธิบายการใช้งานของการตั้งค่านี้"
                  />
                </div>
                <div className="space-y-2">
                  <Label>การตรวจสอบ</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newConfig.validation.required}
                      onCheckedChange={(checked) =>
                        setNewConfig({
                          ...newConfig,
                          validation: { ...newConfig.validation, required: checked },
                        })
                      }
                    />
                    <Label>จำเป็นต้องมีค่า</Label>
                  </div>
                  {(newConfig.type === "string" || newConfig.type === "number") && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>ค่าต่ำสุด</Label>
                        <Input
                          type="number"
                          value={newConfig.validation.min || ""}
                          onChange={(e) =>
                            setNewConfig({
                              ...newConfig,
                              validation: {
                                ...newConfig.validation,
                                min: e.target.value ? Number.parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>ค่าสูงสุด</Label>
                        <Input
                          type="number"
                          value={newConfig.validation.max || ""}
                          onChange={(e) =>
                            setNewConfig({
                              ...newConfig,
                              validation: {
                                ...newConfig.validation,
                                max: e.target.value ? Number.parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleAddConfig}>เพิ่ม</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {getCategoryIcon(category.id)}
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category.id)}
                  {category.name}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {configs.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>ยังไม่มีการตั้งค่าในหมวดหมู่นี้</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {configs.map((config) => (
                      <div key={config.key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm bg-muted px-2 py-1 rounded">{config.key}</code>
                            <Badge variant="secondary">{config.type}</Badge>
                            {config.validation?.required && (
                              <Badge variant="destructive" className="text-xs">
                                จำเป็น
                              </Badge>
                            )}
                          </div>
                          {config.description && (
                            <p className="text-sm text-muted-foreground mb-2">{config.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-medium">ค่า:</Label>
                            {renderConfigValue(config)}
                          </div>
                          {config.metadata && (
                            <div className="text-xs text-muted-foreground mt-2">
                              อัปเดตล่าสุด: {new Date(config.metadata.updatedAt).toLocaleString("th-TH")}
                              โดย {config.metadata.updatedBy}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setEditingConfig(config)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteConfig(config.key)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
