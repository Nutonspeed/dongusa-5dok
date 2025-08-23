"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Monitor, Shield, X } from "lucide-react"
import { useAuth } from "@/app/contexts/AuthContext"

interface SessionInfo {
  id: string
  ipAddress: string
  userAgent: string
  createdAt: number
  lastActivity: number
  isCurrent: boolean
}

export function SessionManager() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([])
  const [requiresReauth, setRequiresReauth] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadSessions()
      checkSecurityHeaders()
    }
  }, [user])

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/user/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
  // console.error("Failed to load sessions:", error)
    }
  }

  const checkSecurityHeaders = () => {
    // Check for security warnings from middleware
    const warnings = document.querySelector('meta[name="security-warnings"]')?.getAttribute("content")
    const reauth = document.querySelector('meta[name="requires-reauth"]')?.getAttribute("content")

    if (warnings) {
      try {
        setSecurityWarnings(JSON.parse(warnings))
      } catch (error) {
        // Ignore parsing errors
      }
    }

    if (reauth === "true") {
      setRequiresReauth(true)
    }
  }

  const terminateSession = async (sessionId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadSessions()
      }
    } catch (error) {
  // console.error("Failed to terminate session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const terminateAllOtherSessions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/sessions/terminate-others", {
        method: "POST",
      })

      if (response.ok) {
        await loadSessions()
      }
    } catch (error) {
  // console.error("Failed to terminate sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatLastActivity = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    return "Just now"
  }

  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return { browser: "Chrome", icon: "🌐" }
    if (userAgent.includes("Safari")) return { browser: "Safari", icon: "🧭" }
    if (userAgent.includes("Firefox")) return { browser: "Firefox", icon: "🦊" }
    if (userAgent.includes("Edge")) return { browser: "Edge", icon: "🔷" }
    return { browser: "Unknown", icon: "❓" }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Security Warnings */}
      {securityWarnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Security Alert</div>
            <ul className="list-disc list-inside space-y-1">
              {securityWarnings.map((warning, index) => (
                <li key={index} className="text-sm">
                  {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Re-authentication Required */}
      {requiresReauth && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Re-authentication Required</div>
                <div className="text-sm">Please verify your identity for sensitive operations.</div>
              </div>
              <Button size="sm" variant="outline">
                Verify Identity
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage your active login sessions across devices</CardDescription>
            </div>
            {sessions.length > 1 && (
              <Button variant="outline" size="sm" onClick={terminateAllOtherSessions} disabled={isLoading}>
                Terminate All Others
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => {
              const device = getDeviceInfo(session.userAgent)
              return (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{device.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{device.browser}</span>
                        {session.isCurrent && <Badge variant="secondary">Current Session</Badge>}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>IP: {session.ipAddress}</div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last active: {formatLastActivity(session.lastActivity)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button variant="ghost" size="sm" onClick={() => terminateSession(session.id)} disabled={isLoading}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}

            {sessions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active sessions found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
