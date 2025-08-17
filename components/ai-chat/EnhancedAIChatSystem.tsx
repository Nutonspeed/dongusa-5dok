"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageSquare,
  Bot,
  Brain,
  BarChart3,
  Users,
  Zap,
  Target,
  TrendingUp,
  Heart,
  Frown,
  Meh,
  Smile,
  Send,
  Mic,
  ImageIcon,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Sparkles,
} from "lucide-react"
import { advancedAI, type CustomerInsight, type PersonalizedRecommendation } from "@/lib/advanced-ai-features"

interface AIConversation {
  id: string
  customer_id: string
  customer_name: string
  channel: "facebook" | "messenger" | "live_chat" | "whatsapp"
  status: "active" | "resolved" | "escalated" | "waiting"
  priority: "urgent" | "high" | "normal" | "low"
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  ai_handled: boolean
  human_takeover: boolean
  created_at: string
  last_message_at: string
  message_count: number
  resolution_time?: number
  satisfaction_score?: number
  tags: string[]
}

interface AIMessage {
  id: string
  conversation_id: string
  sender: "user" | "ai" | "human"
  content: string
  intent: string
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  ai_suggestions: string[]
  created_at: string
  read: boolean
  feedback?: "helpful" | "not_helpful"
}

interface AIAnalytics {
  total_conversations: number
  ai_resolution_rate: number
  average_response_time: number
  customer_satisfaction: number
  sentiment_breakdown: {
    positive: number
    negative: number
    neutral: number
  }
  top_intents: Array<{ intent: string; count: number }>
  performance_trends: Array<{ date: string; conversations: number; satisfaction: number }>
}

export function EnhancedAIChatSystem() {
  const [activeTab, setActiveTab] = useState("conversations")
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<AIConversation | null>(null)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null)
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([])
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [messageInput, setMessageInput] = useState("")
  const [aiEnabled, setAiEnabled] = useState(true)
  const [autoResponse, setAutoResponse] = useState(true)
  const [sentimentFilter, setSentimentFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadAIChatData()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const loadAIChatData = async () => {
    try {
      setLoading(true)

      // Simulate loading AI chat data
      const mockConversations: AIConversation[] = [
        {
          id: "conv_001",
          customer_id: "cust_001",
          customer_name: "สมชาย ใจดี",
          channel: "facebook",
          status: "active",
          priority: "high",
          sentiment: "positive",
          confidence: 0.85,
          ai_handled: true,
          human_takeover: false,
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          message_count: 8,
          tags: ["product_inquiry", "fabric_selection"],
        },
        {
          id: "conv_002",
          customer_id: "cust_002",
          customer_name: "สมหญิง รักสวย",
          channel: "messenger",
          status: "escalated",
          priority: "urgent",
          sentiment: "negative",
          confidence: 0.92,
          ai_handled: false,
          human_takeover: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          last_message_at: new Date(Date.now() - 1800000).toISOString(),
          message_count: 15,
          resolution_time: 45,
          satisfaction_score: 2,
          tags: ["complaint", "delivery_issue"],
        },
      ]

      const mockAnalytics: AIAnalytics = {
        total_conversations: 1247,
        ai_resolution_rate: 78.5,
        average_response_time: 2.3,
        customer_satisfaction: 4.2,
        sentiment_breakdown: {
          positive: 65,
          negative: 15,
          neutral: 20,
        },
        top_intents: [
          { intent: "product_inquiry", count: 342 },
          { intent: "order_status", count: 198 },
          { intent: "fabric_selection", count: 156 },
          { intent: "pricing", count: 134 },
          { intent: "complaint", count: 89 },
        ],
        performance_trends: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          conversations: 150 + Math.floor(Math.random() * 100),
          satisfaction: 3.8 + Math.random() * 1.2,
        })),
      }

      setConversations(mockConversations)
      setAnalytics(mockAnalytics)

      // Load customer insights
      const insights = await Promise.all(
        mockConversations.map((conv) => advancedAI.generateCustomerInsights(conv.customer_id)),
      )
      setCustomerInsights(insights)

      // Load recommendations
      const recs = await advancedAI.generatePersonalizedRecommendations("cust_001")
      setRecommendations(recs)

      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0])
      }
    } catch (error) {
      console.error("Failed to load AI chat data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadConversationMessages = async (conversationId: string) => {
    try {
      // Simulate loading messages with AI analysis
      const mockMessages: AIMessage[] = [
        {
          id: "msg_001",
          conversation_id: conversationId,
          sender: "user",
          content: "สวัสดีครับ ผมสนใจผ้าคลุมโซฟาลายดอกไม้ครับ",
          intent: "product_inquiry",
          sentiment: "positive",
          confidence: 0.88,
          ai_suggestions: ["แนะนำสินค้า", "ขอข้อมูลเพิ่มเติม", "ส่งแคตตาล็อก"],
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read: true,
        },
        {
          id: "msg_002",
          conversation_id: conversationId,
          sender: "ai",
          content: "สวัสดีครับ! ยินดีที่ได้รู้จักค่ะ ผ้าคลุมโซฟาลายดอกไม้ของเรามีหลายแบบให้เลือกเลยค่ะ คุณชอบโทนสีแบบไหนครับ?",
          intent: "greeting_response",
          sentiment: "positive",
          confidence: 0.95,
          ai_suggestions: [],
          created_at: new Date(Date.now() - 3580000).toISOString(),
          read: true,
          feedback: "helpful",
        },
      ]

      setMessages(mockMessages)
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    try {
      // Analyze user message with AI
      const nlpAnalysis = await advancedAI.analyzeText(messageInput)

      const userMessage: AIMessage = {
        id: `msg_${Date.now()}`,
        conversation_id: selectedConversation.id,
        sender: "user",
        content: messageInput,
        intent: nlpAnalysis.intent,
        sentiment: nlpAnalysis.sentiment,
        confidence: nlpAnalysis.confidence,
        ai_suggestions: [],
        created_at: new Date().toISOString(),
        read: true,
      }

      setMessages((prev) => [...prev, userMessage])
      setMessageInput("")

      // Generate AI response if enabled
      if (aiEnabled && autoResponse) {
        setTimeout(
          async () => {
            const aiResponse = await advancedAI.generateChatbotResponse(messageInput, {
              customer_id: selectedConversation.customer_id,
              conversation_history: messages.map((m) => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.content,
              })),
            })

            const aiMessage: AIMessage = {
              id: `msg_${Date.now() + 1}`,
              conversation_id: selectedConversation.id,
              sender: "ai",
              content: aiResponse.response,
              intent: "response",
              sentiment: "neutral",
              confidence: aiResponse.confidence,
              ai_suggestions: aiResponse.suggested_actions,
              created_at: new Date().toISOString(),
              read: false,
            }

            setMessages((prev) => [...prev, aiMessage])

            // Check if human takeover is needed
            if (aiResponse.escalate_to_human) {
              setSelectedConversation((prev) =>
                prev
                  ? {
                      ...prev,
                      status: "escalated",
                      human_takeover: true,
                    }
                  : null,
              )
            }
          },
          1000 + Math.random() * 2000,
        )
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <Smile className="w-4 h-4 text-green-600" />
      case "negative":
        return <Frown className="w-4 h-4 text-red-600" />
      default:
        return <Meh className="w-4 h-4 text-gray-600" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "ai-sentiment-positive"
      case "negative":
        return "ai-sentiment-negative"
      default:
        return "ai-sentiment-neutral"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "escalated":
        return "bg-red-100 text-red-800"
      case "resolved":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">กำลังโหลดระบบ AI Chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="ai-chat-gradient p-3 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Enhanced AI Chat System</h1>
                <p className="text-sm text-muted-foreground">ระบบแชท AI ขั้นสูงที่เหนือกว่า 365 Page</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="ai-analytics-card">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Active: {analytics?.ai_resolution_rate}%
                </Badge>
                <Badge variant="outline" className="ai-analytics-card">
                  <Clock className="w-3 h-3 mr-1" />
                  Avg Response: {analytics?.average_response_time}s
                </Badge>
                <Badge variant="outline" className="ai-analytics-card">
                  <Star className="w-3 h-3 mr-1" />
                  Satisfaction: {analytics?.customer_satisfaction}/5
                </Badge>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                ตั้งค่า AI
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              การสนทนา
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customer Insights
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              AI Recommendations
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Automation
            </TabsTrigger>
          </TabsList>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
              {/* Conversations List */}
              <Card className="ai-analytics-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">การสนทนาทั้งหมด</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="ค้นหาการสนทนา..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[650px]">
                    <div className="space-y-2 p-4">
                      {conversations.map((conversation) => (
                        <Card
                          key={conversation.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedConversation?.id === conversation.id ? "ring-2 ring-primary bg-primary/5" : ""
                          }`}
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10">
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
                                  {getSentimentIcon(conversation.sentiment)}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getStatusColor(conversation.status)} variant="secondary">
                                    {conversation.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {conversation.channel}
                                  </Badge>
                                  {conversation.ai_handled && (
                                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                                      <Bot className="w-3 h-3 mr-1" />
                                      AI
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {conversation.message_count} ข้อความ
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(conversation.last_message_at).toLocaleTimeString("th-TH", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Interface */}
              <Card className="lg:col-span-2 ai-analytics-card">
                {selectedConversation ? (
                  <>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
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
                              <Badge className={getStatusColor(selectedConversation.status)} variant="secondary">
                                {selectedConversation.status}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {getSentimentIcon(selectedConversation.sentiment)}
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(selectedConversation.confidence * 100)}% confidence
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            AI Suggestions
                          </Button>
                          <Button variant="outline" size="sm">
                            <Users className="w-4 h-4 mr-2" />
                            Escalate
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col h-[650px]">
                      {/* Messages */}
                      <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div className="max-w-[80%]">
                                <div
                                  className={`px-4 py-3 ${
                                    message.sender === "user"
                                      ? "ai-chat-bubble-user"
                                      : message.sender === "ai"
                                        ? "ai-chat-bubble-ai border"
                                        : "bg-muted text-muted-foreground rounded-lg"
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  {message.sender === "ai" && message.ai_suggestions.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {message.ai_suggestions.map((suggestion, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {suggestion}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between mt-1 px-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(message.created_at).toLocaleTimeString("th-TH", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    {message.sender === "ai" && (
                                      <div className="flex items-center gap-1">
                                        {getSentimentIcon(message.sentiment)}
                                        <span className="text-xs text-muted-foreground">{message.intent}</span>
                                      </div>
                                    )}
                                  </div>
                                  {message.sender === "ai" && (
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <ThumbsUp className="w-3 h-3" />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <ThumbsDown className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div ref={messagesEndRef} />
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Textarea
                              placeholder="พิมพ์ข้อความ..."
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              rows={2}
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
                              <Mic className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                            <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-[700px]">
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                      <p>เลือกการสนทนาเพื่อเริ่มต้น</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="ai-analytics-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">การสนทนาทั้งหมด</p>
                      <p className="text-2xl font-bold">{analytics?.total_conversations.toLocaleString()}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="ai-analytics-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">AI Resolution Rate</p>
                      <p className="text-2xl font-bold">{analytics?.ai_resolution_rate}%</p>
                    </div>
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <Progress value={analytics?.ai_resolution_rate} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="ai-analytics-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">เวลาตอบสนองเฉลี่ย</p>
                      <p className="text-2xl font-bold">{analytics?.average_response_time}s</p>
                    </div>
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="ai-analytics-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ความพึงพอใจ</p>
                      <p className="text-2xl font-bold">{analytics?.customer_satisfaction}/5</p>
                    </div>
                    <Star className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(analytics?.customer_satisfaction || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sentiment Analysis */}
            <Card className="ai-analytics-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  การวิเคราะห์อารมณ์ลูกค้า
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="ai-sentiment-positive rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                      <Smile className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{analytics?.sentiment_breakdown.positive}%</p>
                    <p className="text-sm text-muted-foreground">Positive</p>
                  </div>
                  <div className="text-center">
                    <div className="ai-sentiment-neutral rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                      <Meh className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-600">{analytics?.sentiment_breakdown.neutral}%</p>
                    <p className="text-sm text-muted-foreground">Neutral</p>
                  </div>
                  <div className="text-center">
                    <div className="ai-sentiment-negative rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                      <Frown className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">{analytics?.sentiment_breakdown.negative}%</p>
                    <p className="text-sm text-muted-foreground">Negative</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Intents */}
            <Card className="ai-analytics-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Intent ที่พบบ่อยที่สุด
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.top_intents.map((intent, index) => (
                    <div key={intent.intent} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{index + 1}</span>
                        </div>
                        <span className="font-medium capitalize">{intent.intent.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{intent.count}</span>
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${(intent.count / (analytics?.top_intents[0]?.count || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customer Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {customerInsights.map((insight) => (
                <Card key={insight.customer_id} className="ai-feature-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Customer: {insight.customer_id}</span>
                      <Badge
                        className={`${
                          insight.segment === "high_value"
                            ? "bg-green-100 text-green-800"
                            : insight.segment === "at_risk"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {insight.segment}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Lifetime Value</p>
                        <p className="text-lg font-semibold">฿{insight.lifetime_value.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Engagement Score</p>
                        <p className="text-lg font-semibold">{insight.engagement_score}/100</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Churn Risk</p>
                      <Progress value={insight.churn_probability * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(insight.churn_probability * 100)}% probability
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Next Purchase Prediction</p>
                      <p className="text-sm">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {insight.next_purchase_prediction.days} วัน (
                        {Math.round(insight.next_purchase_prediction.confidence * 100)}% confidence)
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Preferred Categories</p>
                      <div className="flex flex-wrap gap-1">
                        {insight.behavioral_patterns.preferred_categories.map((category) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Card key={rec.product_id} className="ai-feature-card ai-recommendation-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-sm">{rec.product_name}</span>
                      <Badge variant="outline">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {Math.round(rec.confidence_score * 100)}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">฿{rec.price.toLocaleString()}</span>
                      {rec.discount && <Badge className="bg-red-100 text-red-800">-{rec.discount}%</Badge>}
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Personalization Factors</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Purchase History</span>
                          <span>{Math.round(rec.personalization_factors.purchase_history * 100)}%</span>
                        </div>
                        <Progress value={rec.personalization_factors.purchase_history * 100} className="h-1" />

                        <div className="flex justify-between text-xs">
                          <span>Browsing Behavior</span>
                          <span>{Math.round(rec.personalization_factors.browsing_behavior * 100)}%</span>
                        </div>
                        <Progress value={rec.personalization_factors.browsing_behavior * 100} className="h-1" />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Reasoning</p>
                      <ul className="text-xs space-y-1">
                        {rec.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full" size="sm">
                      <Send className="w-4 h-4 mr-2" />
                      ส่งแนะนำให้ลูกค้า
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="ai-feature-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Auto-Response Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Enable AI Responses</span>
                    <Button
                      variant={aiEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAiEnabled(!aiEnabled)}
                    >
                      {aiEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Auto-Response</span>
                    <Button
                      variant={autoResponse ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAutoResponse(!autoResponse)}
                    >
                      {autoResponse ? "On" : "Off"}
                    </Button>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Response Confidence Threshold</p>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">75% - High confidence responses only</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="ai-feature-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Escalation Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Negative sentiment &gt; 80%</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">AI confidence &lt; 60%</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">Complaint keywords detected</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">VIP customer priority</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="ai-feature-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="ai-chat-gradient rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold">2.3s</p>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-xs text-green-600">↓ 15% from last week</p>
                  </div>
                  <div className="text-center">
                    <div className="ai-chat-gradient rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold">78.5%</p>
                    <p className="text-sm text-muted-foreground">AI Resolution Rate</p>
                    <p className="text-xs text-green-600">↑ 8% from last week</p>
                  </div>
                  <div className="text-center">
                    <div className="ai-chat-gradient rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-2xl font-bold">4.2/5</p>
                    <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                    <p className="text-xs text-green-600">↑ 0.3 from last week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
