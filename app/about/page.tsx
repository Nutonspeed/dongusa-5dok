"use client"

import Image from "next/image"
import { CheckCircle } from "lucide-react"
import { useLanguage } from "@/app/contexts/LanguageContext"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-pink-500 to-rose-600 text-white py-20 md:py-24 overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("about.hero.title")}</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">{t("about.hero.subtitle")}</p>
          </div>
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/abstract-fabric-pattern.png"
              alt="Background Pattern"
              layout="fill"
              objectFit="cover"
              quality={100}
              className="z-0"
            />
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("about.story.title")}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{t("about.story.paragraph1")}</p>
              <p className="text-gray-700 leading-relaxed">{t("about.story.paragraph2")}</p>
            </div>
            <div className="relative">
              <Image
                src="/placeholder-spzt7.png"
                alt="Our Story"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("about.values.title")}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("about.values.subtitle")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <CheckCircle className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("about.values.quality.title")}</h3>
                <p className="text-gray-600 text-sm">{t("about.values.quality.description")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <CheckCircle className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("about.values.innovation.title")}</h3>
                <p className="text-gray-600 text-sm">{t("about.values.innovation.description")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <CheckCircle className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("about.values.customer.title")}</h3>
                <p className="text-gray-600 text-sm">{t("about.values.customer.description")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section (Optional, can be added later) */}
        {/* <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Meet the passionate individuals behind our success.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Image src="/team-member-one.png" alt="Team Member 1" width={200} height={200} className="rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">John Doe</h3>
                <p className="text-gray-600">CEO & Founder</p>
              </div>
            </div>
          </div>
        </section> */}
      </main>
      <Footer />
    </div>
  )
}
