"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, MessageCircle, Phone, Mail, Clock, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SupportTicket {
  id: string
  subject: string
  status: "open" | "in_progress" | "resolved"
  priority: "low" | "medium" | "high" | "urgent"
  created_at: string
}

export default function LoginSupportWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "TICKET-001",
      subject: "Cannot access admin dashboard",
      status: "open",
      priority: "high",
      created_at: "2024-01-15T10:30:00Z",
    },
  ])
  const { toast } = useToast()

  const createSupportTicket = () => {
    toast({
      title: "Support Ticket Created",
      description: "Your support request has been submitted. We'll respond within 2 hours.",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      open: { variant: "destructive" as const, icon: AlertTriangle },
      in_progress: { variant: "secondary" as const, icon: Clock },
      resolved: { variant: "default" as const, icon: CheckCircle },
    }

    const config = variants[status as keyof typeof variants]
    const Icon = config.icon

    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      urgent: "text-red-600",
    }
    return colors[priority as keyof typeof colors]
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 shadow-lg"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      ) : (
        <Card className="w-80 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Login Support</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Having trouble logging in? Get immediate help below.</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={createSupportTicket}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat Support
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset Password
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Contact Information</h4>
              <div className="text-sm space-y-1">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  <span>+66 2-xxx-xxxx</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <span>support@sofacover.com</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span>24/7 Support Available</span>
                </div>
              </div>
            </div>

            {tickets.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Your Support Tickets</h4>
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{ticket.id}</span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div className="text-gray-600 mb-1">{ticket.subject}</div>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={createSupportTicket}>
                Create Support Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
