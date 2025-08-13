interface AnalyticsEvent {
  event: string
  category: string
  label?: string
  value?: number
  userId?: string
  sessionId?: string
  timestamp: string
  properties?: Record<string, any>
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  userId?: string
  sessionId?: string
}

class AnalyticsService {
  private events: AnalyticsEvent[] = []
  private metrics: PerformanceMetric[] = []
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeGoogleAnalytics()
    this.initializeSentry()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeGoogleAnalytics() {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      // Load Google Analytics
      const script = document.createElement("script")
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`
      document.head.appendChild(script)

      // Initialize gtag
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).gtag = (...args: any[]) => {
        ;(window as any).dataLayer.push(args)
      }
      ;(window as any).gtag("js", new Date())
      ;(window as any).gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
      })
    }
  }

  private initializeSentry() {
    // Sentry initialization would go here in production
    // import * as Sentry from "@sentry/nextjs"
    // Sentry.init({ dsn: process.env.SENTRY_DSN })
  }

  setUserId(userId: string) {
    this.userId = userId
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: userId,
      })
    }
  }

  // Track custom events
  trackEvent(event: string, category: string, label?: string, value?: number, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      label,
      value,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      properties,
    }

    this.events.push(analyticsEvent)

    // Send to Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", event, {
        event_category: category,
        event_label: label,
        value: value,
        custom_parameters: properties,
      })
    }

    // Send to backend for storage
    this.sendEventToBackend(analyticsEvent)
  }

  // Track performance metrics
  trackPerformance(name: string, value: number, unit = "ms") {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
    }

    this.metrics.push(metric)

    // Send to Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "performance_metric", {
        event_category: "Performance",
        event_label: name,
        value: Math.round(value),
        custom_parameters: { unit },
      })
    }

    // Send to backend
    this.sendMetricToBackend(metric)
  }

  // E-commerce tracking
  trackPurchase(transactionId: string, value: number, currency = "THB", items: any[]) {
    const purchaseEvent = {
      event: "purchase",
      category: "ecommerce",
      label: transactionId,
      value,
      properties: {
        transaction_id: transactionId,
        currency,
        items,
      },
    }

    this.trackEvent("purchase", "ecommerce", transactionId, value, purchaseEvent.properties)

    // Enhanced ecommerce for GA4
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "purchase", {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price,
        })),
      })
    }
  }

  // User behavior tracking
  trackPageView(path: string, title?: string) {
    this.trackEvent("page_view", "navigation", path, undefined, {
      page_title: title || document.title,
      page_location: window.location.href,
    })

    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title,
      })
    }
  }

  trackUserAction(action: string, element: string, value?: number) {
    this.trackEvent("user_action", "engagement", `${action}_${element}`, value, {
      action,
      element,
    })
  }

  // Error tracking
  trackError(error: Error, context?: Record<string, any>) {
    const errorEvent = {
      event: "error",
      category: "error",
      label: error.message,
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        context,
        url: window.location.href,
        user_agent: navigator.userAgent,
      },
    }

    this.trackEvent("error", "error", error.message, undefined, errorEvent.properties)

    // Send to error tracking service
    this.sendErrorToBackend(error, context)
  }

  // Business metrics
  trackBusinessMetric(metric: string, value: number, category = "business") {
    this.trackEvent("business_metric", category, metric, value, {
      metric_name: metric,
      metric_value: value,
    })
  }

  // Conversion tracking
  trackConversion(conversionType: string, value?: number, properties?: Record<string, any>) {
    this.trackEvent("conversion", "conversion", conversionType, value, {
      conversion_type: conversionType,
      ...properties,
    })

    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", "conversion", {
        send_to: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        event_category: "conversion",
        event_label: conversionType,
        value: value,
      })
    }
  }

  // Send data to backend
  private async sendEventToBackend(event: AnalyticsEvent) {
    try {
      await fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error("Failed to send event to backend:", error)
    }
  }

  private async sendMetricToBackend(metric: PerformanceMetric) {
    try {
      await fetch("/api/analytics/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metric),
      })
    } catch (error) {
      console.error("Failed to send metric to backend:", error)
    }
  }

  private async sendErrorToBackend(error: Error, context?: Record<string, any>) {
    try {
      await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          userId: this.userId,
          severity: "medium",
          context,
        }),
      })
    } catch (err) {
      console.error("Failed to send error to backend:", err)
    }
  }

  // Get analytics data
  getEvents(category?: string): AnalyticsEvent[] {
    if (category) {
      return this.events.filter((event) => event.category === category)
    }
    return this.events
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter((metric) => metric.name === name)
    }
    return this.metrics
  }

  // Clear data (for privacy compliance)
  clearData() {
    this.events = []
    this.metrics = []
    this.userId = undefined
  }
}

export const analytics = new AnalyticsService()
export default analytics
