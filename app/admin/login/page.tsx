"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DEV_CONFIG } from "@/lib/runtime"

export const dynamic = "force-dynamic"

export default function AdminLogin() {
  const router = useRouter()

  // If demo mode is disabled, immediately redirect to real auth
  useEffect(() => {
    if (!DEV_CONFIG.demoMode) {
      router.replace("/auth/login")
    }
  }, [router])

  if (!DEV_CONFIG.demoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-gray-500">กำลังนำทางไปยังหน้าล็อกอินจริง...</p>
      </div>
    )
  }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Demo authentication - in real app, this would be API call
    if (formData.email === "admin@sofacover.com" && formData.password === "admin123") {
      localStorage.setItem("admin_token", "demo_token")
      router.push("/admin")
    } else {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
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
    <div className="min-h-screen bg-gradient-to-br from-accent to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md burgundy-shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-burgundy-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">เข้าสู่ระบบผู้ดูแล (Demo)</CardTitle>
          <p className="text-gray-600">หน้านี้แสดงเฉพาะโหมดเดโม่เท่านั้น</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="admin@sofacover.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full bg-burgundy-gradient hover:opacity-90 text-white"
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ (Demo)"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-accent border border-primary/20 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">ข้อมูลสำหรับทดสอบ (Demo):</h4>
            <p className="text-sm text-primary/80">อีเมล: admin@sofacover.com</p>
            <p className="text-sm text-primary/80">รหัสผ่าน: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
