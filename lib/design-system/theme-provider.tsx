"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { designTokens } from "./tokens"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
  tokens: typeof designTokens
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme
    if (stored) {
      setTheme(stored)
    }
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement

    const updateTheme = (newTheme: "light" | "dark") => {
      root.classList.remove("light", "dark")
      root.classList.add(newTheme)
      setResolvedTheme(newTheme)

      // Update CSS custom properties
      const tokens = designTokens
      Object.entries(tokens.colors.primary).forEach(([key, value]) => {
        root.style.setProperty(`--color-primary-${key}`, value)
      })

      Object.entries(tokens.colors.neutral).forEach(([key, value]) => {
        root.style.setProperty(`--color-neutral-${key}`, value)
      })
    }

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      updateTheme(systemTheme)

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        updateTheme(e.matches ? "dark" : "light")
      }

      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      updateTheme(theme)
    }
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        resolvedTheme,
        tokens: designTokens,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
