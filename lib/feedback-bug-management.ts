import { createClient } from "@/lib/supabase/client"
import { analytics } from "./analytics-service"

interface BugReport {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  status: "new" | "confirmed" | "in_progress" | "testing" | "resolved" | "closed"
  priority: number // 1-10 scale
  reporter_email?: string
  page_url: string
  browser_info: string
  device_info: string
  screenshot_url?: string
  steps_to_reproduce: string[]
  expected_behavior: string
  actual_behavior: string
  assigned_to?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  tags: string[]
}

interface FeedbackAnalysis {
  sentiment: "positive" | "neutral" | "negative"
  category: "ui_ux" | "performance" | "feature_request" | "bug_report" | "general"
  urgency: "low" | "medium" | "high" | "critical"
  actionable: boolean
  keywords: string[]
}

class FeedbackBugManager {
  private supabase = createClient()

  // Enhanced bug reporting with automatic categorization
  async reportBug(bugData: Partial<BugReport>): Promise<{ success: boolean; bugId?: string; error?: string }> {
    try {
      const enhancedBugData: BugReport = {
        id: `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: bugData.title || "",
        description: bugData.description || "",
        severity: this.calculateSeverity(bugData),
        status: "new",
        priority: this.calculatePriority(bugData),
        reporter_email: bugData.reporter_email,
        page_url: bugData.page_url || "",
        browser_info: bugData.browser_info || this.getBrowserInfo(),
        device_info: bugData.device_info || this.getDeviceInfo(),
        screenshot_url: bugData.screenshot_url,
        steps_to_reproduce: bugData.steps_to_reproduce || [],
        expected_behavior: bugData.expected_behavior || "",
        actual_behavior: bugData.actual_behavior || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: this.generateTags(bugData),
      }

      const { data, error } = await this.supabase.from("bug_reports").insert(enhancedBugData).select().single()

      if (error) throw error

      // Auto-assign based on severity and category
      await this.autoAssignBug(data.id, enhancedBugData)

      // Send notifications for critical bugs
      if (enhancedBugData.severity === "critical") {
        await this.notifyCriticalBug(enhancedBugData)
      }

      // Track in analytics
      analytics.trackEvent("bug_report", "submitted", enhancedBugData.severity, enhancedBugData.priority)

      return { success: true, bugId: data.id }
    } catch (error) {
      console.error("Error reporting bug:", error)
      return { success: false, error: "Failed to report bug" }
    }
  }

  // Advanced feedback analysis with sentiment detection
  async analyzeFeedback(feedbackText: string, rating: number, context: any): Promise<FeedbackAnalysis> {
    const analysis: FeedbackAnalysis = {
      sentiment: this.detectSentiment(feedbackText, rating),
      category: this.categorizeFeedback(feedbackText, context),
      urgency: this.calculateUrgency(feedbackText, rating, context),
      actionable: this.isActionable(feedbackText),
      keywords: this.extractKeywords(feedbackText),
    }

    return analysis
  }

  // Intelligent bug prioritization
  private calculatePriority(bugData: Partial<BugReport>): number {
    let priority = 5 // Base priority

    // Severity impact
    const severityWeights = { low: 1, medium: 3, high: 6, critical: 10 }
    priority += severityWeights[bugData.severity || "medium"]

    // Page importance (checkout, payment pages get higher priority)
    const criticalPages = ["/checkout", "/payment", "/login", "/register"]
    if (criticalPages.some((page) => bugData.page_url?.includes(page))) {
      priority += 3
    }

    // User impact (if multiple users report similar issues)
    if (
      bugData.description?.toLowerCase().includes("multiple") ||
      bugData.description?.toLowerCase().includes("many")
    ) {
      priority += 2
    }

    return Math.min(priority, 10) // Cap at 10
  }

  private calculateSeverity(bugData: Partial<BugReport>): "low" | "medium" | "high" | "critical" {
    const description = bugData.description?.toLowerCase() || ""
    const pageUrl = bugData.page_url?.toLowerCase() || ""

    // Critical keywords
    const criticalKeywords = ["crash", "error", "broken", "not working", "payment failed", "checkout failed"]
    if (criticalKeywords.some((keyword) => description.includes(keyword))) {
      return "critical"
    }

    // Critical pages
    if (pageUrl.includes("/checkout") || pageUrl.includes("/payment")) {
      return "high"
    }

    // High severity keywords
    const highKeywords = ["slow", "timeout", "login", "register", "cart"]
    if (highKeywords.some((keyword) => description.includes(keyword))) {
      return "high"
    }

    // Medium severity keywords
    const mediumKeywords = ["display", "layout", "image", "text", "button"]
    if (mediumKeywords.some((keyword) => description.includes(keyword))) {
      return "medium"
    }

    return "low"
  }

  private generateTags(bugData: Partial<BugReport>): string[] {
    const tags: string[] = []
    const description = bugData.description?.toLowerCase() || ""
    const pageUrl = bugData.page_url?.toLowerCase() || ""

    // Page-based tags
    if (pageUrl.includes("/checkout")) tags.push("checkout")
    if (pageUrl.includes("/payment")) tags.push("payment")
    if (pageUrl.includes("/products")) tags.push("products")
    if (pageUrl.includes("/admin")) tags.push("admin")

    // Feature-based tags
    if (description.includes("mobile")) tags.push("mobile")
    if (description.includes("desktop")) tags.push("desktop")
    if (description.includes("image")) tags.push("images")
    if (description.includes("form")) tags.push("forms")
    if (description.includes("search")) tags.push("search")

    // Browser-based tags
    const browserInfo = bugData.browser_info?.toLowerCase() || ""
    if (browserInfo.includes("chrome")) tags.push("chrome")
    if (browserInfo.includes("firefox")) tags.push("firefox")
    if (browserInfo.includes("safari")) tags.push("safari")

    return tags
  }

  private detectSentiment(text: string, rating: number): "positive" | "neutral" | "negative" {
    if (rating >= 4) return "positive"
    if (rating <= 2) return "negative"

    // Simple keyword-based sentiment analysis
    const positiveWords = ["good", "great", "excellent", "love", "amazing", "perfect", "helpful"]
    const negativeWords = ["bad", "terrible", "awful", "hate", "broken", "useless", "frustrating"]

    const lowerText = text.toLowerCase()
    const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length

    if (positiveCount > negativeCount) return "positive"
    if (negativeCount > positiveCount) return "negative"
    return "neutral"
  }

  private categorizeFeedback(text: string, context: any): FeedbackAnalysis["category"] {
    const lowerText = text.toLowerCase()

    if (lowerText.includes("bug") || lowerText.includes("error") || lowerText.includes("broken")) {
      return "bug_report"
    }

    if (lowerText.includes("slow") || lowerText.includes("loading") || lowerText.includes("performance")) {
      return "performance"
    }

    if (lowerText.includes("feature") || lowerText.includes("add") || lowerText.includes("would like")) {
      return "feature_request"
    }

    if (lowerText.includes("design") || lowerText.includes("layout") || lowerText.includes("interface")) {
      return "ui_ux"
    }

    return "general"
  }

  private calculateUrgency(text: string, rating: number, context: any): FeedbackAnalysis["urgency"] {
    if (rating <= 1) return "critical"
    if (rating <= 2) return "high"

    const urgentKeywords = ["urgent", "asap", "immediately", "critical", "broken", "not working"]
    if (urgentKeywords.some((keyword) => text.toLowerCase().includes(keyword))) {
      return "high"
    }

    return "medium"
  }

  private isActionable(text: string): boolean {
    const actionableKeywords = [
      "should",
      "could",
      "would like",
      "suggest",
      "recommend",
      "improve",
      "fix",
      "add",
      "remove",
      "change",
    ]
    return actionableKeywords.some((keyword) => text.toLowerCase().includes(keyword))
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/)
    const stopWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
    ]

    return words
      .filter((word) => word.length > 3 && !stopWords.includes(word))
      .reduce((acc: { [key: string]: number }, word) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      }, {})
      .entries()
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)
  }

  private async autoAssignBug(bugId: string, bugData: BugReport): Promise<void> {
    let assignee = ""

    // Assignment logic based on tags and severity
    if (bugData.tags.includes("payment") || bugData.tags.includes("checkout")) {
      assignee = "backend-team"
    } else if (bugData.tags.includes("mobile") || bugData.tags.includes("ui")) {
      assignee = "frontend-team"
    } else if (bugData.severity === "critical") {
      assignee = "senior-developer"
    } else {
      assignee = "general-team"
    }

    await this.supabase.from("bug_reports").update({ assigned_to: assignee }).eq("id", bugId)
  }

  private async notifyCriticalBug(bugData: BugReport): Promise<void> {
    // In production, this would send real notifications
    console.log(`🚨 CRITICAL BUG REPORTED: ${bugData.title}`)
    console.log(`Page: ${bugData.page_url}`)
    console.log(`Description: ${bugData.description}`)

    // Send to monitoring service
    await fetch("/api/notifications/critical-bug", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bugId: bugData.id,
        title: bugData.title,
        severity: bugData.severity,
        pageUrl: bugData.page_url,
        timestamp: bugData.created_at,
      }),
    })
  }

  private getBrowserInfo(): string {
    if (typeof window === "undefined") return "Unknown"
    return navigator.userAgent
  }

  private getDeviceInfo(): string {
    if (typeof window === "undefined") return "Unknown"
    return `${window.screen.width}x${window.screen.height}, ${navigator.platform}`
  }

  // Feedback trend analysis
  async getFeedbackTrends(days = 30): Promise<any> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: feedback } = await this.supabase
      .from("user_feedback")
      .select("*")
      .gte("created_at", startDate.toISOString())

    if (!feedback) return null

    const trends = {
      totalFeedback: feedback.length,
      averageRating: feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length,
      sentimentDistribution: this.calculateSentimentDistribution(feedback),
      categoryDistribution: this.calculateCategoryDistribution(feedback),
      dailyTrends: this.calculateDailyTrends(feedback, days),
      topIssues: this.identifyTopIssues(feedback),
      improvementSuggestions: this.generateImprovementSuggestions(feedback),
    }

    return trends
  }

  private calculateSentimentDistribution(feedback: any[]): any {
    const distribution = { positive: 0, neutral: 0, negative: 0 }

    feedback.forEach((f) => {
      const sentiment = this.detectSentiment(f.description, f.rating)
      distribution[sentiment]++
    })

    return distribution
  }

  private calculateCategoryDistribution(feedback: any[]): any {
    const distribution: { [key: string]: number } = {}

    feedback.forEach((f) => {
      const category = this.categorizeFeedback(f.description, f)
      distribution[category] = (distribution[category] || 0) + 1
    })

    return distribution
  }

  private calculateDailyTrends(feedback: any[], days: number): any[] {
    const trends = []

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayFeedback = feedback.filter((f) => f.created_at.startsWith(dateStr))
      const avgRating =
        dayFeedback.length > 0 ? dayFeedback.reduce((sum, f) => sum + f.rating, 0) / dayFeedback.length : 0

      trends.unshift({
        date: dateStr,
        count: dayFeedback.length,
        averageRating: Math.round(avgRating * 100) / 100,
      })
    }

    return trends
  }

  private identifyTopIssues(feedback: any[]): string[] {
    const issues: { [key: string]: number } = {}

    feedback.forEach((f) => {
      if (f.rating <= 2) {
        const keywords = this.extractKeywords(f.description)
        keywords.forEach((keyword) => {
          issues[keyword] = (issues[keyword] || 0) + 1
        })
      }
    })

    return Object.entries(issues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([issue]) => issue)
  }

  private generateImprovementSuggestions(feedback: any[]): string[] {
    const suggestions = []
    const lowRatingFeedback = feedback.filter((f) => f.rating <= 2)

    if (lowRatingFeedback.length > feedback.length * 0.3) {
      suggestions.push("Consider conducting user experience audit")
    }

    const performanceIssues = feedback.filter(
      (f) => f.description.toLowerCase().includes("slow") || f.description.toLowerCase().includes("loading"),
    )

    if (performanceIssues.length > 5) {
      suggestions.push("Investigate and optimize page loading performance")
    }

    const mobileIssues = feedback.filter((f) => f.description.toLowerCase().includes("mobile") && f.rating <= 2)

    if (mobileIssues.length > 3) {
      suggestions.push("Review and improve mobile user experience")
    }

    return suggestions
  }

  // Bug resolution tracking
  async updateBugStatus(bugId: string, status: BugReport["status"], resolution?: string): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === "resolved" || status === "closed") {
        updateData.resolved_at = new Date().toISOString()
        if (resolution) updateData.resolution = resolution
      }

      const { error } = await this.supabase.from("bug_reports").update(updateData).eq("id", bugId)

      if (error) throw error

      // Track resolution in analytics
      analytics.trackEvent("bug_resolution", status, "bug_management")

      return true
    } catch (error) {
      console.error("Error updating bug status:", error)
      return false
    }
  }

  // Generate comprehensive feedback report
  async generateFeedbackReport(): Promise<any> {
    const trends = await this.getFeedbackTrends(30)
    const { data: recentBugs } = await this.supabase
      .from("bug_reports")
      .select("*")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    return {
      feedbackTrends: trends,
      bugSummary: {
        totalBugs: recentBugs?.length || 0,
        criticalBugs: recentBugs?.filter((b) => b.severity === "critical").length || 0,
        resolvedBugs: recentBugs?.filter((b) => b.status === "resolved").length || 0,
        averageResolutionTime: this.calculateAverageResolutionTime(recentBugs || []),
      },
      recommendations: trends?.improvementSuggestions || [],
      generatedAt: new Date().toISOString(),
    }
  }

  private calculateAverageResolutionTime(bugs: any[]): number {
    const resolvedBugs = bugs.filter((b) => b.resolved_at)
    if (resolvedBugs.length === 0) return 0

    const totalTime = resolvedBugs.reduce((sum, bug) => {
      const created = new Date(bug.created_at).getTime()
      const resolved = new Date(bug.resolved_at).getTime()
      return sum + (resolved - created)
    }, 0)

    return Math.round(totalTime / resolvedBugs.length / (1000 * 60 * 60)) // Hours
  }
}

export const feedbackBugManager = new FeedbackBugManager()
export default feedbackBugManager
