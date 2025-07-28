"use client"

import Link from "next/link"
import { Shield, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "../contexts/AuthContext"

export default function UnauthorizedPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">ไม่มีสิทธิ์เข้าถึง</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากคุณคิดว่านี่เป็นข้อผิดพลาด</p>

          {user && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>ผู้ใช้งานปัจจุบัน:</strong> {user.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>บทบาท:</strong> {user.role}
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                กลับหน้าหลัก
              </Link>
            </Button>

            {user && (
              <Button variant="outline" onClick={logout} className="w-full bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                ออกจากระบบ
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
