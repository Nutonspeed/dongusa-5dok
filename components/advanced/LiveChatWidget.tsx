"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, Minimize2, Maximize2, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { useAuth } from "@/app/contexts/AuthContext"

interface ChatMessage {
  id: string
  sender: "user" | "agent" | "system"
  message: string
  timestamp: string
  read: boolean
}

interface LiveChatWidgetProps {
  position?: "bottom-right" | "bottom-left"
  theme?: "light" | "dark"
  autoOpen?: boolean
}

export function LiveChatWidget({ position = "bottom-right", theme = "light", autoOpen = false }: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [agentInfo, setAgentInfo] = useState({
    name: "Sarah",
    avatar: "/placeholder.svg?height=40&width=40&text=S",
    status: "online",
  })

  const { language } = useLanguage()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  }

  useEffect(() => {
    // Initialize chat with welcome message
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      sender: "system",
      message:
        language === "th"
          ? "สวัสดีค่ะ! ยินดีต้อนรับสู่ SofaCover Pro เราพร้อมช่วยเหลือคุณ 24/7"
          : "Hello! Welcome to SofaCover Pro. We're here to help you 24/7",
      timestamp: new Date().toISOString(),
      read: false,
    }

    setMessages([welcomeMessage])

    // Simulate connection
    setTimeout(() => {
      setIsConnected(true)
      const agentMessage: ChatMessage = {
        id: "agent-intro",
        sender: "agent",
        message:
          language === "th"
            ? "สวัสดีค่ะ! ฉันชื่อ Sarah จากทีมบริการลูกค้า มีอะไรให้ช่วยเหลือไหมคะ?"
            : "Hi! I'm Sarah from customer service. How can I help you today?",
        timestamp: new Date().toISOString(),
        read: false,
      }
      setMessages((prev) => [...prev, agentMessage])
      setUnreadCount(1)
    }, 2000)
  }, [language])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      message: newMessage,
      timestamp: new Date().toISOString(),
      read: true,
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")
    setIsTyping(true)

    // Simulate agent response
    setTimeout(
      () => {
        setIsTyping(false)
        const agentResponse = generateAgentResponse(newMessage)
        const agentMessage: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: "agent",
          message: agentResponse,
          timestamp: new Date().toISOString(),
          read: false,
        }
        setMessages((prev) => [...prev, agentMessage])

        if (isMinimized || !isOpen) {
          setUnreadCount((prev) => prev + 1)
        }
      },
      1000 + Math.random() * 2000,
    )
  }

  const generateAgentResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("price") || lowerMessage.includes("ราคา")) {
      return language === "th"
        ? "ราคาของเราเริ่มต้นที่ 890 บาท ขึ้นอยู่กับขนาดและผ้าที่เลือก คุณสามารถส่งรูปโซฟาให้เราเพื่อประเมินราคาที่แม่นยำได้ค่ะ"
        : "Our prices start from 890 THB depending on size and fabric choice. You can send us a photo of your sofa for an accurate quote."
    }

    if (lowerMessage.includes("delivery") || lowerMessage.includes("จัดส่ง")) {
      return language === "th"
        ? "เราจัดส่งทั่วประเทศไทย ใช้เวลา 3-5 วันทำการ และฟรีค่าจัดส่งสำหรับออเดอร์เกิน 1,000 บาทค่ะ"
        : "We deliver nationwide in Thailand within 3-5 business days. Free shipping for orders over 1,000 THB."
    }

    if (lowerMessage.includes("fabric") || lowerMessage.includes("ผ้า")) {
      return language === "th"
        ? "เรามีผ้าให้เลือกมากมาย ทั้งผ้าฝ้าย ผ้าลินิน และผ้าสังเคราะห์ คุณสามารถดูแกลเลอรี่ผ้าของเราได้ที่หน้า Fabric Gallery ค่ะ"
        : "We have a wide selection of fabrics including cotton, linen, and synthetic materials. You can browse our Fabric Gallery page."
    }

    if (lowerMessage.includes("custom") || lowerMessage.includes("สั่งทำ")) {
      return language === "th"
        ? "เราทำผ้าคลุมโซฟาตามสั่งทุกขนาด เพียงส่งรูปและขนาดโซฟามาให้เรา เราจะช่วยออกแบบให้เหมาะสมที่สุดค่ะ"
        : "We make custom sofa covers for any size. Just send us photos and measurements of your sofa, and we'll design the perfect fit."
    }

    // Default responses
    const defaultResponses =
      language === "th"
        ? [
            "ขอบคุณสำหรับคำถามค่ะ ให้ฉันช่วยหาข้อมูลให้นะคะ",
            "เข้าใจค่ะ คุณสามารถโทรหาเราที่ 02-xxx-xxxx หรือส่งข้อความทาง Facebook ได้เลยค่ะ",
            "ฉันจะช่วยคุณเรื่องนี้ค่ะ คุณต้องการข้อมูลเพิ่มเติมอะไรไหมคะ?",
          ]
        : [
            "Thank you for your question. Let me help you with that.",
            "I understand. You can call us at 02-xxx-xxxx or message us on Facebook.",
            "I'll help you with this. Do you need any additional information?",
          ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleOpenChat = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setUnreadCount(0)

    // Mark messages as read
    setMessages((prev) => prev.map((msg) => ({ ...msg, read: true })))
  }

  const quickActions = [
    {
      text: language === "th" ? "ขอใบเสนอราคา" : "Get Quote",
      action: () => setNewMessage(language === "th" ? "ขอใบเสนอราคาค่ะ" : "I'd like to get a quote"),
    },
    {
      text: language === "th" ? "ดูแกลเลอรี่ผ้า" : "View Fabrics",
      action: () => window.open("/fabric-gallery", "_blank"),
    },
    {
      text: language === "th" ? "ติดตามออเดอร์" : "Track Order",
      action: () => setNewMessage(language === "th" ? "ต้องการติดตามออเดอร์ค่ะ" : "I'd like to track my order"),
    },
  ]

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <div className="relative">
          <Button
            onClick={handleOpenChat}
            className="rounded-full w-16 h-16 shadow-lg bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="w-7 h-7" />
          </Button>
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center p-0 text-xs bg-red-500">
              {unreadCount}
            </Badge>
          )}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Card
        className={`w-80 h-96 shadow-xl ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white"} ${isMinimized ? "h-14" : ""}`}
      >
        <CardHeader className="pb-2 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={agentInfo.avatar || "/placeholder.svg"}
                  alt={agentInfo.name}
                  className="w-8 h-8 rounded-full"
                />
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    isConnected ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
              </div>
              <div>
                <CardTitle className="text-sm">{agentInfo.name}</CardTitle>
                <p className="text-xs text-gray-500">
                  {isConnected
                    ? language === "th"
                      ? "ออนไลน์"
                      : "Online"
                    : language === "th"
                      ? "กำลังเชื่อมต่อ..."
                      : "Connecting..."}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="p-1 h-8 w-8">
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="p-1 h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.sender === "user"
                        ? "bg-green-600 text-white"
                        : message.sender === "system"
                          ? "bg-blue-100 text-blue-800 text-center"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {message.message}
                    <div className={`text-xs mt-1 ${message.sender === "user" ? "text-green-100" : "text-gray-500"}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t">
                <p className="text-xs text-gray-500 mb-2">{language === "th" ? "คำถามที่พบบ่อย:" : "Quick actions:"}</p>
                <div className="flex flex-wrap gap-1">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="text-xs h-7 bg-transparent"
                    >
                      {action.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={language === "th" ? "พิมพ์ข้อความ..." : "Type a message..."}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Contact Options */}
              <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-gray-500">
                <button className="flex items-center space-x-1 hover:text-green-600">
                  <Phone className="w-3 h-3" />
                  <span>02-xxx-xxxx</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-600">
                  <Mail className="w-3 h-3" />
                  <span>support@sofacover.com</span>
                </button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
