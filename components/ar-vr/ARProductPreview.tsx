"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  Camera,
  RotateCcw,
  Move3D,
  Maximize,
  Target,
  Eye,
  Settings,
  Download,
  Share,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react"
import { arvrEngine, type ARSession, type ARPlacementResult } from "@/lib/ar-vr-engine"
import { FEATURE_FLAGS } from "@/lib/runtime"

interface ARProductPreviewProps {
  productId: string
  productName: string
  onPlacementComplete?: (result: ARPlacementResult) => void
}

export default function ARProductPreview({ productId, productName, onPlacementComplete }: ARProductPreviewProps) {
  const [arSession, setArSession] = useState<ARSession | null>(null)
  const [isARActive, setIsARActive] = useState(false)
  const [placementResult, setPlacementResult] = useState<ARPlacementResult | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [loading, setLoading] = useState(false)
  const [trackingStatus, setTrackingStatus] = useState<"initializing" | "tracking" | "lost">("initializing")
  const [productPosition, setProductPosition] = useState({ x: 0, y: 0, z: -2 })
  const [productRotation, setProductRotation] = useState({ x: 0, y: 0, z: 0 })
  const [productScale, setProductScale] = useState({ x: 1, y: 1, z: 1 })
  const [isARPreviewEnabled, setIsARPreviewEnabled] = useState(true)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    checkARSupport()
    checkARPreviewFeatureFlag()
  }, [])

  useEffect(() => {
    if (arSession) {
      // Simulate tracking updates
      const interval = setInterval(() => {
        const session = arvrEngine.getARSession(arSession.id)
        if (session) {
          setTrackingStatus(session.tracking_data.surface_detected ? "tracking" : "initializing")
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [arSession])

  const checkARSupport = () => {
    const hasWebRTC = "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices
    const hasWebGL = !!document.createElement("canvas").getContext("webgl")
    const hasDeviceOrientation = "DeviceOrientationEvent" in window

    setIsSupported(hasWebRTC && hasWebGL && hasDeviceOrientation)
  }

  const checkARPreviewFeatureFlag = async () => {
    try {
      const response = await fetch("/api/admin/feature-flags")
      if (response.ok) {
        const flags = await response.json()
        setIsARPreviewEnabled(flags.arPreview && flags.previewMode)
      }
    } catch (error) {
      console.error("Error checking AR preview feature flag:", error)
      // Default to enabled if can't check
      setIsARPreviewEnabled(FEATURE_FLAGS.arPreview && FEATURE_FLAGS.previewMode)
    }
  }

  const startARSession = async () => {
    try {
      setLoading(true)
      const sessionId = await arvrEngine.startARSession(productId, "user_123", "living_room", "furniture_placement")
      const session = arvrEngine.getARSession(sessionId)

      if (session && session.camera_stream) {
        setArSession(session)
        setIsARActive(true)

        // Set up video stream
        if (videoRef.current) {
          videoRef.current.srcObject = session.camera_stream
          videoRef.current.play()
        }
      }
    } catch (error) {
      console.error("Error starting AR session:", error)
    } finally {
      setLoading(false)
    }
  }

  const stopARSession = () => {
    if (arSession) {
      arvrEngine.endARSession(arSession.id)
      setArSession(null)
      setIsARActive(false)
      setTrackingStatus("initializing")
      setPlacementResult(null)
    }
  }

  const placeProduct = async () => {
    if (!arSession) return

    try {
      const result = await arvrEngine.placeProductInAR(arSession.id, productPosition, productRotation, productScale)
      setPlacementResult(result)
      onPlacementComplete?.(result)
    } catch (error) {
      console.error("Error placing product:", error)
    }
  }

  const captureScreenshot = async () => {
    if (!arSession) return

    try {
      const screenshotUrl = await arvrEngine.captureARScreenshot(arSession.id)
      // Handle screenshot (e.g., show download link)
      console.log("Screenshot captured:", screenshotUrl)
    } catch (error) {
      console.error("Error capturing screenshot:", error)
    }
  }

  const resetProductPosition = () => {
    setProductPosition({ x: 0, y: 0, z: -2 })
    setProductRotation({ x: 0, y: 0, z: 0 })
    setProductScale({ x: 1, y: 1, z: 1 })
  }

  const getTrackingStatusColor = () => {
    switch (trackingStatus) {
      case "tracking":
        return "text-green-600 bg-green-50 border-green-200"
      case "initializing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "lost":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getPlacementQualityColor = (quality: ARPlacementResult["placement_quality"]) => {
    switch (quality) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200"
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "fair":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "poor":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  if (!isARPreviewEnabled) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Eye className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>ฟีเจอร์ AR Preview ถูกปิดใช้งาน</strong> กรุณาติดต่อผู้ดูแลระบบเพื่อเปิดใช้งานฟีเจอร์นี้
        </AlertDescription>
      </Alert>
    )
  }

  if (!isSupported) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>ไม่รองรับ AR</strong> อุปกรณ์ของคุณไม่รองรับฟีเจอร์ Augmented Reality กรุณาใช้อุปกรณ์ที่รองรับ WebRTC และ WebGL
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary flex items-center justify-center gap-3">
          <Eye className="w-6 h-6" />
          AR Product Preview
        </h2>
        <p className="text-gray-600 mt-1">ลองใส่ {productName} ในห้องของคุณแบบ Virtual</p>
      </div>

      {!isARActive ? (
        /* AR Start Screen */
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-10 h-10 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">เริ่มต้นประสบการณ์ AR</h3>
                <p className="text-gray-600 mb-4">ดูว่า {productName} จะเข้ากับห้องของคุณได้อย่างไร</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>วางสินค้าในห้องจริง</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>ปรับขนาดและมุมมอง</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>ลองสีและลวดลายต่างๆ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>ถ่ายภาพและแชร์</span>
                  </div>
                </div>
              </div>
              <Button size="lg" onClick={startARSession} disabled={loading} className="w-full max-w-xs">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>กำลังเริ่มต้น...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    <span>เริ่ม AR Experience</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* AR Active Interface */
        <div className="space-y-4">
          {/* AR Viewport */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

              {/* AR Overlay UI */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Tracking Status */}
                <div className="absolute top-4 left-4">
                  <Badge className={getTrackingStatusColor()}>
                    <Target className="w-3 h-3 mr-1" />
                    {trackingStatus === "tracking" && "กำลังติดตาม"}
                    {trackingStatus === "initializing" && "กำลังเริ่มต้น"}
                    {trackingStatus === "lost" && "สูญเสียการติดตาม"}
                  </Badge>
                </div>

                {/* Instructions */}
                <div className="absolute top-4 right-4 max-w-xs">
                  <div className="bg-black/70 text-white p-3 rounded-lg text-sm">
                    {trackingStatus === "initializing" && "เลื่อนกล้องไปรอบๆ เพื่อสแกนพื้นผิว"}
                    {trackingStatus === "tracking" && "แตะเพื่อวางสินค้า หรือใช้ปุ่มควบคุมด้านล่าง"}
                    {trackingStatus === "lost" && "เลื่อนกล้องกลับไปยังพื้นผิวที่สแกนไว้"}
                  </div>
                </div>

                {/* Crosshair */}
                {trackingStatus === "tracking" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-auto">
                <Button
                  size="sm"
                  onClick={placeProduct}
                  disabled={trackingStatus !== "tracking"}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Target className="w-4 h-4 mr-1" />
                  วางสินค้า
                </Button>
                <Button size="sm" variant="outline" onClick={captureScreenshot} className="bg-white/90">
                  <Camera className="w-4 h-4 mr-1" />
                  ถ่ายภาพ
                </Button>
                <Button size="sm" variant="outline" onClick={resetProductPosition} className="bg-white/90">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  รีเซ็ต
                </Button>
                <Button size="sm" variant="destructive" onClick={stopARSession}>
                  ออก
                </Button>
              </div>
            </div>
          </Card>

          {/* AR Controls */}
          <Tabs defaultValue="position" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="position">ตำแหน่ง</TabsTrigger>
              <TabsTrigger value="rotation">การหมุน</TabsTrigger>
              <TabsTrigger value="scale">ขนาด</TabsTrigger>
              <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
            </TabsList>

            <TabsContent value="position" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Move3D className="w-5 h-5" />
                    ปรับตำแหน่ง
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">X (ซ้าย-ขวา)</label>
                    <Slider
                      value={[productPosition.x]}
                      onValueChange={([value]) => setProductPosition((prev) => ({ ...prev, x: value }))}
                      min={-3}
                      max={3}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">{productPosition.x.toFixed(1)}m</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Y (ขึ้น-ลง)</label>
                    <Slider
                      value={[productPosition.y]}
                      onValueChange={([value]) => setProductPosition((prev) => ({ ...prev, y: value }))}
                      min={-2}
                      max={2}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">{productPosition.y.toFixed(1)}m</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Z (หน้า-หลัง)</label>
                    <Slider
                      value={[productPosition.z]}
                      onValueChange={([value]) => setProductPosition((prev) => ({ ...prev, z: value }))}
                      min={-5}
                      max={-0.5}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">{Math.abs(productPosition.z).toFixed(1)}m</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rotation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    ปรับการหมุน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">หมุนซ้าย-ขวา</label>
                    <Slider
                      value={[productRotation.y]}
                      onValueChange={([value]) => setProductRotation((prev) => ({ ...prev, y: value }))}
                      min={0}
                      max={360}
                      step={5}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">{productRotation.y}°</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">เอียงขึ้น-ลง</label>
                    <Slider
                      value={[productRotation.x]}
                      onValueChange={([value]) => setProductRotation((prev) => ({ ...prev, x: value }))}
                      min={-30}
                      max={30}
                      step={5}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">{productRotation.x}°</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scale" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Maximize className="w-5 h-5" />
                    ปรับขนาด
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">ขนาดโดยรวม</label>
                    <Slider
                      value={[productScale.x]}
                      onValueChange={([value]) => setProductScale({ x: value, y: value, z: value })}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">{Math.round(productScale.x * 100)}%</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    ตั้งค่า AR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      บันทึกการตั้งค่า
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      แชร์ AR View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Placement Result */}
          {placementResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  ผลการวางสินค้า
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>คุณภาพการวาง</span>
                  <Badge className={getPlacementQualityColor(placementResult.placement_quality)}>
                    {placementResult.placement_quality === "excellent" && "ยอดเยี่ยม"}
                    {placementResult.placement_quality === "good" && "ดี"}
                    {placementResult.placement_quality === "fair" && "พอใช้"}
                    {placementResult.placement_quality === "poor" && "ควรปรับปรุง"}
                  </Badge>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>ความมั่นใจ</span>
                    <span>{Math.round(placementResult.confidence * 100)}%</span>
                  </div>
                  <Progress value={placementResult.confidence * 100} className="h-2" />
                </div>
                {placementResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">คำแนะนำ:</h4>
                    <ul className="space-y-1">
                      {placementResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
