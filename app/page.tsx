import Header from "./components/Header"
import Hero from "./components/Hero"
import FeaturedProducts from "./components/FeaturedProducts"
import WhyChooseUs from "./components/WhyChooseUs"
import CustomCoverSection from "./components/CustomCoverSection"
import FabricCollections from "./components/FabricCollections"
import Footer from "./components/Footer"
import DemoBanner from "@/components/DemoBanner"

export default function HomePage() {
  return (
    <>
      <DemoBanner />
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
        <WhyChooseUs />
        <CustomCoverSection />
        <FabricCollections />
      </main>
      <Footer />
    </>
  )
}
