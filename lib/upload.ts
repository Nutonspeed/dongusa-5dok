"use client"

import { useState } from "react"

import { supabase } from "./supabase"

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export const uploadService = {
  // Upload single file
  async uploadFile(file: File, bucket = "images", folder = ""): Promise<UploadResult> {
    try {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
      if (!allowedTypes.includes(file.type)) {
        throw new Error("ประเภทไฟล์ไม่ถูกต้อง กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น")
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error("ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB")
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split(".").pop()
      const fileName = `${timestamp}_${randomString}.${fileExtension}`

      // Create file path
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        throw new Error(`การอัปโหลดไฟล์ล้มเหลว: ${error.message}`)
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath)

      return {
        url: publicUrl,
        path: filePath,
      }
    } catch (error) {
      console.error("Upload error:", error)
      return {
        url: "",
        path: "",
        error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลดไฟล์",
      }
    }
  },

  // Upload multiple files
  async uploadMultipleFiles(files: File[], bucket = "images", folder = ""): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, bucket, folder))
    return Promise.all(uploadPromises)
  },

  // Delete file
  async deleteFile(filePath: string, bucket = "images"): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath])

      if (error) {
        console.error("Delete error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Delete error:", error)
      return false
    }
  },

  // Get file URL
  getFileUrl(filePath: string, bucket = "images"): string {
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return publicUrl
  },

  // Resize image (client-side)
  async resizeImage(file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and resize image
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(resizedFile)
            } else {
              reject(new Error("Failed to resize image"))
            }
          },
          file.type,
          quality,
        )
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  },

  // Generate thumbnail
  async generateThumbnail(file: File, size = 200): Promise<File> {
    return this.resizeImage(file, size, size, 0.7)
  },

  // Validate image dimensions
  async validateImageDimensions(
    file: File,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()

      img.onload = () => {
        const { width, height } = img

        if (minWidth && width < minWidth) resolve(false)
        if (minHeight && height < minHeight) resolve(false)
        if (maxWidth && width > maxWidth) resolve(false)
        if (maxHeight && height > maxHeight) resolve(false)

        resolve(true)
      }

      img.onerror = () => resolve(false)
      img.src = URL.createObjectURL(file)
    })
  },

  // Get image metadata
  async getImageMetadata(file: File): Promise<{
    width: number
    height: number
    size: number
    type: string
    name: string
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          name: file.name,
        })
      }

      img.onerror = () => reject(new Error("Failed to load image metadata"))
      img.src = URL.createObjectURL(file)
    })
  },

  // Batch upload with progress tracking
  async batchUploadWithProgress(
    files: File[],
    bucket = "images",
    folder = "",
    onProgress?: (progress: number, currentFile: string) => void,
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    const total = files.length

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (onProgress) {
        onProgress((i / total) * 100, file.name)
      }

      const result = await this.uploadFile(file, bucket, folder)
      results.push(result)
    }

    if (onProgress) {
      onProgress(100, "เสร็จสิ้น")
    }

    return results
  },

  // Create storage buckets if they don't exist
  async initializeStorage() {
    try {
      const buckets = ["images", "documents", "avatars", "products"]

      for (const bucket of buckets) {
        const { data: existingBucket } = await supabase.storage.getBucket(bucket)

        if (!existingBucket) {
          await supabase.storage.createBucket(bucket, {
            public: true,
            allowedMimeTypes:
              bucket === "images" ? ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"] : undefined,
            fileSizeLimit: bucket === "images" ? 5242880 : 10485760, // 5MB for images, 10MB for others
          })
          console.log(`Created storage bucket: ${bucket}`)
        }
      }
    } catch (error) {
      console.error("Failed to initialize storage:", error)
    }
  },
}

// File upload hook for React components
export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadFiles = async (files: File[], bucket?: string, folder?: string) => {
    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const results = await uploadService.batchUploadWithProgress(files, bucket, folder, (progress, currentFile) => {
        setProgress(progress)
      })

      const failedUploads = results.filter((r) => r.error)
      if (failedUploads.length > 0) {
        setError(`${failedUploads.length} ไฟล์อัปโหลดไม่สำเร็จ`)
      }

      return results
    } catch (error) {
      setError(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลด")
      return []
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadFiles,
    uploading,
    progress,
    error,
    clearError: () => setError(null),
  }
}

// Image optimization utilities
export const imageUtils = {
  // Convert image to WebP format
  async convertToWebP(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now(),
              })
              resolve(webpFile)
            } else {
              reject(new Error("Failed to convert to WebP"))
            }
          },
          "image/webp",
          quality,
        )
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  },

  // Generate multiple sizes for responsive images
  async generateResponsiveSizes(file: File): Promise<{
    thumbnail: File
    small: File
    medium: File
    large: File
    original: File
  }> {
    const [thumbnail, small, medium, large] = await Promise.all([
      uploadService.resizeImage(file, 150, 150, 0.7),
      uploadService.resizeImage(file, 400, 300, 0.8),
      uploadService.resizeImage(file, 800, 600, 0.8),
      uploadService.resizeImage(file, 1200, 900, 0.9),
    ])

    return {
      thumbnail,
      small,
      medium,
      large,
      original: file,
    }
  },
}
