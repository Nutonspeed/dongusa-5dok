"use client"

import { MockServiceIndicator } from "@/components/MockServiceIndicator"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Hero from "./components/Hero"
import FeaturedProducts from "./components/FeaturedProducts"
import { CustomCoverSection } from "./components/CustomCoverSection"
import FabricCollections from "./components/FabricCollections"
import WhyChooseUs from "./components/WhyChooseUs"

export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
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
