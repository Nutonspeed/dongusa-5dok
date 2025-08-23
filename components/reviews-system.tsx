"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/app/contexts/AuthContext"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  user_id: string
  verified_purchase: boolean
  helpful_count: number
  created_at: string
  profiles: {
    full_name: string
  }
}

interface ReviewsSystemProps {
  productId: string
}

export function ReviewsSystem({ productId }: ReviewsSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
  })
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    loadReviews()
  }, [productId])

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("customer_reviews")
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setReviews(data || [])
    } catch (error) {
  // console.error("Error loading reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitReview = async () => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว")
      return
    }

    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast.error("กรุณากรอกหัวข้อและความคิดเห็น")
      return
    }

    try {
      const { error } = await supabase.from("customer_reviews").insert({
        product_id: productId,
        user_id: user.id,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
      })

      if (error) throw error

      toast.success("เขียนรีวิวสำเร็จ")
      setNewReview({ rating: 5, title: "", comment: "" })
      setShowReviewForm(false)
      loadReviews()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    }
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            รีวิวสินค้า ({reviews.length} รีวิว)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= averageRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
          </div>

          {user && !showReviewForm && <Button onClick={() => setShowReviewForm(true)}>เขียนรีวิว</Button>}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>เขียนรีวิวสินค้า</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">คะแนน</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })}>
                    <Star
                      className={`h-6 w-6 ${
                        star <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">หัวข้อรีวิว</label>
              <Input
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                placeholder="สรุปความคิดเห็นของคุณ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ความคิดเห็น</label>
              <Textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="แบ่งปันประสบการณ์การใช้งานสินค้านี้"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={submitReview}>ส่งรีวิว</Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                ยกเลิก
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {review.verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">ซื้อแล้ว</span>
                    )}
                  </div>
                  <h4 className="font-medium">{review.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  โดย {review.profiles?.full_name || "ผู้ใช้งาน"} •{" "}
                  {new Date(review.created_at).toLocaleDateString("th-TH")}
                </span>
                <button className="flex items-center gap-1 hover:text-gray-700">
                  <ThumbsUp className="h-3 w-3" />
                  {review.helpful_count}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
