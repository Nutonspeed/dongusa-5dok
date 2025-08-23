/**
 * Shared configuration utilities for scripts
 * Reduces code duplication across validation and analysis scripts
 */

import { readFileSync, existsSync } from "fs"
import { join } from "path"

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: any
}

interface TsConfig {
  compilerOptions?: Record<string, any>
  include?: string[]
  exclude?: string[]
  [key: string]: any
}

/**
 * Read and parse package.json file
 */
export function readPackageJson(projectRoot: string = process.cwd()): PackageJson | null {
  try {
    const content = readFileSync(join(projectRoot, "package.json"), "utf-8")
    return JSON.parse(content)
  } catch {
    return null
  }
}

/**
 * Check if Next.js config file exists
 */
export function readNextConfig(projectRoot: string = process.cwd()): boolean {
  try {
    const configPath = join(projectRoot, "next.config.mjs")
    return existsSync(configPath)
  } catch {
    return false
  }
}

/**
 * Read and parse TypeScript config file
 */
export function readTsConfig(projectRoot: string = process.cwd()): TsConfig | null {
  try {
    const content = readFileSync(join(projectRoot, "tsconfig.json"), "utf-8")
    return JSON.parse(content)
  } catch {
    return null
  }
}

/**
 * Check for dependency version conflicts
 */
export function checkVersionConflicts(packageJson: PackageJson): string[] {
  const conflicts: string[] = []

  if (!packageJson) return conflicts

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

  // Check React version compatibility
  if (deps.react && deps["react-dom"]) {
    const reactVersion = deps.react.replace(/[\^~]/, "")
    const reactDomVersion = deps["react-dom"].replace(/[\^~]/, "")

    if (reactVersion !== reactDomVersion) {
      conflicts.push(`React version mismatch: ${reactVersion} vs ${reactDomVersion}`)
    }
  }

  // Check AI SDK and Zod compatibility
  if (deps.ai && deps.zod) {
    const zodVersion = deps.zod.replace(/[\^~]/, "")
    if (zodVersion.startsWith("3.23")) {
      conflicts.push("Zod version 3.23.x may not be compatible with AI SDK 5.x")
    }
  }

  return conflicts
}

/**
 * Check for known problematic dependency combinations
 */
export function checkProblematicCombinations(packageJson: PackageJson): string[] {
  const problems: string[] = []

  if (!packageJson) return problems

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

  // Check for known problematic combinations
  if (deps.react?.includes("18.0.0") && deps.next?.includes("14.")) {
    problems.push("React 18.0.0 with Next.js 14.x - should use React 18.2.0+")
  }

  return problems
}

/**
 * Generic error handler for analysis operations
 */
export function handleAnalysisError(operation: string, error: any): void {
  console.log(`⚠️ ${operation} skipped due to error: ${error.message || error}`)
}

/**
 * Generate common recommendations based on issues
 */
export function generateCommonRecommendations(issues: { category: string; severity: string }[]): string[] {
  const recommendations: string[] = []

  if (issues.filter((i) => i.category === "typescript").length > 0) {
    recommendations.push("Fix TypeScript errors to improve type safety")
  }

  if (issues.filter((i) => i.category === "eslint" && i.severity === "error").length > 0) {
    recommendations.push("Address ESLint errors to maintain code quality standards")
  }

  return recommendations
}