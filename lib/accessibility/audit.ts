// Accessibility audit utilities
interface AccessibilityIssue {
  severity: "error" | "warning" | "info"
  rule: string
  description: string
  element: string
  suggestion: string
}

interface AccessibilityAuditResult {
  score: number
  issues: AccessibilityIssue[]
  passedRules: string[]
  summary: {
    errors: number
    warnings: number
    info: number
  }
}

export class AccessibilityAuditor {
  private issues: AccessibilityIssue[] = []
  private passedRules: string[] = []

  async performAudit(container: HTMLElement = document.body): Promise<AccessibilityAuditResult> {
    this.issues = []
    this.passedRules = []

    // Run all audit checks
    this.checkImages(container)
    this.checkHeadings(container)
    this.checkForms(container)
    this.checkLinks(container)
    this.checkButtons(container)
    this.checkColorContrast(container)
    this.checkKeyboardNavigation(container)
    this.checkAriaLabels(container)
    this.checkLandmarks(container)
    this.checkTables(container)

    const summary = {
      errors: this.issues.filter((i) => i.severity === "error").length,
      warnings: this.issues.filter((i) => i.severity === "warning").length,
      info: this.issues.filter((i) => i.severity === "info").length,
    }

    const totalChecks = this.issues.length + this.passedRules.length
    const score = totalChecks > 0 ? Math.round((this.passedRules.length / totalChecks) * 100) : 100

    return {
      score,
      issues: this.issues,
      passedRules: this.passedRules,
      summary,
    }
  }

  private checkImages(container: HTMLElement): void {
    const images = container.querySelectorAll("img")

    images.forEach((img, index) => {
      const alt = img.getAttribute("alt")
      const src = img.getAttribute("src")

      if (!alt && alt !== "") {
        this.addIssue({
          severity: "error",
          rule: "img-alt",
          description: "Image missing alt attribute",
          element: `img[${index}] src="${src}"`,
          suggestion: 'Add descriptive alt text or empty alt="" for decorative images',
        })
      } else if (alt && alt.length > 125) {
        this.addIssue({
          severity: "warning",
          rule: "img-alt-length",
          description: "Alt text is too long (over 125 characters)",
          element: `img[${index}] src="${src}"`,
          suggestion: "Keep alt text concise and descriptive",
        })
      } else {
        this.passRule("img-alt")
      }
    })
  }

  private checkHeadings(container: HTMLElement): void {
    const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6")
    const headingLevels: number[] = []

    headings.forEach((heading, index) => {
      const level = Number.parseInt(heading.tagName.charAt(1))
      headingLevels.push(level)

      if (!heading.textContent?.trim()) {
        this.addIssue({
          severity: "error",
          rule: "heading-empty",
          description: "Heading is empty",
          element: `${heading.tagName.toLowerCase()}[${index}]`,
          suggestion: "Add descriptive text to the heading",
        })
      }
    })

    // Check heading hierarchy
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i]
      const previous = headingLevels[i - 1]

      if (current > previous + 1) {
        this.addIssue({
          severity: "warning",
          rule: "heading-hierarchy",
          description: "Heading levels skip (e.g., h2 to h4)",
          element: `h${current}[${i}]`,
          suggestion: "Use heading levels in sequential order",
        })
      }
    }

    if (headingLevels.length > 0 && headingLevels[0] !== 1) {
      this.addIssue({
        severity: "warning",
        rule: "heading-start",
        description: "Page does not start with h1",
        element: "document",
        suggestion: "Start page with h1 heading",
      })
    } else if (headingLevels.length > 0) {
      this.passRule("heading-hierarchy")
    }
  }

  private checkForms(container: HTMLElement): void {
    const inputs = container.querySelectorAll("input, select, textarea")

    inputs.forEach((input, index) => {
      const id = input.getAttribute("id")
      const label = id ? container.querySelector(`label[for="${id}"]`) : null
      const ariaLabel = input.getAttribute("aria-label")
      const ariaLabelledby = input.getAttribute("aria-labelledby")

      if (!label && !ariaLabel && !ariaLabelledby) {
        this.addIssue({
          severity: "error",
          rule: "form-label",
          description: "Form control missing label",
          element: `${input.tagName.toLowerCase()}[${index}]`,
          suggestion: "Add a label element, aria-label, or aria-labelledby attribute",
        })
      } else {
        this.passRule("form-label")
      }

      // Check for required fields
      if (input.hasAttribute("required")) {
        const hasRequiredIndicator =
          label?.textContent?.includes("*") ||
          ariaLabel?.includes("required") ||
          input.getAttribute("aria-required") === "true"

        if (!hasRequiredIndicator) {
          this.addIssue({
            severity: "warning",
            rule: "form-required",
            description: "Required field not clearly indicated",
            element: `${input.tagName.toLowerCase()}[${index}]`,
            suggestion: "Add visual and programmatic indication of required fields",
          })
        }
      }
    })
  }

  private checkLinks(container: HTMLElement): void {
    const links = container.querySelectorAll("a")

    links.forEach((link, index) => {
      const href = link.getAttribute("href")
      const text = link.textContent?.trim()
      const ariaLabel = link.getAttribute("aria-label")

      if (!href) {
        this.addIssue({
          severity: "error",
          rule: "link-href",
          description: "Link missing href attribute",
          element: `a[${index}]`,
          suggestion: "Add href attribute or use button element instead",
        })
      }

      if (!text && !ariaLabel) {
        this.addIssue({
          severity: "error",
          rule: "link-text",
          description: "Link has no accessible text",
          element: `a[${index}] href="${href}"`,
          suggestion: "Add descriptive link text or aria-label",
        })
      } else if (text && ["click here", "read more", "more"].includes(text.toLowerCase())) {
        this.addIssue({
          severity: "warning",
          rule: "link-text-descriptive",
          description: "Link text is not descriptive",
          element: `a[${index}] href="${href}"`,
          suggestion: "Use descriptive link text that explains the destination",
        })
      } else if (text || ariaLabel) {
        this.passRule("link-text")
      }
    })
  }

  private checkButtons(container: HTMLElement): void {
    const buttons = container.querySelectorAll('button, [role="button"]')

    buttons.forEach((button, index) => {
      const text = button.textContent?.trim()
      const ariaLabel = button.getAttribute("aria-label")

      if (!text && !ariaLabel) {
        this.addIssue({
          severity: "error",
          rule: "button-text",
          description: "Button has no accessible text",
          element: `button[${index}]`,
          suggestion: "Add descriptive button text or aria-label",
        })
      } else {
        this.passRule("button-text")
      }

      // Check for disabled buttons
      if (button.hasAttribute("disabled") || button.getAttribute("aria-disabled") === "true") {
        const hasDisabledStyling = window.getComputedStyle(button).opacity !== "1"

        if (!hasDisabledStyling) {
          this.addIssue({
            severity: "warning",
            rule: "button-disabled-styling",
            description: "Disabled button not visually indicated",
            element: `button[${index}]`,
            suggestion: "Add visual styling to indicate disabled state",
          })
        }
      }
    })
  }

  private checkColorContrast(container: HTMLElement): void {
    const textElements = container.querySelectorAll("p, span, div, h1, h2, h3, h4, h5, h6, a, button, label")

    textElements.forEach((element, index) => {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor

      // Skip if no text content
      if (!element.textContent?.trim()) return

      // This is a simplified check - in a real implementation,
      // you would need to calculate the actual contrast ratio
      if (color === backgroundColor) {
        this.addIssue({
          severity: "error",
          rule: "color-contrast",
          description: "Text and background colors are the same",
          element: `${element.tagName.toLowerCase()}[${index}]`,
          suggestion: "Ensure sufficient color contrast between text and background",
        })
      } else {
        this.passRule("color-contrast")
      }
    })
  }

  private checkKeyboardNavigation(container: HTMLElement): void {
    const interactiveElements = container.querySelectorAll(
      'a, button, input, select, textarea, [tabindex], [role="button"], [role="link"]',
    )

    interactiveElements.forEach((element, index) => {
      const tabIndex = element.getAttribute("tabindex")

      if (tabIndex && Number.parseInt(tabIndex) > 0) {
        this.addIssue({
          severity: "warning",
          rule: "tabindex-positive",
          description: "Positive tabindex values can cause navigation issues",
          element: `${element.tagName.toLowerCase()}[${index}]`,
          suggestion: 'Use tabindex="0" or remove tabindex to follow natural tab order',
        })
      } else {
        this.passRule("tabindex-positive")
      }
    })
  }

  private checkAriaLabels(container: HTMLElement): void {
    const elementsWithAriaLabelledby = container.querySelectorAll("[aria-labelledby]")

    elementsWithAriaLabelledby.forEach((element, index) => {
      const labelledbyIds = element.getAttribute("aria-labelledby")?.split(" ") || []

      labelledbyIds.forEach((id) => {
        const labelElement = container.querySelector(`#${id}`)
        if (!labelElement) {
          this.addIssue({
            severity: "error",
            rule: "aria-labelledby-valid",
            description: "aria-labelledby references non-existent element",
            element: `${element.tagName.toLowerCase()}[${index}]`,
            suggestion: `Ensure element with id="${id}" exists`,
          })
        }
      })
    })

    const elementsWithAriaDescribedby = container.querySelectorAll("[aria-describedby]")

    elementsWithAriaDescribedby.forEach((element, index) => {
      const describedbyIds = element.getAttribute("aria-describedby")?.split(" ") || []

      describedbyIds.forEach((id) => {
        const descriptionElement = container.querySelector(`#${id}`)
        if (!descriptionElement) {
          this.addIssue({
            severity: "error",
            rule: "aria-describedby-valid",
            description: "aria-describedby references non-existent element",
            element: `${element.tagName.toLowerCase()}[${index}]`,
            suggestion: `Ensure element with id="${id}" exists`,
          })
        }
      })
    })
  }

  private checkLandmarks(container: HTMLElement): void {
    // Placeholder for landmark checks
  }

  private checkTables(container: HTMLElement): void {
    // Placeholder for table checks
  }

  private addIssue(issue: AccessibilityIssue): void {
    this.issues.push(issue)
  }

  private passRule(rule: string): void {
    this.passedRules.push(rule)
  }
}
