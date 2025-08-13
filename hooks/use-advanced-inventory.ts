"use client"

import { useState, useEffect } from "react"
import {
  advancedInventoryService,
  type InventoryForecast,
  type SupplierPerformance,
  type BatchTracking,
  type InventoryTurnoverReport,
  type AutoReorderRule,
} from "@/lib/advanced-inventory-service"
import { logger } from "@/lib/logger"

export function useInventoryForecast(timeframe: "weekly" | "monthly" | "quarterly" = "monthly") {
  const [forecasts, setForecasts] = useState<InventoryForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        setLoading(true)
        const data = await advancedInventoryService.generateInventoryForecast(timeframe)
        setForecasts(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching inventory forecasts:", err)
        setError("Failed to fetch inventory forecasts")
      } finally {
        setLoading(false)
      }
    }

    fetchForecasts()
  }, [timeframe])

  return { forecasts, loading, error }
}

export function useSupplierPerformance() {
  const [performance, setPerformance] = useState<SupplierPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true)
        const data = await advancedInventoryService.evaluateSupplierPerformance()
        setPerformance(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching supplier performance:", err)
        setError("Failed to fetch supplier performance")
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
  }, [])

  const refreshPerformance = async () => {
    const data = await advancedInventoryService.evaluateSupplierPerformance()
    setPerformance(data)
  }

  return { performance, loading, error, refreshPerformance }
}

export function useBatchTracking(inventoryId?: string) {
  const [batches, setBatches] = useState<BatchTracking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true)
        const data = await advancedInventoryService.getBatches({ inventory_id: inventoryId })
        setBatches(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching batches:", err)
        setError("Failed to fetch batches")
      } finally {
        setLoading(false)
      }
    }

    fetchBatches()
  }, [inventoryId])

  const createBatch = async (batchData: Omit<BatchTracking, "id" | "created_at">) => {
    try {
      const batchId = await advancedInventoryService.createBatch(batchData)
      const updatedBatches = await advancedInventoryService.getBatches({ inventory_id: inventoryId })
      setBatches(updatedBatches)
      return batchId
    } catch (err) {
      logger.error("Error creating batch:", err)
      throw err
    }
  }

  const updateBatchStatus = async (batchId: string, status: BatchTracking["status"], notes?: string) => {
    try {
      const success = await advancedInventoryService.updateBatchStatus(batchId, status, notes)
      if (success) {
        const updatedBatches = await advancedInventoryService.getBatches({ inventory_id: inventoryId })
        setBatches(updatedBatches)
      }
      return success
    } catch (err) {
      logger.error("Error updating batch status:", err)
      return false
    }
  }

  return { batches, loading, error, createBatch, updateBatchStatus }
}

export function useInventoryTurnover(period: "monthly" | "quarterly" | "yearly" = "monthly") {
  const [turnoverReport, setTurnoverReport] = useState<InventoryTurnoverReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTurnover = async () => {
      try {
        setLoading(true)
        const data = await advancedInventoryService.generateTurnoverReport(period)
        setTurnoverReport(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching turnover report:", err)
        setError("Failed to fetch turnover report")
      } finally {
        setLoading(false)
      }
    }

    fetchTurnover()
  }, [period])

  return { turnoverReport, loading, error }
}

export function useAutoReorder(inventoryId?: string) {
  const [rules, setRules] = useState<AutoReorderRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true)
        const data = await advancedInventoryService.getAutoReorderRules(inventoryId)
        setRules(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching auto-reorder rules:", err)
        setError("Failed to fetch auto-reorder rules")
      } finally {
        setLoading(false)
      }
    }

    fetchRules()
  }, [inventoryId])

  const createRule = async (rule: Omit<AutoReorderRule, "id" | "created_at" | "updated_at">) => {
    try {
      const ruleId = await advancedInventoryService.createAutoReorderRule(rule)
      const updatedRules = await advancedInventoryService.getAutoReorderRules(inventoryId)
      setRules(updatedRules)
      return ruleId
    } catch (err) {
      logger.error("Error creating auto-reorder rule:", err)
      throw err
    }
  }

  const processReorders = async () => {
    try {
      const result = await advancedInventoryService.processAutoReorders()
      return result
    } catch (err) {
      logger.error("Error processing auto-reorders:", err)
      throw err
    }
  }

  return { rules, loading, error, createRule, processReorders }
}

export function useInventoryInsights() {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true)
        const data = await advancedInventoryService.getInventoryInsights()
        setInsights(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching inventory insights:", err)
        setError("Failed to fetch inventory insights")
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  return { insights, loading, error }
}

export function useDemandPlanning() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateDemandPlan = async (productId: string, timeframe: "monthly" | "quarterly" = "monthly") => {
    try {
      setLoading(true)
      setError(null)
      const plan = await advancedInventoryService.generateDemandPlan(productId, timeframe)
      return plan
    } catch (err) {
      logger.error("Error generating demand plan:", err)
      setError("Failed to generate demand plan")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { generateDemandPlan, loading, error }
}

export function useCostOptimization() {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        const data = await advancedInventoryService.analyzeCostOptimization()
        setAnalysis(data)
        setError(null)
      } catch (err) {
        logger.error("Error fetching cost optimization analysis:", err)
        setError("Failed to fetch cost optimization analysis")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [])

  return { analysis, loading, error }
}
