export interface ConversionEvent {
  eventType: "fabric_view" | "fabric_select" | "bill_create" | "bill_view" | "payment_complete" | "messenger_click"
  userId?: string
  sessionId: string
  timestamp: Date
  data: Record<string, any>
  source: "web" | "messenger" | "admin"
  userAgent?: string
  ipAddress?: string
}

export interface PixelData {
  pixelId: string
  eventName: string
  eventData: Record<string, any>
  userData?: {
    em?: string // email hash
    ph?: string // phone hash
    fn?: string // first name hash
    ln?: string // last name hash
  }
}

export class ConversionTrackingService {
  private events: ConversionEvent[] = []
  private pixelId: string | null = null

  constructor() {
    this.pixelId = process.env.FACEBOOK_PIXEL_ID || null
    this.loadEventsFromStorage()
  }

  // บันทึก conversion event
  async trackEvent(event: Omit<ConversionEvent, "timestamp">): Promise<void> {
    const fullEvent: ConversionEvent = {
      ...event,
      timestamp: new Date(),
    }

    // บันทึกใน memory (ในอนาคตอาจบันทึกใน database)
    this.events.push(fullEvent)

    this.saveEventsToStorage()

    await this.sendToAnalyticsAPI(fullEvent)

    // ส่งไปยัง Facebook Pixel (ถ้ามี)
    if (this.pixelId && typeof window !== "undefined") {
      await this.sendToFacebookPixel(fullEvent)
    }

    // ส่งไปยัง Google Analytics (ถ้ามี)
    if (typeof window !== "undefined" && (window as any).gtag) {
      this.sendToGoogleAnalytics(fullEvent)
    }

    console.log("Conversion event tracked:", fullEvent)
  }

  // ติดตามการดูลายผ้า
  async trackFabricView(
    fabricId: string,
    fabricName: string,
    collectionName: string,
    sessionId: string,
  ): Promise<void> {
    await this.trackEvent({
      eventType: "fabric_view",
      sessionId,
      data: {
        fabric_id: fabricId,
        fabric_name: fabricName,
        collection_name: collectionName,
        content_type: "product",
        content_category: "fabric",
      },
      source: "web",
    })
  }

  // ติดตามการเลือกลายผ้า
  async trackFabricSelect(
    fabricId: string,
    fabricName: string,
    collectionName: string,
    sessionId: string,
  ): Promise<void> {
    await this.trackEvent({
      eventType: "fabric_select",
      sessionId,
      data: {
        fabric_id: fabricId,
        fabric_name: fabricName,
        collection_name: collectionName,
        content_type: "product",
        content_category: "fabric",
        value: 1, // ค่าความสำคัญของการเลือก
      },
      source: "web",
    })
  }

  // ติดตามการสร้างบิล
  async trackBillCreate(billId: string, customerName: string, totalAmount: number, sessionId: string): Promise<void> {
    await this.trackEvent({
      eventType: "bill_create",
      sessionId,
      data: {
        bill_id: billId,
        customer_name: customerName,
        value: totalAmount,
        currency: "THB",
        content_type: "bill",
      },
      source: "admin",
    })
  }

  // ติดตามการดูบิล
  async trackBillView(billId: string, totalAmount: number, sessionId: string): Promise<void> {
    await this.trackEvent({
      eventType: "bill_view",
      sessionId,
      data: {
        bill_id: billId,
        value: totalAmount,
        currency: "THB",
        content_type: "bill",
      },
      source: "web",
    })
  }

  // ติดตามการชำระเงิน
  async trackPaymentComplete(
    billId: string,
    totalAmount: number,
    paymentMethod: string,
    sessionId: string,
  ): Promise<void> {
    await this.trackEvent({
      eventType: "payment_complete",
      sessionId,
      data: {
        bill_id: billId,
        value: totalAmount,
        currency: "THB",
        payment_method: paymentMethod,
        content_type: "purchase",
      },
      source: "web",
    })
  }

  // ติดตามการคลิก Messenger
  async trackMessengerClick(source: string, content: string, sessionId: string): Promise<void> {
    await this.trackEvent({
      eventType: "messenger_click",
      sessionId,
      data: {
        source,
        content,
        platform: "facebook_messenger",
      },
      source: "web",
    })
  }

  // ส่งข้อมูลไปยัง Facebook Pixel
  private async sendToFacebookPixel(event: ConversionEvent): Promise<void> {
    if (!this.pixelId) return

    const pixelEventMap: Record<string, string> = {
      fabric_view: "ViewContent",
      fabric_select: "AddToWishlist",
      bill_create: "InitiateCheckout",
      bill_view: "ViewContent",
      payment_complete: "Purchase",
      messenger_click: "Contact",
    }

    const pixelEventName = pixelEventMap[event.eventType] || "CustomEvent"

    if (typeof window !== "undefined" && (window as any).fbq) {
      ;(window as any).fbq("track", pixelEventName, {
        content_ids: [event.data.fabric_id || event.data.bill_id],
        content_type: event.data.content_type,
        value: event.data.value,
        currency: event.data.currency || "THB",
      })
    }
  }

  // ส่งข้อมูลไปยัง Google Analytics
  private sendToGoogleAnalytics(event: ConversionEvent): void {
    if (typeof window === "undefined" || !(window as any).gtag) return

    const gaEventMap: Record<string, string> = {
      fabric_view: "view_item",
      fabric_select: "select_content",
      bill_create: "begin_checkout",
      bill_view: "view_item",
      payment_complete: "purchase",
      messenger_click: "contact",
    }

    const gaEventName = gaEventMap[event.eventType] || "custom_event"
    ;(window as any).gtag("event", gaEventName, {
      event_category: "sofa_cover",
      event_label: event.data.fabric_name || event.data.bill_id,
      value: event.data.value,
      currency: event.data.currency || "THB",
    })
  }

  // ดึงสถิติ conversion
  getConversionStats(dateFrom?: Date, dateTo?: Date): Record<string, number> {
    let filteredEvents = this.events

    if (dateFrom || dateTo) {
      filteredEvents = this.events.filter((event) => {
        const eventDate = event.timestamp
        if (dateFrom && eventDate < dateFrom) return false
        if (dateTo && eventDate > dateTo) return false
        return true
      })
    }

    const stats: Record<string, number> = {}
    filteredEvents.forEach((event) => {
      stats[event.eventType] = (stats[event.eventType] || 0) + 1
    })

    return stats
  }

  private async sendToAnalyticsAPI(event: ConversionEvent): Promise<void> {
    if (typeof window === "undefined") return

    try {
      await fetch("/api/analytics/conversion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error("Failed to send event to analytics API:", error)
    }
  }

  private saveEventsToStorage(): void {
    if (typeof window === "undefined") return

    try {
      // เก็บแค่ 100 events ล่าสุด
      const recentEvents = this.events.slice(-100)
      localStorage.setItem("conversion_events", JSON.stringify(recentEvents))
    } catch (error) {
      console.error("Failed to save events to localStorage:", error)
    }
  }

  private loadEventsFromStorage(): void {
    if (typeof window === "undefined") return

    try {
      const storedEvents = localStorage.getItem("conversion_events")
      if (storedEvents) {
        this.events = JSON.parse(storedEvents).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp),
        }))
      }
    } catch (error) {
      console.error("Failed to load events from localStorage:", error)
    }
  }

  static getUserId(): string {
    if (typeof window === "undefined") return "anonymous"

    let userId = localStorage.getItem("user_id")
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("user_id", userId)
    }
    return userId
  }

  // สร้าง session ID
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  clearEvents(): void {
    this.events = []
    if (typeof window !== "undefined") {
      localStorage.removeItem("conversion_events")
    }
  }

  getEvents(limit?: number): ConversionEvent[] {
    if (limit) {
      return this.events.slice(-limit)
    }
    return [...this.events]
  }
}

// สร้าง instance สำหรับใช้งาน
export const conversionTracker = new ConversionTrackingService()
