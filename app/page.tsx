import Header from "./components/Header"
import Hero from "./components/Hero"
import FeaturedProducts from "./components/FeaturedProducts"
import WhyChooseUs from "./components/WhyChooseUs"
import FabricCollections from "./components/FabricCollections"
import CustomCoverSection from "./components/CustomCoverSection"
import Footer from "./components/Footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <FeaturedProducts />
      <WhyChooseUs />
      <FabricCollections />
      <CustomCoverSection />
      <Footer />
    </main>
  )
}
