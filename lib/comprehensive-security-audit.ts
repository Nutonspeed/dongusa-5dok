import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"

const execAsync = promisify(exec)

interface SecurityAuditResult {
  timestamp: string
  overallScore: number
  criticalIssues: number
  highIssues: number
  mediumIssues: number
  lowIssues: number
  categories: {
    authentication: SecurityCategoryResult
    authorization: SecurityCategoryResult
    inputValidation: SecurityCategoryResult
    dataProtection: SecurityCategoryResult
    networkSecurity: SecurityCategoryResult
    dependencySecurity: SecurityCategoryResult
  }
  recommendations: string[]
  complianceStatus: {
    gdpr: boolean
    pci: boolean
    owasp: boolean
  }
}

interface SecurityCategoryResult {
  score: number
  issues: SecurityIssue[]
  passed: number
  failed: number
  total: number
}

interface SecurityIssue {
  id: string
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  location: string
  recommendation: string
  cwe?: string
  owasp?: string
}

class ComprehensiveSecurityAuditor {
  private auditResults: SecurityAuditResult = {
    timestamp: "",
    overallScore: 0,
    criticalIssues: 0,
    highIssues: 0,
    mediumIssues: 0,
    lowIssues: 0,
    categories: {
      authentication: { score: 0, issues: [], passed: 0, failed: 0, total: 0 },
      authorization: { score: 0, issues: [], passed: 0, failed: 0, total: 0 },
      inputValidation: { score: 0, issues: [], passed: 0, failed: 0, total: 0 },
      dataProtection: { score: 0, issues: [], passed: 0, failed: 0, total: 0 },
      networkSecurity: { score: 0, issues: [], passed: 0, failed: 0, total: 0 },
      dependencySecurity: { score: 0, issues: [], passed: 0, failed: 0, total: 0 },
    },
    recommendations: [],
    complianceStatus: {
      gdpr: false,
      pci: false,
      owasp: false,
    },
  }

  async performComprehensiveAudit(): Promise<SecurityAuditResult> {
    console.log("🔒 Starting Comprehensive Security Audit...")

    this.auditResults.timestamp = new Date().toISOString()

    // Run all security audits
    await this.auditAuthentication()
    await this.auditAuthorization()
    await this.auditInputValidation()
    await this.auditDataProtection()
    await this.auditNetworkSecurity()
    await this.auditDependencySecurity()

    // Calculate overall scores
    this.calculateOverallScore()
    this.generateRecommendations()
    this.checkCompliance()

    // Save audit results
    await this.saveAuditResults()
    await this.generateAuditReport()

    console.log(`🔒 Security Audit Complete - Overall Score: ${this.auditResults.overallScore}/100`)

    return this.auditResults
  }

  private async auditAuthentication(): Promise<void> {
    console.log("🔐 Auditing Authentication Security...")

    const issues: SecurityIssue[] = []
    let passed = 0
    let total = 0

    // Check authentication implementation
    total++
    try {
      const authContextExists = await this.fileExists("app/contexts/AuthContext.tsx")
      if (authContextExists) {
        passed++
      } else {
        issues.push({
          id: "auth_001",
          severity: "critical",
          title: "Missing Authentication Context",
          description: "No authentication context found",
          location: "app/contexts/AuthContext.tsx",
          recommendation: "Implement proper authentication context",
          cwe: "CWE-287",
          owasp: "A07:2021 – Identification and Authentication Failures",
        })
      }
    } catch (error) {
      issues.push({
        id: "auth_002",
        severity: "high",
        title: "Authentication System Error",
        description: "Error checking authentication implementation",
        location: "Authentication System",
        recommendation: "Review authentication implementation",
      })
    }

    // Check password security
    total++
    const passwordSecurityCheck = await this.checkPasswordSecurity()
    if (passwordSecurityCheck.passed) {
      passed++
    } else {
      issues.push(...passwordSecurityCheck.issues)
    }

    // Check session management
    total++
    const sessionCheck = await this.checkSessionManagement()
    if (sessionCheck.passed) {
      passed++
    } else {
      issues.push(...sessionCheck.issues)
    }

    // Check multi-factor authentication
    total++
    const mfaCheck = await this.checkMFAImplementation()
    if (mfaCheck.passed) {
      passed++
    } else {
      issues.push(...mfaCheck.issues)
    }

    this.auditResults.categories.authentication = {
      score: Math.round((passed / total) * 100),
      issues,
      passed,
      failed: total - passed,
      total,
    }
  }

  private async auditAuthorization(): Promise<void> {
    console.log("🛡️ Auditing Authorization Security...")

    const issues: SecurityIssue[] = []
    let passed = 0
    let total = 0

    // Check middleware protection
    total++
    try {
      const middlewareExists = await this.fileExists("middleware.ts")
      if (middlewareExists) {
        const middlewareContent = await fs.readFile("middleware.ts", "utf-8")
        if (middlewareContent.includes("admin") && middlewareContent.includes("auth")) {
          passed++
        } else {
          issues.push({
            id: "authz_001",
            severity: "high",
            title: "Incomplete Middleware Protection",
            description: "Middleware does not properly protect admin routes",
            location: "middleware.ts",
            recommendation: "Implement proper route protection in middleware",
            cwe: "CWE-285",
            owasp: "A01:2021 – Broken Access Control",
          })
        }
      } else {
        issues.push({
          id: "authz_002",
          severity: "critical",
          title: "Missing Route Protection",
          description: "No middleware found for route protection",
          location: "middleware.ts",
          recommendation: "Implement middleware for route protection",
          cwe: "CWE-285",
          owasp: "A01:2021 – Broken Access Control",
        })
      }
    } catch (error) {
      issues.push({
        id: "authz_003",
        severity: "medium",
        title: "Authorization Check Error",
        description: "Error checking authorization implementation",
        location: "Authorization System",
        recommendation: "Review authorization implementation",
      })
    }

    // Check role-based access control
    total++
    const rbacCheck = await this.checkRBACImplementation()
    if (rbacCheck.passed) {
      passed++
    } else {
      issues.push(...rbacCheck.issues)
    }

    // Check API endpoint protection
    total++
    const apiProtectionCheck = await this.checkAPIProtection()
    if (apiProtectionCheck.passed) {
      passed++
    } else {
      issues.push(...apiProtectionCheck.issues)
    }

    this.auditResults.categories.authorization = {
      score: Math.round((passed / total) * 100),
      issues,
      passed,
      failed: total - passed,
      total,
    }
  }

  private async auditInputValidation(): Promise<void> {
    console.log("🔍 Auditing Input Validation Security...")

    const issues: SecurityIssue[] = []
    let passed = 0
    let total = 0

    // Check for input sanitization
    total++
    try {
      const securityServiceExists = await this.fileExists("lib/security-service.ts")
      if (securityServiceExists) {
        const content = await fs.readFile("lib/security-service.ts", "utf-8")
        if (content.includes("sanitizeInput") && content.includes("detectXSS")) {
          passed++
        } else {
          issues.push({
            id: "input_001",
            severity: "high",
            title: "Incomplete Input Sanitization",
            description: "Input sanitization methods are incomplete",
            location: "lib/security-service.ts",
            recommendation: "Implement comprehensive input sanitization",
            cwe: "CWE-79",
            owasp: "A03:2021 – Injection",
          })
        }
      } else {
        issues.push({
          id: "input_002",
          severity: "critical",
          title: "Missing Input Validation",
          description: "No input validation service found",
          location: "lib/security-service.ts",
          recommendation: "Implement input validation and sanitization",
          cwe: "CWE-20",
          owasp: "A03:2021 – Injection",
        })
      }
    } catch (error) {
      issues.push({
        id: "input_003",
        severity: "medium",
        title: "Input Validation Check Error",
        description: "Error checking input validation implementation",
        location: "Input Validation System",
        recommendation: "Review input validation implementation",
      })
    }

    // Check SQL injection protection
    total++
    const sqlInjectionCheck = await this.checkSQLInjectionProtection()
    if (sqlInjectionCheck.passed) {
      passed++
    } else {
      issues.push(...sqlInjectionCheck.issues)
    }

    // Check XSS protection
    total++
    const xssCheck = await this.checkXSSProtection()
    if (xssCheck.passed) {
      passed++
    } else {
      issues.push(...xssCheck.issues)
    }

    this.auditResults.categories.inputValidation = {
      score: Math.round((passed / total) * 100),
      issues,
      passed,
      failed: total - passed,
      total,
    }
  }

  private async auditDataProtection(): Promise<void> {
    console.log("🔐 Auditing Data Protection Security...")

    const issues: SecurityIssue[] = []
    let passed = 0
    let total = 0

    // Check encryption implementation
    total++
    const encryptionCheck = await this.checkEncryptionImplementation()
    if (encryptionCheck.passed) {
      passed++
    } else {
      issues.push(...encryptionCheck.issues)
    }

    // Check data storage security
    total++
    const storageCheck = await this.checkDataStorageSecurity()
    if (storageCheck.passed) {
      passed++
    } else {
      issues.push(...storageCheck.issues)
    }

    // Check sensitive data handling
    total++
    const sensitiveDataCheck = await this.checkSensitiveDataHandling()
    if (sensitiveDataCheck.passed) {
      passed++
    } else {
      issues.push(...sensitiveDataCheck.issues)
    }

    this.auditResults.categories.dataProtection = {
      score: Math.round((passed / total) * 100),
      issues,
      passed,
      failed: total - passed,
      total,
    }
  }

  private async auditNetworkSecurity(): Promise<void> {
    console.log("🌐 Auditing Network Security...")

    const issues: SecurityIssue[] = []
    let passed = 0
    let total = 0

    // Check HTTPS configuration
    total++
    const httpsCheck = await this.checkHTTPSConfiguration()
    if (httpsCheck.passed) {
      passed++
    } else {
      issues.push(...httpsCheck.issues)
    }

    // Check security headers
    total++
    const headersCheck = await this.checkSecurityHeaders()
    if (headersCheck.passed) {
      passed++
    } else {
      issues.push(...headersCheck.issues)
    }

    // Check CORS configuration
    total++
    const corsCheck = await this.checkCORSConfiguration()
    if (corsCheck.passed) {
      passed++
    } else {
      issues.push(...corsCheck.issues)
    }

    this.auditResults.categories.networkSecurity = {
      score: Math.round((passed / total) * 100),
      issues,
      passed,
      failed: total - passed,
      total,
    }
  }

  private async auditDependencySecurity(): Promise<void> {
    console.log("📦 Auditing Dependency Security...")

    const issues: SecurityIssue[] = []
    let passed = 0
    let total = 0

    // Check for vulnerable dependencies
    total++
    try {
      const { stdout } = await execAsync("npm audit --json")
      const auditResult = JSON.parse(stdout)

      if (auditResult.metadata.vulnerabilities.total === 0) {
        passed++
      } else {
        const { high, critical } = auditResult.metadata.vulnerabilities
        if (critical > 0) {
          issues.push({
            id: "dep_001",
            severity: "critical",
            title: "Critical Dependency Vulnerabilities",
            description: `Found ${critical} critical vulnerabilities in dependencies`,
            location: "package.json",
            recommendation: "Update vulnerable dependencies immediately",
            cwe: "CWE-1104",
            owasp: "A06:2021 – Vulnerable and Outdated Components",
          })
        }
        if (high > 0) {
          issues.push({
            id: "dep_002",
            severity: "high",
            title: "High Severity Dependency Vulnerabilities",
            description: `Found ${high} high severity vulnerabilities in dependencies`,
            location: "package.json",
            recommendation: "Update vulnerable dependencies",
            cwe: "CWE-1104",
            owasp: "A06:2021 – Vulnerable and Outdated Components",
          })
        }
      }
    } catch (error) {
      issues.push({
        id: "dep_003",
        severity: "medium",
        title: "Dependency Audit Failed",
        description: "Could not perform dependency security audit",
        location: "package.json",
        recommendation: "Run npm audit manually to check for vulnerabilities",
      })
    }

    // Check package.json security
    total++
    const packageSecurityCheck = await this.checkPackageJsonSecurity()
    if (packageSecurityCheck.passed) {
      passed++
    } else {
      issues.push(...packageSecurityCheck.issues)
    }

    this.auditResults.categories.dependencySecurity = {
      score: Math.round((passed / total) * 100),
      issues,
      passed,
      failed: total - passed,
      total,
    }
  }

  // Helper methods for specific security checks
  private async checkPasswordSecurity(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    try {
      const securityServiceContent = await fs.readFile("lib/security-service.ts", "utf-8")

      if (!securityServiceContent.includes("hashPassword")) {
        issues.push({
          id: "pwd_001",
          severity: "critical",
          title: "Missing Password Hashing",
          description: "No password hashing implementation found",
          location: "lib/security-service.ts",
          recommendation: "Implement secure password hashing with salt",
          cwe: "CWE-256",
          owasp: "A02:2021 – Cryptographic Failures",
        })
      }

      if (!securityServiceContent.includes("validatePasswordStrength")) {
        issues.push({
          id: "pwd_002",
          severity: "medium",
          title: "Missing Password Strength Validation",
          description: "No password strength validation found",
          location: "lib/security-service.ts",
          recommendation: "Implement password strength requirements",
          cwe: "CWE-521",
          owasp: "A07:2021 – Identification and Authentication Failures",
        })
      }
    } catch (error) {
      issues.push({
        id: "pwd_003",
        severity: "high",
        title: "Password Security Check Failed",
        description: "Could not verify password security implementation",
        location: "Password Security System",
        recommendation: "Review password security implementation",
      })
    }

    return { passed: issues.length === 0, issues }
  }

  private async checkSessionManagement(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    // Check for proper session handling in AuthContext
    try {
      const authContent = await fs.readFile("app/contexts/AuthContext.tsx", "utf-8")

      if (!authContent.includes("signOut")) {
        issues.push({
          id: "session_001",
          severity: "medium",
          title: "Missing Session Termination",
          description: "No proper session termination found",
          location: "app/contexts/AuthContext.tsx",
          recommendation: "Implement proper session termination",
          cwe: "CWE-613",
          owasp: "A07:2021 – Identification and Authentication Failures",
        })
      }
    } catch (error) {
      issues.push({
        id: "session_002",
        severity: "medium",
        title: "Session Management Check Failed",
        description: "Could not verify session management implementation",
        location: "Session Management System",
        recommendation: "Review session management implementation",
      })
    }

    return { passed: issues.length === 0, issues }
  }

  private async checkMFAImplementation(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    // For now, we'll note that MFA is not implemented (which is common for many apps)
    issues.push({
      id: "mfa_001",
      severity: "low",
      title: "Multi-Factor Authentication Not Implemented",
      description: "No MFA implementation found",
      location: "Authentication System",
      recommendation: "Consider implementing MFA for enhanced security",
      cwe: "CWE-308",
      owasp: "A07:2021 – Identification and Authentication Failures",
    })

    return { passed: false, issues }
  }

  private async checkRBACImplementation(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    try {
      const authContent = await fs.readFile("app/contexts/AuthContext.tsx", "utf-8")

      if (authContent.includes("isAdmin") && authContent.includes("role")) {
        return { passed: true, issues: [] }
      } else {
        issues.push({
          id: "rbac_001",
          severity: "medium",
          title: "Incomplete Role-Based Access Control",
          description: "RBAC implementation is incomplete",
          location: "app/contexts/AuthContext.tsx",
          recommendation: "Implement comprehensive role-based access control",
          cwe: "CWE-285",
          owasp: "A01:2021 – Broken Access Control",
        })
      }
    } catch (error) {
      issues.push({
        id: "rbac_002",
        severity: "medium",
        title: "RBAC Check Failed",
        description: "Could not verify RBAC implementation",
        location: "Authorization System",
        recommendation: "Review RBAC implementation",
      })
    }

    return { passed: false, issues }
  }

  private async checkAPIProtection(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    // Check if API routes have proper protection
    try {
      const apiFiles = await this.findFiles("app/api", ".ts")
      let protectedRoutes = 0

      for (const file of apiFiles) {
        const content = await fs.readFile(file, "utf-8")
        if (content.includes("auth") || content.includes("middleware") || content.includes("verify")) {
          protectedRoutes++
        }
      }

      if (protectedRoutes < apiFiles.length * 0.5) {
        issues.push({
          id: "api_001",
          severity: "high",
          title: "Insufficient API Protection",
          description: "Many API routes lack proper authentication",
          location: "app/api/",
          recommendation: "Implement authentication for all sensitive API routes",
          cwe: "CWE-306",
          owasp: "A01:2021 – Broken Access Control",
        })
      }
    } catch (error) {
      issues.push({
        id: "api_002",
        severity: "medium",
        title: "API Protection Check Failed",
        description: "Could not verify API protection",
        location: "API Routes",
        recommendation: "Review API route protection",
      })
    }

    return { passed: issues.length === 0, issues }
  }

  private async checkSQLInjectionProtection(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    try {
      const securityContent = await fs.readFile("lib/security-service.ts", "utf-8")

      if (securityContent.includes("detectSQLInjection")) {
        return { passed: true, issues: [] }
      } else {
        issues.push({
          id: "sql_001",
          severity: "high",
          title: "Missing SQL Injection Protection",
          description: "No SQL injection detection found",
          location: "lib/security-service.ts",
          recommendation: "Implement SQL injection detection and prevention",
          cwe: "CWE-89",
          owasp: "A03:2021 – Injection",
        })
      }
    } catch (error) {
      issues.push({
        id: "sql_002",
        severity: "high",
        title: "SQL Injection Check Failed",
        description: "Could not verify SQL injection protection",
        location: "Database Security",
        recommendation: "Review SQL injection protection measures",
      })
    }

    return { passed: false, issues }
  }

  private async checkXSSProtection(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    try {
      const securityContent = await fs.readFile("lib/security-service.ts", "utf-8")

      if (securityContent.includes("detectXSS") && securityContent.includes("sanitizeInput")) {
        return { passed: true, issues: [] }
      } else {
        issues.push({
          id: "xss_001",
          severity: "high",
          title: "Insufficient XSS Protection",
          description: "XSS protection is incomplete",
          location: "lib/security-service.ts",
          recommendation: "Implement comprehensive XSS protection",
          cwe: "CWE-79",
          owasp: "A03:2021 – Injection",
        })
      }
    } catch (error) {
      issues.push({
        id: "xss_002",
        severity: "high",
        title: "XSS Protection Check Failed",
        description: "Could not verify XSS protection",
        location: "XSS Protection System",
        recommendation: "Review XSS protection implementation",
      })
    }

    return { passed: false, issues }
  }

  private async checkEncryptionImplementation(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    try {
      const securityContent = await fs.readFile("lib/security-service.ts", "utf-8")

      if (securityContent.includes("scrypt") && securityContent.includes("randomBytes")) {
        return { passed: true, issues: [] }
      } else {
        issues.push({
          id: "enc_001",
          severity: "medium",
          title: "Weak Encryption Implementation",
          description: "Encryption implementation may be weak",
          location: "lib/security-service.ts",
          recommendation: "Use strong encryption algorithms",
          cwe: "CWE-327",
          owasp: "A02:2021 – Cryptographic Failures",
        })
      }
    } catch (error) {
      issues.push({
        id: "enc_002",
        severity: "medium",
        title: "Encryption Check Failed",
        description: "Could not verify encryption implementation",
        location: "Encryption System",
        recommendation: "Review encryption implementation",
      })
    }

    return { passed: false, issues }
  }

  private async checkDataStorageSecurity(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    // Check environment variables for sensitive data
    const envVars = ["JWT_SECRET", "ENCRYPTION_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    for (const envVar of envVars) {
      if (!process.env[envVar]) {
        issues.push({
          id: `storage_${envVar.toLowerCase()}`,
          severity: "high",
          title: `Missing ${envVar}`,
          description: `Environment variable ${envVar} is not set`,
          location: "Environment Configuration",
          recommendation: `Set ${envVar} environment variable`,
          cwe: "CWE-200",
          owasp: "A02:2021 – Cryptographic Failures",
        })
      }
    }

    return { passed: issues.length === 0, issues }
  }

  private async checkSensitiveDataHandling(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    // This would check for sensitive data in logs, client-side code, etc.
    // For now, we'll add a general recommendation
    issues.push({
      id: "data_001",
      severity: "low",
      title: "Sensitive Data Handling Review Needed",
      description: "Manual review of sensitive data handling required",
      location: "Application Code",
      recommendation: "Review code for sensitive data exposure in logs or client-side",
      cwe: "CWE-200",
      owasp: "A02:2021 – Cryptographic Failures",
    })

    return { passed: false, issues }
  }

  private async checkHTTPSConfiguration(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    // Check if HTTPS is enforced
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl || !siteUrl.startsWith("https://")) {
      issues.push({
        id: "https_001",
        severity: "high",
        title: "HTTPS Not Enforced",
        description: "Site URL does not use HTTPS",
        location: "Environment Configuration",
        recommendation: "Ensure HTTPS is used for all communications",
        cwe: "CWE-319",
        owasp: "A02:2021 – Cryptographic Failures",
      })
    }

    return { passed: issues.length === 0, issues }
  }

  private async checkSecurityHeaders(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    try {
      const nextConfigExists = await this.fileExists("next.config.mjs")
      if (nextConfigExists) {
        const content = await fs.readFile("next.config.mjs", "utf-8")

        if (!content.includes("headers")) {
          issues.push({
            id: "headers_001",
            severity: "medium",
            title: "Missing Security Headers Configuration",
            description: "No security headers configured in Next.js",
            location: "next.config.mjs",
            recommendation: "Configure security headers in Next.js config",
            cwe: "CWE-693",
            owasp: "A05:2021 – Security Misconfiguration",
          })
        }
      }
    } catch (error) {
      issues.push({
        id: "headers_002",
        severity: "medium",
        title: "Security Headers Check Failed",
        description: "Could not verify security headers configuration",
        location: "Security Headers",
        recommendation: "Review security headers configuration",
      })
    }

    return { passed: issues.length === 0, issues }
  }

  private async checkCORSConfiguration(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    // CORS is typically handled by the deployment platform (Vercel)
    // We'll add a general recommendation
    issues.push({
      id: "cors_001",
      severity: "low",
      title: "CORS Configuration Review",
      description: "CORS configuration should be reviewed",
      location: "API Configuration",
      recommendation: "Ensure CORS is properly configured for API endpoints",
      cwe: "CWE-346",
      owasp: "A05:2021 – Security Misconfiguration",
    })

    return { passed: false, issues }
  }

  private async checkPackageJsonSecurity(): Promise<{ passed: boolean; issues: SecurityIssue[] }> {
    const issues: SecurityIssue[] = []

    try {
      const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"))

      // Check for security-related scripts
      if (!packageJson.scripts?.audit) {
        issues.push({
          id: "pkg_001",
          severity: "low",
          title: "Missing Security Audit Script",
          description: "No npm audit script configured",
          location: "package.json",
          recommendation: "Add npm audit script to package.json",
          cwe: "CWE-1104",
          owasp: "A06:2021 – Vulnerable and Outdated Components",
        })
      }
    } catch (error) {
      issues.push({
        id: "pkg_002",
        severity: "medium",
        title: "Package.json Security Check Failed",
        description: "Could not verify package.json security",
        location: "package.json",
        recommendation: "Review package.json configuration",
      })
    }

    return { passed: issues.length === 0, issues }
  }

  private calculateOverallScore(): void {
    const categories = Object.values(this.auditResults.categories)
    const totalScore = categories.reduce((sum, category) => sum + category.score, 0)
    this.auditResults.overallScore = Math.round(totalScore / categories.length)

    // Count issues by severity
    const allIssues = categories.flatMap((category) => category.issues)
    this.auditResults.criticalIssues = allIssues.filter((issue) => issue.severity === "critical").length
    this.auditResults.highIssues = allIssues.filter((issue) => issue.severity === "high").length
    this.auditResults.mediumIssues = allIssues.filter((issue) => issue.severity === "medium").length
    this.auditResults.lowIssues = allIssues.filter((issue) => issue.severity === "low").length
  }

  private generateRecommendations(): void {
    const recommendations = new Set<string>()

    if (this.auditResults.criticalIssues > 0) {
      recommendations.add("Address all critical security issues immediately")
    }

    if (this.auditResults.highIssues > 0) {
      recommendations.add("Prioritize high-severity security issues")
    }

    if (this.auditResults.overallScore < 70) {
      recommendations.add("Implement comprehensive security improvements")
    }

    recommendations.add("Conduct regular security audits")
    recommendations.add("Keep dependencies updated")
    recommendations.add("Implement security monitoring")
    recommendations.add("Train team on secure coding practices")

    this.auditResults.recommendations = Array.from(recommendations)
  }

  private checkCompliance(): void {
    // Basic compliance checks
    this.auditResults.complianceStatus.gdpr = this.auditResults.categories.dataProtection.score >= 80
    this.auditResults.complianceStatus.pci = this.auditResults.categories.dataProtection.score >= 90
    this.auditResults.complianceStatus.owasp = this.auditResults.overallScore >= 80
  }

  private async saveAuditResults(): Promise<void> {
    const auditDir = path.join(process.cwd(), "docs", "security", "audits")
    await fs.mkdir(auditDir, { recursive: true })

    const filename = `security_audit_${new Date().toISOString().split("T")[0]}.json`
    const filepath = path.join(auditDir, filename)

    await fs.writeFile(filepath, JSON.stringify(this.auditResults, null, 2))
  }

  private async generateAuditReport(): Promise<void> {
    const report = `
# Security Audit Report

**Audit Date:** ${this.auditResults.timestamp}
**Overall Security Score:** ${this.auditResults.overallScore}/100

## Executive Summary
- **Critical Issues:** ${this.auditResults.criticalIssues}
- **High Issues:** ${this.auditResults.highIssues}
- **Medium Issues:** ${this.auditResults.mediumIssues}
- **Low Issues:** ${this.auditResults.lowIssues}

## Category Scores
${Object.entries(this.auditResults.categories)
  .map(
    ([name, category]) =>
      `- **${name.charAt(0).toUpperCase() + name.slice(1)}:** ${category.score}/100 (${category.passed}/${category.total} checks passed)`,
  )
  .join("\n")}

## Compliance Status
- **GDPR Compliant:** ${this.auditResults.complianceStatus.gdpr ? "✅" : "❌"}
- **PCI Compliant:** ${this.auditResults.complianceStatus.pci ? "✅" : "❌"}
- **OWASP Compliant:** ${this.auditResults.complianceStatus.owasp ? "✅" : "❌"}

## Key Recommendations
${this.auditResults.recommendations.map((rec) => `- ${rec}`).join("\n")}

## Detailed Issues
${Object.entries(this.auditResults.categories)
  .map(([name, category]) =>
    category.issues.length > 0
      ? `
### ${name.charAt(0).toUpperCase() + name.slice(1)}
${category.issues
  .map(
    (issue) => `
**${issue.title}** (${issue.severity.toUpperCase()})
- **Description:** ${issue.description}
- **Location:** ${issue.location}
- **Recommendation:** ${issue.recommendation}
${issue.cwe ? `- **CWE:** ${issue.cwe}` : ""}
${issue.owasp ? `- **OWASP:** ${issue.owasp}` : ""}
`,
  )
  .join("\n")}
`
      : "",
  )
  .join("\n")}
`

    const reportsDir = path.join(process.cwd(), "docs", "security", "reports")
    await fs.mkdir(reportsDir, { recursive: true })

    const filename = `security_audit_report_${new Date().toISOString().split("T")[0]}.md`
    const filepath = path.join(reportsDir, filename)

    await fs.writeFile(filepath, report)
  }

  // Utility methods
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  private async findFiles(dir: string, extension: string): Promise<string[]> {
    const files: string[] = []

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          const subFiles = await this.findFiles(fullPath, extension)
          files.push(...subFiles)
        } else if (entry.name.endsWith(extension)) {
          files.push(fullPath)
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }

    return files
  }
}

export const securityAuditor = new ComprehensiveSecurityAuditor()

// Export main function
export const performSecurityAudit = () => securityAuditor.performComprehensiveAudit()
