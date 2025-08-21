"use client"

import * as React from "react"
import { Check, AlertCircle, X, Info, AlertTriangle } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
}

type ToastOptions = Omit<Toast, "id">

type ToastContextType = {
  toasts: Toast[]
  addToast: (toast: ToastOptions) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

const toastIcons = {
  success: React.createElement(Check, { className: "h-5 w-5 text-green-500" }),
  error: React.createElement(AlertCircle, { className: "h-5 w-5 text-red-500" }),
  info: React.createElement(Info, { className: "h-5 w-5 text-blue-500" }),
  warning: React.createElement(AlertTriangle, { className: "h-5 w-5 text-yellow-500" }),
}

const toastColors = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  info: "bg-blue-50 border-blue-200",
  warning: "bg-yellow-50 border-yellow-200",
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  const addToast = React.useCallback(({ duration = 5000, ...toast }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    
    setToasts((prevToasts) => [...prevToasts, { ...toast, id, duration }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  return React.createElement(
    ToastContext.Provider,
    { value: { toasts, addToast, removeToast } },
    children,
    React.createElement(
      "div",
      { className: "fixed bottom-4 right-4 z-50 space-y-2" },
      toasts.map((toast) =>
        React.createElement(
          "div",
          {
            key: toast.id,
            className: `flex items-center p-4 w-80 rounded-lg border ${toastColors[toast.type]} shadow-lg`,
          },
          React.createElement("div", { className: "mr-3" }, toastIcons[toast.type]),
          React.createElement(
            "div",
            { className: "flex-1" },
            React.createElement("h4", { className: "font-medium text-gray-900" }, toast.title),
            React.createElement("p", { className: "text-sm text-gray-600" }, toast.message)
          ),
          React.createElement(
            "button",
            {
              onClick: () => removeToast(toast.id),
              className: "ml-2 text-gray-400 hover:text-gray-600",
            },
            React.createElement(X, { className: "h-4 w-4" })
          )
        )
      )
    )
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function useToaster() {
  const { addToast } = useToast()

  return {
    success: (title: string, message: string, options?: Omit<ToastOptions, "type" | "title" | "message">) =>
      addToast({ type: "success", title, message, ...options }),
    error: (title: string, message: string, options?: Omit<ToastOptions, "type" | "title" | "message">) =>
      addToast({ type: "error", title, message, ...options }),
    info: (title: string, message: string, options?: Omit<ToastOptions, "type" | "title" | "message">) =>
      addToast({ type: "info", title, message, ...options }),
    warning: (title: string, message: string, options?: Omit<ToastOptions, "type" | "title" | "message">) =>
      addToast({ type: "warning", title, message, ...options }),
  }
}
