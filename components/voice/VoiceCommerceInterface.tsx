"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mic,
  MicOff,
  Volume2,
  MessageSquare,
  ShoppingCart,
  Search,
  Navigation,
  HelpCircle,
  Zap,
  Play,
  Pause,
  AlertTriangle,
} from "lucide-react"
import { voiceCommerce, type VoiceCommand, type VoiceResponse } from "@/lib/voice-commerce-engine"

export default function VoiceCommerceInterface() {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentCommand, setCurrentCommand] = useState<VoiceCommand | null>(null)
  const [lastResponse, setLastResponse] = useState<VoiceResponse | null>(null)
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([])
  const [isSupported, setIsSupported] = useState(true)
  const [transcript, setTranscript] = useState("")
  const [confidence, setConfidence] = useState(0)

  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    initializeVoiceCommerce()
    checkBrowserSupport()
  }, [])

  const checkBrowserSupport = () => {
    const hasWebSpeech = "webkitSpeechRecognition" in window || "SpeechRecognition" in window
    const hasMediaRecorder = "MediaRecorder" in window
    const hasSpeechSynthesis = "speechSynthesis" in window

    setIsSupported(hasWebSpeech && hasMediaRecorder && hasSpeechSynthesis)
  }

  const initializeVoiceCommerce = async () => {
    try {
      const newSessionId = await voiceCommerce.startVoiceSession("user_123")
      setSessionId(newSessionId)
    } catch (error) {
  // console.error("Error initializing voice commerce:", error)
    }
  }

  const startListening = async () => {
    if (!isSupported || !sessionId) return

    try {
      setIsListening(true)
      setTranscript("")
      setConfidence(0)

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Initialize speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "th-TH"

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          const confidence = event.results[i][0].confidence

          if (event.results[i].isFinal) {
            finalTranscript += transcript
            setConfidence(confidence * 100)
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)

        if (finalTranscript) {
          processVoiceCommand(finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
  // console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.start()
    } catch (error) {
  // console.error("Error starting voice recognition:", error)
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const processVoiceCommand = async (transcript: string) => {
    if (!sessionId) return

    try {
      setIsProcessing(true)

      const response = await voiceCommerce.processVoiceCommand(sessionId, undefined, transcript)

      setLastResponse(response)

      // Execute actions
      for (const action of response.actions) {
        await executeAction(action)
      }

      // Speak response
      if (response.text) {
        await speakResponse(response.text)
      }

      // Update command history
      const session = voiceCommerce.getSession(sessionId)
      if (session && session.commands.length > 0) {
        const latestCommand = session.commands[session.commands.length - 1]
        setCurrentCommand(latestCommand)
        setCommandHistory((prev) => [...prev, latestCommand].slice(-10))
      }
    } catch (error) {
  // console.error("Error processing voice command:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const executeAction = async (action: VoiceResponse["actions"][0]) => {
    switch (action.type) {
      case "navigate":
        // Navigate to specified path
        if (action.payload.path) {
          window.location.href = action.payload.path
        }
        break

      case "add_product":
        // Add product to cart (simulate)
  // console.log("Adding product to cart:", action.payload)
        break

      case "show_results":
        // Show search results (simulate)
  // console.log("Showing search results:", action.payload)
        break

      case "display_info":
        // Display product information (simulate)
  // console.log("Displaying info:", action.payload)
        break

      default:
  // console.log("Unknown action:", action)
    }
  }

  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true)
      await voiceCommerce.textToSpeech(text)
    } catch (error) {
  // console.error("Error speaking response:", error)
    } finally {
      setIsSpeaking(false)
    }
  }

  const getIntentIcon = (intent: VoiceCommand["intent"]) => {
    const icons = {
      search: <Search className="w-4 h-4" />,
      add_to_cart: <ShoppingCart className="w-4 h-4" />,
      checkout: <ShoppingCart className="w-4 h-4" />,
      navigate: <Navigation className="w-4 h-4" />,
      inquiry: <HelpCircle className="w-4 h-4" />,
      unknown: <MessageSquare className="w-4 h-4" />,
    }
    return icons[intent]
  }

  const getIntentColor = (intent: VoiceCommand["intent"]) => {
    const colors = {
      search: "bg-blue-100 text-blue-800 border-blue-200",
      add_to_cart: "bg-green-100 text-green-800 border-green-200",
      checkout: "bg-purple-100 text-purple-800 border-purple-200",
      navigate: "bg-orange-100 text-orange-800 border-orange-200",
      inquiry: "bg-yellow-100 text-yellow-800 border-yellow-200",
      unknown: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[intent]
  }

  if (!isSupported) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>ไม่รองรับ Voice Commerce</strong> เบราว์เซอร์ของคุณไม่รองรับฟีเจอร์เสียง กรุณาใช้ Chrome, Edge หรือ Safari
          เวอร์ชันล่าสุด
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
          <Mic className="w-8 h-8" />
          Voice Commerce
        </h1>
        <p className="text-gray-600 mt-1">สั่งซื้อสินค้าด้วยเสียงอย่างง่ายดาย</p>
      </div>

      {/* Voice Control Panel */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Main Voice Button */}
            <div className="relative">
              <Button
                size="lg"
                className={`w-20 h-20 rounded-full ${
                  isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
              {isListening && (
                <div className="absolute -inset-2 border-4 border-red-300 rounded-full animate-ping"></div>
              )}
            </div>

            {/* Status */}
            <div className="text-center">
              {isListening && (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-blue-600">กำลังฟัง...</p>
                  {transcript && (
                    <div className="p-3 bg-white rounded-lg border max-w-md">
                      <p className="text-gray-800">{transcript}</p>
                      {confidence > 0 && (
                        <div className="mt-2">
                          <Progress value={confidence} className="h-1" />
                          <p className="text-xs text-gray-500 mt-1">ความมั่นใจ: {confidence.toFixed(0)}%</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-orange-600">กำลังประมวลผล...</p>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                </div>
              )}

              {isSpeaking && (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-green-600">กำลังตอบกลับ...</p>
                  <Volume2 className="w-6 h-6 text-green-500 mx-auto animate-pulse" />
                </div>
              )}

              {!isListening && !isProcessing && !isSpeaking && (
                <p className="text-gray-600">กดปุ่มไมค์เพื่อเริ่มสั่งซื้อด้วยเสียง</p>
              )}
            </div>

            {/* Quick Commands */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                "หาผ้าคลุมโซฟาสีน้ำเงิน"
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                "ใส่ตะกร้า 2 ชิ้น"
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                "ไปหน้าชำระเงิน"
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                "ราคาเท่าไหร่"
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Command & Response */}
      {(currentCommand || lastResponse) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Command */}
          {currentCommand && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  คำสั่งล่าสุด
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getIntentColor(currentCommand.intent)}>
                    {getIntentIcon(currentCommand.intent)}
                    <span className="ml-1 capitalize">{currentCommand.intent.replace("_", " ")}</span>
                  </Badge>
                  <span className="text-sm text-gray-500">{Math.round(currentCommand.confidence * 100)}% มั่นใจ</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800">"{currentCommand.transcript}"</p>
                </div>
                {Object.keys(currentCommand.entities).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">ข้อมูลที่ตรวจพบ:</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(currentCommand.entities).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {typeof value === "object" ? JSON.stringify(value) : value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Response */}
          {lastResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  การตอบสนอง AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">{lastResponse.text}</p>
                </div>
                {lastResponse.actions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">การดำเนินการ:</h4>
                    <div className="space-y-1">
                      {lastResponse.actions.map((action, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {action.type.replace("_", " ")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {lastResponse.follow_up_questions && lastResponse.follow_up_questions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">คำถามติดตาม:</h4>
                    <div className="space-y-1">
                      {lastResponse.follow_up_questions.map((question, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          • {question}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">ความมั่นใจ: {Math.round(lastResponse.confidence * 100)}%</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => speakResponse(lastResponse.text)}
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="ml-1">ฟังอีกครั้ง</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Command History */}
      {commandHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ประวัติคำสั่ง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {commandHistory.slice(-5).map((command, index) => (
                <div key={command.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge className={getIntentColor(command.intent)} variant="outline">
                      {getIntentIcon(command.intent)}
                    </Badge>
                    <span className="text-sm">"{command.transcript}"</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(command.timestamp).toLocaleTimeString("th-TH")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
