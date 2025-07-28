"use client"

import type React from "react"
import { useI18n, type TranslationKeys } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

interface LocalizedTextProps {
  tKey: keyof TranslationKeys
  params?: Record<string, string | number>
  as?: keyof JSX.IntrinsicElements
  className?: string
  children?: React.ReactNode
}

export function LocalizedText({ tKey, params, as: Component = "span", className, children }: LocalizedTextProps) {
  const { t, dir } = useI18n()

  return (
    <Component className={cn(className, dir === "rtl" && "text-right")} dir={dir}>
      {t(tKey, params)}
      {children}
    </Component>
  )
}

// Specialized components for common use cases
export function LocalizedHeading({
  tKey,
  params,
  level = 1,
  className,
}: {
  tKey: keyof TranslationKeys
  params?: Record<string, string | number>
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}) {
  const Component = `h${level}` as keyof JSX.IntrinsicElements

  return <LocalizedText tKey={tKey} params={params} as={Component} className={className} />
}

export function LocalizedButton({
  tKey,
  params,
  onClick,
  className,
  ...props
}: {
  tKey: keyof TranslationKeys
  params?: Record<string, string | number>
  onClick?: () => void
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { t } = useI18n()

  return (
    <button onClick={onClick} className={className} {...props}>
      {t(tKey, params)}
    </button>
  )
}

export function LocalizedLabel({
  tKey,
  params,
  htmlFor,
  required,
  className,
}: {
  tKey: keyof TranslationKeys
  params?: Record<string, string | number>
  htmlFor?: string
  required?: boolean
  className?: string
}) {
  const { t } = useI18n()

  return (
    <label htmlFor={htmlFor} className={className}>
      {t(tKey, params)}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}
