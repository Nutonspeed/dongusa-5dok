"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageSquare,
  Mail,
  Phone,
  Facebook,
  Send,
  Paperclip,
  Search,
  MoreVertical,
  Star,
  Archive,
} from "lucide-react"
import {
  communicationHub,
  type Conversation,
  type Message,
  type Agent,
  type Template,
} from "@/lib/unified-communication-hub"

export function UnifiedInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Form states
  const [messageInput, setMessageInput] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [channelFilter, setChannelFilter] = useState<string>("all")

  useEffect(() => {
    loadInboxData()
  }, [statusFilter, channelFilter, searchQuery])

  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const loadInboxData = async () => {
    try {
      setLoading(true)

      const filters: any = {}
      if (statusFilter !== "all") {
        filters.status = [statusFilter]
      }
      if (channelFilter !== "all") {
        filters.channel = [channelFilter]
      }

      const [conversationsData, agentsData, templatesData] = await Promise.all([
        communicationHub.getConversations(filters),
        communicationHub.getAvailableAgents(),
        communicationHub.getTemplates(),
      ])

      setConversations(conversationsData.conversations)
      setAgents(agentsData.agents)
      setTemplates(templatesData.templates)

      // Auto-select first conversation if none selected
      if (!selectedConversation && conversationsData.conversations.length > 0) {
        setSelectedConversation(conversationsData.conversations[0])
      }
    } catch (error) {
      console.error("Failed to load inbox data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const messagesData = await communicationHub.getConversationMessages(conversationId)
      setMessages(messagesData.messages)
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    setSending(true)
    try {
      const result = await communicationHub.sendMessage(
        selectedConversation.id,
        messageInput,
        selectedConversation.channel,
        {
          sender_id: "current_agent", // This would be the current logged-in agent
          template_id: selectedTemplate || undefined,
        },
      )

      if (result.success) {
        setMessageInput("")
        setSelectedTemplate("")
        // Reload messages
        await loadConversationMessages(selectedConversation.id)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleAssignConversation = async (agentId: string) => {
    if (!selectedConversation) return

    try {
      const result = await communicationHub.assignConversation(selectedConversation.id, agentId, "current_user")

      if (result.success) {
        // Reload conversations
        await loadInboxData()
      }
    } catch (error) {
      console.error("Failed to assign conversation:", error)
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="w-4 h-4" />
      case "sms":
        return <Phone className="w-4 h-4" />
      case "facebook":
        return <Facebook className="w-4 h-4" />
      case "live_chat":
        return <MessageSquare className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "email":
        return "bg-blue-100 text-blue-800"
      case "sms":
        return "bg-green-100 text-green-800"
      case "facebook":
        return "bg-blue-100 text-blue-800"
      case "live_chat":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "normal":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} นาทีที่แล้ว`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ชั่วโมงที่แล้ว`
    } else {
      return date.toLocaleDateString("th-TH")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด Unified Inbox...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <MessageSquare className="w-6 h-6" />
            Unified Inbox
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="ค้นหาการสนทนา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="open">เปิด</SelectItem>
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="resolved">แก้ไขแล้ว</SelectItem>
                <SelectItem value="closed">ปิด</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกช่องทาง</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="live_chat">Live Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r bg-gray-50">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-100 ${
                    selectedConversation?.id === conversation.id ? "ring-2 ring-primary bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} />
                          <AvatarFallback>
                            {conversation.customer_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{conversation.customer_name}</h4>
                            <Badge className={`${getChannelColor(conversation.channel)} text-xs`}>
                              {getChannelIcon(conversation.channel)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{conversation.subject || "ไม่มีหัวข้อ"}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getPriorityColor(conversation.priority)} variant="outline">
                              {conversation.priority}
                            </Badge>
                            <Badge
                              variant={conversation.status === "open" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {conversation.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatTime(conversation.last_message_at)}</p>
                        {conversation.message_count > 0 && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {conversation.message_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="border-b bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} />
                      <AvatarFallback>
                        {selectedConversation.customer_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.customer_name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getChannelColor(selectedConversation.channel)}>
                          {getChannelIcon(selectedConversation.channel)}
                          <span className="ml-1 capitalize">{selectedConversation.channel}</span>
                        </Badge>
                        <Badge className={getPriorityColor(selectedConversation.priority)} variant="outline">
                          {selectedConversation.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={handleAssignConversation}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="มอบหมายให้เจ้าหน้าที่" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} ({agent.current_conversations}/{agent.max_conversations})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === "current_agent" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === "current_agent"
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">{formatTime(message.created_at)}</span>
                          {message.status === "read" && message.sender_id === "current_agent" && (
                            <span className="text-xs opacity-70">อ่านแล้ว</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t bg-white p-4">
                <div className="space-y-3">
                  {/* Template Selector */}
                  <div className="flex items-center gap-2">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="เลือกเทมเพลต (ไม่บังคับ)" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTemplate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const template = templates.find((t) => t.id === selectedTemplate)
                          if (template) {
                            setMessageInput(template.content)
                          }
                        }}
                      >
                        ใช้เทมเพลต
                      </Button>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="พิมพ์ข้อความ..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button onClick={handleSendMessage} disabled={sending || !messageInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                <p>เลือกการสนทนาเพื่อเริ่มต้น</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
