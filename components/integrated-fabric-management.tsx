"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, Sparkles, Eye, Download, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FabricUploadSystem } from "./fabric-upload-system"
import { AICollectionNaming } from "./ai-collection-naming"

interface FabricItem {
  id: string
  url: string
  filename: string
  path: string
  collection: string
  category: string
  size: number
  type: string
  uploadedAt: string
  aiAnalysis?: {
    suggestions: string
    analysis: string
    generatedAt: string
  }
  collectionName?: {
    thai: string
    english: string
    reason: string
    description: string
  }
}

interface IntegratedFabricManagementProps {
  onFabricProcessed?: (fabric: FabricItem) => void
  autoAnalyze?: boolean
  autoName?: boolean
}

export function IntegratedFabricManagement({
  onFabricProcessed,
  autoAnalyze = true,
  autoName = true,
}: IntegratedFabricManagementProps) {
  const [fabricItems, setFabricItems] = useState<FabricItem[]>([])
  const [selectedFabric, setSelectedFabric] = useState<FabricItem | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)
  const { toast } = useToast()

  const handleUploadComplete = useCallback(
    async (uploadedFiles: any[]) => {
      setProcessing(true)
      setProcessingStep("กำลังประมวลผลไฟล์...")
      setProcessingProgress(0)

      const newFabricItems: FabricItem[] = []

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        setProcessingStep(`กำลังประมวลผลไฟล์ ${i + 1}/${uploadedFiles.length}: ${file.filename}`)
        setProcessingProgress((i / uploadedFiles.length) * 100)

        const fabricItem: FabricItem = {
          id: `fabric-${Date.now()}-${i}`,
          ...file,
        }

        // Auto-analyze if enabled
        if (autoAnalyze) {
          setProcessingStep(`กำลังวิเคราะห์ลายผ้า: ${file.filename}`)
          try {
            const analysisResponse = await fetch("/api/ai/fabric-analysis", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageUrl: file.url,
                analysisType: "comprehensive",
              }),
            })

            if (analysisResponse.ok) {
              const analysisData = await analysisResponse.json()
              fabricItem.aiAnalysis = analysisData
            }
          } catch (error) {
            console.error("Analysis failed:", error)
          }
        }

        // Auto-generate collection name if enabled
        if (autoName) {
          setProcessingStep(`กำลังสร้างชื่อคอลเลกชัน: ${file.filename}`)
          try {
            const namingResponse = await fetch("/api/ai/collection-naming", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                imageUrl: file.url,
                fabricType: file.category,
                style: file.collection,
                colors: "",
                description: fabricItem.aiAnalysis?.analysis || "",
              }),
            })

            if (namingResponse.ok) {
              const namingData = await namingResponse.json()
              // Parse the first suggestion from AI response
              const suggestions = namingData.suggestions
              const firstSuggestion = suggestions.split("\n").find((line: string) => line.includes("**ชื่อไทย**"))
              if (firstSuggestion) {
                const thaiMatch = firstSuggestion.match(/\*\*ชื่อไทย\*\*:\s*"([^"]+)"/)
                const englishMatch = firstSuggestion.match(/\*\*ชื่ออังกฤษ\*\*:\s*"([^"]+)"/)
                if (thaiMatch && englishMatch) {
                  fabricItem.collectionName = {
                    thai: thaiMatch[1],
                    english: englishMatch[1],
                    reason: "AI Generated",
                    description: "สร้างโดย AI จากการวิเคราะห์ลายผ้า",
                  }
                }
              }
            }
          } catch (error) {
            console.error("Naming failed:", error)
          }
        }

        newFabricItems.push(fabricItem)
        onFabricProcessed?.(fabricItem)
      }

      setFabricItems((prev) => [...prev, ...newFabricItems])
      setProcessingProgress(100)
      setProcessingStep("เสร็จสิ้น")

      toast({
        title: "ประมวลผลเสร็จสิ้น",
        description: `ประมวลผลลายผ้า ${newFabricItems.length} ไฟล์เรียบร้อยแล้ว`,
      })

      setTimeout(() => {
        setProcessing(false)
        setProcessingStep("")
        setProcessingProgress(0)
      }, 1000)
    },
    [autoAnalyze, autoName, onFabricProcessed, toast],
  )

  const processWithAI = async (fabric: FabricItem) => {
    setProcessing(true)
    setProcessingStep(`กำลังประมวลผล: ${fabric.filename}`)

    try {
      // Get AI analysis
      const analysisResponse = await fetch("/api/ai/fabric-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: fabric.url,
          analysisType: "comprehensive",
        }),
      })

      let analysisData = null
      if (analysisResponse.ok) {
        analysisData = await analysisResponse.json()
      }

      // Generate collection names
      const namingResponse = await fetch("/api/ai/collection-naming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: fabric.url,
          fabricType: fabric.category,
          style: fabric.collection,
          colors: "",
          description: analysisData?.analysis || "",
        }),
      })

      let namingData = null
      if (namingResponse.ok) {
        namingData = await namingResponse.json()
      }

      // Update fabric item
      setFabricItems((prev) =>
        prev.map((item) =>
          item.id === fabric.id
            ? {
                ...item,
                aiAnalysis: analysisData,
                collectionName: namingData
                  ? {
                      thai: "AI Generated Name",
                      english: "AI Generated Name",
                      reason: "AI Generated",
                      description: namingData.suggestions.substring(0, 100) + "...",
                    }
                  : undefined,
              }
            : item,
        ),
      )

      toast({
        title: "ประมวลผลสำเร็จ",
        description: "วิเคราะห์ลายผ้าและสร้างชื่อคอลเลกชันเรียบร้อยแล้ว",
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถประมวลผลด้วย AI ได้",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
      setProcessingStep("")
    }
  }

  const deleteFabric = async (fabric: FabricItem) => {
    try {
      // Delete from blob storage
      await fetch("/api/fabric/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fabric.url }),
      })

      setFabricItems((prev) => prev.filter((item) => item.id !== fabric.id))

      toast({
        title: "ลบเรียบร้อย",
        description: "ลบลายผ้าออกจากระบบแล้ว",
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบไฟล์ได้",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Processing Status */}
      {processing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{processingStep}</span>
                <span className="text-sm text-muted-foreground">{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">อัปโหลดลายผ้า</TabsTrigger>
          <TabsTrigger value="gallery">แกลเลอรี่ลายผ้า</TabsTrigger>
          <TabsTrigger value="ai-tools">เครื่องมือ AI</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <FabricUploadSystem
            onUploadComplete={handleUploadComplete}
            maxFiles={20}
            collections={["premium", "standard", "luxury", "custom", "seasonal"]}
            categories={["fabric", "pattern", "texture", "sample", "inspiration"]}
          />
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>แกลเลอรี่ลายผ้า ({fabricItems.length} ไฟล์)</CardTitle>
            </CardHeader>
            <CardContent>
              {fabricItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>ยังไม่มีลายผ้าในแกลเลอรี่</p>
                  <p className="text-sm">อัปโหลดลายผ้าเพื่อเริ่มต้นใช้งาน</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fabricItems.map((fabric) => (
                    <Card key={fabric.id} className="overflow-hidden">
                      <div className="aspect-square bg-muted overflow-hidden">
                        <img
                          src={fabric.url || "/placeholder.svg"}
                          alt={fabric.filename}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setSelectedFabric(fabric)}
                        />
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-medium truncate">{fabric.filename}</h3>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {fabric.collection}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {fabric.category}
                            </Badge>
                          </div>
                        </div>

                        {fabric.collectionName && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-primary">{fabric.collectionName.thai}</p>
                            <p className="text-xs text-muted-foreground">{fabric.collectionName.english}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => processWithAI(fabric)}
                            disabled={processing}
                          >
                            <Sparkles className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setSelectedFabric(fabric)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => window.open(fabric.url, "_blank")}>
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteFabric(fabric)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-tools" className="space-y-4">
          <AICollectionNaming
            imageUrl={selectedFabric?.url}
            onNameSelected={(name) => {
              if (selectedFabric) {
                setFabricItems((prev) =>
                  prev.map((item) => (item.id === selectedFabric.id ? { ...item, collectionName: name } : item)),
                )
                toast({
                  title: "บันทึกชื่อคอลเลกชัน",
                  description: "บันทึกชื่อคอลเลกชันที่เลือกเรียบร้อยแล้ว",
                })
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Fabric Detail Modal */}
      {selectedFabric && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedFabric.filename}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFabric(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedFabric.url || "/placeholder.svg"}
                    alt={selectedFabric.filename}
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">ข้อมูลไฟล์</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>คอลเลกชัน:</strong> {selectedFabric.collection}
                      </p>
                      <p>
                        <strong>หมวดหมู่:</strong> {selectedFabric.category}
                      </p>
                      <p>
                        <strong>ขนาด:</strong> {(selectedFabric.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p>
                        <strong>อัปโหลดเมื่อ:</strong> {new Date(selectedFabric.uploadedAt).toLocaleString("th-TH")}
                      </p>
                    </div>
                  </div>

                  {selectedFabric.collectionName && (
                    <div>
                      <h3 className="font-medium mb-2">ชื่อคอลเลกชัน</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>ไทย:</strong> {selectedFabric.collectionName.thai}
                        </p>
                        <p>
                          <strong>อังกฤษ:</strong> {selectedFabric.collectionName.english}
                        </p>
                        <p>
                          <strong>คำอธิบาย:</strong> {selectedFabric.collectionName.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedFabric.aiAnalysis && (
                    <div>
                      <h3 className="font-medium mb-2">การวิเคราะห์ AI</h3>
                      <div className="bg-muted p-3 rounded text-sm">
                        <pre className="whitespace-pre-wrap">{selectedFabric.aiAnalysis.analysis}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
