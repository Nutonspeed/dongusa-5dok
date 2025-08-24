"use client"

import React from "react"

type GlassPanelProps = React.PropsWithChildren<{
  className?: string
  accent?: "burgundy" | "gold" | "none"
}>

export default function GlassPanel({ children, className = "", accent = "none" }: GlassPanelProps) {
  const ring = accent === "burgundy"
    ? "ring-1 ring-[#B8323C]/30"
    : accent === "gold"
    ? "ring-1 ring-[#F0A500]/30"
    : "ring-1 ring-white/30"

  return (
    <div className={`rounded-2xl bg-white/70 backdrop-blur-md shadow-sm ${ring} ${className}`}>
      {children}
    </div>
  )
}
