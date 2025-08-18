"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Users, Clock, Send, Search, Facebook } from "lucide-react"

interface ChatMessage {
  id: string
  pageId: string
  pageName: string
  senderId: string
  senderName: string
  message: string
  timestamp: Date
  isRead: boolean
  type: "incoming" | "outgoing"
}

interface FacebookPage {
  id: string
  name: string
  unreadCount: number
  lastMessage?: string
  lastMessageTime?: Date
}

export default function UnifiedFacebookChatDashboard() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pages, setPages] = useState<FacebookPage[]>([
    {
      id: "page1",
      name: "ELF SofaCover Pro",
      unreadCount: 3,
      lastMessage: "สอบถามราคาผ้าคลุมโซฟาครับ",
      lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: "page2",
      name: "ELF Home Decor",
      unreadCount: 1,
      lastMessage: "ขอดูสีอื่นได้ไหมคะ",
      lastMessageTime: new Date(Date.now() - 15 * 60 * 1000),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const mockMessages: ChatMessage[] = [
    {
      id: "1",
      pageId: "page1",
      pageName: "ELF SofaCover Pro",
      senderId: "user1",
      senderName: "คุณสมชาย",
      message: "สวัสดีครับ สอบถามราคาผ้าคลุมโซฟา 3 ที่นั่งครับ",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true,
      type: "incoming",
    },
    {
      id: "2",
      pageId: "page1",
      pageName: "ELF SofaCover Pro",
      senderId: "admin",
      senderName: "Admin",
      message: "สวัสดีครับ ผ้าคลุมโซฟา 3 ที่นั่งราคา 2,890 บาทครับ",
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      isRead: true,
      type: "outgoing",
    },
  ]

  useEffect(() => {
    setMessages(mockMessages)
  }, [])

  const filteredMessages = messages.filter((msg) => (selectedPage ? msg.pageId === selectedPage : true))

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedPage) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      pageId: selectedPage,
      pageName: pages.find((p) => p.id === selectedPage)?.name || "",
      senderId: "admin",
      senderName: "Admin",
      message: newMessage,
      timestamp: new Date(),
      isRead: true,
      type: "outgoing",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unified Facebook Chat</h1>
          <p className="text-gray-600 mt-1">ระบบแชท Facebook แบบรวมศูนย์</p>
        </div>
        <div className="flex items-center space-x-2">
          <Facebook className="w-6 h-6 text-blue-600" />
          <Badge variant="secondary">{pages.length} เพจ</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 h-[600px]">
        {/* Pages List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Facebook Pages</span>
              <Badge variant="outline">{pages.reduce((sum, p) => sum + p.unreadCount, 0)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 border-b transition-colors ${
                    selectedPage === page.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{page.name}</span>
                    {page.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {page.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {page.lastMessage && <p className="text-xs text-gray-500 truncate">{page.lastMessage}</p>}
                  {page.lastMessageTime && (
                    <p className="text-xs text-gray-400 mt-1">
                      {page.lastMessageTime.toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>{selectedPage ? pages.find((p) => p.id === selectedPage)?.name : "เลือกเพจเพื่อเริ่มแชท"}</span>
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="ค้นหาข้อความ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-[400px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedPage ? (
                filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "outgoing" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === "outgoing" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${message.type === "outgoing" ? "text-blue-100" : "text-gray-500"}`}
                        >
                          {message.timestamp.toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>ยังไม่มีข้อความในแชทนี้</p>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>เลือกเพจจากรายการด้านซ้ายเพื่อเริ่มแชท</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            {selectedPage && (
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="พิมพ์ข้อความ..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[40px] max-h-[120px]"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="self-end">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ข้อความรวม</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">1,234</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ลูกค้าที่แชท</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">89</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">เวลาตอบกลับเฉลี่ย</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">2.5 นาที</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
