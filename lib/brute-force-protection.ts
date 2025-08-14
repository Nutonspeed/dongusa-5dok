import { securityService } from "@/lib/security-service"
import { Redis } from "@upstash/redis"

interface BruteForceConfig {
  maxAttempts: number
  windowMs: number
  lockoutDurationMs: number
  progressiveLockout: boolean
  captchaThreshold: number
  ipBlockThreshold: number
  ipBlockDurationMs: number
}

interface LoginAttemptResult {
  allowed: boolean
  remainingAttempts: number
  lockoutUntil?: number
  requiresCaptcha: boolean
  isBlocked: boolean
  message: string
}

interface IPBlockResult {
  isBlocked: boolean
  blockUntil?: number
  reason: string
}

export class BruteForceProtection {
  private redis: Redis
  private config: BruteForceConfig

  constructor(config?: Partial<BruteForceConfig>) {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    this.config = {
      maxAttempts: 5,
      windowMs: 900000, // 15 minutes
      lockoutDurationMs: 900000, // 15 minutes
      progressiveLockout: true,
      captchaThreshold: 3,
      ipBlockThreshold: 20,
      ipBlockDurationMs: 3600000, // 1 hour
      ...config,
    }
  }

  async checkLoginAttempt(
    identifier: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
  ): Promise<LoginAttemptResult> {
    const now = Date.now()

    // Check if IP is blocked
    const ipBlock = await this.checkIPBlock(ipAddress)
    if (ipBlock.isBlocked) {
      return {
        allowed: false,
        remainingAttempts: 0,
        requiresCaptcha: false,
        isBlocked: true,
        message: `IP address blocked until ${new Date(ipBlock.blockUntil!).toLocaleString()}. Reason: ${ipBlock.reason}`,
      }
    }

    const accountKey = `login_attempts:${identifier}`
    const ipKey = `ip_attempts:${ipAddress}`
    const lockoutKey = `lockout:${identifier}`

    // Check if account is locked
    const lockoutUntil = await this.redis.get(lockoutKey)
    if (lockoutUntil && now < Number.parseInt(lockoutUntil as string)) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutUntil: Number.parseInt(lockoutUntil as string),
        requiresCaptcha: false,
        isBlocked: false,
        message: `Account locked until ${new Date(Number.parseInt(lockoutUntil as string)).toLocaleString()}`,
      }
    }

    if (success) {
      // Clear attempts on successful login
      await this.redis.del(accountKey)
      await this.redis.del(lockoutKey)

      // Log successful login
      await securityService.logSecurityEvent({
        id: `login_success_${now}`,
        type: "login_attempt",
        severity: "low",
        ip_address: ipAddress,
        user_agent: userAgent,
        details: { identifier, success: true },
        timestamp: new Date().toISOString(),
        blocked: false,
      })

      return {
        allowed: true,
        remainingAttempts: this.config.maxAttempts,
        requiresCaptcha: false,
        isBlocked: false,
        message: "Login successful",
      }
    }

    // Handle failed login attempt
    const accountAttempts = await this.redis.incr(accountKey)
    const ipAttempts = await this.redis.incr(ipKey)

    // Set expiration for attempt counters
    await this.redis.expire(accountKey, Math.floor(this.config.windowMs / 1000))
    await this.redis.expire(ipKey, Math.floor(this.config.windowMs / 1000))

    // Check if we need to block the IP
    if (ipAttempts >= this.config.ipBlockThreshold) {
      await this.blockIP(ipAddress, "Excessive failed login attempts", this.config.ipBlockDurationMs)

      await securityService.logSecurityEvent({
        id: `ip_blocked_${now}`,
        type: "brute_force_attack",
        severity: "critical",
        ip_address: ipAddress,
        user_agent: userAgent,
        details: { reason: "IP blocked for excessive attempts", attempts: ipAttempts },
        timestamp: new Date().toISOString(),
        blocked: true,
      })

      return {
        allowed: false,
        remainingAttempts: 0,
        requiresCaptcha: false,
        isBlocked: true,
        message: "IP address has been blocked due to suspicious activity",
      }
    }

    // Check if account should be locked
    if (accountAttempts >= this.config.maxAttempts) {
      let lockoutDuration = this.config.lockoutDurationMs

      // Progressive lockout - increase duration for repeated lockouts
      if (this.config.progressiveLockout) {
        const lockoutHistoryKey = `lockout_history:${identifier}`
        const lockoutCount = await this.redis.incr(lockoutHistoryKey)
        await this.redis.expire(lockoutHistoryKey, 86400) // 24 hours

        lockoutDuration = this.config.lockoutDurationMs * Math.pow(2, lockoutCount - 1)
        lockoutDuration = Math.min(lockoutDuration, 86400000) // Max 24 hours
      }

      const lockoutUntilTime = now + lockoutDuration
      await this.redis.setex(lockoutKey, Math.floor(lockoutDuration / 1000), lockoutUntilTime.toString())

      await securityService.logSecurityEvent({
        id: `account_locked_${now}`,
        type: "account_lockout",
        severity: "high",
        ip_address: ipAddress,
        user_agent: userAgent,
        details: { identifier, attempts: accountAttempts, lockout_duration: lockoutDuration },
        timestamp: new Date().toISOString(),
        blocked: true,
      })

      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutUntil: lockoutUntilTime,
        requiresCaptcha: false,
        isBlocked: false,
        message: `Account locked for ${Math.round(lockoutDuration / 60000)} minutes due to too many failed attempts`,
      }
    }

    // Log failed attempt
    await securityService.logSecurityEvent({
      id: `login_failed_${now}`,
      type: "login_attempt",
      severity: "medium",
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { identifier, attempts: accountAttempts, success: false },
      timestamp: new Date().toISOString(),
      blocked: false,
    })

    const remainingAttempts = this.config.maxAttempts - accountAttempts
    const requiresCaptcha = accountAttempts >= this.config.captchaThreshold

    return {
      allowed: true,
      remainingAttempts,
      requiresCaptcha,
      isBlocked: false,
      message: `Invalid credentials. ${remainingAttempts} attempts remaining${requiresCaptcha ? ". CAPTCHA required." : ""}`,
    }
  }

  async checkIPBlock(ipAddress: string): Promise<IPBlockResult> {
    const blockKey = `ip_blocked:${ipAddress}`
    const blockData = await this.redis.get(blockKey)

    if (!blockData) {
      return { isBlocked: false, reason: "" }
    }

    try {
      const { until, reason } = JSON.parse(blockData as string)
      const now = Date.now()

      if (now >= until) {
        await this.redis.del(blockKey)
        return { isBlocked: false, reason: "" }
      }

      return {
        isBlocked: true,
        blockUntil: until,
        reason,
      }
    } catch {
      await this.redis.del(blockKey)
      return { isBlocked: false, reason: "" }
    }
  }

  async blockIP(ipAddress: string, reason: string, durationMs: number): Promise<void> {
    const blockKey = `ip_blocked:${ipAddress}`
    const until = Date.now() + durationMs
    const blockData = JSON.stringify({ until, reason })

    await this.redis.setex(blockKey, Math.floor(durationMs / 1000), blockData)
  }

  async unblockIP(ipAddress: string): Promise<void> {
    const blockKey = `ip_blocked:${ipAddress}`
    await this.redis.del(blockKey)
  }

  async resetAccountAttempts(identifier: string): Promise<void> {
    const accountKey = `login_attempts:${identifier}`
    const lockoutKey = `lockout:${identifier}`
    await this.redis.del(accountKey)
    await this.redis.del(lockoutKey)
  }

  async getAccountStatus(identifier: string): Promise<{
    attempts: number
    isLocked: boolean
    lockoutUntil?: number
    requiresCaptcha: boolean
  }> {
    const accountKey = `login_attempts:${identifier}`
    const lockoutKey = `lockout:${identifier}`

    const attempts = (await this.redis.get(accountKey)) || 0
    const lockoutUntil = await this.redis.get(lockoutKey)
    const now = Date.now()

    const isLocked = lockoutUntil && now < Number.parseInt(lockoutUntil as string)
    const requiresCaptcha = Number(attempts) >= this.config.captchaThreshold

    return {
      attempts: Number(attempts),
      isLocked: !!isLocked,
      lockoutUntil: isLocked ? Number.parseInt(lockoutUntil as string) : undefined,
      requiresCaptcha,
    }
  }

  async getIPStatus(ipAddress: string): Promise<{
    attempts: number
    isBlocked: boolean
    blockUntil?: number
  }> {
    const ipKey = `ip_attempts:${ipAddress}`
    const attempts = (await this.redis.get(ipKey)) || 0

    const blockResult = await this.checkIPBlock(ipAddress)

    return {
      attempts: Number(attempts),
      isBlocked: blockResult.isBlocked,
      blockUntil: blockResult.blockUntil,
    }
  }

  async getBruteForceMetrics(timeRange: "1h" | "24h" | "7d" = "24h"): Promise<{
    totalAttempts: number
    failedAttempts: number
    lockedAccounts: number
    blockedIPs: number
    topAttackers: Array<{ ip: string; attempts: number }>
  }> {
    // This would typically query from security events
    const metrics = await securityService.getSecurityMetrics(timeRange)

    // Get current locked accounts and blocked IPs
    const keys = await this.redis.keys("lockout:*")
    const ipBlockKeys = await this.redis.keys("ip_blocked:*")

    const lockedAccounts = keys.length
    const blockedIPs = ipBlockKeys.length

    return {
      totalAttempts: metrics.total_events,
      failedAttempts: metrics.blocked_attempts,
      lockedAccounts,
      blockedIPs,
      topAttackers: metrics.threat_sources.map((source) => ({
        ip: source.ip,
        attempts: source.count,
      })),
    }
  }
}

export const bruteForceProtection = new BruteForceProtection()
