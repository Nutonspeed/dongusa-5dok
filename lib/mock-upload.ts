import { logger } from '@/lib/logger';
import { developmentConfig } from "./development-config"

// Upload types
export interface UploadedFile {
  id: string
  filename: string
  size: number
  type: string
  uploadedAt: string
  url: string
}

export interface UploadProgress {
  id: string
  filename: string
  progress: number
  status: "uploading" | "processing" | "completed" | "failed"
  error?: string
}

export interface UploadStats {
  totalFiles: number
  totalSize: number
  successfulUploads: number
  failedUploads: number
}

// In-memory storage
const uploadedFiles: UploadedFile[] = []
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
class MockUploadService {
  private files: UploadedFile[] = []
  private stats: UploadStats = {
    totalFiles: 0,
    totalSize: 0,
    successfulUploads: 0,
    failedUploads: 0,
  }

  async uploadFile(file: File): Promise<UploadedFile | null> {
    // Validate file
    if (!isValidFileType(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }

    if (!isValidFileSize(file.size)) {
      throw new Error(`File size ${file.size} exceeds maximum allowed size`)
    }

    const uploadId = generateId()
    const filename = `${uploadId}_${file.name}`
    const folder = "general"
    const path = `${folder}/${filename}`

    // Initialize progress tracking
    const progress: UploadProgress = {
      id: uploadId,
      filename: file.name,
      progress: 0,
      status: "uploading",
    }
    uploadProgress.set(uploadId, progress)

    logger.info("📁 [MOCK UPLOAD] Starting upload:", file.name)

    try {
      // Simulate upload process
      const success = await simulateUploadProgress(uploadId)

      if (!success) {
        throw new Error("Upload failed")
      }

      // Create uploaded file record
      const uploadedFile: UploadedFile = {
        id: uploadId,
        filename,
        size: file.size,
        type: file.type,
        url: generateMockUrl(filename),
        uploadedAt: new Date().toISOString(),
      }

      this.files.push(uploadedFile)
      this.stats.totalFiles++
      this.stats.totalSize += file.size
      this.stats.successfulUploads++

      logger.info("📁 [MOCK UPLOAD] ✅ Upload completed:", file.name)
      return uploadedFile
    } catch (error) {
      uploadProgress.delete(uploadId)
      logger.info("📁 [MOCK UPLOAD] ❌ Upload failed:", file.name, error)
      this.stats.failedUploads++
      throw error
    }
  }

  async getUploadStatistics(): Promise<UploadStats> {
    return this.stats
  }

  async getUploadedFiles(limit = 10): Promise<UploadedFile[]> {
    return this.files.slice(-limit).reverse()
  }

  async clearAllFiles(): Promise<void> {
    this.files = []
    this.stats = {
      totalFiles: 0,
      totalSize: 0,
      successfulUploads: 0,
      failedUploads: 0,
    }
    logger.info("🗑️ [MOCK UPLOAD] All files cleared")
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  async getFile(id: string): Promise<UploadedFile | null> {
    return this.files.find((file) => file.id === id) || null
  }

  async seedSampleFiles(): Promise<void> {
    const sampleFiles: Omit<UploadedFile, "id">[] = [
      {
        filename: "sample_sofa_cover_1.jpg",
        size: 245760, // ~240KB
        type: "image/jpeg",
        url: generateMockUrl("sample_sofa_cover_1.jpg"),
        uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        filename: "sample_sofa_cover_2.jpg",
        size: 312480, // ~305KB
        type: "image/jpeg",
        url: generateMockUrl("sample_sofa_cover_2.jpg"),
        uploadedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        filename: "catalog_2024.pdf",
        size: 2048000, // ~2MB
        type: "application/pdf",
        url: generateMockUrl("catalog_2024.pdf"),
        uploadedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      },
    ]

    for (const fileData of sampleFiles) {
      const file: UploadedFile = {
        ...fileData,
        id: generateId(),
      }
      this.files.push(file)
      this.stats.totalFiles++
      this.stats.totalSize += file.size
      this.stats.successfulUploads++
    }

    logger.info("🌱 [MOCK UPLOAD] Sample files seeded")
  }

  async initialize(): Promise<void> {
    if (developmentConfig.services.upload.useMock) {
      if (this.files.length === 0) {
        await this.seedSampleFiles()
      }
    }
  }
}

export const mockUploadService = new MockUploadService()

// Auto-initialize
if (developmentConfig.services.upload.useMock) {
  mockUploadService.initialize().catch(logger.error)
}
