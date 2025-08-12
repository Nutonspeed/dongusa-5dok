"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "../contexts/LanguageContext"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function ProfilePage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { user, isAuthenticated, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    joinDate: "",
    totalOrders: 0,
    totalSpent: 0,
  })

  const [editForm, setEditForm] = useState(profile)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/profile")
      return
    }

    if (user) {
      const userData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
        joinDate: user.joinDate || "",
        totalOrders: user.totalOrders || 0,
        totalSpent: user.totalSpent || 0,
      }
      setProfile(userData)
      setEditForm(userData)
    }
  }, [isAuthenticated, user, router])

  const handleSave = async () => {
    setIsLoading(true)

    const result = await updateProfile(editForm)

    if (result.success) {
      setProfile(editForm)
      setIsEditing(false)
    } else {
      console.error("Profile update failed:", result.error)
    }

    setIsLoading(false)
  }

  const handleCancel = () => {
    setEditForm(profile)
    setIsEditing(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{language === "th" ? "โปรไฟล์ของฉัน" : "My Profile"}</h1>
          <p className="text-gray-600 mt-2">
            {language === "th"
              ? "จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี"
              : "Manage your personal information and account settings"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {language === "th" ? "ข้อมูลส่วนตัว" : "Personal Information"}
                </CardTitle>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    {language === "th" ? "แก้ไข" : "Edit"}
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      {language === "th" ? "ยกเลิก" : "Cancel"}
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading
                        ? language === "th"
                          ? "กำลังบันทึก..."
                          : "Saving..."
                        : language === "th"
                          ? "บันทึก"
                          : "Save"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "th" ? "ชื่อ" : "First Name"}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "th" ? "นามสกุล" : "Last Name"}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    {language === "th" ? "อีเมล" : "Email"}
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {language === "th" ? "เบอร์โทรศัพท์" : "Phone Number"}
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {language === "th" ? "ที่อยู่" : "Address"}
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.address}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {language === "th" ? "สถิติบัญชี" : "Account Stats"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-accent rounded-lg">
                  <div className="text-2xl font-bold text-primary">{profile.totalOrders}</div>
                  <div className="text-sm text-gray-600">{language === "th" ? "คำสั่งซื้อทั้งหมด" : "Total Orders"}</div>
                </div>

                <div className="text-center p-4 bg-accent rounded-lg">
                  <div className="text-2xl font-bold text-primary">{formatPrice(profile.totalSpent)}</div>
                  <div className="text-sm text-gray-600">{language === "th" ? "ยอดซื้อทั้งหมด" : "Total Spent"}</div>
                </div>

                <div className="text-center p-4 bg-accent rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{language === "th" ? "สมาชิกตั้งแต่" : "Member Since"}</div>
                  <div className="font-medium text-gray-900">{formatDate(profile.joinDate)}</div>
                </div>

                <div className="text-center">
                  <Badge className="bg-burgundy-gradient text-white">
                    {language === "th" ? "ลูกค้า VIP" : "VIP Customer"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "th" ? "การดำเนินการด่วน" : "Quick Actions"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/orders">{language === "th" ? "ดูคำสั่งซื้อ" : "View Orders"}</a>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/settings">{language === "th" ? "ตั้งค่าบัญชี" : "Account Settings"}</a>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href="/contact">{language === "th" ? "ติดต่อเรา" : "Contact Us"}</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
