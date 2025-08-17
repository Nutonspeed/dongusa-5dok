import "server-only"
import { Redis } from "@upstash/redis"
import { randomBytes } from "crypto"
import { securityService } from "@/lib/security-service"

interface SessionData {
  id: string
  userId: string
  email: string
  role: string
  ipAddress: string
  userAgent: string
  createdAt: number
  lastActivity: number
  expiresAt: number
  isActive: boolean
  deviceFingerprint?: string
}

interface SessionConfig {
  maxAge: number // Session duration in milliseconds
  idleTimeout: number // Idle timeout in milliseconds
  maxConcurrentSessions: number // Max sessions per user
  requireReauth: boolean // Require re-authentication for sensitive operations
  trackDevices: boolean // Track device fingerprints
}

interface SessionValidationResult {
  isValid: boolean
  session?: SessionData
  shouldRefresh: boolean
  securityWarnings: string[]
  requiresReauth: boolean
}

export class SessionManager {
  private redis: Redis
  private config: SessionConfig

  constructor(config?: Partial<SessionConfig>) {
    this.redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })

    this.config = {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      idleTimeout: 30 * 60 * 1000, // 30 minutes
      maxConcurrentSessions: 5,
      requireReauth: true,
      trackDevices: true,
      ...config,
    }
  }

  async createSession(
    userId: string,
    email: string,
    role: string,
    ipAddress: string,
    userAgent: string,
    deviceFingerprint?: string,
  ): Promise<{ sessionId: string; session: SessionData }> {
    const sessionId = this.generateSessionId()
    const now = Date.now()

    const session: SessionData = {
      id: sessionId,
      userId,
      email,
      role,
      ipAddress,
      userAgent,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.config.maxAge,
      isActive: true,
      deviceFingerprint,
    }

    // Check and enforce concurrent session limit
    await this.enforceConcurrentSessionLimit(userId)

    // Store session
    const sessionKey = `session:${sessionId}`
    const userSessionsKey = `user_sessions:${userId}`

    await this.redis.setex(sessionKey, Math.floor(this.config.maxAge / 1000), JSON.stringify(session))
    await this.redis.sadd(userSessionsKey, sessionId)
    await this.redis.expire(userSessionsKey, Math.floor(this.config.maxAge / 1000))

    // Log session creation
    await securityService.logSecurityEvent({
      id: `session_created_${now}`,
      type: "login_attempt",
      severity: "low",
      ip_address: ipAddress,
      user_agent: userAgent,
      user_id: userId,
      details: { sessionId, email, role },
      timestamp: new Date().toISOString(),
      blocked: false,
    })

    return { sessionId, session }
  }

  async validateSession(sessionId: string, ipAddress: string, userAgent: string): Promise<SessionValidationResult> {
    const sessionKey = `session:${sessionId}`
    const sessionData = await this.redis.get(sessionKey)

    if (!sessionData) {
      return {
        isValid: false,
        shouldRefresh: false,
        securityWarnings: ["Session not found"],
        requiresReauth: false,
      }
    }

    try {
      const session: SessionData = JSON.parse(sessionData as string)
      const now = Date.now()
      const securityWarnings: string[] = []

      // Check if session has expired
      if (session.expiresAt < now) {
        await this.destroySession(sessionId)
        return {
          isValid: false,
          shouldRefresh: true,
          securityWarnings: ["Session expired"],
          requiresReauth: false,
        }
      }

      // Check idle timeout
      if (now - session.lastActivity > this.config.idleTimeout) {
        await this.destroySession(sessionId)
        return {
          isValid: false,
          shouldRefresh: true,
          securityWarnings: ["Session idle timeout"],
          requiresReauth: false,
        }
      }

      // Check for IP address changes
      if (session.ipAddress !== ipAddress) {
        securityWarnings.push("IP address changed")
        await securityService.logSecurityEvent({
          id: `ip_change_${now}`,
          type: "suspicious_activity",
          severity: "medium",
          ip_address: ipAddress,
          user_agent: userAgent,
          user_id: session.userId,
          details: {
            sessionId,
            oldIp: session.ipAddress,
            newIp: ipAddress,
          },
          timestamp: new Date().toISOString(),
          blocked: false,
        })
      }

      // Check for user agent changes (less strict)
      if (session.userAgent !== userAgent) {
        securityWarnings.push("User agent changed")
      }

      // Update last activity
      session.lastActivity = now
      await this.redis.setex(sessionKey, Math.floor((session.expiresAt - now) / 1000), JSON.stringify(session))

      // Determine if refresh is needed (within 5 minutes of expiry)
      const shouldRefresh = session.expiresAt - now < 5 * 60 * 1000

      // Determine if re-authentication is required for sensitive operations
      const requiresReauth =
        this.config.requireReauth && (securityWarnings.length > 0 || now - session.createdAt > 60 * 60 * 1000) // 1 hour

      return {
        isValid: true,
        session,
        shouldRefresh,
        securityWarnings,
        requiresReauth,
      }
    } catch (error) {
      await this.destroySession(sessionId)
      return {
        isValid: false,
        shouldRefresh: false,
        securityWarnings: ["Session data corrupted"],
        requiresReauth: false,
      }
    }
  }

  async refreshSession(sessionId: string): Promise<{ success: boolean; newExpiresAt?: number }> {
    const sessionKey = `session:${sessionId}`
    const sessionData = await this.redis.get(sessionKey)

    if (!sessionData) {
      return { success: false }
    }

    try {
      const session: SessionData = JSON.parse(sessionData as string)
      const now = Date.now()

      // Extend session
      session.expiresAt = now + this.config.maxAge
      session.lastActivity = now

      await this.redis.setex(sessionKey, Math.floor(this.config.maxAge / 1000), JSON.stringify(session))

      return { success: true, newExpiresAt: session.expiresAt }
    } catch (error) {
      return { success: false }
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    const sessionKey = `session:${sessionId}`
    const sessionData = await this.redis.get(sessionKey)

    if (sessionData) {
      try {
        const session: SessionData = JSON.parse(sessionData as string)
        const userSessionsKey = `user_sessions:${session.userId}`

        // Remove from user sessions set
        await this.redis.srem(userSessionsKey, sessionId)

        // Log session destruction
        await securityService.logSecurityEvent({
          id: `session_destroyed_${Date.now()}`,
          type: "login_attempt",
          severity: "low",
          ip_address: session.ipAddress,
          user_agent: session.userAgent,
          user_id: session.userId,
          details: { sessionId, reason: "manual_logout" },
          timestamp: new Date().toISOString(),
          blocked: false,
        })
      } catch (error) {
        // Continue with deletion even if parsing fails
      }
    }

    await this.redis.del(sessionKey)
  }

  async destroyAllUserSessions(userId: string, exceptSessionId?: string): Promise<number> {
    const userSessionsKey = `user_sessions:${userId}`
    const sessionIds = await this.redis.smembers(userSessionsKey)

    let destroyedCount = 0

    for (const sessionId of sessionIds) {
      if (sessionId !== exceptSessionId) {
        await this.destroySession(sessionId as string)
        destroyedCount++
      }
    }

    return destroyedCount
  }

  async getUserSessions(userId: string): Promise<SessionData[]> {
    const userSessionsKey = `user_sessions:${userId}`
    const sessionIds = await this.redis.smembers(userSessionsKey)

    const sessions: SessionData[] = []

    for (const sessionId of sessionIds) {
      const sessionKey = `session:${sessionId}`
      const sessionData = await this.redis.get(sessionKey)

      if (sessionData) {
        try {
          const session: SessionData = JSON.parse(sessionData as string)
          const now = Date.now()

          // Check if session is still valid
          if (session.expiresAt > now && now - session.lastActivity <= this.config.idleTimeout) {
            sessions.push(session)
          } else {
            // Clean up expired session
            await this.destroySession(sessionId as string)
          }
        } catch (error) {
          // Clean up corrupted session
          await this.destroySession(sessionId as string)
        }
      }
    }

    return sessions
  }

  async getSessionMetrics(): Promise<{
    totalActiveSessions: number
    sessionsLast24h: number
    averageSessionDuration: number
    topUserAgents: Array<{ userAgent: string; count: number }>
    suspiciousActivities: number
  }> {
    // This would typically query from security events and session data
    const keys = await this.redis.keys("session:*")
    const totalActiveSessions = keys.length

    // Get security metrics for session-related events
    const securityMetrics = await securityService.getSecurityMetrics("24h")

    return {
      totalActiveSessions,
      sessionsLast24h: securityMetrics.total_events,
      averageSessionDuration: 45 * 60 * 1000, // Placeholder: 45 minutes
      topUserAgents: [
        { userAgent: "Chrome", count: 150 },
        { userAgent: "Safari", count: 80 },
        { userAgent: "Firefox", count: 45 },
      ],
      suspiciousActivities: securityMetrics.blocked_attempts,
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    const keys = await this.redis.keys("session:*")
    let cleanedCount = 0

    for (const key of keys) {
      const sessionData = await this.redis.get(key)
      if (sessionData) {
        try {
          const session: SessionData = JSON.parse(sessionData as string)
          const now = Date.now()

          if (session.expiresAt < now || now - session.lastActivity > this.config.idleTimeout) {
            await this.destroySession(session.id)
            cleanedCount++
          }
        } catch (error) {
          // Clean up corrupted session
          await this.redis.del(key)
          cleanedCount++
        }
      }
    }

    return cleanedCount
  }

  private generateSessionId(): string {
    return randomBytes(32).toString("hex")
  }

  private async enforceConcurrentSessionLimit(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId)

    if (sessions.length >= this.config.maxConcurrentSessions) {
      // Sort by last activity and remove oldest sessions
      sessions.sort((a, b) => a.lastActivity - b.lastActivity)

      const sessionsToRemove = sessions.slice(0, sessions.length - this.config.maxConcurrentSessions + 1)

      for (const session of sessionsToRemove) {
        await this.destroySession(session.id)
      }

      // Log concurrent session limit enforcement
      await securityService.logSecurityEvent({
        id: `concurrent_limit_${Date.now()}`,
        type: "suspicious_activity",
        severity: "medium",
        ip_address: "system",
        user_agent: "system",
        user_id: userId,
        details: {
          reason: "concurrent_session_limit",
          removedSessions: sessionsToRemove.length,
          limit: this.config.maxConcurrentSessions,
        },
        timestamp: new Date().toISOString(),
        blocked: false,
      })
    }
  }
}

export const sessionManager = new SessionManager()
