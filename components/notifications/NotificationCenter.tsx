"use client"

import { useState, useEffect } from "react"
import { Bell, Check, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  realTimeNotificationService,
  type PushNotification,
  type NotificationPreferences,
} from "@/lib/real-time-notification-service"

export function NotificationCenter({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<PushNotification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadNotifications()
    loadPreferences()

    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/push?userId=${userId}&limit=20`)
      const data = await response.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.notifications?.filter((n: PushNotification) => !n.read).length || 0)
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const loadPreferences = () => {
    const prefs = realTimeNotificationService.getUserPreferences(userId)
    setPreferences(prefs)
  }

  const markAsRead = async (notificationId: string) => {
    await realTimeNotificationService.markAsRead(notificationId)
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read)
    for (const notification of unreadNotifications) {
      await realTimeNotificationService.markAsRead(notification.id)
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!preferences) return

    const newPreferences = { ...preferences, ...updates }
    await realTimeNotificationService.updateUserPreferences(userId, updates)
    setPreferences(newPreferences)
  }

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "system":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "orders":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "payments":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "inventory":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "เมื่อสักครู่"
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`
    return date.toLocaleDateString("th-TH")
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        <Tabs defaultValue="notifications" className="w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
              <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications" className="mt-0">
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>ไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                <>
                  <div className="p-3 border-b flex justify-between items-center">
                    <span className="text-sm font-medium">การแจ้งเตือนทั้งหมด ({notifications.length})</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                        <Check className="h-4 w-4 mr-1" />
                        อ่านทั้งหมด
                      </Button>
                    )}
                  </div>

                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.data?.category || "default")}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
                            <p className="text-xs text-gray-400 mt-2">{formatTime(notification.timestamp)}</p>
                          </div>
                          {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">ช่องทางการแจ้งเตือน</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Push Notifications</span>
                    <Switch
                      checked={preferences?.push || false}
                      onCheckedChange={(checked) => updatePreferences({ push: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">อีเมล</span>
                    <Switch
                      checked={preferences?.email || false}
                      onCheckedChange={(checked) => updatePreferences({ email: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS</span>
                    <Switch
                      checked={preferences?.sms || false}
                      onCheckedChange={(checked) => updatePreferences({ sms: checked })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">หมวดหมู่การแจ้งเตือน</h3>
                <div className="space-y-3">
                  {preferences &&
                    Object.entries(preferences.categories).map(([category, enabled]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm capitalize">
                          {category === "orders" && "คำสั่งซื้อ"}
                          {category === "payments" && "การชำระเงิน"}
                          {category === "inventory" && "คลังสินค้า"}
                          {category === "system" && "ระบบ"}
                          {category === "customer_service" && "บริการลูกค้า"}
                        </span>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) =>
                            updatePreferences({
                              categories: { ...preferences.categories, [category]: checked },
                            })
                          }
                        />
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">ช่วงเวลาเงียบ</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">เปิดใช้งาน</span>
                  <Switch
                    checked={preferences?.quiet_hours.enabled || false}
                    onCheckedChange={(checked) =>
                      updatePreferences({
                        quiet_hours: { ...preferences?.quiet_hours, enabled: checked } as any,
                      })
                    }
                  />
                </div>
                {preferences?.quiet_hours.enabled && (
                  <div className="text-xs text-gray-600">
                    {preferences.quiet_hours.start} - {preferences.quiet_hours.end}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
