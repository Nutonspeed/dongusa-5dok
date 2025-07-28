"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Clock, Package, Scissors, Truck, Home, AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import type { ProgressStage } from "@/lib/types/bill"
import { apiClient, handleApiError } from "@/lib/api-client"
import { formatDateTime, formatTimeAgo } from "@/lib/utils"
import { ErrorBoundary } from "@/components/ErrorBoundary"

interface BillProgressTrackerProps {
  billId?: string
  progress: ProgressStage[]
  enableRealTimeUpdates?: boolean
  onProgressUpdate?: (progress: ProgressStage[]) => void
}

const stageConfig = {
  "Order Received": {
    icon: Clock,
    label: "Order Received",
    labelTh: "รับคำสั่งซื้อ",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    description: "Your order has been received and is being processed",
  },
  Tailoring: {
    icon: Scissors,
    label: "Tailoring",
    labelTh: "กำลังตัดเย็บ",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    description: "Your custom sofa cover is being tailored",
  },
  Packing: {
    icon: Package,
    label: "Packing",
    labelTh: "กำลังแพ็ค",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    description: "Your order is being carefully packed for shipment",
  },
  Shipping: {
    icon: Truck,
    label: "Shipped",
    labelTh: "จัดส่งแล้ว",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    description: "Your order is on its way to you",
  },
  Delivered: {
    icon: Home,
    label: "Delivered",
    labelTh: "ส่งถึงแล้ว",
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Your order has been delivered successfully",
  },
}

// Real-time updates hook with exponential backoff
function useRealTimeProgress(billId?: string, enabled = false) {
  const [progress, setProgress] = useState<ProgressStage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const fetchProgress = async () => {
    if (!billId || !enabled || !isOnline) return

    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get<{ progress: ProgressStage[] }>(
        `/bills/${billId}/progress`,
        { maxRetries: 2 }, // Reduced retries for real-time updates
      )

      setProgress(data.progress)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)

      // Exponential backoff for retries
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000) // Max 30 seconds
      setTimeout(() => {
        setRetryCount((prev) => prev + 1)
      }, delay)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!enabled || !billId) return

    fetchProgress()

    // Set up polling with exponential backoff on errors
    const baseInterval = 30000 // 30 seconds
    const interval = error ? Math.min(baseInterval * Math.pow(2, retryCount), 300000) : baseInterval // Max 5 minutes

    const intervalId = setInterval(fetchProgress, interval)

    return () => clearInterval(intervalId)
  }, [billId, enabled, retryCount, error, isOnline])

  return { progress, loading, error, refetch: fetchProgress, isOnline }
}

export default function BillProgressTracker({
  billId,
  progress: initialProgress,
  enableRealTimeUpdates = false,
  onProgressUpdate,
}: BillProgressTrackerProps) {
  const {
    progress: realtimeProgress,
    loading: realtimeLoading,
    error: realtimeError,
    refetch,
    isOnline,
  } = useRealTimeProgress(billId, enableRealTimeUpdates)

  // Use real-time progress if available, otherwise use initial progress
  const progress = enableRealTimeUpdates && realtimeProgress.length > 0 ? realtimeProgress : initialProgress

  useEffect(() => {
    if (enableRealTimeUpdates && realtimeProgress.length > 0) {
      onProgressUpdate?.(realtimeProgress)
    }
  }, [realtimeProgress, enableRealTimeUpdates, onProgressUpdate])

  const getStageStatus = (stage: ProgressStage["stage"]) => {
    const stageData = progress.find((p) => p.stage === stage)
    return stageData?.status || "pending"
  }

  const getStageData = (stage: ProgressStage["stage"]) => {
    return progress.find((p) => p.stage === stage)
  }

  const allStages: ProgressStage["stage"][] = ["Order Received", "Tailoring", "Packing", "Shipping", "Delivered"]
  const completedStages = progress.filter((p) => p.status === "completed").length
  const progressPercentage = (completedStages / allStages.length) * 100

  const currentStage =
    progress.find((p) => p.status === "in_progress") || progress.filter((p) => p.status === "completed").pop()

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Network Status and Error Handling */}
        {enableRealTimeUpdates && !isOnline && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <WifiOff className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You're offline. Progress updates will resume when connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {enableRealTimeUpdates && realtimeError && isOnline && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 flex items-center justify-between">
              <span>Unable to fetch real-time updates: {realtimeError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={realtimeLoading}
                className="ml-2 bg-transparent"
              >
                {realtimeLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Overall Progress</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
              {enableRealTimeUpdates && (
                <div className="flex items-center space-x-1">
                  {isOnline ? (
                    <Wifi className="w-3 h-3 text-green-600" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-gray-400" />
                  )}
                  {realtimeLoading && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  )}
                </div>
              )}
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Status Timeline */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {allStages.map((stage, index) => {
              const config = stageConfig[stage]
              const Icon = config.icon
              const status = getStageStatus(stage)
              const stageData = getStageData(stage)
              const isCompleted = status === "completed"
              const isInProgress = status === "in_progress"
              const isCurrent = isInProgress || (isCompleted && index === completedStages - 1)

              return (
                <div key={stage} className="flex flex-col items-center relative flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted || isInProgress
                        ? `${config.bgColor} ${config.color} border-current shadow-sm`
                        : "bg-gray-100 text-gray-400 border-gray-300"
                    } ${isCurrent ? "ring-4 ring-opacity-20 ring-current scale-110" : ""}`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>

                  <div className="mt-2 text-center max-w-20">
                    <p
                      className={`text-xs font-medium ${isCompleted || isInProgress ? "text-gray-900" : "text-gray-500"}`}
                    >
                      {config.labelTh}
                    </p>
                    {stageData && (
                      <p className="text-xs text-gray-400 mt-1">
                        {stageData.completedAt
                          ? formatTimeAgo(stageData.completedAt)
                          : stageData.startedAt
                            ? `Started ${formatTimeAgo(stageData.startedAt)}`
                            : ""}
                      </p>
                    )}
                  </div>

                  {/* Connection Line */}
                  {index < allStages.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 h-0.5 transition-all duration-300 ${
                        index < completedStages - 1 ? "bg-green-400" : "bg-gray-300"
                      }`}
                      style={{
                        width: "calc(100% - 2.5rem)",
                        marginLeft: "1.25rem",
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Status Details */}
        {currentStage && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${stageConfig[currentStage.stage].bgColor}`}
                >
                  {React.createElement(stageConfig[currentStage.stage].icon, {
                    className: `w-4 h-4 ${stageConfig[currentStage.stage].color}`,
                  })}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{stageConfig[currentStage.stage].labelTh}</h4>
                  <p className="text-sm text-gray-600 mt-1">{stageConfig[currentStage.stage].description}</p>

                  {/* Timing Information */}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    {currentStage.startedAt && <span>Started: {formatDateTime(currentStage.startedAt)}</span>}
                    {currentStage.estimatedCompletion && !currentStage.completedAt && (
                      <span>Est. completion: {formatDateTime(currentStage.estimatedCompletion)}</span>
                    )}
                    {currentStage.completedAt && (
                      <span className="text-green-600">Completed: {formatDateTime(currentStage.completedAt)}</span>
                    )}
                  </div>

                  {/* Delay Warning */}
                  {currentStage.estimatedCompletion &&
                    !currentStage.completedAt &&
                    new Date() > new Date(currentStage.estimatedCompletion) && (
                      <Badge className="bg-red-100 text-red-800 text-xs mt-2">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Delayed
                      </Badge>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Progress History</h4>
            {enableRealTimeUpdates && (
              <Button variant="outline" size="sm" onClick={refetch} disabled={realtimeLoading || !isOnline}>
                {realtimeLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                ) : (
                  <RefreshCw className="w-3 h-3 mr-2" />
                )}
                Refresh
              </Button>
            )}
          </div>

          {realtimeLoading && progress.length === 0 ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {progress
                .sort((a, b) => {
                  const aTime = a.completedAt || a.startedAt || new Date(0)
                  const bTime = b.completedAt || b.startedAt || new Date(0)
                  return new Date(bTime).getTime() - new Date(aTime).getTime()
                })
                .map((item, index) => {
                  const config = stageConfig[item.stage]
                  const Icon = config.icon
                  const isDelayed =
                    item.estimatedCompletion && !item.completedAt && new Date() > new Date(item.estimatedCompletion)

                  return (
                    <div
                      key={`${item.stage}-${index}`}
                      className="flex items-start space-x-3 p-3 bg-white border rounded-lg"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor} flex-shrink-0`}
                      >
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{config.labelTh}</p>
                          <div className="flex items-center space-x-2">
                            {isDelayed && <Badge className="bg-red-100 text-red-800 text-xs">Delayed</Badge>}
                            <Badge
                              className={`text-xs ${
                                item.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}

                        {/* Timing Information */}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {item.startedAt && <span>Started: {formatDateTime(item.startedAt)}</span>}
                          {item.estimatedCompletion && (
                            <span>Est. completion: {formatDateTime(item.estimatedCompletion)}</span>
                          )}
                          {item.completedAt && (
                            <span className="text-green-600">Completed: {formatDateTime(item.completedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {progress.length === 0 && !realtimeLoading && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>No progress updates available yet</p>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
