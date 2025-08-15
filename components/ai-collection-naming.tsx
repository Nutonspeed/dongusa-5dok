"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, Copy, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AICollectionNamingProps {
  imageUrl?: string
  onNameSelected?: (name: { thai: string; english: string; reason: string; description: string }) => void
}

export function AICollectionNaming({ imageUrl, onNameSelected }: AICollectionNamingProps) {
  const [formData, setFormData] = useState({
    imageUrl: imageUrl || "",
    fabricType: "",
    style: "",
    colors: "",
    description: "",
  })
  const [suggestions, setSuggestions] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisType, setAnalysisType] = useState("comprehensive")
  const { toast } = useToast()

  const generateNames = async () => {
    if (!formData.imageUrl) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาใส่ URL รูปภาพ",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ai/collection-naming", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to generate names")
      }

      const data = await response.json()
      setSuggestions(data.suggestions)

      toast({
        title: "สร้างชื่อคอลเลกชันสำเร็จ",
        description: "AI ได้สร้างชื่อคอลเลกชันที่เหมาะสมแล้ว",
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างชื่อคอลเลกชันได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const analyzeFabric = async () => {
    if (!formData.imageUrl) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณาใส่ URL รูปภาพ",
        variant: "destructive",
      })
      return
    }

    setAnalysisLoading(true)
    try {
      const response = await fetch("/api/ai/fabric-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: formData.imageUrl,
          analysisType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze fabric")
      }

      const data = await response.json()
      setAnalysis(data.analysis)

      toast({
        title: "วิเคราะห์ผ้าสำเร็จ",
        description: "AI ได้วิเคราะห์ลายผ้าเรียบร้อยแล้ว",
      })
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถวิเคราะห์ผ้าได้",
        variant: "destructive",
      })
    } finally {
      setAnalysisLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "คัดลอกแล้ว",
      description: "คัดลอกข้อความไปยังคลิปบอร์ดแล้ว",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Collection Naming System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image URL Input */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL รูปภาพลายผ้า</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/fabric-image.jpg"
                className="flex-1"
              />
              {formData.imageUrl && (
                <Button variant="outline" size="sm" onClick={() => window.open(formData.imageUrl, "_blank")}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fabricType">ประเภทผ้า</Label>
              <Select
                value={formData.fabricType}
                onValueChange={(value) => setFormData({ ...formData, fabricType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทผ้า" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cotton">ผ้าฝ้าย</SelectItem>
                  <SelectItem value="linen">ผ้าลินิน</SelectItem>
                  <SelectItem value="velvet">ผ้ากำมะหยี่</SelectItem>
                  <SelectItem value="silk">ผ้าไหม</SelectItem>
                  <SelectItem value="polyester">ผ้าโพลีเอสเตอร์</SelectItem>
                  <SelectItem value="blend">ผ้าผสม</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="style">สไตล์</Label>
              <Select value={formData.style} onValueChange={(value) => setFormData({ ...formData, style: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสไตล์" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">โมเดิร์น</SelectItem>
                  <SelectItem value="classic">คลาสสิก</SelectItem>
                  <SelectItem value="vintage">วินเทจ</SelectItem>
                  <SelectItem value="minimal">มินิมอล</SelectItem>
                  <SelectItem value="luxury">หรูหรา</SelectItem>
                  <SelectItem value="casual">สบายๆ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="colors">สีหลัก</Label>
            <Input
              id="colors"
              value={formData.colors}
              onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
              placeholder="เช่น น้ำเงิน, ขาว, ทอง"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">คำอธิบายเพิ่มเติม</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="อธิบายลักษณะพิเศษของลายผ้า..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="naming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="naming">สร้างชื่อคอลเลกชัน</TabsTrigger>
          <TabsTrigger value="analysis">วิเคราะห์ผ้า</TabsTrigger>
        </TabsList>

        <TabsContent value="naming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>สร้างชื่อคอลเลกชัน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateNames} disabled={loading || !formData.imageUrl} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังสร้างชื่อ...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    สร้างชื่อคอลเลกชัน
                  </>
                )}
              </Button>

              {suggestions && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">ข้อเสนอแนะชื่อคอลเลกชัน</h3>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(suggestions)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{suggestions}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>วิเคราะห์ลายผ้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ประเภทการวิเคราะห์</Label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">วิเคราะห์ครอบคลุม</SelectItem>
                    <SelectItem value="pattern">วิเคราะห์ลาย</SelectItem>
                    <SelectItem value="color">วิเคราะห์สี</SelectItem>
                    <SelectItem value="style">วิเคราะห์สไตล์</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={analyzeFabric} disabled={analysisLoading || !formData.imageUrl} className="w-full">
                {analysisLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังวิเคราะห์...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    วิเคราะห์ผ้า
                  </>
                )}
              </Button>

              {analysis && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">ผลการวิเคราะห์</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{analysisType}</Badge>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(analysis)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
