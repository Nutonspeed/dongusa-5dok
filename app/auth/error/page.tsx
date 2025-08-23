"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "../../contexts/LanguageContext"
import Header from "../../components/Header"
import Footer from "../../components/Footer"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const { language } = useLanguage()

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "callback_failed":
        return language === "th" ? "การยืนยันอีเมลล้มเหลว" : "Email confirmation failed"
      case "profile_access":
        return language === "th" ? "ไม่สามารถเข้าถึงข้อมูลโปรไฟล์ได้" : "Unable to access profile data"
      case "role_check_failed":
        return language === "th" ? "ไม่สามารถตรวจสอบสิทธิ์ได้" : "Unable to verify permissions"
      case "middleware_error":
        return language === "th" ? "เกิดข้อผิดพลาดในระบบ" : "System error occurred"
      default:
        return language === "th" ? "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" : "An authentication error occurred"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl">{language === "th" ? "เกิดข้อผิดพลาด" : "Authentication Error"}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">{getErrorMessage(error)}</p>
              <div className="pt-4 space-y-2">
                <Link href="/auth/login">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
                    {language === "th" ? "ลองเข้าสู่ระบบอีกครั้ง" : "Try Login Again"}
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full bg-transparent">
                    {language === "th" ? "กลับหน้าหลัก" : "Back to Home"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
