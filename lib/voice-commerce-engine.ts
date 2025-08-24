// NOTE: No UI restructure. Types/boundary only.
import { advancedAI } from "./advanced-ai-features"
import { logger } from "./logger"

export interface VoiceCommand {
  id: string
  transcript: string
  confidence: number
  intent: "search" | "add_to_cart" | "checkout" | "navigate" | "inquiry" | "unknown"
  entities: {
    product_name?: string
    quantity?: number
    color?: string
    size?: string
    price_range?: { min: number; max: number }
    category?: string
  }
  timestamp: string
}

export interface VoiceResponse {
  text: string
  audio_url?: string
  actions: Array<{
    type: "navigate" | "add_product" | "show_results" | "play_audio" | "display_info"
    payload: any
  }>
  follow_up_questions?: string[]
  confidence: number
}

export interface VoiceSession {
  session_id: string
  user_id?: string
  commands: VoiceCommand[]
  context: {
    current_page: string
    cart_items: string[]
    search_history: string[]
    preferences: Record<string, any>
  }
  started_at: string
  last_activity: string
}

class VoiceCommerceEngine {
  private sessions: Map<string, VoiceSession> = new Map()
  private isListening = false
  private recognition: any = null
  private synthesis: any = null

  constructor() {
    this.initializeVoiceAPIs()
  }

  private initializeVoiceAPIs() {
    if (typeof window !== "undefined") {
      // Initialize Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const SpeechSynthesis = window.speechSynthesis

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.lang = "th-TH" // Support Thai language
      }

      if (SpeechSynthesis) {
        this.synthesis = SpeechSynthesis
      }
    }
  }

  async startVoiceSession(userId?: string): Promise<string> {
    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const session: VoiceSession = {
      session_id: sessionId,
      user_id: userId,
      commands: [],
      context: {
        current_page: "/",
        cart_items: [],
        search_history: [],
        preferences: {},
      },
      started_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    }

    this.sessions.set(sessionId, session)
    return sessionId
  }

  async processVoiceCommand(sessionId: string, audioBlob?: Blob, transcript?: string): Promise<VoiceResponse> {
    try {
      const session = this.sessions.get(sessionId)
      if (!session) {
        throw new Error("Session not found")
      }

      let finalTranscript = transcript

      // If audio blob is provided, convert to text
      if (audioBlob && !transcript) {
        finalTranscript = await this.speechToText(audioBlob)
      }

      if (!finalTranscript) {
        return {
          text: "ขออภัยค่ะ ไม่สามารถรับฟังเสียงได้ชัดเจน กรุณาลองใหม่อีกครั้ง",
          actions: [],
          confidence: 0.1,
        }
      }

      // Analyze voice command
      const command = await this.analyzeVoiceCommand(finalTranscript, session.context)

      // Update session
      session.commands.push(command)
      session.last_activity = new Date().toISOString()

      // Generate response
      const response = await this.generateVoiceResponse(command, session)

      // Update context based on command
      await this.updateSessionContext(session, command, response)

      return response
    } catch (error) {
      logger.error("Error processing voice command:", error)
      return {
        text: "เกิดข้อผิดพลาดในการประมวลผลคำสั่งเสียง กรุณาลองใหม่อีกครั้ง",
        actions: [],
        confidence: 0.1,
      }
    }
  }

  // Server-safe voice processing: does not use browser-only APIs.
  // Use from server routes when browser features are not available.
  async processVoiceCommandServer(sessionId: string, audioBlob?: any | null, transcript?: string): Promise<VoiceResponse> {
    try {
      const session = this.sessions.get(sessionId)
      if (!session) throw new Error("Session not found")

      const finalTranscript = (transcript || "").trim()
      if (!finalTranscript) {
        return {
          text: "ขออภัยค่ะ ไม่ได้รับคำสั่งเป็นข้อความ กรุณาลองพูดหรือพิมพ์คำสั่งอีกครั้ง",
          actions: [],
          follow_up_questions: ["กรุณาพิมพ์คำสั่งหรืออัปโหลดไฟล์เสียงที่ถอดเป็นข้อความแล้ว"],
          confidence: 0.1,
        }
      }

      // Reuse existing analyzer/generator (advancedAI used inside analyzeVoiceCommand)
      const command = await this.analyzeVoiceCommand(finalTranscript, session.context)

      // Update session and timestamp
      session.commands.push(command)
      session.last_activity = new Date().toISOString()

      // Generate response (server-safe: no speech synthesis)
      const response = await this.generateVoiceResponse(command, session)

      // Update context (search history, cart, preferences)
      await this.updateSessionContext(session, command, response)

      return response
    } catch (error) {
      const msg = error instanceof Error ? error.message : "unknown error"
      try {
        // optional logger; safe-guarded
        // @ts-ignore
        logger?.error?.("processVoiceCommandServer error:", msg)
      } catch {}
      return {
        text: "ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผลคำสั่ง กรุณาลองใหม่อีกครั้ง",
        actions: [],
        follow_up_questions: [],
        confidence: 0.1,
      }
    }
  }

  private async speechToText(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error("Speech recognition not supported"))
        return
      }

      // Convert blob to audio URL for recognition
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      this.recognition.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript
          }
        }
        resolve(transcript.trim())
      }

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`))
      }

      this.recognition.start()

      // Stop recognition after 10 seconds
      setTimeout(() => {
        this.recognition.stop()
      }, 10000)
    })
  }

  private async analyzeVoiceCommand(transcript: string, context: VoiceSession["context"]): Promise<VoiceCommand> {
    // Use NLP to analyze the command
    const nlpAnalysis = await advancedAI.analyzeText(transcript)

    const command: VoiceCommand = {
      id: `cmd_${Date.now()}`,
      transcript,
      confidence: nlpAnalysis.confidence,
      intent: this.extractIntent(transcript, nlpAnalysis.intent),
      entities: this.extractEntities(transcript),
      timestamp: new Date().toISOString(),
    }

    return command
  }

  private extractIntent(transcript: string, nlpIntent: string): VoiceCommand["intent"] {
    const lowerTranscript = transcript.toLowerCase()

    // Search intent
    if (
      lowerTranscript.includes("หา") ||
      lowerTranscript.includes("ค้นหา") ||
      lowerTranscript.includes("search") ||
      lowerTranscript.includes("find")
    ) {
      return "search"
    }

    // Add to cart intent
    if (
      lowerTranscript.includes("ใส่ตะกร้า") ||
      lowerTranscript.includes("เพิ่มในตะกร้า") ||
      lowerTranscript.includes("add to cart") ||
      lowerTranscript.includes("ซื้อ")
    ) {
      return "add_to_cart"
    }

    // Checkout intent
    if (
      lowerTranscript.includes("ชำระเงิน") ||
      lowerTranscript.includes("สั่งซื้อ") ||
      lowerTranscript.includes("checkout") ||
      lowerTranscript.includes("order")
    ) {
      return "checkout"
    }

    // Navigation intent
    if (
      lowerTranscript.includes("ไป") ||
      lowerTranscript.includes("เปิด") ||
      lowerTranscript.includes("go to") ||
      lowerTranscript.includes("navigate")
    ) {
      return "navigate"
    }

    // Inquiry intent
    if (
      lowerTranscript.includes("ราคา") ||
      lowerTranscript.includes("ข้อมูล") ||
      lowerTranscript.includes("price") ||
      lowerTranscript.includes("information") ||
      nlpIntent === "inquiry"
    ) {
      return "inquiry"
    }

    return "unknown"
  }

  private extractEntities(transcript: string): VoiceCommand["entities"] {
    const entities: VoiceCommand["entities"] = {}
    const lowerTranscript = transcript.toLowerCase()

    // Extract product names
    const productKeywords = ["ผ้าคลุมโซฟา", "โซฟา", "sofa cover", "cushion", "หมอน"]
    for (const keyword of productKeywords) {
      if (lowerTranscript.includes(keyword.toLowerCase())) {
        entities.product_name = keyword
        break
      }
    }

    // Extract quantities
    const quantityMatch = transcript.match(/(\d+)\s*(ชิ้น|อัน|ตัว|pieces?)/i)
    if (quantityMatch) {
      entities.quantity = Number.parseInt(quantityMatch[1])
    }

    // Extract colors
    const colors = ["แดง", "น้ำเงิน", "เขียว", "เหลือง", "ดำ", "ขาว", "red", "blue", "green", "yellow", "black", "white"]
    for (const color of colors) {
      if (lowerTranscript.includes(color.toLowerCase())) {
        entities.color = color
        break
      }
    }

    // Extract sizes
    const sizes = ["เล็ก", "กลาง", "ใหญ่", "small", "medium", "large", "s", "m", "l", "xl"]
    for (const size of sizes) {
      if (lowerTranscript.includes(size.toLowerCase())) {
        entities.size = size
        break
      }
    }

    // Extract price ranges
    const priceMatch = transcript.match(/(\d+)\s*-\s*(\d+)\s*(บาท|baht)/i)
    if (priceMatch) {
      entities.price_range = {
        min: Number.parseInt(priceMatch[1]),
        max: Number.parseInt(priceMatch[2]),
      }
    }

    return entities
  }

  private async generateVoiceResponse(command: VoiceCommand, session: VoiceSession): Promise<VoiceResponse> {
    let responseText = ""
    const actions: VoiceResponse["actions"] = []
    let followUpQuestions: string[] = []

    switch (command.intent) {
      case "search":
        responseText = await this.generateSearchResponse(command, session)
        actions.push({
          type: "show_results",
          payload: {
            query: command.entities.product_name || command.transcript,
            filters: {
              color: command.entities.color,
              size: command.entities.size,
              price_range: command.entities.price_range,
            },
          },
        })
        followUpQuestions = ["ต้องการดูรายละเอียดสินค้าไหนเพิ่มเติมไหมคะ?", "มีสีหรือขนาดอื่นที่สนใจไหมคะ?"]
        break

      case "add_to_cart":
        responseText = await this.generateAddToCartResponse(command, session)
        actions.push({
          type: "add_product",
          payload: {
            product_name: command.entities.product_name,
            quantity: command.entities.quantity || 1,
            color: command.entities.color,
            size: command.entities.size,
          },
        })
        followUpQuestions = ["ต้องการเพิ่มสินค้าอื่นในตะกร้าไหมคะ?", "พร้อมชำระเงินเลยไหมคะ?"]
        break

      case "checkout":
        responseText = "กำลังนำคุณไปยังหน้าชำระเงินค่ะ กรุณาตรวจสอบรายการสินค้าในตะกร้า"
        actions.push({
          type: "navigate",
          payload: { path: "/checkout" },
        })
        break

      case "navigate":
        responseText = await this.generateNavigationResponse(command, session)
        const navigationPath = this.extractNavigationPath(command.transcript)
        if (navigationPath) {
          actions.push({
            type: "navigate",
            payload: { path: navigationPath },
          })
        }
        break

      case "inquiry":
        responseText = await this.generateInquiryResponse(command, session)
        actions.push({
          type: "display_info",
          payload: {
            type: "product_info",
            query: command.transcript,
          },
        })
        followUpQuestions = ["มีคำถามอื่นเกี่ยวกับสินค้าไหมคะ?", "ต้องการดูสินค้าที่คล้ายกันไหมคะ?"]
        break

      default:
        responseText = "ขออภัยค่ะ ไม่เข้าใจคำสั่งที่คุณพูด กรุณาลองพูดใหม่อีกครั้ง หรือพูดว่า 'ช่วยเหลือ' เพื่อดูคำสั่งที่ใช้ได้"
        followUpQuestions = ["ลองพูดว่า 'หาผ้าคลุมโซฟาสีน้ำเงิน'", "หรือ 'ใส่ตะกร้า 2 ชิ้น'", "หรือ 'ไปหน้าชำระเงิน'"]
    }

    return {
      text: responseText,
      actions,
      follow_up_questions: followUpQuestions,
      confidence: command.confidence,
    }
  }

  private async generateSearchResponse(command: VoiceCommand, session: VoiceSession): Promise<string> {
    const productName = command.entities.product_name || "สินค้า"
    const color = command.entities.color ? `สี${command.entities.color}` : ""
    const size = command.entities.size ? `ขนาด${command.entities.size}` : ""

    let response = `กำลังค้นหา${productName}${color}${size}ให้คุณค่ะ`

    if (command.entities.price_range) {
      response += ` ในช่วงราคา ${command.entities.price_range.min}-${command.entities.price_range.max} บาท`
    }

    return response
  }

  private async generateAddToCartResponse(command: VoiceCommand, session: VoiceSession): Promise<string> {
    const productName = command.entities.product_name || "สินค้า"
    const quantity = command.entities.quantity || 1
    const color = command.entities.color ? `สี${command.entities.color}` : ""
    const size = command.entities.size ? `ขนาด${command.entities.size}` : ""

    return `เพิ่ม${productName}${color}${size} จำนวน ${quantity} ชิ้น ลงในตะกร้าแล้วค่ะ`
  }

  private async generateNavigationResponse(command: VoiceCommand, session: VoiceSession): Promise<string> {
    const transcript = command.transcript.toLowerCase()

    if (transcript.includes("หน้าแรก") || transcript.includes("home")) {
      return "กำลังพาคุณไปยังหน้าแรกค่ะ"
    } else if (transcript.includes("ตะกร้า") || transcript.includes("cart")) {
      return "กำลังเปิดตะกร้าสินค้าให้คุณค่ะ"
    } else if (transcript.includes("โปรไฟล์") || transcript.includes("profile")) {
      return "กำลังเปิดหน้าโปรไฟล์ของคุณค่ะ"
    }

    return "กำลังนำคุณไปยังหน้าที่ต้องการค่ะ"
  }

  private async generateInquiryResponse(command: VoiceCommand, session: VoiceSession): Promise<string> {
    const transcript = command.transcript.toLowerCase()

    if (transcript.includes("ราคา") || transcript.includes("price")) {
      return "ราคาผ้าคลุมโซฟาของเราเริ่มต้นที่ 1,500 บาท ขึ้นอยู่กับขนาดและวัสดุค่ะ"
    } else if (transcript.includes("ขนาด") || transcript.includes("size")) {
      return "เรามีผ้าคลุมโซฟาหลายขนาด ตั้งแต่โซฟา 2 ที่นั่ง 3 ที่นั่ง และ L-Shape ค่ะ"
    } else if (transcript.includes("สี") || transcript.includes("color")) {
      return "เรามีผ้าคลุมโซฟาหลายสี เช่น น้ำเงิน เทา ครีม น้ำตาล และอื่นๆ อีกมากมายค่ะ"
    }

    return "ขออภัยค่ะ ไม่พบข้อมูลที่คุณต้องการ กรุณาติดต่อฝ่ายบริการลูกค้าสำหรับข้อมูลเพิ่มเติมค่ะ"
  }

  private extractNavigationPath(transcript: string): string | null {
    const lowerTranscript = transcript.toLowerCase()

    if (lowerTranscript.includes("หน้าแรก") || lowerTranscript.includes("home")) {
      return "/"
    } else if (lowerTranscript.includes("ตะกร้า") || lowerTranscript.includes("cart")) {
      return "/cart"
    } else if (lowerTranscript.includes("โปรไฟล์") || lowerTranscript.includes("profile")) {
      return "/profile"
    } else if (lowerTranscript.includes("สินค้า") || lowerTranscript.includes("products")) {
      return "/products"
    } else if (lowerTranscript.includes("ติดต่อ") || lowerTranscript.includes("contact")) {
      return "/contact"
    }

    return null
  }

  private async updateSessionContext(
    session: VoiceSession,
    command: VoiceCommand,
    response: VoiceResponse,
  ): Promise<void> {
    // Update search history
    if (command.intent === "search" && command.entities.product_name) {
      session.context.search_history.push(command.entities.product_name)
      if (session.context.search_history.length > 10) {
        session.context.search_history = session.context.search_history.slice(-10)
      }
    }

    // Update cart items
    if (command.intent === "add_to_cart" && command.entities.product_name) {
      session.context.cart_items.push(command.entities.product_name)
    }

    // Update preferences
    if (command.entities.color) {
      session.context.preferences.preferred_color = command.entities.color
    }
    if (command.entities.size) {
      session.context.preferences.preferred_size = command.entities.size
    }
  }

  async textToSpeech(text: string, lang = "th-TH"): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8

      utterance.onend = () => {
        resolve("Speech completed")
      }

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      this.synthesis.speak(utterance)
    })
  }

  async getVoiceCommands(): Promise<string[]> {
    return [
      "หาผ้าคลุมโซฟาสีน้ำเงิน",
      "ใส่ตะกร้า 2 ชิ้น",
      "ไปหน้าชำระเงิน",
      "ราคาเท่าไหร่",
      "มีขนาดอะไรบ้าง",
      "ไปหน้าแรก",
      "เปิดตะกร้าสินค้า",
      "ช่วยเหลือ",
    ]
  }

  getSession(sessionId: string): VoiceSession | undefined {
    return this.sessions.get(sessionId)
  }

  endSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }
}

export const voiceCommerce = new VoiceCommerceEngine()
