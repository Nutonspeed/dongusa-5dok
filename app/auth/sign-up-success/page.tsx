"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "../../contexts/LanguageContext"
import Header from "../../components/Header"
import Footer from "../../components/Footer"

export default function SignUpSuccessPage() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">{language === "th" ? "ตรวจสอบอีเมลของคุณ" : "Check your email"}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <Mail className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600">
                {language === "th"
                  ? "เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว กรุณาคลิกลิงก์เพื่อเปิดใช้งานบัญชี"
                  : "We've sent a confirmation link to your email. Please click the link to activate your account."}
              </p>
              <div className="pt-4">
                <Link href="/auth/login">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
                    {language === "th" ? "กลับไปหน้าเข้าสู่ระบบ" : "Back to Login"}
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
