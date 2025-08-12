"use client"

import { usePricingConfig } from "./ConfigProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, ShoppingCart, Receipt, Gift } from "lucide-react"

export function DynamicPricing() {
  const pricing = usePricingConfig()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ค่าจัดส่ง</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pricing.deliveryFee)}</div>
          <p className="text-xs text-muted-foreground">ค่าจัดส่งมาตรฐาน</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ยอดขั้นต่ำ</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pricing.minimumOrder)}</div>
          <p className="text-xs text-muted-foreground">สำหรับการสั่งซื้อ</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">อัตราภาษี</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(pricing.taxRate * 100).toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">ภาษีมูลค่าเพิ่ม</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ส่วนลด</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(pricing.discountRate * 100).toFixed(0)}%</div>
          <p className="text-xs text-muted-foreground">เมื่อซื้อครบ {formatCurrency(pricing.discountThreshold)}</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Example usage in a product page
export function ProductPricing({ basePrice }: { basePrice: number }) {
  const pricing = usePricingConfig()

  const finalPrice = basePrice + basePrice * pricing.taxRate
  const hasDiscount = basePrice >= pricing.discountThreshold
  const discountedPrice = hasDiscount ? finalPrice * (1 - pricing.discountRate) : finalPrice

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{formatCurrency(discountedPrice)}</span>
        {hasDiscount && (
          <Badge variant="secondary" className="text-green-600">
            ประหยัด {formatCurrency(finalPrice - discountedPrice)}
          </Badge>
        )}
      </div>

      {hasDiscount && <div className="text-sm text-muted-foreground line-through">{formatCurrency(finalPrice)}</div>}

      <div className="text-xs text-muted-foreground">รวมภาษี {(pricing.taxRate * 100).toFixed(1)}%</div>

      {basePrice < pricing.minimumOrder && (
        <div className="text-sm text-amber-600">ซื้อเพิ่ม {formatCurrency(pricing.minimumOrder - basePrice)} เพื่อสั่งซื้อได้</div>
      )}
    </div>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount)
}
