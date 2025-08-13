// Bundle analysis and optimization utilities

export class BundleOptimizer {
  // Analyze bundle size and suggest optimizations
  static analyzeBundleSize() {
    if (typeof window === "undefined") return

    // Get all loaded scripts
    const scripts = Array.from(document.querySelectorAll("script[src]"))
    const stylesheets = Array.from(document.querySelectorAll("link[rel='stylesheet']"))

    const analysis = {
      scripts: scripts.map((script) => ({
        src: (script as HTMLScriptElement).src,
        async: (script as HTMLScriptElement).async,
        defer: (script as HTMLScriptElement).defer,
      })),
      stylesheets: stylesheets.map((link) => ({
        href: (link as HTMLLinkElement).href,
      })),
      recommendations: [] as string[],
    }

    // Add recommendations
    if (scripts.length > 10) {
      analysis.recommendations.push("Consider code splitting to reduce initial bundle size")
    }

    if (stylesheets.length > 5) {
      analysis.recommendations.push("Consider combining CSS files to reduce HTTP requests")
    }

    return analysis
  }

  // Preload critical resources
  static preloadCriticalResources() {
    const criticalResources = [
      "/fonts/inter-var.woff2",
      "/images/logo.svg",
      // Add other critical resources
    ]

    criticalResources.forEach((resource) => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = resource

      if (resource.includes(".woff")) {
        link.as = "font"
        link.type = "font/woff2"
        link.crossOrigin = "anonymous"
      } else if (resource.includes(".svg") || resource.includes(".png")) {
        link.as = "image"
      }

      document.head.appendChild(link)
    })
  }

  // Lazy load non-critical resources
  static lazyLoadResources() {
    // Lazy load images
    const images = document.querySelectorAll("img[data-src]")
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src!
          img.removeAttribute("data-src")
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach((img) => imageObserver.observe(img))

    // Lazy load components
    const lazyComponents = document.querySelectorAll("[data-lazy-component]")
    const componentObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement
          const componentName = element.dataset.lazyComponent

          // Dynamically import component
          import(`@/components/${componentName}`)
            .then((module) => {
              // Render component
              console.log(`Lazy loaded component: ${componentName}`)
            })
            .catch((error) => {
              console.error(`Failed to lazy load component ${componentName}:`, error)
            })

          componentObserver.unobserve(element)
        }
      })
    })

    lazyComponents.forEach((component) => componentObserver.observe(component))
  }
}
