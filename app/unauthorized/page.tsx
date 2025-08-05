"use client"

import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, Home, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">ไม่มีสิทธิ์เข้าถึง</CardTitle>
            <CardDescription className="text-base">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">เหตุผลที่เป็นไปได้:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• คุณยังไม่ได้เข้าสู่ระบบ</li>
                <li>• บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้านี้</li>
                <li>• เซสชันของคุณหมดอายุแล้ว</li>
                <li>• บัญชีของคุณถูกระงับชั่วคราว</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">ติดต่อสนับสนุน:</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>02-123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>support@sofacover.co.th</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => router.back()} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                ย้อนกลับ
              </Button>

              <Button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
              >
                <Home className="w-4 h-4 mr-2" />
                กลับหน้าหลัก
              </Button>

              <Button onClick={() => router.push("/login")} variant="secondary" className="w-full">
                เข้าสู่ระบบ
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อทีมสนับสนุน</p>
        </div>
      </div>
    </div>
  )
}
