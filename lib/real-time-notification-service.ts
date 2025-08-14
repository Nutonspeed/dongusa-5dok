import { toast } from "sonner"
import { analytics } from "./analytics-service"
import { logger } from "./logger"

interface NotificationTemplate {
  id: string
  name: string
  type: "email" | "sms" | "push" | "in_app"
  title: string
  body: string
  icon?: string
  actions?: NotificationAction[]
  priority: "low" | "normal" | "high" | "urgent"
  category: string
}

interface NotificationAction {
  id: string
  label: string
  action: "url" | "api_call" | "dismiss"
  data: Record<string, any>
}

interface NotificationPreferences {
  userId: string
  email: boolean
  sms: boolean
  push: boolean
  in_app: boolean
  categories: Record<string, boolean>
  quiet_hours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface PushNotification {
  id: string
  userId: string
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: Record<string, any>
  actions?: NotificationAction[]
  timestamp: string
  read: boolean
  clicked: boolean
}

interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: number
  operator: ">" | "<" | "=" | ">=" | "<="
  metric: string
  recipients: string[]
  channels: ("email" | "sms" | "push" | "webhook")[]
  cooldown: number // minutes
  isActive: boolean
}

export class RealTimeNotificationService {
  private notifications: PushNotification[] = []
  private templates: NotificationTemplate[] = []
  private alertRules: AlertRule[] = []
  private userPreferences: Map<string, NotificationPreferences> = new Map()
  private alertCooldowns: Map<string, number> = new Map()

  constructor() {
    this.initializeDefaultTemplates()
    this.initializeDefaultAlertRules()
    this.setupServiceWorker()
  }

  private initializeDefaultTemplates() {
    this.templates = [
      {
        id: "order_confirmed",
        name: "Order Confirmation",
        type: "push",
        title: "คำสั่งซื้อได้รับการยืนยันแล้ว",
        body: "คำสั่งซื้อ #{order_number} ของคุณได้รับการยืนยันแล้ว",
        icon: "/icons/order-confirmed.png",
        priority: "normal",
        category: "orders",
        actions: [
          {
            id: "view_order",
            label: "ดูคำสั่งซื้อ",
            action: "url",
            data: { url: "/orders/{order_id}" },
          },
        ],
      },
      {
        id: "payment_received",
        name: "Payment Received",
        type: "push",
        title: "ได้รับการชำระเงินแล้ว",
        body: "ได้รับการชำระเงินสำหรับคำสั่งซื้อ #{order_number}",
        icon: "/icons/payment-success.png",
        priority: "high",
        category: "payments",
      },
      {
        id: "low_stock_alert",
        name: "Low Stock Alert",
        type: "push",
        title: "แจ้งเตือนสต็อกต่ำ",
        body: "สินค้า {product_name} เหลือเพียง {quantity} ชิ้น",
        icon: "/icons/warning.png",
        priority: "high",
        category: "inventory",
        actions: [
          {
            id: "reorder",
            label: "สั่งซื้อเพิ่ม",
            action: "url",
            data: { url: "/admin/inventory/{product_id}/reorder" },
          },
        ],
      },
      {
        id: "system_alert",
        name: "System Alert",
        type: "push",
        title: "แจ้งเตือนระบบ",
        body: "{alert_message}",
        icon: "/icons/system-alert.png",
        priority: "urgent",
        category: "system",
      },
      {
        id: "customer_message",
        name: "Customer Message",
        type: "push",
        title: "ข้อความจากลูกค้า",
        body: "คุณมีข้อความใหม่จาก {customer_name}",
        icon: "/icons/message.png",
        priority: "normal",
        category: "customer_service",
        actions: [
          {
            id: "reply",
            label: "ตอบกลับ",
            action: "url",
            data: { url: "/admin/messages/{message_id}" },
          },
        ],
      },
    ]
  }

  private initializeDefaultAlertRules() {
    this.alertRules = [
      {
        id: "high_error_rate",
        name: "High Error Rate",
        condition: "error_rate",
        threshold: 5,
        operator: ">",
        metric: "percentage",
        recipients: ["admin@example.com"],
        channels: ["email", "push"],
        cooldown: 30,
        isActive: true,
      },
      {
        id: "low_inventory",
        name: "Low Inventory Alert",
        condition: "inventory_level",
        threshold: 10,
        operator: "<=",
        metric: "quantity",
        recipients: ["inventory@example.com"],
        channels: ["email", "push"],
        cooldown: 60,
        isActive: true,
      },
      {
        id: "high_response_time",
        name: "High Response Time",
        condition: "response_time",
        threshold: 2000,
        operator: ">",
        metric: "milliseconds",
        recipients: ["tech@example.com"],
        channels: ["push", "webhook"],
        cooldown: 15,
        isActive: true,
      },
      {
        id: "failed_payments",
        name: "Failed Payment Alert",
        condition: "payment_failure_rate",
        threshold: 10,
        operator: ">",
        metric: "percentage",
        recipients: ["finance@example.com"],
        channels: ["email", "sms", "push"],
        cooldown: 45,
        isActive: true,
      },
    ]
  }

  private async setupServiceWorker() {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js")
        console.log("Service Worker registered:", registration)

        // Request notification permission
        if ("Notification" in window && Notification.permission === "default") {
          await Notification.requestPermission()
        }
      } catch (error) {
        console.error("Service Worker registration failed:", error)
      }
    }
  }

  // Send push notification
  async sendPushNotification(
    userId: string,
    templateId: string,
    data: Record<string, any>,
    options?: {
      immediate?: boolean
      schedule?: string
    },
  ): Promise<string> {
    try {
      const template = this.templates.find((t) => t.id === templateId)
      if (!template) {
        throw new Error(`Template ${templateId} not found`)
      }

      const preferences = this.getUserPreferences(userId)
      if (!preferences.push || !preferences.categories[template.category]) {
        logger.info(`Push notification skipped for user ${userId} due to preferences`)
        return ""
      }

      // Check quiet hours
      if (this.isQuietHours(preferences)) {
        logger.info(`Push notification delayed due to quiet hours for user ${userId}`)
        // In real implementation, schedule for later
        return ""
      }

      const notification: PushNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        title: this.interpolateTemplate(template.title, data),
        body: this.interpolateTemplate(template.body, data),
        icon: template.icon,
        badge: "/icons/badge.png",
        data: { ...data, templateId, category: template.category },
        actions: template.actions,
        timestamp: new Date().toISOString(),
        read: false,
        clicked: false,
      }

      this.notifications.push(notification)

      // Send browser push notification
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        const browserNotification = new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon,
          badge: notification.badge,
          data: notification.data,
          tag: notification.id,
          requireInteraction: template.priority === "urgent",
        })

        browserNotification.onclick = () => {
          this.handleNotificationClick(notification.id)
          browserNotification.close()
        }

        // Auto-close after 10 seconds for non-urgent notifications
        if (template.priority !== "urgent") {
          setTimeout(() => {
            browserNotification.close()
          }, 10000)
        }
      }

      // Show in-app toast notification
      this.showInAppNotification(notification)

      // Track notification sent
      analytics.trackEvent("notification_sent", "push", templateId, 1, {
        userId,
        category: template.category,
        priority: template.priority,
      })

      return notification.id
    } catch (error) {
      logger.error("Error sending push notification:", error)
      throw error
    }
  }

  private showInAppNotification(notification: PushNotification) {
    const actions = notification.actions?.map((action) => ({
      label: action.label,
      onClick: () => this.handleNotificationAction(notification.id, action.id),
    }))

    toast(notification.title, {
      description: notification.body,
      action: actions?.[0],
      duration: notification.data?.category === "system" ? Number.POSITIVE_INFINITY : 5000,
    })
  }

  // Send alert based on rules
  async sendAlert(metric: string, value: number, context: Record<string, any> = {}): Promise<void> {
    const applicableRules = this.alertRules.filter(
      (rule) => rule.isActive && rule.condition === metric && this.evaluateCondition(rule, value),
    )

    for (const rule of applicableRules) {
      // Check cooldown
      const cooldownKey = `${rule.id}_${context.resourceId || "global"}`
      const lastAlert = this.alertCooldowns.get(cooldownKey)
      if (lastAlert && Date.now() - lastAlert < rule.cooldown * 60 * 1000) {
        continue
      }

      // Send alert through configured channels
      for (const channel of rule.channels) {
        switch (channel) {
          case "push":
            for (const recipient of rule.recipients) {
              await this.sendPushNotification(recipient, "system_alert", {
                alert_message: `${rule.name}: ${metric} is ${value} ${rule.metric}`,
                metric,
                value,
                threshold: rule.threshold,
                ...context,
              })
            }
            break
          case "email":
            await this.sendEmailAlert(rule, metric, value, context)
            break
          case "sms":
            await this.sendSMSAlert(rule, metric, value, context)
            break
          case "webhook":
            await this.sendWebhookAlert(rule, metric, value, context)
            break
        }
      }

      // Set cooldown
      this.alertCooldowns.set(cooldownKey, Date.now())

      // Track alert sent
      analytics.trackEvent("alert_sent", "system", rule.name, 1, {
        metric,
        value,
        threshold: rule.threshold,
        channels: rule.channels,
      })
    }
  }

  private evaluateCondition(rule: AlertRule, value: number): boolean {
    switch (rule.operator) {
      case ">":
        return value > rule.threshold
      case "<":
        return value < rule.threshold
      case ">=":
        return value >= rule.threshold
      case "<=":
        return value <= rule.threshold
      case "=":
        return value === rule.threshold
      default:
        return false
    }
  }

  private async sendEmailAlert(rule: AlertRule, metric: string, value: number, context: Record<string, any>) {
    // Implementation would integrate with email service
    logger.info(`Email alert sent for rule ${rule.name}:`, { metric, value, context })
  }

  private async sendSMSAlert(rule: AlertRule, metric: string, value: number, context: Record<string, any>) {
    // Implementation would integrate with SMS service
    logger.info(`SMS alert sent for rule ${rule.name}:`, { metric, value, context })
  }

  private async sendWebhookAlert(rule: AlertRule, metric: string, value: number, context: Record<string, any>) {
    try {
      await fetch("/api/webhooks/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rule: rule.name,
          metric,
          value,
          threshold: rule.threshold,
          context,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      logger.error("Webhook alert failed:", error)
    }
  }

  // Notification management
  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
      analytics.trackEvent("notification_read", "engagement", notification.data?.category, 1)
    }
  }

  async markAsClicked(notificationId: string): Promise<void> {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.clicked = true
      analytics.trackEvent("notification_clicked", "engagement", notification.data?.category, 1)
    }
  }

  private handleNotificationClick(notificationId: string) {
    this.markAsClicked(notificationId)
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification?.actions?.[0]) {
      this.handleNotificationAction(notificationId, notification.actions[0].id)
    }
  }

  private handleNotificationAction(notificationId: string, actionId: string) {
    const notification = this.notifications.find((n) => n.id === notificationId)
    const action = notification?.actions?.find((a) => a.id === actionId)

    if (!action) return

    switch (action.action) {
      case "url":
        if (typeof window !== "undefined") {
          window.open(this.interpolateTemplate(action.data.url, notification?.data || {}), "_blank")
        }
        break
      case "api_call":
        fetch(action.data.endpoint, {
          method: action.data.method || "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action.data.payload || {}),
        })
        break
      case "dismiss":
        this.markAsRead(notificationId)
        break
    }

    analytics.trackEvent("notification_action", "engagement", actionId, 1, {
      notificationId,
      actionType: action.action,
    })
  }

  // User preferences
  getUserPreferences(userId: string): NotificationPreferences {
    return (
      this.userPreferences.get(userId) || {
        userId,
        email: true,
        sms: false,
        push: true,
        in_app: true,
        categories: {
          orders: true,
          payments: true,
          inventory: true,
          system: true,
          customer_service: true,
        },
        quiet_hours: {
          enabled: false,
          start: "22:00",
          end: "08:00",
        },
      }
    )
  }

  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const current = this.getUserPreferences(userId)
    const updated = { ...current, ...preferences }
    this.userPreferences.set(userId, updated)

    // In real implementation, save to database
    logger.info(`Updated notification preferences for user ${userId}`)
  }

  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const [startHour, startMin] = preferences.quiet_hours.start.split(":").map(Number)
    const [endHour, endMin] = preferences.quiet_hours.end.split(":").map(Number)
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime
    }
  }

  private interpolateTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key]?.toString() || match
    })
  }

  // Analytics and reporting
  async getNotificationAnalytics(userId?: string, dateRange?: { start: string; end: string }) {
    let notifications = this.notifications

    if (userId) {
      notifications = notifications.filter((n) => n.userId === userId)
    }

    if (dateRange) {
      notifications = notifications.filter((n) => n.timestamp >= dateRange.start && n.timestamp <= dateRange.end)
    }

    const total = notifications.length
    const read = notifications.filter((n) => n.read).length
    const clicked = notifications.filter((n) => n.clicked).length

    const byCategory = notifications.reduce(
      (acc, n) => {
        const category = n.data?.category || "unknown"
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total,
      read,
      clicked,
      readRate: total > 0 ? (read / total) * 100 : 0,
      clickRate: total > 0 ? (clicked / total) * 100 : 0,
      byCategory,
    }
  }

  // Management methods
  async createTemplate(template: Omit<NotificationTemplate, "id">): Promise<NotificationTemplate> {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: `template_${Date.now()}`,
    }
    this.templates.push(newTemplate)
    return newTemplate
  }

  async createAlertRule(rule: Omit<AlertRule, "id">): Promise<AlertRule> {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}`,
    }
    this.alertRules.push(newRule)
    return newRule
  }

  getNotifications(userId?: string, limit = 50): PushNotification[] {
    let notifications = this.notifications

    if (userId) {
      notifications = notifications.filter((n) => n.userId === userId)
    }

    return notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  getTemplates(): NotificationTemplate[] {
    return this.templates
  }

  getAlertRules(): AlertRule[] {
    return this.alertRules
  }
}

export const realTimeNotificationService = new RealTimeNotificationService()
export type { NotificationTemplate, NotificationPreferences, PushNotification, AlertRule }
