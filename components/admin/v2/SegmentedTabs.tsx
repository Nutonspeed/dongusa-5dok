import React from "react"

export type SegmentedTabsProps = {
  tabs: { key: string; label: string; count?: number }[]
  value: string
  onChange: (key: string) => void
  className?: string
}

// Usage note: The prop for changing value is named `onChange`, not `onValueChange`.
export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({ tabs, value, onChange, className }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex(t => t.key === value)
    if (idx === -1) return
    if (e.key === "ArrowRight") {
      e.preventDefault()
      const next = tabs[(idx + 1) % tabs.length]
      onChange(next.key)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      const prev = tabs[(idx - 1 + tabs.length) % tabs.length]
      onChange(prev.key)
    }
  }

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Segmented tabs"
      onKeyDown={onKeyDown}
      className={[
        "relative inline-flex items-center gap-1 p-1 rounded-2xl",
        "bg-white/60 dark:bg-neutral-900/40 backdrop-blur-md",
        "shadow-[0_6px_30px_-12px_rgba(184,50,60,.25)]",
        className || "",
      ].join(" ")}
    >
      {tabs.map(t => {
        const active = t.key === value
        return (
          <button
            key={t.key}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.key)}
            className={[
              "px-4 py-2 rounded-xl text-sm font-medium transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70",
              active
                ? "bg-gradient-to-r from-[#B8323C] via-[#F0A500] to-[#F4C95D] text-white shadow"
                : "text-neutral-700 dark:text-neutral-200 hover:bg-white/70 dark:hover:bg-neutral-800/50",
            ].join(" ")}
          >
            <span>{t.label}</span>
            {typeof t.count === "number" && (
              <span className="ml-2 inline-block min-w-[1.5em] text-xs rounded-full bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 align-middle">
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedTabs
