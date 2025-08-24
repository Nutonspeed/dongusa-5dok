"use client"

import React from "react"
import { Bell, Menu, Search } from "lucide-react"

export type TopBarV2Props = {
  title?: string
  query: string
  onQueryChange: (v: string) => void
  onToggleSidebar?: () => void
  notifications?: number
  rightSlot?: React.ReactNode
}

const TopBarV2: React.FC<TopBarV2Props> = ({ title = "ELF SofaCover Pro Dashboard", query, onQueryChange, onToggleSidebar, notifications = 0, rightSlot }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button aria-label="เปิดเมนู" className="lg:hidden rounded-xl p-2 bg-white/70 border border-white/50 shadow backdrop-blur-md" onClick={onToggleSidebar}>
          <Menu className="w-5 h-5 text-neutral-700" />
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            id="bills-v2-search"
            placeholder="ค้นหาคำสั่งซื้อ..."
            className="pl-9 pr-3 py-2 rounded-xl bg-white/70 backdrop-blur-md border border-white/50 shadow text-sm w-72 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
          />
        </div>
        <button className="relative rounded-full p-2 bg-white/70 backdrop-blur-md border border-white/50 shadow">
          <Bell className="w-5 h-5 text-neutral-700" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 text-[11px] grid place-items-center rounded-full text-white bg-gradient-to-br from-[#B8323C] via-[#F0A500] to-[#F4C95D]">
              {notifications}
            </span>
          )}
        </button>
        {rightSlot}
      </div>
    </div>
  )
}

export default TopBarV2
