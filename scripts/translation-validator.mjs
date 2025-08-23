#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class TranslationValidator {
  constructor() {
    this.projectRoot = join(__dirname, "..")
    this.config = this.loadConfig()
  }

  loadConfig() {
    const configPath = join(this.projectRoot, "localization.config.json")
    if (!existsSync(configPath)) {
      throw new Error("Localization config file not found")
    }
    return JSON.parse(readFileSync(configPath, "utf-8"))
  }

  validateTranslations() {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: {
        totalKeys: 0,
        completedTranslations: {},
        missingTranslations: {},
      },
    }

    const localesDir = join(this.projectRoot, this.config.directories.locales)
    
    if (!existsSync(localesDir)) {
      result.errors.push(`Locales directory not found: ${localesDir}`)
      result.isValid = false
      return result
    }

    // Load default locale as reference
    const defaultLocalePath = join(localesDir, `${this.config.defaultLocale}.json`)
    if (!existsSync(defaultLocalePath)) {
      result.errors.push(`Default locale file not found: ${defaultLocalePath}`)
      result.isValid = false
      return result
    }

    const defaultTranslations = JSON.parse(readFileSync(defaultLocalePath, "utf-8"))
    const defaultKeys = Object.keys(defaultTranslations)
    result.summary.totalKeys = defaultKeys.length

    // Validate each locale
    for (const locale of this.config.supportedLocales) {
      const localePath = join(localesDir, `${locale}.json`)
      result.summary.completedTranslations[locale] = 0
      result.summary.missingTranslations[locale] = []

      if (!existsSync(localePath)) {
        result.errors.push(`Translation file missing for locale: ${locale}`)
        result.isValid = false
        continue
      }

      try {
        const translations = JSON.parse(readFileSync(localePath, "utf-8"))
        
        // Check for missing keys
        for (const key of defaultKeys) {
          if (key in translations) {
            const translation = translations[key]
            
            // Validate translation content
            if (!translation || typeof translation !== "string") {
              result.errors.push(`Invalid translation for key "${key}" in locale "${locale}"`)
              result.isValid = false
            } else if (translation.trim() === "") {
              result.warnings.push(`Empty translation for key "${key}" in locale "${locale}"`)
            } else {
              result.summary.completedTranslations[locale]++
              
              // Validate translation length
              if (translation.length > this.config.validation.maxTranslationLength) {
                result.warnings.push(`Translation too long for key "${key}" in locale "${locale}" (${translation.length} chars)`)
              }
            }
          } else {
            result.summary.missingTranslations[locale].push(key)
            result.errors.push(`Missing translation for key "${key}" in locale "${locale}"`)
            result.isValid = false
          }
        }

        // Check for extra keys
        const extraKeys = Object.keys(translations).filter(key => !defaultKeys.includes(key))
        if (extraKeys.length > 0) {
          result.warnings.push(`Extra keys found in locale "${locale}": ${extraKeys.join(", ")}`)
        }

      } catch (error) {
        result.errors.push(`Invalid JSON in locale file: ${localePath}`)
        result.isValid = false
      }
    }

    // Validate key names
    for (const key of defaultKeys) {
      if (key.length > this.config.validation.maxKeyLength) {
        result.warnings.push(`Key name too long: "${key}" (${key.length} chars)`)
      }
      
      if (!/^[a-z0-9._-]+$/i.test(key)) {
        result.warnings.push(`Invalid key name format: "${key}"`)
      }
    }

    return result
  }

  generateReport(result) {
    const report = []
    
    report.push("🌐 Translation Validation Report")
    report.push("=" .repeat(50))
    report.push("")
    
    report.push(`📊 Summary:`)
    report.push(`  Total Keys: ${result.summary.totalKeys}`)
    
    for (const locale of this.config.supportedLocales) {
      const completed = result.summary.completedTranslations[locale] || 0
      const percentage = result.summary.totalKeys > 0 ? Math.round((completed / result.summary.totalKeys) * 100) : 0
      report.push(`  ${locale.toUpperCase()}: ${completed}/${result.summary.totalKeys} (${percentage}%)`)
    }
    
    report.push("")
    
    if (result.errors.length > 0) {
      report.push(`❌ Errors (${result.errors.length}):`)
      result.errors.forEach(error => report.push(`  - ${error}`))
      report.push("")
    }
    
    if (result.warnings.length > 0) {
      report.push(`⚠️  Warnings (${result.warnings.length}):`)
      result.warnings.forEach(warning => report.push(`  - ${warning}`))
      report.push("")
    }
    
    if (result.isValid) {
      report.push("✅ All translations are valid!")
    } else {
      report.push("❌ Translation validation failed!")
    }
    
    return report.join("\n")
  }

  async exportTranslationsForPlatform() {
    console.log("🔄 Exporting translations for translation platform...")
    
    const localesDir = join(this.projectRoot, this.config.directories.locales)
    const tempDir = join(this.projectRoot, this.config.directories.temp)
    
    // Create temp directory if it doesn't exist
    if (!existsSync(tempDir)) {
      const fs = await import("fs")
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Export files for Crowdin/Lokalise
    for (const locale of this.config.supportedLocales) {
      const sourcePath = join(localesDir, `${locale}.json`)
      const targetPath = join(tempDir, `${locale}.json`)
      
      if (existsSync(sourcePath)) {
        const content = readFileSync(sourcePath, "utf-8")
        writeFileSync(targetPath, content)
        console.log(`✅ Exported ${locale}.json`)
      }
    }
    
    console.log(`📁 Exported files to: ${tempDir}`)
  }
}

// CLI interface
const validator = new TranslationValidator()

const command = process.argv[2]

switch (command) {
  case "validate":
    const result = validator.validateTranslations()
    const report = validator.generateReport(result)
    console.log(report)
    process.exit(result.isValid ? 0 : 1)
    break
    
  case "export":
    await validator.exportTranslationsForPlatform()
    break
    
  default:
    console.log("Usage:")
    console.log("  npm run translations:validate  - Validate translation files")
    console.log("  npm run translations:export    - Export translations for platform")
    process.exit(1)
}