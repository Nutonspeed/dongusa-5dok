"use client"

import { useState } from "react"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, Mail, UserIcon, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import Footer from "../components/Footer"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { signIn, isAuthenticated, user, isAdmin } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = new URLSearchParams(window.location.search).get("redirect")
      if (isAdmin && !redirect) {
        router.push("/admin")
      } else {
        router.push(redirect || "/")
      }
    }
  }, [isAuthenticated, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await signIn(formData.email, formData.password)

    if (result.success) {
      const redirect = new URLSearchParams(window.location.search).get("redirect")
      if (redirect) {
        router.push(redirect)
      } else {
        // Check if user is admin after successful login
        const userData = localStorage.getItem("user_data")
        if (userData) {
          const parsedUser = JSON.parse(userData)
          if (parsedUser.role === "admin") {
            router.push("/admin")
          } else {
            router.push("/")
          }
        } else {
          router.push("/")
        }
      }
    } else {
      setError(result.error || (language === "th" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : "Invalid email or password"))
    }

    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {language === "th" ? "เข้าสู่ระบบ" : "Login"}
            </CardTitle>
            <p className="text-gray-600">{language === "th" ? "เข้าสู่ระบบเพื่อเริ่มช้อปปิ้ง" : "Login to start shopping"}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "th" ? "อีเมล" : "Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="user@sofacover.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "th" ? "รหัสผ่าน" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
              >
                {isLoading
                  ? language === "th"
                    ? "กำลังเข้าสู่ระบบ..."
                    : "Logging in..."
                  : language === "th"
                    ? "เข้าสู่ระบบ"
                    : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {language === "th" ? "ยังไม่มีบัญชี?" : "Don't have an account?"}{" "}
                <Link href="/register" className="text-pink-600 hover:underline font-medium">
                  {language === "th" ? "สมัครสมาชิก" : "Register"}
                </Link>
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                <h4 className="font-semibold text-pink-700 mb-2 flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  {language === "th" ? "บัญชีผู้ใช้ทั่วไป:" : "Regular User Account:"}
                </h4>
                <p className="text-sm text-pink-600">{language === "th" ? "อีเมล:" : "Email:"} user@sofacover.com</p>
                <p className="text-sm text-pink-600">{language === "th" ? "รหัสผ่าน:" : "Password:"} user123</p>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <h4 className="font-semibold text-rose-700 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  {language === "th" ? "บัญชีแอดมิน:" : "Admin Account:"}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Admin
                  </Badge>
                </h4>
                <p className="text-sm text-rose-600">{language === "th" ? "อีเมล:" : "Email:"} admin@sofacover.com</p>
                <p className="text-sm text-rose-600">{language === "th" ? "รหัสผ่าน:" : "Password:"} admin123</p>
                <p className="text-xs text-rose-500 mt-1">
                  {language === "th"
                    ? "เข้าถึงแดชบอร์ดแอดมินและฟีเจอร์การจัดการ"
                    : "Access admin dashboard and management features"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
