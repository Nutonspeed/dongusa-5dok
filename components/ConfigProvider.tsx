"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { dynamicConfig } from "@/lib/dynamic-config-system"
import type { ConfigField } from "@/lib/types/dynamic-config"

interface ConfigContextType {
  getConfig: <T = any>(key: string, defaultValue?: T) => T
  setConfig: (key: string, value: any, options?: any) => Promise<void>
  configs: Record<string, ConfigField>
  loading: boolean
}

const ConfigContext = createContext<ConfigContextType | null>(null)

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, ConfigField>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial configs
    const allConfigs = dynamicConfig.getAllConfigs()
    const configMap = allConfigs.reduce(
      (acc, config) => {
        acc[config.key] = config
        return acc
      },
      {} as Record<string, ConfigField>,
    )

    setConfigs(configMap)
    setLoading(false)

    // Subscribe to changes
    const unsubscribe = dynamicConfig.subscribe((config) => {
      setConfigs((prev) => ({
        ...prev,
        [config.key]: config,
      }))
    })

    return unsubscribe
  }, [])

  const getConfig = <T = any>(key: string, defaultValue?: T): T => {
    return configs[key]?.value ?? defaultValue
  }

  const setConfig = async (key: string, value: any, options?: any) => {
    await dynamicConfig.setConfig(key, value, options)
  }

  return <ConfigContext.Provider value={{ getConfig, setConfig, configs, loading }}>{children}</ConfigContext.Provider>
}

export function useConfigContext() {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error("useConfigContext must be used within a ConfigProvider")
  }
  return context
}

// Convenience hooks for common config types
export function usePricingConfig() {
  const { getConfig } = useConfigContext()

  return {
    deliveryFee: getConfig("pricing.delivery_fee", 50),
    minimumOrder: getConfig("pricing.minimum_order", 500),
    taxRate: getConfig("pricing.tax_rate", 0.07),
    discountThreshold: getConfig("pricing.discount_threshold", 1000),
    discountRate: getConfig("pricing.discount_rate", 0.1),
  }
}

export function useBusinessConfig() {
  const { getConfig } = useConfigContext()

  return {
    companyName: getConfig("business.company_name", "ดงอุษา โซฟา"),
    phone: getConfig("business.phone", "02-123-4567"),
    email: getConfig("business.email", "info@dongusa.com"),
    address: getConfig("business.address", "กรุงเทพมหานคร"),
    workingHours: getConfig("business.working_hours", "9:00-18:00"),
    socialMedia: getConfig("business.social_media", {
      facebook: "",
      line: "",
      instagram: "",
    }),
  }
}

export function useFeatureConfig() {
  const { getConfig } = useConfigContext()

  return {
    enableOnlinePayment: getConfig("features.enable_online_payment", false),
    enableCustomOrders: getConfig("features.enable_custom_orders", true),
    enableInventoryTracking: getConfig("features.enable_inventory_tracking", false),
    enableReviews: getConfig("features.enable_reviews", true),
    enableWishlist: getConfig("features.enable_wishlist", true),
    maintenanceMode: getConfig("features.maintenance_mode", false),
  }
}
