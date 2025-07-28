"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, UserIcon, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register, isLoading } = useAuth()
  const { language } = useLanguage()

  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const redirectTo = searchParams.get("redirect") || "/"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!loginForm.email || !loginForm.password) {
      setError(language === "en" ? "Please fill in all fields" : "กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    const result = await login(loginForm.email, loginForm.password)

    if (result.success) {
      setSuccess(language === "en" ? "Login successful! Redirecting..." : "เข้าสู่ระบบสำเร็จ! กำลังเปลี่ยนเส้นทาง...")
      setTimeout(() => {
        router.push(redirectTo)
      }, 1000)
    } else {
      setError(result.error || (language === "en" ? "Login failed" : "เข้าสู่ระบบไม่สำเร็จ"))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setError(language === "en" ? "Please fill in all fields" : "กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError(language === "en" ? "Passwords do not match" : "รหัสผ่านไม่ตรงกัน")
      return
    }

    if (registerForm.password.length < 6) {
      setError(language === "en" ? "Password must be at least 6 characters" : "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      return
    }

    const result = await register(registerForm.email, registerForm.password, registerForm.name)

    if (result.success) {
      setSuccess(language === "en" ? "Registration successful! Redirecting..." : "สมัครสมาชิกสำเร็จ! กำลังเปลี่ยนเส้นทาง...")
      setTimeout(() => {
        router.push(redirectTo)
      }, 1000)
    } else {
      setError(result.error || (language === "en" ? "Registration failed" : "สมัครสมาชิกไม่สำเร็จ"))
    }
  }

  const content = {
    en: {
      title: "Welcome Back",
      subtitle: "Sign in to your account to continue shopping",
      loginTab: "Sign In",
      registerTab: "Sign Up",
      email: "Email",
      password: "Password",
      name: "Full Name",
      confirmPassword: "Confirm Password",
      loginButton: "Sign In",
      registerButton: "Create Account",
      backToHome: "Back to Home",
      registerTitle: "Create Account",
      registerSubtitle: "Join us to start your sofa cover journey",
      emailPlaceholder: "your@email.com",
      passwordPlaceholder: "••••••••",
      namePlaceholder: "Your full name",
    },
    th: {
      title: "ยินดีต้อนรับกลับ",
      subtitle: "เข้าสู่ระบบเพื่อเลือกซื้อผ้าคลุมโซฟา",
      loginTab: "เข้าสู่ระบบ",
      registerTab: "สมัครสมาชิก",
      email: "อีเมล",
      password: "รหัสผ่าน",
      name: "ชื่อ-นามสกุล",
      confirmPassword: "ยืนยันรหัสผ่าน",
      loginButton: "เข้าสู่ระบบ",
      registerButton: "สร้างบัญชี",
      backToHome: "กลับหน้าแรก",
      registerTitle: "สร้างบัญชีใหม่",
      registerSubtitle: "เข้าร่วมกับเราเพื่อเริ่มต้นการเลือกผ้าคลุมโซฟา",
      emailPlaceholder: "อีเมลของคุณ",
      passwordPlaceholder: "••••••••",
      namePlaceholder: "ชื่อ-นามสกุลของคุณ",
    },
  }

  const t = content[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToHome}
            </Button>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">{t.loginTab}</TabsTrigger>
                <TabsTrigger value="register">{t.registerTab}</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <div className="text-center mb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">{t.title}</CardTitle>
                  <p className="text-gray-600 mt-2">{t.subtitle}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600">{success}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={t.emailPlaceholder}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={t.passwordPlaceholder}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {language === "en" ? "Signing in..." : "กำลังเข้าสู่ระบบ..."}
                      </div>
                    ) : (
                      t.loginButton
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <div className="text-center mb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">{t.registerTitle}</CardTitle>
                  <p className="text-gray-600 mt-2">{t.registerSubtitle}</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600">{success}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.name}</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={t.namePlaceholder}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={t.emailPlaceholder}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={t.passwordPlaceholder}
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.confirmPassword}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder={t.passwordPlaceholder}
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {language === "en" ? "Creating account..." : "กำลังสร้างบัญชี..."}
                      </div>
                    ) : (
                      t.registerButton
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Demo Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                {language === "en" ? "Demo Credentials:" : "ข้อมูลสำหรับทดสอบ:"}
              </h4>
              <p className="text-sm text-blue-700">
                {language === "en" ? "Email: user@sofacover.com" : "อีเมล: user@sofacover.com"}
              </p>
              <p className="text-sm text-blue-700">{language === "en" ? "Password: user123" : "รหัสผ่าน: user123"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
