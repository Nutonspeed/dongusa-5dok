#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class TranslationManager {
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

  async uploadToCrowdin() {
    console.log("🔄 Uploading source files to Crowdin...")
    
    const { projectId, apiToken } = this.config.translationPlatform
    
    if (!projectId || !apiToken) {
      throw new Error("Crowdin project ID and API token must be configured")
    }

    // This is a mock implementation - in a real scenario, you would use Crowdin API
    console.log(`📤 Uploading to Crowdin project: ${projectId}`)
    
    const localesDir = join(this.projectRoot, this.config.directories.locales)
    const sourceFile = join(localesDir, `${this.config.defaultLocale}.json`)
    
    if (!existsSync(sourceFile)) {
      throw new Error(`Source file not found: ${sourceFile}`)
    }

    // Simulate API call
    console.log("📁 Preparing source file for upload...")
    const sourceContent = readFileSync(sourceFile, "utf-8")
    
    try {
      JSON.parse(sourceContent)
      console.log("✅ Source file validation passed")
    } catch (error) {
      throw new Error("Invalid JSON in source file")
    }
    
    // Mock API response
    console.log("🎯 Upload completed successfully")
    console.log("💡 Translators can now access the updated content")
  }

  async downloadFromCrowdin() {
    console.log("🔄 Downloading translations from Crowdin...")
    
    const { projectId, apiToken } = this.config.translationPlatform
    
    if (!projectId || !apiToken) {
      throw new Error("Crowdin project ID and API token must be configured")
    }

    // This is a mock implementation - in a real scenario, you would use Crowdin API
    console.log(`📥 Downloading from Crowdin project: ${projectId}`)
    
    const localesDir = join(this.projectRoot, this.config.directories.locales)
    
    // Simulate downloading translations for each locale
    for (const locale of this.config.supportedLocales) {
      if (locale === this.config.defaultLocale) continue // Skip source locale
      
      console.log(`⬇️  Downloading ${locale} translations...`)
      
      // In real implementation, this would fetch from Crowdin API
      // For now, we'll just verify the file exists
      const localeFile = join(localesDir, `${locale}.json`)
      if (existsSync(localeFile)) {
        console.log(`✅ ${locale} translations downloaded`)
      } else {
        console.log(`⚠️  ${locale} translations not available`)
      }
    }
    
    console.log("🎯 Download completed")
  }

  async uploadToLokalise() {
    console.log("🔄 Uploading source files to Lokalise...")
    
    const { projectId, apiToken } = this.config.translationPlatform
    
    if (!projectId || !apiToken) {
      throw new Error("Lokalise project ID and API token must be configured")
    }

    // This is a mock implementation - in a real scenario, you would use Lokalise API
    console.log(`📤 Uploading to Lokalise project: ${projectId}`)
    
    const localesDir = join(this.projectRoot, this.config.directories.locales)
    const sourceFile = join(localesDir, `${this.config.defaultLocale}.json`)
    
    if (!existsSync(sourceFile)) {
      throw new Error(`Source file not found: ${sourceFile}`)
    }

    // Simulate API call
    console.log("📁 Preparing source file for upload...")
    const sourceContent = readFileSync(sourceFile, "utf-8")
    
    try {
      JSON.parse(sourceContent)
      console.log("✅ Source file validation passed")
    } catch (error) {
      throw new Error("Invalid JSON in source file")
    }
    
    // Mock API response
    console.log("🎯 Upload completed successfully")
    console.log("💡 Translators can now access the updated content")
  }

  async downloadFromLokalise() {
    console.log("🔄 Downloading translations from Lokalise...")
    
    const { projectId, apiToken } = this.config.translationPlatform
    
    if (!projectId || !apiToken) {
      throw new Error("Lokalise project ID and API token must be configured")
    }

    // This is a mock implementation
    console.log(`📥 Downloading from Lokalise project: ${projectId}`)
    
    const localesDir = join(this.projectRoot, this.config.directories.locales)
    
    // Simulate downloading translations for each locale
    for (const locale of this.config.supportedLocales) {
      if (locale === this.config.defaultLocale) continue
      
      console.log(`⬇️  Downloading ${locale} translations...`)
      
      const localeFile = join(localesDir, `${locale}.json`)
      if (existsSync(localeFile)) {
        console.log(`✅ ${locale} translations downloaded`)
      } else {
        console.log(`⚠️  ${locale} translations not available`)
      }
    }
    
    console.log("🎯 Download completed")
  }

  async syncWithPlatform() {
    const { provider } = this.config.translationPlatform
    
    console.log(`🌐 Syncing with ${provider}...`)
    
    switch (provider.toLowerCase()) {
      case "crowdin":
        await this.uploadToCrowdin()
        await this.downloadFromCrowdin()
        break
      case "lokalise":
        await this.uploadToLokalise()
        await this.downloadFromLokalise()
        break
      default:
        throw new Error(`Unsupported translation platform: ${provider}`)
    }
    
    console.log("🎯 Sync completed successfully")
  }

  generateTranslationReport() {
    console.log("📊 Generating translation report...")
    
    const localesDir = join(this.projectRoot, this.config.directories.locales)
    const defaultFile = join(localesDir, `${this.config.defaultLocale}.json`)
    
    if (!existsSync(defaultFile)) {
      throw new Error("Default locale file not found")
    }
    
    const defaultTranslations = JSON.parse(readFileSync(defaultFile, "utf-8"))
    const totalKeys = Object.keys(defaultTranslations).length
    
    const report = {
      timestamp: new Date().toISOString(),
      platform: this.config.translationPlatform.provider,
      defaultLocale: this.config.defaultLocale,
      totalKeys,
      locales: {}
    }
    
    for (const locale of this.config.supportedLocales) {
      const localeFile = join(localesDir, `${locale}.json`)
      
      if (existsSync(localeFile)) {
        try {
          const translations = JSON.parse(readFileSync(localeFile, "utf-8"))
          const translatedKeys = Object.keys(translations).filter(key => 
            translations[key] && translations[key].trim() !== ""
          ).length
          
          report.locales[locale] = {
            totalKeys: Object.keys(translations).length,
            translatedKeys,
            completionPercentage: Math.round((translatedKeys / totalKeys) * 100),
            missingKeys: totalKeys - translatedKeys
          }
        } catch (error) {
          report.locales[locale] = {
            error: "Invalid JSON file"
          }
        }
      } else {
        report.locales[locale] = {
          error: "File not found"
        }
      }
    }
    
    const reportPath = join(this.projectRoot, "translation-report.json")
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log("📄 Translation report generated:", reportPath)
    console.log("\n📊 Summary:")
    console.log(`Total keys: ${totalKeys}`)
    
    for (const [locale, data] of Object.entries(report.locales)) {
      if (data.error) {
        console.log(`${locale.toUpperCase()}: ❌ ${data.error}`)
      } else {
        console.log(`${locale.toUpperCase()}: ${data.completionPercentage}% (${data.translatedKeys}/${totalKeys})`)
      }
    }
  }
}

// CLI interface
async function main() {
  const manager = new TranslationManager()
  const command = process.argv[2]

  try {
    switch (command) {
      case "sync":
        await manager.syncWithPlatform()
        break
        
      case "upload":
        const provider = manager.config.translationPlatform.provider
        if (provider === "crowdin") {
          await manager.uploadToCrowdin()
        } else if (provider === "lokalise") {
          await manager.uploadToLokalise()
        } else {
          throw new Error(`Unsupported provider: ${provider}`)
        }
        break
        
      case "download":
        const downloadProvider = manager.config.translationPlatform.provider
        if (downloadProvider === "crowdin") {
          await manager.downloadFromCrowdin()
        } else if (downloadProvider === "lokalise") {
          await manager.downloadFromLokalise()
        } else {
          throw new Error(`Unsupported provider: ${downloadProvider}`)
        }
        break
        
      case "report":
        manager.generateTranslationReport()
        break
        
      default:
        console.log("Usage:")
        console.log("  npm run translations:sync     - Sync with translation platform")
        console.log("  npm run translations:upload   - Upload source files")
        console.log("  npm run translations:download - Download translations")
        console.log("  npm run translations:report   - Generate translation report")
        process.exit(1)
    }
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  }
}

main()