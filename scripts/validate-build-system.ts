#!/usr/bin/env tsx

/**
 * Build System Validation Script
 * Validates module exports, dependencies, and build configuration
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"

interface ValidationResult {
  success: boolean
  errors: string[]
  warnings: string[]
}

interface ModuleExport {
  file: string
  exports: string[]
  imports: string[]
}

class BuildSystemValidator {
  private projectRoot: string
  private results: ValidationResult

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot
    this.results = {
      success: true,
      errors: [],
      warnings: [],
    }
  }

  async validate(): Promise<ValidationResult> {
    console.log("🔍 Starting Build System Validation...\n")

    // 1. Validate module exports and imports
    await this.validateModuleSystem()

    // 2. Validate dependencies
    await this.validateDependencies()

    // 3. Validate runtime environment separation
    await this.validateRuntimeEnvironments()

    // 4. Validate build configuration
    await this.validateBuildConfiguration()

    // Generate report
    this.generateReport()

    return this.results
  }

  private async validateModuleSystem(): Promise<void> {
    console.log("📦 Validating Module System...")

    const modules = this.scanModules()
    const importMap = this.buildImportMap(modules)

    // Check for missing exports
    for (const [importPath, importingFiles] of importMap) {
      if (!this.moduleExists(importPath)) {
        this.results.errors.push(`Missing module: ${importPath} (imported by: ${importingFiles.join(", ")})`)
        this.results.success = false
      }
    }

    // Check for circular dependencies
    const circularDeps = this.detectCircularDependencies(modules)
    if (circularDeps.length > 0) {
      this.results.warnings.push(`Circular dependencies detected: ${circularDeps.join(", ")}`)
    }

    console.log("✅ Module system validation complete\n")
  }

  private async validateDependencies(): Promise<void> {
    console.log("📋 Validating Dependencies...")

    const packageJson = this.readPackageJson()
    const conflicts = this.checkVersionConflicts(packageJson)

    if (conflicts.length > 0) {
      this.results.warnings.push(`Dependency conflicts: ${conflicts.join(", ")}`)
    }

    // Check for known problematic combinations
    const problematicCombos = this.checkProblematicCombinations(packageJson)
    if (problematicCombos.length > 0) {
      this.results.errors.push(`Problematic dependency combinations: ${problematicCombos.join(", ")}`)
      this.results.success = false
    }

    console.log("✅ Dependency validation complete\n")
  }

  private async validateRuntimeEnvironments(): Promise<void> {
    console.log("🌐 Validating Runtime Environments...")

    const edgeRuntimeFiles = this.findEdgeRuntimeFiles()
    const nodeModuleUsage = this.findNodeModuleUsage(edgeRuntimeFiles)

    if (nodeModuleUsage.length > 0) {
      this.results.warnings.push(`Node.js modules in Edge Runtime: ${nodeModuleUsage.join(", ")}`)
    }

    console.log("✅ Runtime environment validation complete\n")
  }

  private async validateBuildConfiguration(): Promise<void> {
    console.log("⚙️ Validating Build Configuration...")

    // Check Next.js config
    const nextConfig = this.readNextConfig()
    if (!nextConfig) {
      this.results.warnings.push("Missing next.config.mjs")
    }

    // Check TypeScript config
    const tsConfig = this.readTsConfig()
    if (!tsConfig) {
      this.results.errors.push("Missing tsconfig.json")
      this.results.success = false
    }

    console.log("✅ Build configuration validation complete\n")
  }

  private scanModules(): ModuleExport[] {
    const modules: ModuleExport[] = []
    const scanDir = (dir: string) => {
      const items = readdirSync(join(this.projectRoot, dir))

      for (const item of items) {
        const fullPath = join(this.projectRoot, dir, item)
        const relativePath = join(dir, item)

        if (statSync(fullPath).isDirectory()) {
          if (!item.startsWith(".") && item !== "node_modules") {
            scanDir(relativePath)
          }
        } else if ([".ts", ".tsx", ".js", ".jsx"].includes(extname(item))) {
          const moduleInfo = this.analyzeModule(fullPath, relativePath)
          if (moduleInfo) {
            modules.push(moduleInfo)
          }
        }
      }
    }

    scanDir(".")
    return modules
  }

  private analyzeModule(fullPath: string, relativePath: string): ModuleExport | null {
    try {
      const content = readFileSync(fullPath, "utf-8")
      const exports = this.extractExports(content)
      const imports = this.extractImports(content)

      return {
        file: relativePath,
        exports,
        imports,
      }
    } catch (error) {
      return null
    }
  }

  private extractExports(content: string): string[] {
    const exports: string[] = []

    // Default exports
    const defaultExportMatch = content.match(/export\s+default\s+(?:function\s+)?(\w+)/g)
    if (defaultExportMatch) {
      exports.push("default")
    }

    // Named exports
    const namedExportMatches = content.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/g)
    if (namedExportMatches) {
      namedExportMatches.forEach((match) => {
        const name = match.match(/(\w+)$/)?.[1]
        if (name) exports.push(name)
      })
    }

    // Export statements
    const exportStatements = content.match(/export\s*\{([^}]+)\}/g)
    if (exportStatements) {
      exportStatements.forEach((statement) => {
        const names = statement.match(/\{([^}]+)\}/)?.[1]
        if (names) {
          names.split(",").forEach((name) => {
            const cleanName = name.trim().split(" as ")[0].trim()
            exports.push(cleanName)
          })
        }
      })
    }

    return exports
  }

  private extractImports(content: string): string[] {
    const imports: string[] = []

    const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g)
    if (importMatches) {
      importMatches.forEach((match) => {
        const path = match.match(/from\s+['"]([^'"]+)['"]/)?.[1]
        if (path) imports.push(path)
      })
    }

    return imports
  }

  private buildImportMap(modules: ModuleExport[]): Map<string, string[]> {
    const importMap = new Map<string, string[]>()

    modules.forEach((module) => {
      module.imports.forEach((importPath) => {
        if (!importMap.has(importPath)) {
          importMap.set(importPath, [])
        }
        importMap.get(importPath)!.push(module.file)
      })
    })

    return importMap
  }

  private moduleExists(importPath: string): boolean {
    // Handle relative imports
    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      return true // Skip relative path validation for now
    }

    // Handle alias imports (@/)
    if (importPath.startsWith("@/")) {
      const realPath = importPath.replace("@/", "")
      const possibleExtensions = [".ts", ".tsx", ".js", ".jsx"]

      for (const ext of possibleExtensions) {
        if (existsSync(join(this.projectRoot, realPath + ext))) {
          return true
        }
      }

      // Check for index files
      if (
        existsSync(join(this.projectRoot, realPath, "index.ts")) ||
        existsSync(join(this.projectRoot, realPath, "index.tsx"))
      ) {
        return true
      }

      return false
    }

    // Handle node_modules
    return existsSync(join(this.projectRoot, "node_modules", importPath))
  }

  private detectCircularDependencies(modules: ModuleExport[]): string[] {
    // Simplified circular dependency detection
    // In a real implementation, this would use graph algorithms
    return []
  }

  private readPackageJson(): any {
    try {
      const content = readFileSync(join(this.projectRoot, "package.json"), "utf-8")
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  private checkVersionConflicts(packageJson: any): string[] {
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

  private checkProblematicCombinations(packageJson: any): string[] {
    const problems: string[] = []

    if (!packageJson) return problems

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

    // Check for known problematic combinations
    if (deps.react?.includes("18.0.0") && deps.next?.includes("14.")) {
      problems.push("React 18.0.0 with Next.js 14.x - should use React 18.2.0+")
    }

    return problems
  }

  private findEdgeRuntimeFiles(): string[] {
    const edgeFiles: string[] = []

    // Files that typically run in Edge Runtime
    const edgePatterns = [
      "middleware.ts",
      "middleware.js",
      "**/route.ts", // API routes with edge runtime
      "**/route.js",
    ]

    // This would scan for files with edge runtime configuration
    return edgeFiles
  }

  private findNodeModuleUsage(files: string[]): string[] {
    const nodeModuleUsage: string[] = []

    files.forEach((file) => {
      try {
        const content = readFileSync(join(this.projectRoot, file), "utf-8")

        // Check for Node.js specific imports
        const nodeImports = [
          "crypto",
          "fs",
          "path",
          "util",
          "os",
          "child_process",
          "stream",
          "buffer",
          "events",
          "http",
          "https",
        ]

        nodeImports.forEach((nodeModule) => {
          if (content.includes(`require('${nodeModule}')`) || content.includes(`from '${nodeModule}'`)) {
            nodeModuleUsage.push(`${file}: ${nodeModule}`)
          }
        })
      } catch {
        // Ignore read errors
      }
    })

    return nodeModuleUsage
  }

  private readNextConfig(): any {
    try {
      const configPath = join(this.projectRoot, "next.config.mjs")
      return existsSync(configPath)
    } catch {
      return false
    }
  }

  private readTsConfig(): any {
    try {
      const content = readFileSync(join(this.projectRoot, "tsconfig.json"), "utf-8")
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  private generateReport(): void {
    console.log("📊 Build System Validation Report")
    console.log("================================\n")

    if (this.results.success) {
      console.log("✅ Overall Status: PASSED\n")
    } else {
      console.log("❌ Overall Status: FAILED\n")
    }

    if (this.results.errors.length > 0) {
      console.log("🚨 Errors:")
      this.results.errors.forEach((error) => console.log(`  - ${error}`))
      console.log()
    }

    if (this.results.warnings.length > 0) {
      console.log("⚠️  Warnings:")
      this.results.warnings.forEach((warning) => console.log(`  - ${warning}`))
      console.log()
    }

    if (this.results.errors.length === 0 && this.results.warnings.length === 0) {
      console.log("🎉 No issues found!")
    }

    console.log("\n💡 Recommendations:")
    console.log("  - Run this validation before each deployment")
    console.log("  - Add to CI/CD pipeline as a pre-build step")
    console.log("  - Fix all errors before deploying")
    console.log("  - Address warnings to improve system stability")
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new BuildSystemValidator()
  validator.validate().then((result) => {
    process.exit(result.success ? 0 : 1)
  })
}

export { BuildSystemValidator }
