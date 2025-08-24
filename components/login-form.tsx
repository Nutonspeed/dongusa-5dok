"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Clock, Eye, EyeOff, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const router = useRouter()
  const { signIn, checkAccountStatus } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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

  const isLocked = !!lockoutUntil && Date.now() < lockoutUntil

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <div className="w-16 h-16 bg-login-gradient rounded-full flex items-center justify-center mx-auto mb-4 login-shadow">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-login-gradient">Welcome back</h1>
        <p className="text-lg text-muted-foreground">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLocked && (
          <Alert className="animate-in slide-in-from-top-2">
            <Clock className="h-4 w-4" />
            <AlertDescription>Account is temporarily locked. Time remaining: {lockoutTimeLeft}</AlertDescription>
          </Alert>
        )}

        {requiresCaptcha && !isLocked && (
          <Alert className="animate-in slide-in-from-top-2">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Multiple failed attempts detected. Additional security verification may be required.
            </AlertDescription>
          </Alert>
        )}

        {remainingAttempts !== null && remainingAttempts < 5 && !isLocked && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2">
            <AlertDescription>
              Warning: {remainingAttempts} login attempts remaining before account lockout.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLocked}
                className="pl-10 bg-input border-border focus:ring-primary focus:border-primary transition-all duration-200"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLocked}
                className="pl-10 pr-10 bg-input border-border focus:ring-primary focus:border-primary transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div></div>
          <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
            Forgot your password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading || isLocked}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium rounded-lg h-[60px] disabled:opacity-50 login-shadow transition-all duration-200 hover:login-glow"
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

        <div className="text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}
