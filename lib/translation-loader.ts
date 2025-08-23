import { readFileSync, existsSync } from "fs"
import { join } from "path"

/**
 * @typedef {Object} TranslationLoader
 * @property {function(string): Object} loadTranslations
 * @property {function(): string[]} getAvailableLocales  
 * @property {function(): boolean} validateTranslations
 */

class FileTranslationLoader {
  constructor(localesDir = "./locales") {
    this.localesDir = localesDir
    this.cache = new Map()
  }

  loadTranslations(locale) {
    // Check cache first
    if (this.cache.has(locale)) {
      return this.cache.get(locale)
    }

    const filePath = join(process.cwd(), this.localesDir, `${locale}.json`)
    
    if (!existsSync(filePath)) {
      console.warn(`Translation file not found for locale: ${locale}`)
      return {}
    }

    try {
      const content = readFileSync(filePath, "utf-8")
      const translations = JSON.parse(content)
      
      // Cache the translations
      this.cache.set(locale, translations)
      
      return translations
    } catch (error) {
      console.error(`Error loading translations for locale ${locale}:`, error)
      return {}
    }
  }

  getAvailableLocales() {
    const supportedLocales = ["th", "en", "ms", "zh", "es"]
    return supportedLocales.filter(locale => {
      const filePath = join(process.cwd(), this.localesDir, `${locale}.json`)
      return existsSync(filePath)
    })
  }

  validateTranslations() {
    const locales = this.getAvailableLocales()
    if (locales.length === 0) {
      return false
    }

    const defaultLocale = "th"
    const defaultTranslations = this.loadTranslations(defaultLocale)
    const defaultKeys = Object.keys(defaultTranslations)

    for (const locale of locales) {
      if (locale === defaultLocale) continue

      const translations = this.loadTranslations(locale)
      const localeKeys = Object.keys(translations)

      // Check for missing keys
      for (const key of defaultKeys) {
        if (!localeKeys.includes(key)) {
          console.warn(`Missing translation key "${key}" in locale "${locale}"`)
        }
      }
    }

    return true
  }

  clearCache() {
    this.cache.clear()
  }
}

export const translationLoader = new FileTranslationLoader()