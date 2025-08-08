'use client'

import { useCart } from '@/app/contexts/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Trash2 } from 'lucide-react'

export default function CartPage() {
  const { cartItems, updateItemQuantity, removeItem, getTotalPrice, clearCart } = useCart()

  const handleQuantityChange = (id: string, color: string | undefined, size: string | undefined, newQuantity: number) => {
    updateItemQuantity(id, newQuantity, color, size)
  }

  const handleRemoveItem = (id: string, color: string | undefined, size: string | undefined) => {
    removeItem(id, color, size)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">ตะกร้าสินค้าของคุณ</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">ไม่มีสินค้าในตะกร้า</p>
          <Link href="/products">
            <Button size="lg">เลือกซื้อสินค้า</Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-center gap-4 py-4 border-b last:border-b-0">
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex-1 grid gap-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.color && `สี: ${item.color}`}
                        {item.color && item.size && ' | '}
                        {item.size && `ขนาด: ${item.size}`}
                      </p>
                      <p className="font-medium text-primary">
                        {(item.price * item.quantity).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.id,
                            item.color,
                            item.size,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-20 text-center"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id, item.color, item.size)}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={clearCart}>
                    ล้างตะกร้า
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>
                <div className="flex justify-between items-center text-lg font-medium mb-2">
                  <span>ราคารวม:</span>
                  <span>{getTotalPrice().toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  ค่าจัดส่งและภาษีจะคำนวณในขั้นตอนถัดไป
                </p>
                <Separator className="my-4" />
                <Link href="/checkout">
                  <Button size="lg" className="w-full">
                    ดำเนินการชำระเงิน
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
