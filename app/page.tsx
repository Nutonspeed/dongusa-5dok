"use client"
import Header from "./components/Header"
import Hero from "./components/Hero"
import FeaturedProducts from "./components/FeaturedProducts"
import FabricCollections from "./components/FabricCollections"
import WhyChooseUs from "./components/WhyChooseUs"
import CustomCoverSection from "./components/CustomCoverSection"
import Footer from "./components/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
        <FabricCollections />
        <WhyChooseUs />
        <CustomCoverSection />
      </main>
      <Footer />
    </div>
  )
}
