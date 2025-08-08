'use client'

import { useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useEffect } from 'react'
import { useCart } from '@/app/contexts/CartContext'

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const total = searchParams.get('total')
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart after successful order confirmation
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      <Card className="w-full max-w-2xl text-center p-8 shadow-lg">
        <CardHeader className="flex flex-col items-center gap-4">
          <CheckCircle className="h-20 w-20 text-green-500" />
          <CardTitle className="text-4xl font-bold text-green-600">
            ขอบคุณสำหรับคำสั่งซื้อ!
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-6">
          <p className="text-lg text-gray-700 mb-4">
            คำสั่งซื้อของคุณได้รับการยืนยันแล้ว และจะดำเนินการจัดส่งในไม่ช้า
          </p>
          {orderId && (
            <p className="text-xl font-semibold text-gray-800 mb-2">
              หมายเลขคำสั่งซื้อ: <span className="text-primary">{orderId}</span>
            </p>
          )}
          {total && (
            <p className="text-xl font-semibold text-gray-800 mb-4">
              ยอดรวม: <span className="text-primary">{parseFloat(total).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
            </p>
          )}
          <p className="text-md text-gray-600 mb-6">
            คุณจะได้รับอีเมลยืนยันพร้อมรายละเอียดคำสั่งซื้อเพิ่มเติม
          </p>
          <Separator className="my-6" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                กลับสู่หน้าหลัก
              </Button>
            </Link>
            <Link href="/profile/orders"> {/* Assuming a user orders page exists */}
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                ดูสถานะคำสั่งซื้อ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
