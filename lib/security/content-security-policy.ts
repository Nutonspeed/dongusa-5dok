// Content Security Policy configuration
export interface CSPDirectives {
  "default-src"?: string[]
  "script-src"?: string[]
  "style-src"?: string[]
  "img-src"?: string[]
  "font-src"?: string[]
  "connect-src"?: string[]
  "media-src"?: string[]
  "object-src"?: string[]
  "child-src"?: string[]
  "worker-src"?: string[]
  "frame-src"?: string[]
  "form-action"?: string[]
  "base-uri"?: string[]
  "manifest-src"?: string[]
  "upgrade-insecure-requests"?: boolean
  "block-all-mixed-content"?: boolean
}

export class ContentSecurityPolicy {
  private directives: CSPDirectives
  private reportUri?: string
  private reportOnly: boolean

  constructor(directives: CSPDirectives, options: { reportUri?: string; reportOnly?: boolean } = {}) {
    this.directives = directives
    this.reportUri = options.reportUri
    this.reportOnly = options.reportOnly || false
  }

  toString(): string {
    const policies: string[] = []

    Object.entries(this.directives).forEach(([directive, value]) => {
      if (typeof value === "boolean" && value) {
        policies.push(directive.replace(/([A-Z])/g, "-$1").toLowerCase())
      } else if (Array.isArray(value) && value.length > 0) {
        const directiveName = directive.replace(/([A-Z])/g, "-$1").toLowerCase()
        policies.push(`${directiveName} ${value.join(" ")}`)
      }
    })

    if (this.reportUri) {
      policies.push(`report-uri ${this.reportUri}`)
    }

    return policies.join("; ")
  }

  getHeaderName(): string {
    return this.reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy"
  }

  // Predefined secure configurations
  static strict(): ContentSecurityPolicy {
    return new ContentSecurityPolicy({
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "font-src": ["'self'", "https:", "data:"],
      "connect-src": ["'self'"],
      "media-src": ["'self'"],
      "object-src": ["'none'"],
      "child-src": ["'self'"],
      "worker-src": ["'self'"],
      "frame-src": ["'self'"],
      "form-action": ["'self'"],
      "base-uri": ["'self'"],
      "upgrade-insecure-requests": true,
      "block-all-mixed-content": true,
    })
  }

  static development(): ContentSecurityPolicy {
    return new ContentSecurityPolicy(
      {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "localhost:*"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:", "http:"],
        "font-src": ["'self'", "https:", "data:"],
        "connect-src": ["'self'", "ws:", "wss:", "localhost:*"],
        "media-src": ["'self'"],
        "object-src": ["'none'"],
        "child-src": ["'self'"],
        "worker-src": ["'self'", "blob:"],
        "frame-src": ["'self'"],
        "form-action": ["'self'"],
        "base-uri": ["'self'"],
      },
      { reportOnly: true },
    )
  }

  static production(): ContentSecurityPolicy {
    return new ContentSecurityPolicy(
      {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'sha256-HASH_HERE'"], // Replace with actual hashes
        "style-src": ["'self'", "'sha256-HASH_HERE'"],
        "img-src": ["'self'", "data:", "https://trusted-cdn.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "connect-src": ["'self'", "https://api.example.com"],
        "media-src": ["'self'"],
        "object-src": ["'none'"],
        "child-src": ["'none'"],
        "worker-src": ["'self'"],
        "frame-src": ["'none'"],
        "form-action": ["'self'"],
        "base-uri": ["'self'"],
        "upgrade-insecure-requests": true,
        "block-all-mixed-content": true,
      },
      { reportUri: "/api/csp-report" },
    )
  }
}

// CSP violation reporting
export interface CSPViolation {
  "document-uri": string
  referrer: string
  "violated-directive": string
  "effective-directive": string
  "original-policy": string
  disposition: string
  "blocked-uri": string
  "line-number": number
  "column-number": number
  "source-file": string
  "status-code": number
  "script-sample": string
}

export class CSPViolationReporter {
  private violations: CSPViolation[] = []
  private maxViolations = 1000

  reportViolation(violation: CSPViolation): void {
    this.violations.push({
      ...violation,
      timestamp: new Date().toISOString(),
    } as any)

    // Keep only recent violations
    if (this.violations.length > this.maxViolations) {
      this.violations = this.violations.slice(-this.maxViolations)
    }

    // Log violation
    console.warn("CSP Violation:", violation)

    // Send to monitoring service
    this.sendToMonitoring(violation)
  }

  private async sendToMonitoring(violation: CSPViolation): Promise<void> {
    try {
      await fetch("/api/security/csp-violations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(violation),
      })
    } catch (error) {
      console.error("Failed to report CSP violation:", error)
    }
  }

  getViolations(): CSPViolation[] {
    return [...this.violations]
  }

  getViolationsByDirective(directive: string): CSPViolation[] {
    return this.violations.filter((v) => v["violated-directive"].includes(directive))
  }

  clearViolations(): void {
    this.violations = []
  }
}

// Export singleton instance
export const cspReporter = new CSPViolationReporter()
