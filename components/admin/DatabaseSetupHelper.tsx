"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function DatabaseSetupHelper() {
  const [isSetupRunning, setIsSetupRunning] = useState(false)
  const [setupStatus, setSetupStatus] = useState<"idle" | "success" | "error">("idle")
  const [setupMessage, setSetupMessage] = useState("")

  const runGuestUserSetup = async () => {
    setIsSetupRunning(true)
    setSetupStatus("idle")
    setSetupMessage("")

    try {
      const response = await fetch("/api/admin/setup-guest-system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (response.ok) {
        setSetupStatus("success")
        setSetupMessage(result.message || "Guest User System setup completed successfully!")
      } else {
        setSetupStatus("error")
        setSetupMessage(result.error || "Failed to setup Guest User System")
      }
    } catch (error) {
      setSetupStatus("error")
      setSetupMessage("Network error occurred while setting up the system")
    } finally {
      setIsSetupRunning(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Database Setup Helper
        </CardTitle>
        <CardDescription>
          Set up the Guest User System tables and configurations in your Supabase database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {setupStatus === "success" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{setupMessage}</AlertDescription>
          </Alert>
        )}

        {setupStatus === "error" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{setupMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">What this will create:</h4>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>
              • <code>guest_users</code> table for managing unregistered users
            </li>
            <li>
              • <code>guest_orders</code> table for guest user orders
            </li>
            <li>
              • <code>guest_cart_items</code> table for guest shopping carts
            </li>
            <li>• Proper indexes and Row Level Security policies</li>
          </ul>
        </div>

        <Button onClick={runGuestUserSetup} disabled={isSetupRunning} className="w-full">
          {isSetupRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up Guest User System...
            </>
          ) : (
            "Setup Guest User System"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
