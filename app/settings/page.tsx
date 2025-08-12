"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, Bell, Shield, Eye, EyeOff, Save, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useLanguage } from "../contexts/LanguageContext"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import Footer from "../components/Footer"

export const dynamic = "force-dynamic"

export default function SettingsPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { user, profile, isAuthenticated, signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [profileSettings, setProfileSettings] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  })

  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    newsletter: false,
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "private",
    dataSharing: false,
    analytics: true,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/settings")
      return
    }

    if (user || profile) {
      const fullName = user?.full_name || profile?.full_name || ""
      const nameParts = fullName.split(" ")
      setProfileSettings({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user?.email || profile?.email || "",
        phone: profile?.phone || "",
        address: "", // These would come from a separate address table
        city: "",
        postalCode: "",
      })
    }

    const savedNotifications = localStorage.getItem("notification_settings")
    if (savedNotifications) {
      setNotificationSettings(JSON.parse(savedNotifications))
    }

    const savedPrivacy = localStorage.getItem("privacy_settings")
    if (savedPrivacy) {
      setPrivacySettings(JSON.parse(savedPrivacy))
    }
  }, [isAuthenticated, user, profile, router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Profile update would be implemented here:", profileSettings)
      alert(language === "th" ? "อัปเดตโปรไฟล์สำเร็จ" : "Profile updated successfully")
    } catch (error) {
      console.error("Profile update failed:", error)
      alert(language === "th" ? "เกิดข้อผิดพลาดในการอัปเดต" : "Update failed")
    }

    setIsLoading(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      alert(language === "th" ? "รหัสผ่านใหม่ไม่ตรงกัน" : "New passwords do not match")
      return
    }

    if (passwordSettings.newPassword.length < 6) {
      alert(language === "th" ? "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" : "Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setPasswordSettings({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsLoading(false)
      alert(language === "th" ? "เปลี่ยนรหัสผ่านสำเร็จ" : "Password changed successfully")
    }, 1000)
  }

  const handleNotificationUpdate = (key: string, value: boolean) => {
    const updated = { ...notificationSettings, [key]: value }
    setNotificationSettings(updated)
    localStorage.setItem("notification_settings", JSON.stringify(updated))
  }

  const handlePrivacyUpdate = (key: string, value: boolean | string) => {
    const updated = { ...privacySettings, [key]: value }
    setPrivacySettings(updated)
    localStorage.setItem("privacy_settings", JSON.stringify(updated))
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      language === "th"
        ? "คุณแน่ใจหรือไม่ที่จะลบบัญชี? การกระทำนี้ไม่สามารถยกเลิกได้"
        : "Are you sure you want to delete your account? This action cannot be undone.",
    )

    if (confirmed) {
      signOut()
      router.push("/")
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{language === "th" ? "ตั้งค่าบัญชี" : "Account Settings"}</h1>
          <p className="text-gray-600 mt-2">
            {language === "th"
              ? "จัดการข้อมูลส่วนตัว ความปลอดภัย และการตั้งค่าต่างๆ"
              : "Manage your personal information, security, and preferences"}
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                {language === "th" ? "ข้อมูลส่วนตัว" : "Personal Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "th" ? "ชื่อ" : "First Name"}
                    </label>
                    <input
                      type="text"
                      value={profileSettings.firstName}
                      onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "th" ? "นามสกุล" : "Last Name"}
                    </label>
                    <input
                      type="text"
                      value={profileSettings.lastName}
                      onChange={(e) => setProfileSettings({ ...profileSettings, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "th" ? "อีเมล" : "Email"}
                    </label>
                    <input
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "th" ? "เบอร์โทรศัพท์" : "Phone Number"}
                    </label>
                    <input
                      type="tel"
                      value={profileSettings.phone}
                      onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "th" ? "ที่อยู่" : "Address"}
                  </label>
                  <textarea
                    value={profileSettings.address}
                    onChange={(e) => setProfileSettings({ ...profileSettings, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "th" ? "จังหวัด" : "City"}
                    </label>
                    <input
                      type="text"
                      value={profileSettings.city}
                      onChange={(e) => setProfileSettings({ ...profileSettings, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "th" ? "รหัสไปรษณีย์" : "Postal Code"}
                    </label>
                    <input
                      type="text"
                      value={profileSettings.postalCode}
                      onChange={(e) => setProfileSettings({ ...profileSettings, postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="bg-burgundy-gradient hover:opacity-90 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading
                    ? language === "th"
                      ? "กำลังบันทึก..."
                      : "Saving..."
                    : language === "th"
                      ? "บันทึกข้อมูล"
                      : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                {language === "th" ? "เปลี่ยนรหัสผ่าน" : "Change Password"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "th" ? "รหัสผ่านปัจจุบัน" : "Current Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordSettings.currentPassword}
                      onChange={(e) => setPasswordSettings({ ...passwordSettings, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "th" ? "รหัสผ่านใหม่" : "New Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordSettings.newPassword}
                      onChange={(e) => setPasswordSettings({ ...passwordSettings, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === "th" ? "ยืนยันรหัสผ่านใหม่" : "Confirm New Password"}
                  </label>
                  <input
                    type="password"
                    value={passwordSettings.confirmPassword}
                    onChange={(e) => setPasswordSettings({ ...passwordSettings, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="bg-burgundy-gradient hover:opacity-90 text-white">
                  <Lock className="w-4 h-4 mr-2" />
                  {isLoading
                    ? language === "th"
                      ? "กำลังเปลี่ยน..."
                      : "Changing..."
                    : language === "th"
                      ? "เปลี่ยนรหัสผ่าน"
                      : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                {language === "th" ? "การแจ้งเตือน" : "Notifications"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {language === "th" ? "แจ้งเตือนทางอีเมล" : "Email Notifications"}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {language === "th" ? "รับการแจ้งเตือนทางอีเมล" : "Receive notifications via email"}
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationUpdate("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {language === "th" ? "แจ้งเตือนทาง SMS" : "SMS Notifications"}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {language === "th" ? "รับการแจ้งเตือนทาง SMS" : "Receive notifications via SMS"}
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => handleNotificationUpdate("smsNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">{language === "th" ? "อัปเดตคำสั่งซื้อ" : "Order Updates"}</Label>
                  <p className="text-xs text-gray-500">
                    {language === "th" ? "แจ้งเตือนสถานะคำสั่งซื้อ" : "Get notified about order status changes"}
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.orderUpdates}
                  onCheckedChange={(checked) => handleNotificationUpdate("orderUpdates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">{language === "th" ? "โปรโมชั่น" : "Promotions"}</Label>
                  <p className="text-xs text-gray-500">
                    {language === "th" ? "รับข้อมูลโปรโมชั่นและส่วนลด" : "Receive promotional offers and discounts"}
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.promotions}
                  onCheckedChange={(checked) => handleNotificationUpdate("promotions", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">{language === "th" ? "จดหมายข่าว" : "Newsletter"}</Label>
                  <p className="text-xs text-gray-500">
                    {language === "th" ? "รับจดหมายข่าวรายเดือน" : "Receive monthly newsletter"}
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.newsletter}
                  onCheckedChange={(checked) => handleNotificationUpdate("newsletter", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                {language === "th" ? "ความเป็นส่วนตัว" : "Privacy"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {language === "th" ? "แชร์ข้อมูลเพื่อการวิเคราะห์" : "Share Data for Analytics"}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {language === "th" ? "ช่วยปรับปรุงบริการด้วยข้อมูลการใช้งาน" : "Help improve our service with usage data"}
                  </p>
                </div>
                <Switch
                  checked={privacySettings.analytics}
                  onCheckedChange={(checked) => handlePrivacyUpdate("analytics", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    {language === "th" ? "แชร์ข้อมูลกับพาร์ทเนอร์" : "Share Data with Partners"}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {language === "th" ? "แชร์ข้อมูลกับพาร์ทเนอร์ที่เชื่อถือได้" : "Share data with trusted partners"}
                  </p>
                </div>
                <Switch
                  checked={privacySettings.dataSharing}
                  onCheckedChange={(checked) => handlePrivacyUpdate("dataSharing", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {language === "th" ? "โซนอันตราย" : "Danger Zone"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{language === "th" ? "ลบบัญชี" : "Delete Account"}</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {language === "th"
                      ? "การลบบัญชีจะทำให้ข้อมูลทั้งหมดของคุณถูกลบอย่างถาวร และไม่สามารถกู้คืนได้"
                      : "Deleting your account will permanently remove all your data and cannot be undone."}
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleDeleteAccount}
                    className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === "th" ? "ลบบัญชี" : "Delete Account"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
