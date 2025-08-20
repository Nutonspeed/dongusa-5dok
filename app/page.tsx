import { MockServiceIndicator } from "@/components/MockServiceIndicator"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import Hero from "@/app/components/Hero"
import FeaturedProducts from "@/app/components/FeaturedProducts"
import { CustomCoverSection } from "@/app/components/CustomCoverSection"
import FabricCollections from "@/app/components/FabricCollections"
import WhyChooseUs from "@/app/components/WhyChooseUs"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
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
