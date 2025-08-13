"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Star, Gift, Trophy, Crown, Zap, ArrowRight, Calendar, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/app/contexts/LanguageContext"
import { useAuth } from "@/app/contexts/AuthContext"

interface LoyaltyTier {
  id: string
  name: string
  nameEn: string
  minPoints: number
  maxPoints: number
  benefits: string[]
  benefitsEn: string[]
  color: string
  icon: React.ReactNode
}

interface LoyaltyTransaction {
  id: string
  type: "earned" | "redeemed"
  points: number
  description: string
  date: string
  orderId?: string
}

interface Reward {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  pointsCost: number
  category: "discount" | "freebie" | "exclusive"
  image: string
  available: boolean
}

export function LoyaltyProgram() {
  const [userPoints, setUserPoints] = useState(1250)
  const [currentTier, setCurrentTier] = useState<LoyaltyTier | null>(null)
  const [nextTier, setNextTier] = useState<LoyaltyTier | null>(null)
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)

  const { language } = useLanguage()
  const { user } = useAuth()

  const loyaltyTiers: LoyaltyTier[] = [
    {
      id: "bronze",
      name: "สมาชิกทองแดง",
      nameEn: "Bronze Member",
      minPoints: 0,
      maxPoints: 499,
      benefits: ["ส่วนลด 5% สำหรับออเดอร์แรก", "แจ้งข่าวสารพิเศษ"],
      benefitsEn: ["5% discount on first order", "Special newsletter"],
      color: "bg-amber-600",
      icon: <Star className="w-5 h-5" />,
    },
    {
      id: "silver",
      name: "สมาชิกเงิน",
      nameEn: "Silver Member",
      minPoints: 500,
      maxPoints: 1499,
      benefits: ["ส่วนลด 10% ทุกออเดอร์", "ฟรีค่าจัดส่งเมื่อซื้อครบ 800 บาท", "เข้าถึงสินค้าใหม่ก่อนใคร"],
      benefitsEn: ["10% discount on all orders", "Free shipping over 800 THB", "Early access to new products"],
      color: "bg-gray-400",
      icon: <Gift className="w-5 h-5" />,
    },
    {
      id: "gold",
      name: "สมาชิกทอง",
      nameEn: "Gold Member",
      minPoints: 1500,
      maxPoints: 2999,
      benefits: ["ส่วนลด 15% ทุกออเดอร์", "ฟรีค่าจัดส่งทุกออเดอร์", "บริการปรึกษาส่วนตัว", "ของขวัญวันเกิด"],
      benefitsEn: [
        "15% discount on all orders",
        "Free shipping on all orders",
        "Personal consultation",
        "Birthday gift",
      ],
      color: "bg-yellow-500",
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: "platinum",
      name: "สมาชิกแพลทินัม",
      nameEn: "Platinum Member",
      minPoints: 3000,
      maxPoints: 9999,
      benefits: ["ส่วนลด 20% ทุกออเดอร์", "ฟรีค่าจัดส่งและติดตั้ง", "บริการออกแบบเฉพาะ", "เข้าถึงคอลเลกชันพิเศษ"],
      benefitsEn: [
        "20% discount on all orders",
        "Free shipping & installation",
        "Custom design service",
        "Exclusive collections",
      ],
      color: "bg-purple-600",
      icon: <Crown className="w-5 h-5" />,
    },
  ]

  const availableRewards: Reward[] = [
    {
      id: "discount-100",
      name: "คูปองส่วนลด 100 บาท",
      nameEn: "100 THB Discount Coupon",
      description: "ใช้ได้กับออเดอร์ขั้นต่ำ 1,000 บาท",
      descriptionEn: "Valid for orders over 1,000 THB",
      pointsCost: 200,
      category: "discount",
      image: "/placeholder.svg?height=100&width=100&text=100฿",
      available: true,
    },
    {
      id: "free-pillow",
      name: "หมอนอิงฟรี",
      nameEn: "Free Throw Pillow",
      description: "หมอนอิงผ้าเดียวกับผ้าคลุมโซฟา",
      descriptionEn: "Matching throw pillow with sofa cover",
      pointsCost: 500,
      category: "freebie",
      image: "/placeholder.svg?height=100&width=100&text=Pillow",
      available: true,
    },
    {
      id: "premium-fabric",
      name: "อัพเกรดผ้าพรีเมียมฟรี",
      nameEn: "Free Premium Fabric Upgrade",
      description: "อัพเกรดเป็นผ้าพรีเมียมโดยไม่เสียค่าใช้จ่ายเพิ่ม",
      descriptionEn: "Upgrade to premium fabric at no extra cost",
      pointsCost: 800,
      category: "exclusive",
      image: "/placeholder.svg?height=100&width=100&text=Premium",
      available: true,
    },
    {
      id: "vip-consultation",
      name: "บริการปรึกษา VIP",
      nameEn: "VIP Consultation Service",
      description: "บริการปรึกษาการออกแบบแบบ 1:1 กับผู้เชี่ยวชาญ",
      descriptionEn: "1:1 design consultation with expert",
      pointsCost: 1000,
      category: "exclusive",
      image: "/placeholder.svg?height=100&width=100&text=VIP",
      available: currentTier?.id === "gold" || currentTier?.id === "platinum",
    },
  ]

  useEffect(() => {
    loadLoyaltyData()
  }, [userPoints])

  const loadLoyaltyData = () => {
    // Determine current tier
    const tier = loyaltyTiers.find((t) => userPoints >= t.minPoints && userPoints <= t.maxPoints)
    setCurrentTier(tier || loyaltyTiers[0])

    // Determine next tier
    const nextTierIndex = loyaltyTiers.findIndex((t) => userPoints < t.minPoints)
    setNextTier(nextTierIndex >= 0 ? loyaltyTiers[nextTierIndex] : null)

    // Load mock transactions
    setTransactions([
      {
        id: "1",
        type: "earned",
        points: 150,
        description: "Purchase Order #ORD-2024-001",
        date: "2024-01-15",
        orderId: "ORD-2024-001",
      },
      {
        id: "2",
        type: "earned",
        points: 200,
        description: "Product Review Bonus",
        date: "2024-01-10",
      },
      {
        id: "3",
        type: "redeemed",
        points: -100,
        description: "100 THB Discount Coupon",
        date: "2024-01-05",
      },
    ])

    setRewards(availableRewards)
    setLoading(false)
  }

  const redeemReward = async (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId)
    if (!reward || userPoints < reward.pointsCost) return

    // Simulate redemption
    setUserPoints((prev) => prev - reward.pointsCost)

    const newTransaction: LoyaltyTransaction = {
      id: `redeem-${Date.now()}`,
      type: "redeemed",
      points: -reward.pointsCost,
      description: language === "th" ? reward.name : reward.nameEn,
      date: new Date().toISOString().split("T")[0],
    }

    setTransactions((prev) => [newTransaction, ...prev])

    // Show success message (you can integrate with toast system)
    alert(language === "th" ? `แลกรางวัล "${reward.name}" สำเร็จ!` : `Successfully redeemed "${reward.nameEn}"!`)
  }

  const getProgressToNextTier = () => {
    if (!nextTier) return 100
    const progress =
      ((userPoints - (currentTier?.minPoints || 0)) / (nextTier.minPoints - (currentTier?.minPoints || 0))) * 100
    return Math.min(progress, 100)
  }

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-lg" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {language === "th" ? "โปรแกรมสมาชิก" : "Loyalty Program"}
        </h2>
        <p className="text-gray-600">
          {language === "th" ? "สะสมแต้มและรับสิทธิพิเศษมากมาย" : "Earn points and enjoy exclusive benefits"}
        </p>
      </div>

      {/* Current Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-full text-white ${currentTier?.color}`}>{currentTier?.icon}</div>
              <div>
                <h3 className="text-xl font-bold">{language === "th" ? currentTier?.name : currentTier?.nameEn}</h3>
                <p className="text-gray-600">
                  {userPoints.toLocaleString()} {language === "th" ? "แต้ม" : "points"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{userPoints.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{language === "th" ? "แต้มสะสม" : "Total Points"}</div>
            </div>
          </div>

          {nextTier && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  {language === "th" ? "ความคืบหน้าไปยัง" : "Progress to"}{" "}
                  {language === "th" ? nextTier.name : nextTier.nameEn}
                </span>
                <span>
                  {nextTier.minPoints - userPoints} {language === "th" ? "แต้มที่เหลือ" : "points to go"}
                </span>
              </div>
              <Progress value={getProgressToNextTier()} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="benefits" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="benefits">{language === "th" ? "สิทธิประโยชน์" : "Benefits"}</TabsTrigger>
          <TabsTrigger value="rewards">{language === "th" ? "แลกรางวัล" : "Rewards"}</TabsTrigger>
          <TabsTrigger value="history">{language === "th" ? "ประวัติ" : "History"}</TabsTrigger>
        </TabsList>

        <TabsContent value="benefits" className="space-y-4">
          {/* Current Tier Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`p-2 rounded-full text-white ${currentTier?.color}`}>{currentTier?.icon}</div>
                <span>{language === "th" ? "สิทธิประโยชน์ปัจจุบัน" : "Current Benefits"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(language === "th" ? currentTier?.benefits : currentTier?.benefitsEn)?.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Tiers */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loyaltyTiers.map((tier) => (
              <Card key={tier.id} className={`${userPoints >= tier.minPoints ? "ring-2 ring-purple-500" : ""}`}>
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <div className={`inline-flex p-3 rounded-full text-white ${tier.color} mb-2`}>{tier.icon}</div>
                    <h3 className="font-bold">{language === "th" ? tier.name : tier.nameEn}</h3>
                    <p className="text-sm text-gray-500">
                      {tier.minPoints.toLocaleString()} - {tier.maxPoints.toLocaleString()}{" "}
                      {language === "th" ? "แต้ม" : "pts"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {(language === "th" ? tier.benefits : tier.benefitsEn).slice(0, 2).map((benefit, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className={`${!reward.available ? "opacity-50" : ""}`}>
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <img
                      src={reward.image || "/placeholder.svg"}
                      alt={language === "th" ? reward.name : reward.nameEn}
                      className="w-20 h-20 mx-auto mb-3 rounded-lg"
                    />
                    <h3 className="font-bold mb-1">{language === "th" ? reward.name : reward.nameEn}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {language === "th" ? reward.description : reward.descriptionEn}
                    </p>
                    <Badge variant={reward.category === "exclusive" ? "default" : "secondary"}>
                      {reward.category === "discount" && (language === "th" ? "ส่วนลด" : "Discount")}
                      {reward.category === "freebie" && (language === "th" ? "ของแถม" : "Freebie")}
                      {reward.category === "exclusive" && (language === "th" ? "พิเศษ" : "Exclusive")}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold">{reward.pointsCost.toLocaleString()}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => redeemReward(reward.id)}
                      disabled={!reward.available || userPoints < reward.pointsCost}
                    >
                      {language === "th" ? "แลก" : "Redeem"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === "th" ? "ประวัติการใช้แต้ม" : "Points History"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "earned" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.type === "earned" ? (
                          <ArrowRight className="w-4 h-4" />
                        ) : (
                          <ShoppingBag className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold ${transaction.type === "earned" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "earned" ? "+" : ""}
                      {transaction.points.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
