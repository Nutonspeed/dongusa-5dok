import Header from "./components/Header"
import Hero from "./components/Hero"
import FeaturedProducts from "./components/FeaturedProducts"
import WhyChooseUs from "./components/WhyChooseUs"
import FabricCollections from "./components/FabricCollections"
import CustomCoverSection from "./components/CustomCoverSection"
import Footer from "./components/Footer"
import { DemoBanner } from "@/components/DemoBanner"
import { MockServiceIndicator } from "@/components/MockServiceIndicator"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <DemoBanner />
      <MockServiceIndicator />
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
        <WhyChooseUs />
        <FabricCollections />
        <CustomCoverSection />
      </main>
      <Footer />
    </div>
  )
}
