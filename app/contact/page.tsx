"use client"

import type React from "react"

import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"

export default function ContactPage() {
  const { t } = useLanguage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here (e.g., send to API)
    alert("ข้อความของคุณถูกส่งแล้ว! เราจะติดต่อกลับโดยเร็วที่สุด")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("contact.title")}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("contact.subtitle")}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-white rounded-lg shadow-xl p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">{t("contact.form.title")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="mb-2">
                      {t("contact.form.name")} *
                    </Label>
                    <Input id="name" type="text" placeholder={t("contact.form.name-placeholder")} required />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2">
                      {t("contact.form.email")} *
                    </Label>
                    <Input id="email" type="email" placeholder={t("contact.form.email-placeholder")} required />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="mb-2">
                      {t("contact.form.subject")}
                    </Label>
                    <Input id="subject" type="text" placeholder={t("contact.form.subject-placeholder")} />
                  </div>
                  <div>
                    <Label htmlFor="message" className="mb-2">
                      {t("contact.form.message")} *
                    </Label>
                    <Textarea id="message" rows={5} placeholder={t("contact.form.message-placeholder")} required />
                  </div>
                  <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white text-lg py-3">
                    {t("contact.form.send-message")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info & Map */}
            <div className="space-y-8">
              <Card className="bg-white rounded-lg shadow-xl p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">{t("contact.info.title")}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-pink-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{t("contact.info.address-label")}</h3>
                      <p className="text-gray-700">123 ถนนสุขุมวิท, แขวงคลองเตย, เขตคลองเตย, กรุงเทพฯ 10110</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-pink-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{t("contact.info.phone-label")}</h3>
                      <p className="text-gray-700">02-123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-pink-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{t("contact.info.email-label")}</h3>
                      <p className="text-gray-700">info@sofacovers.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Facebook className="w-6 h-6 text-pink-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Facebook</h3>
                      <a
                        href="https://facebook.com/yourpage"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        facebook.com/yourpage
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Instagram className="w-6 h-6 text-pink-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Instagram</h3>
                      <a
                        href="https://instagram.com/yourpage"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        instagram.com/yourpage
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5433000000003!2d100.56666666666666!3d13.746666666666667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29e29e29e29e2%3A0x30e29e29e29e29e2!2sBangkok!5e0!3m2!1sen!2sth!4v1678901234567!5m2!1sen!2sth"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
