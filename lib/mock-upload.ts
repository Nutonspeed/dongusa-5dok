import { developmentConfig } from "./development-config"

// Upload types
export interface UploadedFile {
  id: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  url: string
  path: string
  uploadedAt: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
    [key: string]: any
  }
}

export interface UploadProgress {
  id: string
  filename: string
  progress: number
  status: "uploading" | "processing" | "completed" | "failed"
  error?: string
}

export interface UploadStatistics {
  totalFiles: number
  totalSize: number
  successfulUploads: number
  failedUploads: number
  byMimeType: Record<string, number>
  recentUploads: UploadedFile[]
}

// In-memory storage
let uploadedFiles: UploadedFile[] = []
const uploadProgress: Map<string, UploadProgress> = new Map()

// Utility functions
const generateId = () => Math.random().toString(36).substring(2, 15)

const simulateUploadProgress = async (
  progressId: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<boolean> => {
  const progress = uploadProgress.get(progressId)
  if (!progress) return false

  // Simulate upload progress
  for (let i = 0; i <= 100; i += Math.random() * 20 + 5) {
    const currentProgress = Math.min(i, 100)
    progress.progress = currentProgress
    progress.status = currentProgress === 100 ? "processing" : "uploading"

    if (onProgress) {
      onProgress({ ...progress })
    }

    if (currentProgress < 100) {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 100))
    }
  }

  // Simulate processing time
  progress.status = "processing"
  if (onProgress) {
    onProgress({ ...progress })
  }
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

  // Determine success/failure
  const success = Math.random() < developmentConfig.services.upload.successRate
  progress.status = success ? "completed" : "failed"
  progress.error = success ? undefined : "Simulated upload failure"

  if (onProgress) {
    onProgress({ ...progress })
  }

  return success
}

const generateMockUrl = (filename: string): string => {
  // Generate a mock URL that looks realistic
  const baseUrl = "https://mock-storage.example.com"
  const folder = new Date().toISOString().substring(0, 7) // YYYY-MM
  return `${baseUrl}/uploads/${folder}/${filename}`
}

const isValidFileType = (mimeType: string): boolean => {
  return developmentConfig.services.upload.allowedTypes.includes(mimeType)
}

const isValidFileSize = (size: number): boolean => {
  return size <= developmentConfig.services.upload.maxFileSize
}

// Mock Upload Service
export const mockUploadService = {
  // Upload single file
  async uploadFile(
    file: File,
    options?: {
      folder?: string
      onProgress?: (progress: UploadProgress) => void
    },
  ): Promise<UploadedFile> {
    // Validate file
    if (!isValidFileType(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }

    if (!isValidFileSize(file.size)) {
      throw new Error(`File size ${file.size} exceeds maximum allowed size`)
    }

    const uploadId = generateId()
    const filename = `${uploadId}_${file.name}`
    const folder = options?.folder || "general"
    const path = `${folder}/${filename}`

    // Initialize progress tracking
    const progress: UploadProgress = {
      id: uploadId,
      filename: file.name,
      progress: 0,
      status: "uploading",
    }
    uploadProgress.set(uploadId, progress)

    console.log("📁 [MOCK UPLOAD] Starting upload:", file.name)

    try {
      // Simulate upload process
      const success = await simulateUploadProgress(uploadId, options?.onProgress)

      if (!success) {
        throw new Error("Upload failed")
      }

      // Create uploaded file record
      const uploadedFile: UploadedFile = {
        id: uploadId,
        filename,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        url: generateMockUrl(filename),
        path,
        uploadedAt: new Date().toISOString(),
        metadata: await this.extractMetadata(file),
      }

      uploadedFiles.push(uploadedFile)
      uploadProgress.delete(uploadId)

      console.log("📁 [MOCK UPLOAD] ✅ Upload completed:", file.name)
      return uploadedFile
    } catch (error) {
      uploadProgress.delete(uploadId)
      console.log("📁 [MOCK UPLOAD] ❌ Upload failed:", file.name, error)
      throw error
    }
  },

  // Upload multiple files
  async uploadFiles(
    files: File[],
    options?: {
      folder?: string
      onProgress?: (fileId: string, progress: UploadProgress) => void
    },
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, {
        folder: options?.folder,
        onProgress: options?.onProgress ? (progress) => options.onProgress!(file.name, progress) : undefined,
      }),
    )

    const results = await Promise.allSettled(uploadPromises)

    const successful: UploadedFile[] = []
    const failed: string[] = []

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push(result.value)
      } else {
        failed.push(files[index].name)
      }
    })

    if (failed.length > 0) {
      console.log("📁 [MOCK UPLOAD] Some uploads failed:", failed)
    }

    return successful
  },

  // Extract metadata from file
  async extractMetadata(file: File): Promise<Record<string, any>> {
    const metadata: Record<string, any> = {}

    if (file.type.startsWith("image/")) {
      // Simulate image metadata extraction
      metadata.width = Math.floor(Math.random() * 2000) + 400
      metadata.height = Math.floor(Math.random() * 2000) + 400
      metadata.format = file.type.split("/")[1]
    } else if (file.type.startsWith("video/")) {
      // Simulate video metadata extraction
      metadata.duration = Math.floor(Math.random() * 300) + 10 // 10-310 seconds
      metadata.width = Math.floor(Math.random() * 1920) + 480
      metadata.height = Math.floor(Math.random() * 1080) + 360
    }

    return metadata
  },

  // Get uploaded files
  async getUploadedFiles(options?: {
    folder?: string
    limit?: number
    mimeType?: string
  }): Promise<UploadedFile[]> {
    let files = [...uploadedFiles]

    // Filter by folder
    if (options?.folder) {
      files = files.filter((file) => file.path.startsWith(options.folder!))
    }

    // Filter by mime type
    if (options?.mimeType) {
      files = files.filter((file) => file.mimeType.startsWith(options.mimeType!))
    }

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

    // Limit results
    if (options?.limit) {
      files = files.slice(0, options.limit)
    }

    return files
  },

  // Get file by ID
  async getFile(id: string): Promise<UploadedFile | null> {
    return uploadedFiles.find((file) => file.id === id) || null
  },

  // Delete file
  async deleteFile(id: string): Promise<boolean> {
    const index = uploadedFiles.findIndex((file) => file.id === id)
    if (index === -1) return false

    const file = uploadedFiles[index]
    uploadedFiles.splice(index, 1)

    console.log("📁 [MOCK UPLOAD] 🗑️ File deleted:", file.originalName)
    return true
  },

  // Get upload statistics
  async getUploadStatistics(): Promise<UploadStatistics> {
    const totalFiles = uploadedFiles.length
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0)
    const successfulUploads = uploadedFiles.length
    const failedUploads = 0 // In mock, failed uploads don't get stored

    // Group by mime type
    const byMimeType: Record<string, number> = {}
    uploadedFiles.forEach((file) => {
      const category = file.mimeType.split("/")[0]
      byMimeType[category] = (byMimeType[category] || 0) + 1
    })

    const recentUploads = await this.getUploadedFiles({ limit: 10 })

    return {
      totalFiles,
      totalSize,
      successfulUploads,
      failedUploads,
      byMimeType,
      recentUploads,
    }
  },

  // Clear all files
  async clearAllFiles(): Promise<void> {
    uploadedFiles = []
    uploadProgress.clear()
    console.log("🗑️ [MOCK UPLOAD] All files cleared")
  },

  // Seed sample files
  async seedSampleFiles(): Promise<void> {
    const sampleFiles: Omit<UploadedFile, "id">[] = [
      {
        filename: "sample_sofa_cover_1.jpg",
        originalName: "sofa-cover-beige.jpg",
        size: 245760, // ~240KB
        mimeType: "image/jpeg",
        url: generateMockUrl("sample_sofa_cover_1.jpg"),
        path: "products/sample_sofa_cover_1.jpg",
        uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        metadata: { width: 800, height: 600, format: "jpeg" },
      },
      {
        filename: "sample_sofa_cover_2.jpg",
        originalName: "sofa-cover-floral.jpg",
        size: 312480, // ~305KB
        mimeType: "image/jpeg",
        url: generateMockUrl("sample_sofa_cover_2.jpg"),
        path: "products/sample_sofa_cover_2.jpg",
        uploadedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        metadata: { width: 1024, height: 768, format: "jpeg" },
      },
      {
        filename: "catalog_2024.pdf",
        originalName: "product-catalog-2024.pdf",
        size: 2048000, // ~2MB
        mimeType: "application/pdf",
        url: generateMockUrl("catalog_2024.pdf"),
        path: "documents/catalog_2024.pdf",
        uploadedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      },
    ]

    for (const fileData of sampleFiles) {
      const file: UploadedFile = {
        ...fileData,
        id: generateId(),
      }
      uploadedFiles.push(file)
    }

    console.log("🌱 [MOCK UPLOAD] Sample files seeded")
  },

  // Utility function to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B"

    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  },

  // Get storage stats for demo panel
  async getStorageStats() {
    const stats = await this.getUploadStatistics()
    return {
      totalFiles: stats.totalFiles,
      totalSize: stats.totalSize,
      formattedSize: this.formatFileSize(stats.totalSize),
      byType: stats.byMimeType,
      recent: stats.recentUploads.slice(0, 5).map((file) => ({
        id: file.id,
        name: file.originalName,
        size: this.formatFileSize(file.size),
        type: file.mimeType,
        uploadedAt: file.uploadedAt,
      })),
    }
  },

  // Initialize with sample files if needed
  async initialize(): Promise<void> {
    if (uploadedFiles.length === 0) {
      await this.seedSampleFiles()
    }
  },
}

// Auto-initialize
if (developmentConfig.services.upload.useMock) {
  mockUploadService.initialize().catch(console.error)
}
