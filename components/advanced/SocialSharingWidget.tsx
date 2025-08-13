"use client"

import { useState } from "react"
import { Share2, Facebook, Twitter, MessageCircle, Mail, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/app/contexts/LanguageContext"

interface SocialSharingWidgetProps {
  url?: string
  title?: string
  description?: string
  image?: string
  hashtags?: string[]
  className?: string
}

export function SocialSharingWidget({
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "SofaCover Pro - ผ้าคลุมโซฟาคุณภาพสูง",
  description = "ผ้าคลุมโซฟาสั่งทำพิเศษ คุณภาพสูง ราคาเป็นกันเอง",
  image = "/placeholder.svg?height=400&width=800&text=SofaCover+Pro",
  hashtags = ["SofaCover", "HomeDecor", "InteriorDesign", "Thailand"],
  className = "",
}: SocialSharingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { language } = useLanguage()

  const shareData = {
    title,
    text: description,
    url,
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      setIsOpen(true)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtags.join(",")}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
  }

  const socialPlatforms = [
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      url: shareUrls.facebook,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5" />,
      url: shareUrls.twitter,
      color: "bg-sky-500 hover:bg-sky-600",
    },
    {
      name: "LINE",
      icon: <MessageCircle className="w-5 h-5" />,
      url: shareUrls.line,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      url: shareUrls.whatsapp,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      url: shareUrls.email,
      color: "bg-gray-600 hover:bg-gray-700",
    },
  ]

  const handleSocialShare = (platform: string, url: string) => {
    if (platform === "Email") {
      window.location.href = url
    } else {
      window.open(url, "_blank", "width=600,height=400")
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={handleNativeShare}
        variant="outline"
        size="sm"
        className={`flex items-center space-x-2 ${className}`}
      >
        <Share2 className="w-4 h-4" />
        <span>{language === "th" ? "แชร์" : "Share"}</span>
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{language === "th" ? "แชร์เนื้อหา" : "Share Content"}</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              ×
            </Button>
          </div>

          {/* Preview */}
          <div className="mb-6 p-3 border rounded-lg bg-gray-50">
            <div className="flex space-x-3">
              <img src={image || "/placeholder.svg"} alt="Preview" className="w-16 h-16 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{title}</h4>
                <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
                <p className="text-xs text-gray-500 truncate">{url}</p>
              </div>
            </div>
          </div>

          {/* Social Platforms */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {socialPlatforms.map((platform) => (
              <Button
                key={platform.name}
                onClick={() => handleSocialShare(platform.name, platform.url)}
                className={`${platform.color} text-white flex items-center justify-center space-x-2 h-12`}
              >
                {platform.icon}
                <span className="text-sm">{platform.name}</span>
              </Button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="space-y-3">
            <p className="text-sm font-medium">{language === "th" ? "หรือคัดลอกลิงก์" : "Or copy link"}</p>
            <div className="flex space-x-2">
              <Input value={url} readOnly className="flex-1 text-sm" />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 bg-transparent"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">{language === "th" ? "คัดลอกแล้ว" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{language === "th" ? "คัดลอก" : "Copy"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">{language === "th" ? "แฮชแท็กแนะนำ" : "Suggested hashtags"}</p>
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded cursor-pointer hover:bg-blue-200"
                    onClick={() => {
                      navigator.clipboard.writeText(`#${tag}`)
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Quick share button for product cards
export function QuickShareButton({
  productName,
  productImage,
  productUrl,
}: {
  productName: string
  productImage: string
  productUrl: string
}) {
  const { language } = useLanguage()

  const handleQuickShare = async () => {
    const shareData = {
      title: `${productName} - SofaCover Pro`,
      text:
        language === "th"
          ? `ดูผ้าคลุมโซฟาสวยๆ ตัวนี้สิ! ${productName}`
          : `Check out this beautiful sofa cover: ${productName}`,
      url: productUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback to Facebook share
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`
      window.open(facebookUrl, "_blank", "width=600,height=400")
    }
  }

  return (
    <Button onClick={handleQuickShare} variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-blue-600">
      <Share2 className="w-4 h-4" />
    </Button>
  )
}
