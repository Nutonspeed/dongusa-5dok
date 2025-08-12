"use client"

import { useConfigValue } from "@/components/ConfigProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Percent } from "lucide-react"

interface DynamicPricingProps {
  basePrice?: number
  category?: string
  isNewCustomer?: boolean
}

export function DynamicPricing({
  basePrice = 1500,
  category = "standard",
  isNewCustomer = false,
}: DynamicPricingProps) {
  const [basePriceSofaCover] = useConfigValue("basePriceSofaCover", 1500)
  const [materialCostPremium] = useConfigValue("materialCostPremium", 300)
  const [discountPercentage] = useConfigValue("discountPercentage", 10)
  const [businessName] = useConfigValue("businessName", "Dongusa")

  const calculatePrice = () => {
    let finalPrice = basePriceSofaCover || basePrice

    // Add premium material cost if applicable
    if (category === "premium") {
      finalPrice += materialCostPremium || 300
    }

    // Apply new customer discount
    if (isNewCustomer && discountPercentage) {
      const discount = (finalPrice * discountPercentage) / 100
      finalPrice -= discount
    }

    return {
      originalPrice: basePriceSofaCover || basePrice,
      premiumCost: category === "premium" ? materialCostPremium || 300 : 0,
      discount: isNewCustomer ? ((basePriceSofaCover || basePrice) * (discountPercentage || 0)) / 100 : 0,
      finalPrice,
    }
  }

  const pricing = calculatePrice()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Dynamic Pricing - {businessName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Base Price:</span>
          <span className="font-medium">฿{pricing.originalPrice.toLocaleString()}</span>
        </div>

        {pricing.premiumCost > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Premium Material:</span>
            <span className="font-medium text-blue-600">+฿{pricing.premiumCost.toLocaleString()}</span>
          </div>
        )}

        {pricing.discount > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">New Customer Discount:</span>
              <Badge variant="secondary" className="flex items-center">
                <Percent className="w-3 h-3 mr-1" />
                {discountPercentage}%
              </Badge>
            </div>
            <span className="font-medium text-green-600">-฿{pricing.discount.toLocaleString()}</span>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Final Price:</span>
            <span className="text-2xl font-bold text-primary">฿{pricing.finalPrice.toLocaleString()}</span>
          </div>
        </div>

        {isNewCustomer && (
          <Badge variant="outline" className="w-full justify-center">
            New Customer Special Price Applied!
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
