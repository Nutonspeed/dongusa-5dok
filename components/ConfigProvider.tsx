"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { dynamicConfigSystem } from "@/lib/dynamic-config-system"

interface ConfigContextType {
  config: Record<string, any>
  loading: boolean
  error: string | null
  refreshConfig: () => Promise<void>
  getConfig: (key: string, defaultValue?: any) => any
  updateConfig: (key: string, value: any) => Promise<void>
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      const allValues = await dynamicConfigSystem.getAllValues()
      setConfig(allValues)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load configuration")
    } finally {
      setLoading(false)
    }
  }

  const getConfig = (key: string, defaultValue: any = null) => {
    return config[key] ?? defaultValue
  }

  const updateConfig = async (key: string, value: any) => {
    try {
      const fields = await dynamicConfigSystem.getFields()
      const field = fields.find((f) => f.key === key)

      if (!field) {
        throw new Error(`Configuration field '${key}' not found`)
      }

      await dynamicConfigSystem.setValue(field.id, value, "user")
      setConfig((prev) => ({ ...prev, [key]: value }))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to update configuration")
    }
  }

  useEffect(() => {
    refreshConfig()
  }, [])

  const value: ConfigContextType = {
    config,
    loading,
    error,
    refreshConfig,
    getConfig,
    updateConfig,
  }

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider")
  }
  return context
}

// Hook for specific config values with real-time updates
export function useConfigValue<T = any>(key: string, defaultValue?: T): [T, (value: T) => Promise<void>] {
  const { getConfig, updateConfig } = useConfig()
  const [value, setValue] = useState<T>(() => getConfig(key, defaultValue))

  useEffect(() => {
    setValue(getConfig(key, defaultValue))
  }, [key, defaultValue, getConfig])

  const updateValue = async (newValue: T) => {
    await updateConfig(key, newValue)
    setValue(newValue)
  }

  return [value, updateValue]
}
