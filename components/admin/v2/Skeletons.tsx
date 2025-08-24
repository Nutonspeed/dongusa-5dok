"use client"

import React from "react"

function shimmer(className = "") {
  return `relative overflow-hidden ${className} before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent`
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-white/30 p-4">
      <div className={`h-4 w-24 rounded ${shimmer('bg-neutral-200')}`}></div>
      <div className={`h-8 w-32 mt-3 rounded ${shimmer('bg-neutral-200')}`}></div>
      <div className="mt-4 flex items-center gap-2">
        <div className={`h-3 w-16 rounded ${shimmer('bg-neutral-200')}`}></div>
        <div className={`h-3 w-10 rounded ${shimmer('bg-neutral-200')}`}></div>
      </div>
    </div>
  )
}

export function InvoiceCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur-md ring-1 ring-white/30 p-4">
      <div className="flex items-start gap-4">
        <div className={`h-10 w-10 rounded-lg ${shimmer('bg-neutral-200')}`}></div>
        <div className="flex-1">
          <div className={`h-4 w-40 rounded ${shimmer('bg-neutral-200')}`}></div>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <div className={`h-3 w-full rounded ${shimmer('bg-neutral-200')}`}></div>
            <div className={`h-3 w-full rounded ${shimmer('bg-neutral-200')}`}></div>
            <div className={`h-3 w-full rounded ${shimmer('bg-neutral-200')}`}></div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className={`h-6 w-24 rounded-full ${shimmer('bg-neutral-200')}`}></div>
        <div className={`h-8 w-28 rounded-xl ${shimmer('bg-neutral-200')}`}></div>
      </div>
    </div>
  )
}

// tailwind keyframes helper (optional)
// Add this to globals if needed: @keyframes shimmer { 100% { transform: translateX(100%); } }
