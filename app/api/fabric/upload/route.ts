import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const collection = (formData.get("collection") as string) || "general"
    const category = (formData.get("category") as string) || "fabric"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type for fabric patterns
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "ประเภทไฟล์ไม่ถูกต้อง กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPEG, PNG, WebP)",
        },
        { status: 400 },
      )
    }

    // Validate file size (max 10MB for high-quality fabric patterns)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 10MB",
        },
        { status: 400 },
      )
    }

    // Generate organized file path for fabric collections
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop()
    const fileName = `${collection}/${category}/${timestamp}_${randomString}.${fileExtension}`

    // Upload to Vercel Blob with fabric-specific metadata
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      path: fileName,
      collection,
      category,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Fabric upload error:", error)
    return NextResponse.json({ error: "การอัปโหลดลายผ้าล้มเหลว" }, { status: 500 })
  }
}
