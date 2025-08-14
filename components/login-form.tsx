"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const router = useRouter()
  const { signIn, checkAccountStatus } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [requiresCaptcha, setRequiresCaptcha] = useState(false)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const checkStatus = async () => {
      if (email && email.includes("@")) {
        try {
          const status = await checkAccountStatus(email)
          setRequiresCaptcha(status.requiresCaptcha)
          setLockoutUntil(status.lockoutUntil || null)
          setRemainingAttempts(status.attempts > 0 ? 5 - status.attempts : null)
        } catch (error) {
          // Ignore errors in status check
        }
      }
    }

    const timeoutId = setTimeout(checkStatus, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [email, checkAccountStatus])

  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutTimeLeft("")
      return
    }

    const updateCountdown = () => {
      const now = Date.now()
      const timeLeft = lockoutUntil - now

      if (timeLeft <= 0) {
        setLockoutUntil(null)
        setLockoutTimeLeft("")
        return
      }

      const minutes = Math.floor(timeLeft / 60000)
      const seconds = Math.floor((timeLeft % 60000) / 1000)
      setLockoutTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [lockoutUntil])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    setError("")

    try {
      const result = await signIn(email, password)

      if (result.success) {
        toast({ description: "Successfully signed in!" })
        router.push("/")
      } else {
        setError(result.error || "Login failed")
        setRequiresCaptcha(result.requiresCaptcha || false)
        setLockoutUntil(result.lockoutUntil || null)
        setRemainingAttempts(result.remainingAttempts || null)

        if (result.error) {
          toast({ variant: "destructive", description: result.error })
        }
      }
    } catch (err) {
      const message = "An error occurred during sign in"
      setError(message)
      toast({ variant: "destructive", description: message })
    } finally {
      setIsLoading(false)
    }
  }

  const isLocked = lockoutUntil && Date.now() < lockoutUntil

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-burgundy-900">Welcome back</h1>
        <p className="text-lg text-gray-600">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLocked && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>Account is temporarily locked. Time remaining: {lockoutTimeLeft}</AlertDescription>
          </Alert>
        )}

        {requiresCaptcha && !isLocked && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Multiple failed attempts detected. Additional security verification may be required.
            </AlertDescription>
          </Alert>
        )}

        {remainingAttempts !== null && remainingAttempts < 5 && !isLocked && (
          <Alert variant="destructive">
            <AlertDescription>
              Warning: {remainingAttempts} login attempts remaining before account lockout.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLocked}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLocked}
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div></div>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-burgundy-600 hover:text-burgundy-700 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading || isLocked}
          className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white py-6 text-lg font-medium rounded-lg h-[60px] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : isLocked ? (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Account Locked ({lockoutTimeLeft})
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="text-burgundy-600 hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}
