"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  HeadsetIcon as VrHeadset,
  Camera,
  RotateCcw,
  Maximize,
  Palette,
  Home,
  Bed,
  Briefcase,
  Sun,
  Moon,
  Lightbulb,
  Eye,
  Settings,
} from "lucide-react"
import { arvrEngine, type VREnvironment } from "@/lib/ar-vr-engine"

interface VRShowroomViewerProps {
  productId: string
  productName: string
  onEnvironmentChange?: (environmentId: string) => void
}

export default function VRShowroomViewer({ productId, productName, onEnvironmentChange }: VRShowroomViewerProps) {
  const [currentEnvironment, setCurrentEnvironment] = useState<VREnvironment | null>(null)
  const [availableEnvironments, setAvailableEnvironments] = useState<VREnvironment[]>([])
  const [selectedCameraPosition, setSelectedCameraPosition] = useState(0)
  const [isVRMode, setIsVRMode] = useState(false)
  const [loading, setLoading] = useState(true)

  const viewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeVRShowroom()
  }, [])

  const initializeVRShowroom = async () => {
    try {
      setLoading(true)

      // Create default environments
      const livingRoomId = await arvrEngine.createVRShowroom("living_room")
      const bedroomId = await arvrEngine.createVRShowroom("bedroom")
      const officeId = await arvrEngine.createVRShowroom("office")

      const environments = await Promise.all([
        arvrEngine.getVREnvironment(livingRoomId),
        arvrEngine.getVREnvironment(bedroomId),
        arvrEngine.getVREnvironment(officeId),
      ])

      const validEnvironments = environments.filter((env): env is VREnvironment => env !== null)
      setAvailableEnvironments(validEnvironments)

      if (validEnvironments.length > 0) {
        setCurrentEnvironment(validEnvironments[0])
        onEnvironmentChange?.(validEnvironments[0].id)
      }
    } catch (error) {
      console.error("Error initializing VR showroom:", error)
    } finally {
      setLoading(false)
    }
  }

  const switchEnvironment = async (environmentId: string) => {
    const environment = availableEnvironments.find((env) => env.id === environmentId)
    if (environment) {
      setCurrentEnvironment(environment)
      setSelectedCameraPosition(0)
      onEnvironmentChange?.(environmentId)
    }
  }

  const changeLighting = async (lighting: VREnvironment["lighting"]) => {
    if (!currentEnvironment) return

    await arvrEngine.updateVREnvironmentLighting(currentEnvironment.id, lighting)
    setCurrentEnvironment((prev) => (prev ? { ...prev, lighting } : null))
  }

  const switchCameraPosition = (index: number) => {
    if (currentEnvironment && index < currentEnvironment.camera_positions.length) {
      setSelectedCameraPosition(index)
    }
  }

  const enterVRMode = () => {
    if (viewerRef.current && "requestFullscreen" in viewerRef.current) {
      viewerRef.current.requestFullscreen()
      setIsVRMode(true)
    }
  }

  const exitVRMode = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    setIsVRMode(false)
  }

  const getEnvironmentIcon = (type: VREnvironment["type"]) => {
    switch (type) {
      case "living_room":
        return <Home className="w-4 h-4" />
      case "bedroom":
        return <Bed className="w-4 h-4" />
      case "office":
        return <Briefcase className="w-4 h-4" />
      default:
        return <Home className="w-4 h-4" />
    }
  }

  const getLightingIcon = (lighting: VREnvironment["lighting"]) => {
    switch (lighting) {
      case "natural":
        return <Sun className="w-4 h-4" />
      case "warm":
        return <Lightbulb className="w-4 h-4" />
      case "cool":
        return <Moon className="w-4 h-4" />
      default:
        return <Sun className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด VR Showroom...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
            <VrHeadset className="w-6 h-6" />
            VR Showroom
          </h2>
          <p className="text-gray-600 mt-1">ดู {productName} ในห้องจำลองแบบ 3 มิติ</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Select value={currentEnvironment?.id} onValueChange={switchEnvironment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="เลือกห้อง" />
            </SelectTrigger>
            <SelectContent>
              {availableEnvironments.map((env) => (
                <SelectItem key={env.id} value={env.id}>
                  <div className="flex items-center gap-2">
                    {getEnvironmentIcon(env.type)}
                    <span>{env.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={isVRMode ? exitVRMode : enterVRMode}>
            <VrHeadset className="w-4 h-4 mr-2" />
            {isVRMode ? "ออกจาก VR" : "โหมด VR"}
          </Button>
        </div>
      </div>

      {/* VR Viewer */}
      <Card className="overflow-hidden">
        <div
          ref={viewerRef}
          className={`relative ${isVRMode ? "h-screen" : "aspect-video"} bg-gradient-to-b from-sky-200 to-sky-100`}
        >
          {/* 3D Scene Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <VrHeadset className="w-16 h-16 text-white/60" />
              </div>
              <p className="text-white/80 text-lg font-medium">
                {currentEnvironment?.name} - {productName}
              </p>
              <p className="text-white/60 text-sm mt-1">
                มุมมอง: {currentEnvironment?.camera_positions[selectedCameraPosition]?.name}
              </p>
            </div>
          </div>

          {/* VR Controls Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Environment Info */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-black/50 text-white border-white/20">
                {getEnvironmentIcon(currentEnvironment?.type || "living_room")}
                <span className="ml-1">{currentEnvironment?.name}</span>
              </Badge>
            </div>

            {/* Lighting Info */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-black/50 text-white border-white/20">
                {getLightingIcon(currentEnvironment?.lighting || "natural")}
                <span className="ml-1 capitalize">{currentEnvironment?.lighting}</span>
              </Badge>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-auto">
              {currentEnvironment?.camera_positions.map((position, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={selectedCameraPosition === index ? "default" : "outline"}
                  onClick={() => switchCameraPosition(index)}
                  className={selectedCameraPosition === index ? "bg-blue-500" : "bg-white/90"}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  {position.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* VR Controls */}
      <Tabs defaultValue="environment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="environment">สภาพแวดล้อม</TabsTrigger>
          <TabsTrigger value="lighting">แสงสว่าง</TabsTrigger>
          <TabsTrigger value="camera">มุมมอง</TabsTrigger>
          <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
        </TabsList>

        <TabsContent value="environment" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {availableEnvironments.map((env) => (
              <Card
                key={env.id}
                className={`cursor-pointer transition-colors ${
                  currentEnvironment?.id === env.id ? "border-primary bg-primary/5" : "hover:border-gray-300"
                }`}
                onClick={() => switchEnvironment(env.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getEnvironmentIcon(env.type)}
                    <h3 className="font-medium">{env.name}</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>เฟอร์นิเจอร์: {env.furniture.length} ชิ้น</div>
                    <div>มุมมอง: {env.camera_positions.length} มุม</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lighting" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["natural", "warm", "cool", "dramatic"] as const).map((lighting) => (
              <Button
                key={lighting}
                variant={currentEnvironment?.lighting === lighting ? "default" : "outline"}
                onClick={() => changeLighting(lighting)}
                className="h-20 flex-col"
              >
                {getLightingIcon(lighting)}
                <span className="mt-2 capitalize">{lighting}</span>
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="camera" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentEnvironment?.camera_positions.map((position, index) => (
              <Button
                key={index}
                variant={selectedCameraPosition === index ? "default" : "outline"}
                onClick={() => switchCameraPosition(index)}
                className="h-20 flex-col"
              >
                <Camera className="w-6 h-6" />
                <span className="mt-2">{position.name}</span>
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                ตั้งค่า VR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  ดูแบบ 360°
                </Button>
                <Button variant="outline">
                  <Maximize className="w-4 h-4 mr-2" />
                  เต็มจอ
                </Button>
                <Button variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  รีเซ็ตมุมมอง
                </Button>
                <Button variant="outline">
                  <Palette className="w-4 h-4 mr-2" />
                  เปลี่ยนสี
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Environment Details */}
      {currentEnvironment && (
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดห้อง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">เฟอร์นิเจอร์ในห้อง</h4>
                <div className="space-y-1">
                  {currentEnvironment.furniture.map((item, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="capitalize">{item.type.replace("_", " ")}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">วัสดุและพื้นผิว</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>พื้น: Hardwood</div>
                  <div>ผนัง: Modern Paint</div>
                  <div>เพดาน: White Finish</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
