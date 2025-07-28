"use client"

import React from "react"

// Comprehensive accessibility utilities and hooks
import { useEffect, useRef, useState } from "react"

// ARIA live region types
export type AriaLiveType = "polite" | "assertive" | "off"

// Focus management utilities
export class FocusManager {
  private static instance: FocusManager
  private focusStack: HTMLElement[] = []
  private trapStack: HTMLElement[] = []

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager()
    }
    return FocusManager.instance
  }

  // Save current focus and set new focus
  pushFocus(element: HTMLElement): void {
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus && currentFocus !== document.body) {
      this.focusStack.push(currentFocus)
    }
    element.focus()
  }

  // Restore previous focus
  popFocus(): void {
    const previousFocus = this.focusStack.pop()
    if (previousFocus && document.contains(previousFocus)) {
      previousFocus.focus()
    }
  }

  // Trap focus within an element
  trapFocus(element: HTMLElement): () => void {
    this.trapStack.push(element)

    const focusableElements = this.getFocusableElements(element)
    if (focusableElements.length === 0) return () => {}

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    element.addEventListener("keydown", handleKeyDown)
    firstElement.focus()

    return () => {
      element.removeEventListener("keydown", handleKeyDown)
      this.trapStack.pop()
    }
  }

  // Get all focusable elements within a container
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(", ")

    return Array.from(container.querySelectorAll(focusableSelectors)).filter((element) => {
      const htmlElement = element as HTMLElement
      return (
        htmlElement.offsetWidth > 0 &&
        htmlElement.offsetHeight > 0 &&
        !htmlElement.hidden &&
        window.getComputedStyle(htmlElement).visibility !== "hidden"
      )
    }) as HTMLElement[]
  }

  // Move focus to next/previous focusable element
  moveFocus(direction: "next" | "previous", container?: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container || document.body)
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)

    if (currentIndex === -1) return

    let nextIndex: number
    if (direction === "next") {
      nextIndex = (currentIndex + 1) % focusableElements.length
    } else {
      nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1
    }

    focusableElements[nextIndex].focus()
  }
}

// Keyboard navigation utilities
export const KeyboardKeys = {
  ENTER: "Enter",
  SPACE: " ",
  ESCAPE: "Escape",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
  TAB: "Tab",
} as const

export type KeyboardKey = (typeof KeyboardKeys)[keyof typeof KeyboardKeys]

// Screen reader utilities
export class ScreenReaderUtils {
  private static liveRegion: HTMLElement | null = null

  static announce(message: string, priority: AriaLiveType = "polite"): void {
    if (!this.liveRegion) {
      this.createLiveRegion()
    }

    if (this.liveRegion) {
      this.liveRegion.setAttribute("aria-live", priority)
      this.liveRegion.textContent = message

      // Clear after announcement to allow repeated announcements
      setTimeout(() => {
        if (this.liveRegion) {
          this.liveRegion.textContent = ""
        }
      }, 1000)
    }
  }

  private static createLiveRegion(): void {
    this.liveRegion = document.createElement("div")
    this.liveRegion.setAttribute("aria-live", "polite")
    this.liveRegion.setAttribute("aria-atomic", "true")
    this.liveRegion.className = "sr-only"
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `
    document.body.appendChild(this.liveRegion)
  }
}

// Color contrast utilities
export class ColorContrastUtils {
  static calculateLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  static calculateContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)

    if (!rgb1 || !rgb2) return 0

    const lum1 = this.calculateLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = this.calculateLuminance(rgb2.r, rgb2.g, rgb2.b)

    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }

  static meetsWCAGAA(foreground: string, background: string): boolean {
    return this.calculateContrastRatio(foreground, background) >= 4.5
  }

  static meetsWCAGAAA(foreground: string, background: string): boolean {
    return this.calculateContrastRatio(foreground, background) >= 7
  }

  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }
}

// React hooks for accessibility
export function useFocusManagement() {
  const focusManager = FocusManager.getInstance()

  return {
    pushFocus: focusManager.pushFocus.bind(focusManager),
    popFocus: focusManager.popFocus.bind(focusManager),
    trapFocus: focusManager.trapFocus.bind(focusManager),
    moveFocus: focusManager.moveFocus.bind(focusManager),
    getFocusableElements: focusManager.getFocusableElements.bind(focusManager),
  }
}

export function useAnnouncement() {
  return {
    announce: ScreenReaderUtils.announce.bind(ScreenReaderUtils),
  }
}

export function useKeyboardNavigation(
  onKeyDown?: (event: KeyboardEvent) => void,
  dependencies: React.DependencyList = [],
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      onKeyDown?.(event)
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, dependencies)
}

export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const focusManager = FocusManager.getInstance()
    const cleanup = focusManager.trapFocus(containerRef.current)

    return cleanup
  }, [isActive, containerRef])
}

export function useAriaLiveRegion(message: string, priority: AriaLiveType = "polite") {
  useEffect(() => {
    if (message) {
      ScreenReaderUtils.announce(message, priority)
    }
  }, [message, priority])
}

// Skip link component
export function SkipLink({
  href,
  children = "Skip to main content",
}: {
  href: string
  children?: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      onFocus={(e) => {
        // Ensure the skip link is visible when focused
        e.currentTarget.classList.remove("sr-only")
      }}
      onBlur={(e) => {
        // Hide the skip link when focus is lost
        e.currentTarget.classList.add("sr-only")
      }}
    >
      {children}
    </a>
  )
}

// Accessible form field wrapper
export function AccessibleField({
  id,
  label,
  description,
  error,
  required,
  children,
}: {
  id: string
  label: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {React.cloneElement(children as React.ReactElement, {
        id,
        "aria-describedby": [descriptionId, errorId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": !!error,
        "aria-required": required,
      })}

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible modal/dialog
export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}) {
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`).current
  const descriptionId = description
    ? useRef(`modal-description-${Math.random().toString(36).substr(2, 9)}`).current
    : undefined

  useFocusTrap(isOpen, modalRef)

  useKeyboardNavigation(
    (event) => {
      if (isOpen && event.key === KeyboardKeys.ESCAPE) {
        onClose()
      }
    },
    [isOpen, onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      ScreenReaderUtils.announce(`Dialog opened: ${title}`, "assertive")
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, title])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 id={titleId} className="text-xl font-semibold">
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close dialog">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        {description && (
          <p id={descriptionId} className="text-gray-600 mb-4">
            {description}
          </p>
        )}

        {children}
      </div>
    </div>
  )
}

// Accessible table
export function AccessibleTable({
  caption,
  headers,
  data,
  onRowClick,
}: {
  caption: string
  headers: Array<{ key: string; label: string; sortable?: boolean }>
  data: Array<Record<string, any>>
  onRowClick?: (row: any) => void
}) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnKey)
      setSortDirection("asc")
    }
  }

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [data, sortColumn, sortDirection])

  return (
    <table className="w-full border-collapse border border-gray-300" role="table">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header.key} className="border border-gray-300 px-4 py-2 text-left bg-gray-50" scope="col">
              {header.sortable ? (
                <button
                  onClick={() => handleSort(header.key)}
                  className="flex items-center gap-2 hover:text-blue-600"
                  aria-sort={
                    sortColumn === header.key ? (sortDirection === "asc" ? "ascending" : "descending") : "none"
                  }
                >
                  {header.label}
                  <span aria-hidden="true">
                    {sortColumn === header.key ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                  </span>
                </button>
              ) : (
                header.label
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, index) => (
          <tr
            key={index}
            className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
            onClick={() => onRowClick?.(row)}
            tabIndex={onRowClick ? 0 : undefined}
            onKeyDown={
              onRowClick
                ? (e) => {
                    if (e.key === KeyboardKeys.ENTER || e.key === KeyboardKeys.SPACE) {
                      e.preventDefault()
                      onRowClick(row)
                    }
                  }
                : undefined
            }
          >
            {headers.map((header) => (
              <td key={header.key} className="border border-gray-300 px-4 py-2">
                {row[header.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Export all utilities

export type { AriaLiveType, KeyboardKey }
