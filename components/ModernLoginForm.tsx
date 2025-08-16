"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  Clock,
  Chrome,
  Facebook,
  Apple,
  Fingerprint,
  Smartphone,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function ModernLoginForm() {
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
  const [securityLevel, setSecurityLevel] = useState<"low" | "medium" | "high">("low")
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [connectionSecure, setConnectionSecure] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined" && "PublicKeyCredential" in window) {
      setBiometricAvailable(true)
    }

    setConnectionSecure(window.location.protocol === "https:")
  }, [])

  useEffect(() => {
    if (!email || !password) {
      setSecurityLevel("low")
      return
    }

    let level: "low" | "medium" | "high" = "low"

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isLongEnough = password.length >= 8

    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough].filter(Boolean).length

    if (strengthScore >= 4) level = "high"
    else if (strengthScore >= 2) level = "medium"

    setSecurityLevel(level)
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    setError("")

    try {
      const result = await signIn(email, password)

      if (result.success) {
        toast({
          description: "Successfully signed in to ELF SofaCover Pro!",
          duration: 3000,
        })
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

  const handleSocialLogin = (provider: string) => {
    toast({
      description: `${provider} login integration coming soon to ELF SofaCover Pro!`,
      duration: 4000,
    })
  }

  const handleBiometricLogin = async () => {
    if (!biometricAvailable) {
      toast({
        variant: "destructive",
        description: "Biometric authentication not available on this device",
      })
      return
    }

    toast({
      description: "Biometric authentication coming soon!",
      duration: 3000,
    })
  }

  const isLocked = lockoutUntil && Date.now() < lockoutUntil

  const SecurityIndicator = () => (
    <div className="flex items-center space-x-2 text-xs">
      {connectionSecure ? (
        <div className="flex items-center text-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          <span>Secure Connection</span>
        </div>
      ) : (
        <div className="flex items-center text-amber-600">
          <AlertTriangle className="w-3 h-3 mr-1" />
          <span>Unsecured Connection</span>
        </div>
      )}
      <div className="flex items-center">
        <Shield
          className={`w-3 h-3 mr-1 ${
            securityLevel === "high" ? "text-green-600" : securityLevel === "medium" ? "text-amber-600" : "text-red-600"
          }`}
        />
        <span
          className={`capitalize ${
            securityLevel === "high" ? "text-green-600" : securityLevel === "medium" ? "text-amber-600" : "text-red-600"
          }`}
        >
          {securityLevel} Security
        </span>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
          <div className="text-2xl font-bold text-white">ELF</div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent mb-2">
          Welcome Back
        </h1>
        <p className="text-muted-foreground">Sign in to your ELF SofaCover Pro account</p>
        <div className="mt-3 flex justify-center">
          <SecurityIndicator />
        </div>
      </div>

      {/* Main Login Card */}
      <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-md">
        <CardHeader className="pb-4">
          <div className="space-y-4">
            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("Google")}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 transform hover:scale-105"
              >
                <Chrome className="w-4 h-4 text-blue-600" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("Facebook")}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 transform hover:scale-105"
              >
                <Facebook className="w-4 h-4 text-blue-700" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("Apple")}
                className="hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform hover:scale-105"
              >
                <Apple className="w-4 h-4 text-gray-800" />
              </Button>
            </div>

            {biometricAvailable && (
              <Button
                variant="outline"
                onClick={handleBiometricLogin}
                className="w-full hover:bg-green-50 hover:border-green-300 transition-all duration-300 bg-transparent"
              >
                <Fingerprint className="w-4 h-4 mr-2 text-green-600" />
                Use Biometric Authentication
              </Button>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Alerts */}
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLocked && (
            <Alert className="animate-in slide-in-from-top-2 duration-300 border-amber-200 bg-amber-50">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Account temporarily locked. Time remaining: {lockoutTimeLeft}
              </AlertDescription>
            </Alert>
          )}

          {requiresCaptcha && !isLocked && (
            <Alert className="animate-in slide-in-from-top-2 duration-300 border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Additional security verification may be required.
              </AlertDescription>
            </Alert>
          )}

          {remainingAttempts !== null && remainingAttempts < 5 && !isLocked && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
              <AlertDescription>
                Warning: {remainingAttempts} attempts remaining before account lockout.
              </AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
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
                  className="pl-10 bg-input border-border focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
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
                  className="pl-10 pr-10 bg-input border-border focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className={`h-1 flex-1 rounded ${
                      securityLevel === "high"
                        ? "bg-green-500"
                        : securityLevel === "medium"
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      securityLevel === "high"
                        ? "text-green-600"
                        : securityLevel === "medium"
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {securityLevel === "high" ? "Strong" : securityLevel === "medium" ? "Medium" : "Weak"}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-border rounded"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-cyan-600 hover:text-cyan-700 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-medium py-6 text-base shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
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
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign In Securely
                </>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors duration-200"
              >
                Create account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
          <h4 className="font-semibold text-foreground mb-2 flex items-center">
            <Shield className="w-4 h-4 mr-2 text-cyan-600" />
            Demo Credentials - ELF SofaCover Pro
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Customer:</span>{" "}
              <span className="text-foreground font-mono bg-white px-2 py-1 rounded">
                user@elfsofacover.com / user123
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Admin:</span>{" "}
              <span className="text-foreground font-mono bg-white px-2 py-1 rounded">
                admin@elfsofacover.com / admin123
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Shield className="w-3 h-3 mr-1 text-green-600" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center">
            <Smartphone className="w-3 h-3 mr-1 text-blue-600" />
            <span>Mobile Ready</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-3 h-3 mr-1 text-cyan-600" />
            <span>GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  )
}
