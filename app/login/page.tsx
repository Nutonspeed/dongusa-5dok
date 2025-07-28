"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, LogIn, UserPlus, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../contexts/AuthContext"
import { AuthService } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register, isAuthenticated, isLoading } = useAuth()

  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Login form
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  // Register form
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Demo credentials
  const demoCredentials = [
    {
      role: "Admin",
      email: "admin@sofacover.com",
      password: "admin123",
      icon: Shield,
      color: "bg-red-100 text-red-800",
    },
    {
      role: "Manager",
      email: "manager@sofacover.com",
      password: "manager123",
      icon: Shield,
      color: "bg-blue-100 text-blue-800",
    },
    {
      role: "Staff",
      email: "staff@sofacover.com",
      password: "staff123",
      icon: Shield,
      color: "bg-green-100 text-green-800",
    },
    {
      role: "Customer",
      email: "customer@sofacover.com",
      password: "customer123",
      icon: User,
      color: "bg-purple-100 text-purple-800",
    },
  ]

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirect = searchParams.get("redirect") || "/"
      router.push(redirect)
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await login(loginForm.email, loginForm.password)
      if (response.success && response.user) {
        const redirectPath = AuthService.getRedirectPath(response.user)
        router.push(searchParams.get("redirect") || redirectPath)
      } else {
        setError(response.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน")
      return
    }

    if (registerForm.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        role: "customer",
      })

      if (response.success) {
        router.push("/")
      } else {
        setError(response.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก")
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการสมัครสมาชิก")
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillDemoCredentials = (email: string, password: string) => {
    setLoginForm({ email, password })
    setActiveTab("login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ระบบจัดการผ้าคลุมโซฟา</h1>
          <p className="text-gray-600">เข้าสู่ระบบเพื่อใช้งานแพลตฟอร์มของเรา</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Login/Register Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center">{activeTab === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>เข้าสู่ระบบ</span>
                  </TabsTrigger>
                  <TabsTrigger value="register" className="flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>สมัครสมาชิก</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">อีเมล</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder="กรอกอีเมลของคุณ"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">รหัสผ่าน</Label>
                      <div className="relative mt-1">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          placeholder="กรอกรหัสผ่านของคุณ"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                    >
                      {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-name">ชื่อ-นามสกุล</Label>
                      <Input
                        id="register-name"
                        type="text"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        placeholder="กรอกชื่อ-นามสกุลของคุณ"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-email">อีเมล</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        placeholder="กรอกอีเมลของคุณ"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">รหัสผ่าน</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-confirm-password">ยืนยันรหัสผ่าน</Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                        required
                        className="mt-1"
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                    >
                      {isSubmitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>บัญชีทดสอบ</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-4">คลิกเพื่อใช้บัญชีทดสอบสำหรับแต่ละบทบาท</p>

              {demoCredentials.map((cred) => {
                const IconComponent = cred.icon
                return (
                  <div
                    key={cred.role}
                    onClick={() => fillDemoCredentials(cred.email, cred.password)}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                        <div>
                          <Badge className={cred.color}>{cred.role}</Badge>
                          <p className="text-sm text-gray-600 mt-1">{cred.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">รหัสผ่าน:</p>
                        <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{cred.password}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">คำแนะนำการใช้งาน:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>Admin:</strong> เข้าถึงได้ทุกฟีเจอร์
                  </li>
                  <li>
                    • <strong>Manager:</strong> จัดการคำสั่งซื้อและรายงาน
                  </li>
                  <li>
                    • <strong>Staff:</strong> จัดการสินค้าและใบแจ้งหนี้
                  </li>
                  <li>
                    • <strong>Customer:</strong> ดูสินค้าและติดตามคำสั่งซื้อ
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
