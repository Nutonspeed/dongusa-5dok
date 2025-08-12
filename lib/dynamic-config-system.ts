"use client"

import type { ConfigField, ConfigCategory, ConfigValidationResult, ConfigAuditLog } from "./types/dynamic-config"

class DynamicConfigSystem {
  private configs: Map<string, ConfigField> = new Map()
  private categories: Map<string, ConfigCategory> = new Map()
  private cache: Map<string, any> = new Map()
  private auditLogs: ConfigAuditLog[] = []
  private subscribers: Set<(config: ConfigField) => void> = new Set()

  constructor() {
    this.initializeDefaultCategories()
    this.loadFromStorage()
  }

  private initializeDefaultCategories() {
    const defaultCategories: ConfigCategory[] = [
      {
        id: "pricing",
        name: "ราคาและค่าบริการ",
        description: "การตั้งค่าราคาสินค้าและค่าบริการต่างๆ",
        icon: "DollarSign",
        order: 1,
        permissions: ["admin", "pricing_manager"],
      },
      {
        id: "business",
        name: "ข้อมูลธุรกิจ",
        description: "ข้อมูลพื้นฐานของธุรกิจและการติดต่อ",
        icon: "Building",
        order: 2,
        permissions: ["admin", "business_manager"],
      },
      {
        id: "features",
        name: "ฟีเจอร์และการทำงาน",
        description: "การเปิด/ปิดฟีเจอร์และการตั้งค่าการทำงาน",
        icon: "Settings",
        order: 3,
        permissions: ["admin", "feature_manager"],
      },
      {
        id: "ui",
        name: "หน้าตาและการแสดงผล",
        description: "การตั้งค่าธีม สี และการแสดงผล",
        icon: "Palette",
        order: 4,
        permissions: ["admin", "ui_manager"],
      },
      {
        id: "notifications",
        name: "การแจ้งเตือน",
        description: "การตั้งค่าการส่งอีเมลและการแจ้งเตือน",
        icon: "Bell",
        order: 5,
        permissions: ["admin", "notification_manager"],
      },
    ]

    defaultCategories.forEach((category) => {
      this.categories.set(category.id, category)
    })
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dynamic-config")
      if (stored) {
        try {
          const data = JSON.parse(stored)
          data.configs?.forEach((config: ConfigField) => {
            this.configs.set(config.key, config)
          })
        } catch (error) {
          console.error("Failed to load config from storage:", error)
        }
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      const data = {
        configs: Array.from(this.configs.values()),
        categories: Array.from(this.categories.values()),
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem("dynamic-config", JSON.stringify(data))
    }
  }

  // Configuration Management
  async setConfig(
    key: string,
    value: any,
    options?: {
      category?: string
      description?: string
      validation?: ConfigField["validation"]
      userId?: string
    },
  ): Promise<void> {
    const existingConfig = this.configs.get(key)
    const now = new Date()

    const config: ConfigField = {
      id: existingConfig?.id || this.generateId(),
      key,
      value,
      type: this.inferType(value),
      category: options?.category || "general",
      description: options?.description,
      validation: options?.validation,
      metadata: {
        createdAt: existingConfig?.metadata?.createdAt || now,
        updatedAt: now,
        createdBy: existingConfig?.metadata?.createdBy || options?.userId || "system",
        updatedBy: options?.userId || "system",
        version: (existingConfig?.metadata?.version || 0) + 1,
      },
    }

    // Validate configuration
    const validation = this.validateConfig(config)
    if (!validation.isValid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(", ")}`)
    }

    // Log audit trail
    this.auditLogs.push({
      id: this.generateId(),
      configId: config.id,
      action: existingConfig ? "update" : "create",
      oldValue: existingConfig?.value,
      newValue: value,
      userId: options?.userId || "system",
      timestamp: now,
    })

    this.configs.set(key, config)
    this.cache.delete(key) // Invalidate cache
    this.saveToStorage()

    // Notify subscribers
    this.subscribers.forEach((callback) => callback(config))
  }

  getConfig<T = any>(key: string, defaultValue?: T): T {
    const config = this.configs.get(key)
    return config ? config.value : defaultValue
  }

  getConfigWithMetadata(key: string): ConfigField | null {
    return this.configs.get(key) || null
  }

  getAllConfigs(category?: string): ConfigField[] {
    const configs = Array.from(this.configs.values())
    return category ? configs.filter((c) => c.category === category) : configs
  }

  deleteConfig(key: string, userId?: string): boolean {
    const config = this.configs.get(key)
    if (!config) return false

    // Log audit trail
    this.auditLogs.push({
      id: this.generateId(),
      configId: config.id,
      action: "delete",
      oldValue: config.value,
      newValue: null,
      userId: userId || "system",
      timestamp: new Date(),
    })

    this.configs.delete(key)
    this.cache.delete(key)
    this.saveToStorage()
    return true
  }

  // Category Management
  addCategory(category: ConfigCategory): void {
    this.categories.set(category.id, category)
    this.saveToStorage()
  }

  getCategories(): ConfigCategory[] {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order)
  }

  // Validation
  private validateConfig(config: ConfigField): ConfigValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config.key) {
      errors.push("Configuration key is required")
    }

    if (config.validation) {
      const { required, min, max, pattern, enum: enumValues } = config.validation

      if (required && (config.value === null || config.value === undefined || config.value === "")) {
        errors.push("Value is required")
      }

      if (typeof config.value === "string") {
        if (min && config.value.length < min) {
          errors.push(`Value must be at least ${min} characters`)
        }
        if (max && config.value.length > max) {
          errors.push(`Value must be at most ${max} characters`)
        }
        if (pattern && !new RegExp(pattern).test(config.value)) {
          errors.push("Value does not match required pattern")
        }
      }

      if (typeof config.value === "number") {
        if (min && config.value < min) {
          errors.push(`Value must be at least ${min}`)
        }
        if (max && config.value > max) {
          errors.push(`Value must be at most ${max}`)
        }
      }

      if (enumValues && !enumValues.includes(config.value)) {
        errors.push(`Value must be one of: ${enumValues.join(", ")}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Utility methods
  private inferType(value: any): ConfigField["type"] {
    if (typeof value === "string") return "string"
    if (typeof value === "number") return "number"
    if (typeof value === "boolean") return "boolean"
    if (value instanceof Date) return "date"
    if (Array.isArray(value)) return "array"
    return "json"
  }

  private generateId(): string {
    return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Subscription system
  subscribe(callback: (config: ConfigField) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  // Export/Import
  exportConfig(): string {
    return JSON.stringify(
      {
        configs: Array.from(this.configs.values()),
        categories: Array.from(this.categories.values()),
        exportedAt: new Date().toISOString(),
      },
      null,
      2,
    )
  }

  importConfig(jsonData: string, userId?: string): void {
    try {
      const data = JSON.parse(jsonData)

      if (data.configs) {
        data.configs.forEach((config: ConfigField) => {
          this.setConfig(config.key, config.value, {
            category: config.category,
            description: config.description,
            validation: config.validation,
            userId,
          })
        })
      }

      if (data.categories) {
        data.categories.forEach((category: ConfigCategory) => {
          this.addCategory(category)
        })
      }
    } catch (error) {
      throw new Error("Invalid configuration data")
    }
  }

  // Audit
  getAuditLogs(configId?: string): ConfigAuditLog[] {
    return configId ? this.auditLogs.filter((log) => log.configId === configId) : this.auditLogs
  }
}

// Singleton instance
export const dynamicConfig = new DynamicConfigSystem()

// React Hook
import { useState, useEffect } from "react"

export function useConfig<T = any>(key: string, defaultValue?: T) {
  const [value, setValue] = useState<T>(() => dynamicConfig.getConfig(key, defaultValue))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = dynamicConfig.subscribe((config) => {
      if (config.key === key) {
        setValue(config.value)
      }
    })

    return unsubscribe
  }, [key])

  const updateConfig = async (
    newValue: T,
    options?: {
      category?: string
      description?: string
      validation?: ConfigField["validation"]
    },
  ) => {
    setLoading(true)
    try {
      await dynamicConfig.setConfig(key, newValue, options)
    } finally {
      setLoading(false)
    }
  }

  return { value, updateConfig, loading }
}

export function useConfigCategory(category: string) {
  const [configs, setConfigs] = useState<ConfigField[]>(() => dynamicConfig.getAllConfigs(category))

  useEffect(() => {
    const unsubscribe = dynamicConfig.subscribe(() => {
      setConfigs(dynamicConfig.getAllConfigs(category))
    })

    return unsubscribe
  }, [category])

  return configs
}
