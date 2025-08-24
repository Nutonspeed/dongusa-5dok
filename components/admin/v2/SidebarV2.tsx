"use client"

import React from "react"
import { X, Home, FileText, Package, Settings } from "lucide-react"

export type SidebarV2Props = {
  mode?: "inline" | "drawer"
  onClose?: () => void
}

const items = [
  { key: "dashboard", label: "ภาพรวม", icon: <Home className="w-4 h-4" /> },
  { key: "bills", label: "เปิดบิล", icon: <FileText className="w-4 h-4" /> },
  { key: "orders", label: "ออเดอร์", icon: <Package className="w-4 h-4" /> },
  { key: "settings", label: "ตั้งค่า", icon: <Settings className="w-4 h-4" /> },
]

const SidebarV2: React.FC<SidebarV2Props> = ({ mode = "inline", onClose }) => {
  const body = (
    <aside className="w-[260px] rounded-2xl bg-white/70 dark:bg-neutral-900/40 border border-white/50 dark:border-white/10 backdrop-blur-md shadow p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-neutral-700">เมนู</span>
        {mode === "drawer" && (
          <button aria-label="ปิดเมนู" onClick={onClose} className="rounded-lg p-1 hover:bg-white/70">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        )}
      </div>
      <nav className="flex flex-col gap-1">
        {items.map(it => (
          <button key={it.key} className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm text-neutral-700 hover:bg-white shadow border border-white/50">
            {it.icon}
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )

  if (mode === "drawer") {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="absolute left-4 right-16 top-6">
          {body}
        </div>
      </div>
    )
  }

  return body
}

export default SidebarV2
