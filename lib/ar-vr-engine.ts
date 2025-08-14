import { logger } from "./logger"

export interface ARSession {
  id: string
  user_id?: string
  product_id: string
  room_type: "living_room" | "bedroom" | "office" | "custom"
  ar_mode: "furniture_placement" | "color_preview" | "size_comparison"
  camera_stream?: MediaStream
  tracking_data: {
    surface_detected: boolean
    lighting_conditions: "good" | "fair" | "poor"
    device_orientation: "portrait" | "landscape"
    stability_score: number
  }
  placement_data?: {
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number }
    scale: { x: number; y: number; z: number }
  }
  created_at: string
  last_updated: string
}

export interface VREnvironment {
  id: string
  name: string
  type: "showroom" | "living_room" | "bedroom" | "office" | "outdoor"
  lighting: "natural" | "warm" | "cool" | "dramatic"
  textures: {
    floor: string
    walls: string
    ceiling: string
  }
  furniture: Array<{
    id: string
    type: string
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number }
  }>
  camera_positions: Array<{
    name: string
    position: { x: number; y: number; z: number }
    target: { x: number; y: number; z: number }
  }>
}

export interface Product3DModel {
  id: string
  product_id: string
  model_url: string
  texture_urls: string[]
  material_properties: {
    roughness: number
    metallic: number
    normal_intensity: number
    emissive_color: string
  }
  dimensions: {
    width: number
    height: number
    depth: number
  }
  variants: Array<{
    color: string
    texture_url: string
    material_override?: Partial<Product3DModel["material_properties"]>
  }>
  animations?: Array<{
    name: string
    duration: number
    loop: boolean
  }>
}

export interface ARPlacementResult {
  success: boolean
  confidence: number
  placement_quality: "excellent" | "good" | "fair" | "poor"
  recommendations: string[]
  measurements: {
    distance_from_camera: number
    surface_area_covered: number
    lighting_score: number
    occlusion_detected: boolean
  }
  screenshot_url?: string
}

class ARVREngine {
  private arSessions: Map<string, ARSession> = new Map()
  private vrEnvironments: Map<string, VREnvironment> = new Map()
  private product3DModels: Map<string, Product3DModel> = new Map()

  constructor() {
    this.initializeDefaultEnvironments()
    this.loadProduct3DModels()
  }

  async startARSession(
    productId: string,
    userId?: string,
    roomType: ARSession["room_type"] = "living_room",
    arMode: ARSession["ar_mode"] = "furniture_placement",
  ): Promise<string> {
    try {
      const sessionId = `ar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera for AR
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      const session: ARSession = {
        id: sessionId,
        user_id: userId,
        product_id: productId,
        room_type: roomType,
        ar_mode: arMode,
        camera_stream: stream,
        tracking_data: {
          surface_detected: false,
          lighting_conditions: "fair",
          device_orientation: "portrait",
          stability_score: 0,
        },
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      }

      this.arSessions.set(sessionId, session)

      // Initialize AR tracking
      await this.initializeARTracking(sessionId)

      return sessionId
    } catch (error) {
      logger.error("Error starting AR session:", error)
      throw error
    }
  }

  private async initializeARTracking(sessionId: string): Promise<void> {
    const session = this.arSessions.get(sessionId)
    if (!session) return

    // Simulate AR tracking initialization
    setTimeout(() => {
      session.tracking_data = {
        surface_detected: true,
        lighting_conditions: "good",
        device_orientation: window.innerWidth > window.innerHeight ? "landscape" : "portrait",
        stability_score: 0.8 + Math.random() * 0.2,
      }
      session.last_updated = new Date().toISOString()
    }, 2000)
  }

  async placeProductInAR(
    sessionId: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 },
    scale: { x: number; y: number; z: number } = { x: 1, y: 1, z: 1 },
  ): Promise<ARPlacementResult> {
    try {
      const session = this.arSessions.get(sessionId)
      if (!session) {
        throw new Error("AR session not found")
      }

      // Update placement data
      session.placement_data = { position, rotation, scale }
      session.last_updated = new Date().toISOString()

      // Analyze placement quality
      const placementResult = await this.analyzePlacementQuality(session, position)

      return placementResult
    } catch (error) {
      logger.error("Error placing product in AR:", error)
      return {
        success: false,
        confidence: 0,
        placement_quality: "poor",
        recommendations: ["กรุณาลองใหม่อีกครั้ง"],
        measurements: {
          distance_from_camera: 0,
          surface_area_covered: 0,
          lighting_score: 0,
          occlusion_detected: false,
        },
      }
    }
  }

  private async analyzePlacementQuality(
    session: ARSession,
    position: { x: number; y: number; z: number },
  ): Promise<ARPlacementResult> {
    // Simulate placement quality analysis
    const distanceFromCamera = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2)
    const lightingScore =
      session.tracking_data.lighting_conditions === "good"
        ? 0.9
        : session.tracking_data.lighting_conditions === "fair"
          ? 0.7
          : 0.4
    const stabilityScore = session.tracking_data.stability_score

    let placementQuality: ARPlacementResult["placement_quality"] = "poor"
    let confidence = 0.3

    if (distanceFromCamera > 1 && distanceFromCamera < 5 && lightingScore > 0.7 && stabilityScore > 0.7) {
      placementQuality = "excellent"
      confidence = 0.9
    } else if (distanceFromCamera > 0.5 && distanceFromCamera < 7 && lightingScore > 0.5 && stabilityScore > 0.5) {
      placementQuality = "good"
      confidence = 0.7
    } else if (lightingScore > 0.4 && stabilityScore > 0.4) {
      placementQuality = "fair"
      confidence = 0.5
    }

    const recommendations: string[] = []
    if (distanceFromCamera < 1) recommendations.push("ขยับออกไปไกลขึ้นเล็กน้อย")
    if (distanceFromCamera > 7) recommendations.push("เข้าใกล้มากขึ้น")
    if (lightingScore < 0.5) recommendations.push("หาที่ที่มีแสงสว่างมากขึ้น")
    if (stabilityScore < 0.5) recommendations.push("ถือโทรศัพท์ให้นิ่งมากขึ้น")

    return {
      success: true,
      confidence,
      placement_quality: placementQuality,
      recommendations,
      measurements: {
        distance_from_camera: distanceFromCamera,
        surface_area_covered: Math.PI * 0.5 ** 2, // Simulate covered area
        lighting_score: lightingScore,
        occlusion_detected: Math.random() > 0.8,
      },
    }
  }

  async createVRShowroom(environmentType: VREnvironment["type"] = "showroom"): Promise<string> {
    const environmentId = `vr_env_${Date.now()}`

    const environment: VREnvironment = {
      id: environmentId,
      name: `${environmentType} Environment`,
      type: environmentType,
      lighting: "natural",
      textures: {
        floor: "/textures/hardwood_floor.jpg",
        walls: "/textures/white_wall.jpg",
        ceiling: "/textures/white_ceiling.jpg",
      },
      furniture: this.generateDefaultFurniture(environmentType),
      camera_positions: this.generateCameraPositions(environmentType),
    }

    this.vrEnvironments.set(environmentId, environment)
    return environmentId
  }

  private generateDefaultFurniture(environmentType: VREnvironment["type"]): VREnvironment["furniture"] {
    const furniture: VREnvironment["furniture"] = []

    switch (environmentType) {
      case "living_room":
        furniture.push(
          { id: "sofa_main", type: "sofa", position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
          { id: "coffee_table", type: "table", position: { x: 0, y: 0, z: -1.5 }, rotation: { x: 0, y: 0, z: 0 } },
          { id: "tv_stand", type: "tv_stand", position: { x: 0, y: 0, z: -3 }, rotation: { x: 0, y: 180, z: 0 } },
        )
        break
      case "bedroom":
        furniture.push(
          { id: "bed", type: "bed", position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
          { id: "nightstand", type: "nightstand", position: { x: 1.5, y: 0, z: 0.5 }, rotation: { x: 0, y: 0, z: 0 } },
          { id: "dresser", type: "dresser", position: { x: -2, y: 0, z: -1 }, rotation: { x: 0, y: 90, z: 0 } },
        )
        break
      case "office":
        furniture.push(
          { id: "desk", type: "desk", position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
          { id: "office_chair", type: "chair", position: { x: 0, y: 0, z: 1 }, rotation: { x: 0, y: 180, z: 0 } },
          { id: "bookshelf", type: "bookshelf", position: { x: -2, y: 0, z: -1 }, rotation: { x: 0, y: 90, z: 0 } },
        )
        break
    }

    return furniture
  }

  private generateCameraPositions(environmentType: VREnvironment["type"]): VREnvironment["camera_positions"] {
    const positions: VREnvironment["camera_positions"] = [
      { name: "Front View", position: { x: 0, y: 1.6, z: 3 }, target: { x: 0, y: 0.8, z: 0 } },
      { name: "Side View", position: { x: 3, y: 1.6, z: 0 }, target: { x: 0, y: 0.8, z: 0 } },
      { name: "Corner View", position: { x: 2, y: 1.8, z: 2 }, target: { x: 0, y: 0.8, z: 0 } },
      { name: "Top View", position: { x: 0, y: 4, z: 0 }, target: { x: 0, y: 0, z: 0 } },
    ]

    return positions
  }

  async load3DModel(productId: string): Promise<Product3DModel | null> {
    return this.product3DModels.get(productId) || null
  }

  async generate360View(
    productId: string,
    quality: "low" | "medium" | "high" = "medium",
  ): Promise<{
    images: string[]
    total_frames: number
    frame_rate: number
    interactive_hotspots: Array<{
      position: { x: number; y: number }
      info: string
      action?: string
    }>
  }> {
    // Simulate 360-degree view generation
    const frameCount = quality === "high" ? 72 : quality === "medium" ? 36 : 18
    const images: string[] = []

    for (let i = 0; i < frameCount; i++) {
      const angle = (360 / frameCount) * i
      images.push(`/360views/${productId}/frame_${angle.toString().padStart(3, "0")}.jpg`)
    }

    return {
      images,
      total_frames: frameCount,
      frame_rate: 12,
      interactive_hotspots: [
        { position: { x: 0.3, y: 0.4 }, info: "วัสดุผ้าคุณภาพสูง", action: "show_material_details" },
        { position: { x: 0.7, y: 0.6 }, info: "ระบบยึดแน่น", action: "show_installation_guide" },
        { position: { x: 0.5, y: 0.8 }, info: "ดูสีอื่น", action: "show_color_variants" },
      ],
    }
  }

  async captureARScreenshot(sessionId: string): Promise<string> {
    const session = this.arSessions.get(sessionId)
    if (!session || !session.camera_stream) {
      throw new Error("AR session not found or camera not available")
    }

    // Simulate screenshot capture
    const screenshotUrl = `/ar_screenshots/${sessionId}_${Date.now()}.jpg`
    return screenshotUrl
  }

  async getVREnvironment(environmentId: string): Promise<VREnvironment | null> {
    return this.vrEnvironments.get(environmentId) || null
  }

  async updateVREnvironmentLighting(environmentId: string, lighting: VREnvironment["lighting"]): Promise<boolean> {
    const environment = this.vrEnvironments.get(environmentId)
    if (!environment) return false

    environment.lighting = lighting
    return true
  }

  async addFurnitureToVR(environmentId: string, furniture: VREnvironment["furniture"][0]): Promise<boolean> {
    const environment = this.vrEnvironments.get(environmentId)
    if (!environment) return false

    environment.furniture.push(furniture)
    return true
  }

  private initializeDefaultEnvironments(): void {
    // Initialize some default VR environments
    const defaultEnvironments: VREnvironment[] = [
      {
        id: "modern_living_room",
        name: "Modern Living Room",
        type: "living_room",
        lighting: "natural",
        textures: {
          floor: "/textures/modern_floor.jpg",
          walls: "/textures/modern_wall.jpg",
          ceiling: "/textures/white_ceiling.jpg",
        },
        furniture: this.generateDefaultFurniture("living_room"),
        camera_positions: this.generateCameraPositions("living_room"),
      },
      {
        id: "cozy_bedroom",
        name: "Cozy Bedroom",
        type: "bedroom",
        lighting: "warm",
        textures: {
          floor: "/textures/carpet_floor.jpg",
          walls: "/textures/bedroom_wall.jpg",
          ceiling: "/textures/white_ceiling.jpg",
        },
        furniture: this.generateDefaultFurniture("bedroom"),
        camera_positions: this.generateCameraPositions("bedroom"),
      },
    ]

    defaultEnvironments.forEach((env) => {
      this.vrEnvironments.set(env.id, env)
    })
  }

  private loadProduct3DModels(): void {
    // Load some sample 3D models
    const sampleModels: Product3DModel[] = [
      {
        id: "sofa_cover_001",
        product_id: "prod_001",
        model_url: "/3d_models/sofa_cover_001.glb",
        texture_urls: ["/textures/fabric_blue.jpg", "/textures/fabric_gray.jpg"],
        material_properties: {
          roughness: 0.8,
          metallic: 0.0,
          normal_intensity: 1.0,
          emissive_color: "#000000",
        },
        dimensions: { width: 2.0, height: 0.8, depth: 1.0 },
        variants: [
          { color: "blue", texture_url: "/textures/fabric_blue.jpg" },
          { color: "gray", texture_url: "/textures/fabric_gray.jpg" },
          { color: "cream", texture_url: "/textures/fabric_cream.jpg" },
        ],
      },
    ]

    sampleModels.forEach((model) => {
      this.product3DModels.set(model.product_id, model)
    })
  }

  endARSession(sessionId: string): boolean {
    const session = this.arSessions.get(sessionId)
    if (session && session.camera_stream) {
      // Stop camera stream
      session.camera_stream.getTracks().forEach((track) => track.stop())
    }
    return this.arSessions.delete(sessionId)
  }

  getARSession(sessionId: string): ARSession | undefined {
    return this.arSessions.get(sessionId)
  }
}

export const arvrEngine = new ARVREngine()
export type { ARSession, VREnvironment, Product3DModel, ARPlacementResult }
