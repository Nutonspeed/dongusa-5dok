"use client"

import React from "react"

type Variant = "default" | "success" | "warning" | "danger" | "info" | "outline"

type ActionPillProps = React.PropsWithChildren<{
  variant?: Variant
  className?: string
  onClick?: () => void
  asButton?: boolean
}>

const styles: Record<Variant, string> = {
  default: "bg-neutral-100 text-neutral-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-sky-100 text-sky-700",
  outline: "border border-neutral-300 text-neutral-700"
}

export default function ActionPill({ children, variant = "default", className = "", onClick, asButton = false }: ActionPillProps) {
  const base = `inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${styles[variant]} ${className}`
  if (asButton) {
    return (
      <button onClick={onClick} className={`${base} hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}>
        {children}
      </button>
    )
  }
  return <span className={base}>{children}</span>
}
