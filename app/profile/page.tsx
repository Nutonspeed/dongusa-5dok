"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Calendar, Shield, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
      })
    }
  }, [user])

  const handleSave = async () => {
    // In a real app, you would call an API to update the user profile
    console.log("Saving profile:", editForm)
    setIsEditing(false)
    // Show success message
  }

  const handleCancel = () => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
      })
    }
    setIsEditing(false)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const content = {
    en: {
      title: "My Profile",
      subtitle: "Manage your account information",
      personalInfo: "Personal Information",
      name: "Full Name",
      email: "Email Address",
      role: "Account Type",
      joinDate: "Member Since",
      edit: "Edit Profile",
      save: "Save Changes",
      cancel: "Cancel",
      loading: "Loading...",
    },
    th: {
      title: "โปรไฟล์ของฉัน",
      subtitle: "จัดการข้อมูลบัญชีของคุณ",
      personalInfo: "ข้อมูลส่วนตัว",
      name: "ชื่อ-นามสกุล",
      email: "อีเมล",
      role: "ประเภทบัญชี",
      joinDate: "สมาชิกตั้งแต่",
      edit: "แก้ไขโปรไฟล์",
      save: "บันทึกการเปลี่ยนแปลง",
      cancel: "ยกเลิก",
      loading: "กำลังโหลด...",
    },
  }

  const t = content[language]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>

        {/* Profile Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar || undefined} alt={user.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center mt-2">
                    <Shield className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 capitalize">{user.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      {t.save}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      {t.cancel}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    {t.edit}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {t.personalInfo}
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t.name}</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">{t.email}</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>{t.role}</Label>
                    <div className="mt-1 flex items-center">
                      <Shield className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-gray-900 capitalize">{user.role}</span>
                    </div>
                  </div>

                  <div>
                    <Label>{t.joinDate}</Label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {new Date().toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Statistics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === "en" ? "Account Statistics" : "สถิติบัญชี"}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-gray-600">{language === "en" ? "Orders" : "คำสั่งซื้อ"}</div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">{language === "en" ? "Reviews" : "รีวิว"}</div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">0</div>
                      <div className="text-sm text-gray-600">{language === "en" ? "Wishlist" : "รายการโปรด"}</div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">0</div>
                      <div className="text-sm text-gray-600">{language === "en" ? "Points" : "คะแนน"}</div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
