"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "../contexts/LanguageContext"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function ContactPage() {
  const { language } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    sofaType: "",
    urgency: "normal",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create message for Facebook
    const message = `
${language === "th" ? "ข้อมูลการติดต่อ" : "Contact Information"}:

${language === "th" ? "ชื่อ" : "Name"}: ${formData.name}
${language === "th" ? "อีเมล" : "Email"}: ${formData.email}
${language === "th" ? "เบอร์โทร" : "Phone"}: ${formData.phone}
${language === "th" ? "หัวข้อ" : "Subject"}: ${formData.subject}
${language === "th" ? "ประเภทโซฟา" : "Sofa Type"}: ${formData.sofaType}
${language === "th" ? "ความเร่งด่วน" : "Urgency"}: ${formData.urgency}

${language === "th" ? "ข้อความ" : "Message"}:
${formData.message}
    `

    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
    window.open(facebookUrl, "_blank")

    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const contactInfo = [
    {
      icon: Phone,
      title: language === "th" ? "โทรศัพท์" : "Phone",
      content: "02-xxx-xxxx, 08x-xxx-xxxx",
      description: language === "th" ? "เปิดรับสาย 8:00-20:00 น." : "Available 8:00-20:00",
    },
    {
      icon: Mail,
      title: language === "th" ? "อีเมล" : "Email",
      content: "info@sofacover.co.th",
      description: language === "th" ? "ตอบกลับภายใน 2 ชั่วโมง" : "Reply within 2 hours",
    },
    {
      icon: MapPin,
      title: language === "th" ? "ที่อยู่" : "Address",
      content: language === "th" ? "123 ถนนสุขุมวิท กรุงเทพฯ 10110" : "123 Sukhumvit Road, Bangkok 10110",
      description: language === "th" ? "เปิดจันทร์-เสาร์ 9:00-18:00 น." : "Open Mon-Sat 9:00-18:00",
    },
    {
      icon: MessageCircle,
      title: "Facebook Messenger",
      content: "@SofaCoverThailand",
      description: language === "th" ? "ตอบเร็วที่สุด 24/7" : "Fastest response 24/7",
    },
  ]

  const faqData = [
    {
      question: language === "th" ? "ใช้เวลาผลิตนานแค่ไหน?" : "How long does production take?",
      answer:
        language === "th"
          ? "ผ้าคลุมโซฟาทั่วไป 7-10 วัน, แบบพิเศษหรือขนาดใหญ่ 10-14 วัน"
          : "Regular covers 7-10 days, special or large sizes 10-14 days",
    },
    {
      question: language === "th" ? "มีการรับประกันไหม?" : "Do you offer warranty?",
      answer:
        language === "th"
          ? "รับประกันคุณภาพ 1 ปี หากมีปัญหาจากการผลิตจะเปลี่ยนให้ใหม่ฟรี"
          : "1-year quality warranty. Free replacement for manufacturing defects",
    },
    {
      question: language === "th" ? "สามารถดูตัวอย่างผ้าได้ไหม?" : "Can I see fabric samples?",
      answer:
        language === "th"
          ? "ได้ครับ สามารถขอดูตัวอย่างผ้าได้ฟรี จัดส่งถึงบ้าน"
          : "Yes, free fabric samples available with home delivery",
    },
    {
      question: language === "th" ? "ราคาคำนวณยังไง?" : "How is pricing calculated?",
      answer:
        language === "th"
          ? "ราคาขึ้นอยู่กับขนาดโซฟา, ประเภทผ้า, และความซับซ้อนของรูปทรง"
          : "Price depends on sofa size, fabric type, and shape complexity",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{language === "th" ? "ติดต่อเรา" : "Contact Us"}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === "th"
              ? "พร้อมให้คำปรึกษาและประเมินราคาผ้าคลุมโซฟาตามความต้องการของคุณ"
              : "Ready to consult and quote sofa covers according to your needs"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {language === "th" ? "ส่งข้อความหาเรา" : "Send us a message"}
                </h2>

                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span>
                      {language === "th"
                        ? "ส่งข้อความเรียบร้อย! เราจะติดต่อกลับเร็วๆ นี้"
                        : "Message sent successfully! We'll contact you soon"}
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th" ? "ชื่อ-นามสกุล *" : "Full Name *"}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder={language === "th" ? "กรอกชื่อ-นามสกุล" : "Enter your full name"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th" ? "เบอร์โทรศัพท์ *" : "Phone Number *"}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder={language === "th" ? "08x-xxx-xxxx" : "08x-xxx-xxxx"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "th" ? "อีเมล" : "Email"}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder={language === "th" ? "your@email.com" : "your@email.com"}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th" ? "ประเภทโซฟา" : "Sofa Type"}
                      </label>
                      <select
                        name="sofaType"
                        value={formData.sofaType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="">{language === "th" ? "เลือกประเภทโซฟา" : "Select sofa type"}</option>
                        <option value="single">{language === "th" ? "โซฟา 1 ที่นั่ง" : "Single seat sofa"}</option>
                        <option value="loveseat">{language === "th" ? "โซฟา 2 ที่นั่ง" : "2-seat loveseat"}</option>
                        <option value="sofa">{language === "th" ? "โซฟา 3 ที่นั่ง" : "3-seat sofa"}</option>
                        <option value="sectional">{language === "th" ? "โซฟาเซ็กชั่นแนล" : "Sectional sofa"}</option>
                        <option value="recliner">{language === "th" ? "เก้าอี้ปรับนอน" : "Recliner"}</option>
                        <option value="other">{language === "th" ? "อื่นๆ" : "Other"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "th" ? "ความเร่งด่วน" : "Urgency"}
                      </label>
                      <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="normal">{language === "th" ? "ปกติ (7-14 วัน)" : "Normal (7-14 days)"}</option>
                        <option value="urgent">{language === "th" ? "เร่งด่วน (3-7 วัน)" : "Urgent (3-7 days)"}</option>
                        <option value="express">{language === "th" ? "ด่วนพิเศษ (1-3 วัน)" : "Express (1-3 days)"}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "th" ? "หัวข้อ" : "Subject"}
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder={language === "th" ? "เช่น: ขอใบเสนอราคาผ้าคลุมโซฟา" : "e.g: Request sofa cover quote"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "th" ? "รายละเอียด *" : "Message *"}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder={
                        language === "th"
                          ? "กรุณาระบุขนาดโซฟา, สีที่ต้องการ, และรายละเอียดอื่นๆ (แนะนำให้แนบรูปโซฟาใน Facebook)"
                          : "Please specify sofa dimensions, preferred colors, and other details (recommend attaching sofa photos on Facebook)"
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white py-3"
                    size="lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {language === "th" ? "ส่งข้อความ" : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {language === "th" ? "ข้อมูลติดต่อ" : "Contact Information"}
                </h3>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{info.title}</h4>
                        <p className="text-gray-700">{info.content}</p>
                        <p className="text-sm text-gray-500">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-pink-600" />
                  {language === "th" ? "เวลาทำการ" : "Business Hours"}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{language === "th" ? "จันทร์ - ศุกร์" : "Monday - Friday"}</span>
                    <span className="font-medium">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "th" ? "เสาร์" : "Saturday"}</span>
                    <span className="font-medium">9:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "th" ? "อาทิตย์" : "Sunday"}</span>
                    <span className="text-red-600">{language === "th" ? "ปิด" : "Closed"}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-pink-600 font-medium">
                      Facebook: {language === "th" ? "ตอบ 24/7" : "24/7 Response"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">
                  {language === "th" ? "ต้องการคำตอบเร็ว?" : "Need Quick Answer?"}
                </h3>
                <p className="mb-4 opacity-90">
                  {language === "th" ? "แชทกับเราใน Facebook Messenger" : "Chat with us on Facebook Messenger"}
                </p>
                <Button
                  onClick={() => {
                    const message =
                      language === "th"
                        ? "สวัสดีครับ/ค่ะ! ผมต้องการสอบถามเรื่องผ้าคลุมโซฟาครับ/ค่ะ"
                        : "Hello! I'd like to inquire about sofa covers"
                    const facebookUrl = `https://m.me/your-facebook-page?text=${encodeURIComponent(message)}`
                    window.open(facebookUrl, "_blank")
                  }}
                  className="bg-white text-pink-600 hover:bg-gray-100"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {language === "th" ? "เริ่มแชท" : "Start Chat"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                {language === "th" ? "คำถามที่พบบ่อย" : "Frequently Asked Questions"}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {faqData.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-semibold text-gray-900">{faq.question}</h4>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
