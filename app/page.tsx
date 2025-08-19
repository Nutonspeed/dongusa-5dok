"use client"

import { useEffect } from "react"
import { MockServiceIndicator } from "@/components/MockServiceIndicator"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import Hero from "@/app/components/Hero"
import FeaturedProducts from "@/app/components/FeaturedProducts"
import { CustomCoverSection } from "@/app/components/CustomCoverSection"
import FabricCollections from "@/app/components/FabricCollections"
import WhyChooseUs from "@/app/components/WhyChooseUs"

export default function HomePage() {
  useEffect(() => {
    console.log("[v0] HomePage component mounted")
    console.log("[v0] Checking component loading...")

    const checkComponents = () => {
      const components = [
        "Header",
        "Hero",
        "FeaturedProducts",
        "CustomCoverSection",
        "FabricCollections",
        "WhyChooseUs",
        "Footer",
      ]

      components.forEach((comp) => {
        console.log(`[v0] ${comp} component ready`)
      })
    }

    checkComponents()

    const timer = setTimeout(() => {
      const mainElement = document.querySelector("main")
      if (mainElement) {
        console.log("[v0] Main element found, children count:", mainElement.children.length)
      } else {
        console.error("[v0] Main element not found!")
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
        <CustomCoverSection />
        <FabricCollections />
        <WhyChooseUs />
      </main>
      <Footer />
      <MockServiceIndicator />
    </div>
  )
}
