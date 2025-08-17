"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  url: string
  filename: string
  path: string
  collection: string
  category: string
  size: number
  type: string
  uploadedAt: string
}

interface FabricUploadSystemProps {
  onUploadComplete?: (files: UploadedFile[]) => void
  maxFiles?: number
  collections?: string[]
  categories?: string[]
}

export function FabricUploadSystem({
  onUploadComplete,
  maxFiles = 10,
  collections = ["premium", "standard", "luxury", "custom"],
  categories = ["fabric", "pattern", "texture", "sample"],
}: FabricUploadSystemProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedCollection, setSelectedCollection] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const { toast } = useToast()

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || [])

      if (selectedFiles.length + files.length > maxFiles) {
        toast({
          title: "ไฟล์เกินจำนวนที่กำหนด",
          description: `สามารถอัปโหลดได้สูงสุด ${maxFiles} ไฟล์`,
          variant: "destructive",
        })
        return
      }

      setFiles((prev) => [...prev, ...selectedFiles])
    },
    [files.length, maxFiles, toast],
  )

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "ไม่มีไฟล์ที่จะอัปโหลด",
        description: "กรุณาเลือกไฟล์ก่อนทำการอัปโหลด",
        variant: "destructive",
      })
      return
    }

    if (!selectedCollection || !selectedCategory) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาเลือกคอลเลกชันและหมวดหมู่",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setProgress(0)
    const uploaded: UploadedFile[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)
        formData.append("collection", selectedCollection)
        formData.append("category", selectedCategory)

        const response = await fetch("/api/fabric/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "การอัปโหลดล้มเหลว")
        }

        const result = await response.json()
        uploaded.push(result)
        setProgress(((i + 1) / files.length) * 100)
      }

      setUploadedFiles((prev) => [...prev, ...uploaded])
      setFiles([])
      onUploadComplete?.(uploaded)

      toast({
        title: "อัปโหลดสำเร็จ",
        description: `อัปโหลดลายผ้า ${uploaded.length} ไฟล์เรียบร้อยแล้ว`,
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "การอัปโหลดล้มเหลว",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            ระบบอัปโหลดลายผ้า
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Collection and Category Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="collection">คอลเลกชัน</Label>
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกคอลเลกชัน" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection} value={collection}>
                      {collection.charAt(0).toUpperCase() + collection.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">หมวดหมู่</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="files">เลือกไฟล์ลายผ้า</Label>
            <Input
              id="files"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <p className="text-sm text-muted-foreground">
              รองรับไฟล์ JPEG, PNG, WebP ขนาดไม่เกิน 10MB ต่อไฟล์ (สูงสุด {maxFiles} ไฟล์)
            </p>
          </div>

          {/* Selected Files Preview */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>ไฟล์ที่เลือก ({files.length})</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>กำลังอัปโหลด...</Label>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={uploadFiles}
            disabled={uploading || files.length === 0 || !selectedCollection || !selectedCategory}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังอัปโหลด...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                อัปโหลดลายผ้า ({files.length} ไฟล์)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ไฟล์ที่อัปโหลดแล้ว ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="space-y-2">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                      src={file.url || "/placeholder.svg"}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate">{file.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.collection} • {file.category}
                    </p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
