'use client'

import { useState, useTransition, useEffect } from 'react'
import { useCart } from '@/app/contexts/CartContext'
import { submitOrder } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast' // Corrected import path

export default function CheckoutPage() {
  const { cartItems, getTotalPrice, clearCart } = useCart()
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (cartItems.length === 0 && !isPending) {
      // Redirect or show message if cart is empty and not in submission
      toast({
        title: 'ตะกร้าสินค้าว่างเปล่า',
        description: 'โปรดเพิ่มสินค้าลงในตะกร้าก่อนดำเนินการชำระเงิน',
        variant: 'destructive',
      })
      // Optionally redirect to products page or cart page
      // router.push('/cart');
    }
  }, [cartItems, isPending])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormState((prev) => ({ ...prev, [id]: value }))
    setErrors((prev) => ({ ...prev, [id]: '' })) // Clear error on change
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formState.firstName) newErrors.firstName = 'กรุณากรอกชื่อ'
    if (!formState.lastName) newErrors.lastName = 'กรุณากรอกนามสกุล'
    if (!formState.email) {
      newErrors.email = 'กรุณากรอกอีเมล'
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    }
    if (!formState.phone) newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์'
    if (!formState.address) newErrors.address = 'กรุณากรอกที่อยู่'
    if (!formState.city) newErrors.city = 'กรุณากรอกอำเภอ/เขต'
    if (!formState.province) newErrors.province = 'กรุณากรอกจังหวัด'
    if (!formState.zipCode) newErrors.zipCode = 'กรุณากรอกรหัสไปรษณีย์'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) {
      toast({
        title: 'ข้อมูลไม่ถูกต้อง',
        description: 'โปรดตรวจสอบข้อมูลที่กรอกให้ครบถ้วนและถูกต้อง',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const orderData = {
        ...formState,
        cartItems: cartItems,
        totalPrice: getTotalPrice(),
      }
      const result = await submitOrder(orderData)
      if (result && !result.success) {
        toast({
          title: 'เกิดข้อผิดพลาดในการสั่งซื้อ',
          description: result.message || 'ไม่สามารถดำเนินการสั่งซื้อได้ โปรดลองอีกครั้ง',
          variant: 'destructive',
        })
      } else {
        // If successful, the server action will handle the redirect
        clearCart(); // Clear cart after successful submission and before redirect
      }
    })
  }

  const totalPrice = getTotalPrice()

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">ดำเนินการชำระเงิน</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1 order-last lg:order-first">
          <Card>
            <CardHeader>
              <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {cartItems.length === 0 ? (
                <p className="text-gray-500">ไม่มีสินค้าในตะกร้า</p>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-center gap-4 mb-4">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                        <Image
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.color && `สี: ${item.color}`}
                          {item.color && item.size && ' | '}
                          {item.size && `ขนาด: ${item.size}`}
                        </p>
                        <p className="text-sm text-gray-700">
                          {item.quantity} x {item.price.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                        </p>
                      </div>
                      <span className="font-semibold">
                        {(item.price * item.quantity).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                      </span>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>รวมทั้งหมด:</span>
                    <span>{totalPrice.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Shipping Information Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลการจัดส่ง</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">ชื่อ</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formState.firstName}
                      onChange={handleChange}
                      required
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">นามสกุล</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formState.lastName}
                      onChange={handleChange}
                      required
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formState.phone}
                    onChange={handleChange}
                    required
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <Label htmlFor="address">ที่อยู่</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formState.address}
                    onChange={handleChange}
                    required
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">อำเภอ/เขต</Label>
                    <Input
                      id="city"
                      type="text"
                      value={formState.city}
                      onChange={handleChange}
                      required
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="province">จังหวัด</Label>
                    <Input
                      id="province"
                      type="text"
                      value={formState.province}
                      onChange={handleChange}
                      required
                      className={errors.province ? 'border-red-500' : ''}
                    />
                    {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
                  </div>
                  <div>
                    <Label htmlFor="zipCode">รหัสไปรษณีย์</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      value={formState.zipCode}
                      onChange={handleChange}
                      required
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full py-3 text-lg" disabled={isPending || cartItems.length === 0}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    'ยืนยันคำสั่งซื้อ'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
