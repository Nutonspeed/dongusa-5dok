"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/app/contexts/LanguageContext"

interface BackButtonProps {
  fallbackUrl?: string
  className?: string
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg"
}

export function BackButton({
  fallbackUrl = "/",
  className = "",
  variant = "ghost",
  size = "default",
}: BackButtonProps) {
  const router = useRouter()
  const { language } = useLanguage()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackUrl)
    }
  }

  return (
    <Button onClick={handleBack} variant={variant} size={size} className={`flex items-center gap-2 ${className}`}>
      <ArrowLeft className="w-4 h-4" />
      {language === "th" ? "กลับ" : "Back"}
    </Button>
  )
}
