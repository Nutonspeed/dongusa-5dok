"use client"
// NOTE: Boundary fix only. Do NOT restructure or remove existing UI.

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"
import { securityService } from "@/lib/security-client"
import { createClient } from "@/lib/supabase/client"
import { USE_SUPABASE } from "@/lib/runtime"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState<any>(null)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const checkToken = async () => {
      if (USE_SUPABASE) {
        // Check if we have the necessary URL fragments for Supabase auth
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get("access_token")
        const refreshToken = hashParams.get("refresh_token")

        if (accessToken && refreshToken) {
          setIsValidToken(true)
        } else {
          setError("Invalid or expired reset link. Please request a new password reset.")
        }
      } else {
        // Mock mode - always valid
        setIsValidToken(true)
      }
      setIsCheckingToken(false)
    }

    checkToken()
  }, [])

  useEffect(() => {
    if (password) {
      const strength = securityService.validatePasswordStrength(password)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(null)
    }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) return

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!passwordStrength?.isValid) {
      setError("Password does not meet security requirements")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      if (USE_SUPABASE) {
        const { error } = await supabase.auth.updateUser({
          password: password,
        })

        if (error) {
          setError(error.message)
          return
        }
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-burgundy-600" />
          <p className="mt-2 text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-red-600">Invalid Reset Link</CardTitle>
            <CardDescription className="text-gray-600">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700"
            >
              Request new reset link
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900">Password updated!</CardTitle>
            <CardDescription className="text-gray-600">
              Your password has been successfully updated. You will be redirected to the login page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "very_weak":
        return "text-red-600"
      case "weak":
        return "text-orange-600"
      case "fair":
        return "text-yellow-600"
      case "good":
        return "text-blue-600"
      case "strong":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case "very_weak":
        return "Very Weak"
      case "weak":
        return "Weak"
      case "fair":
        return "Fair"
      case "good":
        return "Good"
      case "strong":
        return "Strong"
      default:
        return ""
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-gray-900">Reset your password</CardTitle>
          <CardDescription className="text-gray-600">Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {passwordStrength && (
                <div className="space-y-1">
                  <div className={`text-xs font-medium ${getStrengthColor(passwordStrength.strength)}`}>
                    Password strength: {getStrengthText(passwordStrength.strength)}
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-gray-600 space-y-1">
                      {passwordStrength.feedback.map((feedback: string, index: number) => (
                        <li key={index}>• {feedback}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900 pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={
                isLoading || !password || !confirmPassword || password !== confirmPassword || !passwordStrength?.isValid
              }
              className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </Button>

            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-burgundy-600 hover:text-burgundy-700">
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
