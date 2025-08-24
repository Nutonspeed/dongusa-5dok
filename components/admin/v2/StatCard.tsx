import React from "react"

export type StatCardProps = {
  icon?: React.ReactNode
  label: string
  value: string | number
  hint?: string
  gradient?: string // tailwind gradient classes
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, hint, gradient, className }) => {
  return (
    <div
      role="group"
      aria-label={label}
      className={[
        "relative rounded-2xl p-4 sm:p-5",
        "bg-white/70 dark:bg-neutral-900/40 backdrop-blur-md",
        "border border-white/40 dark:border-white/10",
        "shadow-[0_10px_30px_-12px_rgba(184,50,60,.18)]",
        "transition hover:shadow-[0_16px_40px_-12px_rgba(184,50,60,.28)]",
        className || "",
      ].join(" ")}
    >
      {gradient && (
        <div className={["absolute inset-0 rounded-2xl opacity-[0.18] pointer-events-none", gradient].join(" ")} />
      )}
      <div className="relative flex items-center gap-3">
        {icon && (
          <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#B8323C] via-[#F0A500] to-[#F4C95D] text-white grid place-items-center shadow">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm text-neutral-600 dark:text-neutral-300 truncate">{label}</div>
          <div className="text-2xl font-semibold text-neutral-900 dark:text-white">{value}</div>
          {hint && <div className="text-xs text-neutral-500 mt-1">{hint}</div>}
        </div>
      </div>
    </div>
  )
}

export default StatCard
