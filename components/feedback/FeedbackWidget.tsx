"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Bug, Lightbulb, Star, X, Send, Camera } from "lucide-react"
import { feedbackBugManager } from "@/lib/feedback-bug-management"
import { useLanguage } from "@/app/contexts/LanguageContext"

interface FeedbackWidgetProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  theme?: "light" | "dark"
}

export function FeedbackWidget({ position = "bottom-right", theme = "light" }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<"general" | "bug_report" | "feature_request">("general")
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { language } = useLanguage()

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  }

  const handleSubmit = async () => {
    if (!title || !description || rating === 0) return

    setIsSubmitting(true)

    try {
      if (feedbackType === "bug_report") {
        await feedbackBugManager.reportBug({
          title,
          description,
          reporter_email: email,
          page_url: window.location.href,
          expected_behavior: "Normal functionality",
          actual_behavior: description,
          steps_to_reproduce: [description],
        })
      } else {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            rating,
            feedback_type: feedbackType,
            email,
            page_url: window.location.href,
            browser_info: navigator.userAgent,
            device_info: `${window.screen.width}x${window.screen.height}`,
          }),
        })
      }

      setIsSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setIsSubmitted(false)
        resetForm()
      }, 2000)
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFeedbackType("general")
    setRating(0)
    setTitle("")
    setDescription("")
    setEmail("")
    setScreenshot(null)
  }

  const handleScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const video = document.createElement("video")
      video.srcObject = stream
      video.play()

      video.addEventListener("loadedmetadata", () => {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(video, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "screenshot.png", { type: "image/png" })
            setScreenshot(file)
          }
        })

        stream.getTracks().forEach((track) => track.stop())
      })
    } catch (error) {
      console.error("Error taking screenshot:", error)
    }
  }

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 w-96`}>
      <Card className={`shadow-xl ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white"}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{language === "th" ? "แสดงความคิดเห็น" : "Feedback"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-4xl mb-2">✓</div>
              <p className="text-lg font-medium">
                {language === "th" ? "ขอบคุณสำหรับความคิดเห็น!" : "Thank you for your feedback!"}
              </p>
              <p className="text-sm text-gray-500">
                {language === "th" ? "เราจะตรวจสอบและปรับปรุงต่อไป" : "We'll review and improve accordingly"}
              </p>
            </div>
          ) : (
            <>
              {/* Feedback Type */}
              <div>
                <Label className="text-sm font-medium">{language === "th" ? "ประเภทความคิดเห็น" : "Feedback Type"}</Label>
                <RadioGroup
                  value={feedbackType}
                  onValueChange={(value: any) => setFeedbackType(value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="general" id="general" />
                    <Label htmlFor="general" className="flex items-center cursor-pointer">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {language === "th" ? "ทั่วไป" : "General"}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bug_report" id="bug_report" />
                    <Label htmlFor="bug_report" className="flex items-center cursor-pointer">
                      <Bug className="w-4 h-4 mr-1" />
                      {language === "th" ? "รายงานปัญหา" : "Bug Report"}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="feature_request" id="feature_request" />
                    <Label htmlFor="feature_request" className="flex items-center cursor-pointer">
                      <Lightbulb className="w-4 h-4 mr-1" />
                      {language === "th" ? "ขอฟีเจอร์ใหม่" : "Feature Request"}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Rating */}
              <div>
                <Label className="text-sm font-medium">
                  {language === "th" ? "คะแนนความพึงพอใจ" : "Satisfaction Rating"}
                </Label>
                <div className="flex items-center space-x-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">{rating > 0 && `${rating}/5`}</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  {language === "th" ? "หัวข้อ" : "Title"}
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === "th" ? "สรุปสั้นๆ" : "Brief summary"}
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  {language === "th" ? "รายละเอียด" : "Description"}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    feedbackType === "bug_report"
                      ? language === "th"
                        ? "อธิบายปัญหาที่พบ และขั้นตอนการเกิดปัญหา"
                        : "Describe the issue and steps to reproduce"
                      : language === "th"
                        ? "แสดงความคิดเห็นหรือข้อเสนอแนะ"
                        : "Share your thoughts or suggestions"
                  }
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  {language === "th" ? "อีเมล (ไม่บังคับ)" : "Email (Optional)"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === "th" ? "สำหรับติดตามผล" : "For follow-up"}
                  className="mt-1"
                />
              </div>

              {/* Screenshot for bug reports */}
              {feedbackType === "bug_report" && (
                <div>
                  <Label className="text-sm font-medium">
                    {language === "th" ? "ภาพหน้าจอ (ไม่บังคับ)" : "Screenshot (Optional)"}
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Button type="button" variant="outline" size="sm" onClick={handleScreenshot}>
                      <Camera className="w-4 h-4 mr-1" />
                      {language === "th" ? "ถ่ายหน้าจอ" : "Take Screenshot"}
                    </Button>
                    {screenshot && (
                      <Badge variant="secondary" className="text-xs">
                        {language === "th" ? "มีภาพแนบแล้ว" : "Screenshot attached"}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!title || !description || rating === 0 || isSubmitting}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting
                  ? language === "th"
                    ? "กำลังส่ง..."
                    : "Sending..."
                  : language === "th"
                    ? "ส่งความคิดเห็น"
                    : "Send Feedback"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
