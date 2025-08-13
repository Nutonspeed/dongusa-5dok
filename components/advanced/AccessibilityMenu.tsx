"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Accessibility, X, Type, Eye, MousePointer } from "lucide-react"

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState([100])
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [focusIndicators, setFocusIndicators] = useState(true)

  const applyAccessibilitySettings = () => {
    const root = document.documentElement

    // Font size
    root.style.fontSize = `${fontSize[0]}%`

    // High contrast
    if (highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    // Reduced motion
    if (reducedMotion) {
      root.classList.add("reduce-motion")
    } else {
      root.classList.remove("reduce-motion")
    }

    // Focus indicators
    if (focusIndicators) {
      root.classList.add("enhanced-focus")
    } else {
      root.classList.remove("enhanced-focus")
    }

    // Save preferences
    localStorage.setItem(
      "accessibility-settings",
      JSON.stringify({
        fontSize: fontSize[0],
        highContrast,
        reducedMotion,
        focusIndicators,
      }),
    )
  }

  const resetSettings = () => {
    setFontSize([100])
    setHighContrast(false)
    setReducedMotion(false)
    setFocusIndicators(true)

    const root = document.documentElement
    root.style.fontSize = "100%"
    root.classList.remove("high-contrast", "reduce-motion")
    root.classList.add("enhanced-focus")

    localStorage.removeItem("accessibility-settings")
  }

  // Load saved settings on mount
  useState(() => {
    const saved = localStorage.getItem("accessibility-settings")
    if (saved) {
      const settings = JSON.parse(saved)
      setFontSize([settings.fontSize])
      setHighContrast(settings.highContrast)
      setReducedMotion(settings.reducedMotion)
      setFocusIndicators(settings.focusIndicators)
    }
  })

  return (
    <>
      {/* Accessibility button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg bg-transparent"
        onClick={() => setIsOpen(true)}
        aria-label="Open accessibility menu"
      >
        <Accessibility className="h-4 w-4" />
      </Button>

      {/* Accessibility menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                Accessibility Settings
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close accessibility menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Font Size */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Font Size: {fontSize[0]}%
                </Label>
                <Slider
                  value={fontSize}
                  onValueChange={(value) => {
                    setFontSize(value)
                    applyAccessibilitySettings()
                  }}
                  max={150}
                  min={75}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  High Contrast
                </Label>
                <Switch
                  id="high-contrast"
                  checked={highContrast}
                  onCheckedChange={(checked) => {
                    setHighContrast(checked)
                    applyAccessibilitySettings()
                  }}
                />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Reduce Motion
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={reducedMotion}
                  onCheckedChange={(checked) => {
                    setReducedMotion(checked)
                    applyAccessibilitySettings()
                  }}
                />
              </div>

              {/* Enhanced Focus */}
              <div className="flex items-center justify-between">
                <Label htmlFor="focus-indicators" className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Enhanced Focus
                </Label>
                <Switch
                  id="focus-indicators"
                  checked={focusIndicators}
                  onCheckedChange={(checked) => {
                    setFocusIndicators(checked)
                    applyAccessibilitySettings()
                  }}
                />
              </div>

              {/* Reset Button */}
              <Button variant="outline" onClick={resetSettings} className="w-full bg-transparent">
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
