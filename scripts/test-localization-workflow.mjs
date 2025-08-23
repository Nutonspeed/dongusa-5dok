#!/usr/bin/env node

// Simple test to validate the localization workflow

import { readFileSync, existsSync } from "fs"
import { join } from "path"

console.log("🧪 Testing Localization Workflow")
console.log("=".repeat(40))

// Test 1: Check if config file exists
console.log("\n1. Testing configuration...")
const configPath = join(process.cwd(), "localization.config.json")
if (existsSync(configPath)) {
  const config = JSON.parse(readFileSync(configPath, "utf-8"))
  console.log("✅ Configuration file found")
  console.log(`   - Supported locales: ${config.supportedLocales.join(", ")}`)
  console.log(`   - Default locale: ${config.defaultLocale}`)
  console.log(`   - Translation platform: ${config.translationPlatform.provider}`)
} else {
  console.log("❌ Configuration file not found")
  process.exit(1)
}

// Test 2: Check if translation files exist
console.log("\n2. Testing translation files...")
const localesDir = join(process.cwd(), "locales")
const supportedLocales = ["th", "en", "ms", "zh", "es"]

for (const locale of supportedLocales) {
  const filePath = join(localesDir, `${locale}.json`)
  if (existsSync(filePath)) {
    try {
      const translations = JSON.parse(readFileSync(filePath, "utf-8"))
      const keyCount = Object.keys(translations).length
      console.log(`✅ ${locale}.json - ${keyCount} keys`)
    } catch (error) {
      console.log(`❌ ${locale}.json - Invalid JSON`)
    }
  } else {
    console.log(`❌ ${locale}.json - File not found`)
  }
}

// Test 3: Check translation consistency
console.log("\n3. Testing translation consistency...")
const defaultLocale = "th"
const defaultPath = join(localesDir, `${defaultLocale}.json`)

if (existsSync(defaultPath)) {
  const defaultTranslations = JSON.parse(readFileSync(defaultPath, "utf-8"))
  const defaultKeys = Object.keys(defaultTranslations)
  
  console.log(`Reference locale (${defaultLocale}) has ${defaultKeys.length} keys`)
  
  let allConsistent = true
  for (const locale of supportedLocales) {
    if (locale === defaultLocale) continue
    
    const filePath = join(localesDir, `${locale}.json`)
    if (existsSync(filePath)) {
      const translations = JSON.parse(readFileSync(filePath, "utf-8"))
      const localeKeys = Object.keys(translations)
      
      const missingKeys = defaultKeys.filter(key => !localeKeys.includes(key))
      const extraKeys = localeKeys.filter(key => !defaultKeys.includes(key))
      
      if (missingKeys.length === 0 && extraKeys.length === 0) {
        console.log(`✅ ${locale} - All keys consistent`)
      } else {
        console.log(`⚠️  ${locale} - Missing: ${missingKeys.length}, Extra: ${extraKeys.length}`)
        allConsistent = false
      }
    }
  }
  
  if (allConsistent) {
    console.log("✅ All translations are consistent")
  }
}

// Test 4: Test workflow scripts
console.log("\n4. Testing workflow scripts...")
const scripts = [
  "scripts/translation-validator.mjs",
  "scripts/translation-manager.mjs"
]

for (const script of scripts) {
  if (existsSync(script)) {
    console.log(`✅ ${script} exists`)
  } else {
    console.log(`❌ ${script} not found`)
  }
}

// Test 5: Test GitHub workflow
console.log("\n5. Testing GitHub workflow...")
const workflowPath = ".github/workflows/localization.yml"
if (existsSync(workflowPath)) {
  console.log("✅ GitHub workflow file exists")
  const content = readFileSync(workflowPath, "utf-8")
  if (content.includes("validate-translations") && content.includes("sync-translations")) {
    console.log("✅ Workflow contains required jobs")
  } else {
    console.log("⚠️  Workflow missing some required jobs")
  }
} else {
  console.log("❌ GitHub workflow not found")
}

console.log("\n🎯 Localization workflow test completed!")
console.log("\nTo use the workflow:")
console.log("- npm run translations:validate - Validate all translations")
console.log("- npm run translations:report - Generate translation report")
console.log("- npm run translations:sync - Sync with translation platform")
console.log("- GitHub Actions will automatically run on changes to translation files")