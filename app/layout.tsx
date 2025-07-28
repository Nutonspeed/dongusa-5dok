import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CartProvider } from "./contexts/CartContext"
import { AuthProvider } from "./contexts/AuthContext"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { DemoBanner } from "@/components/DemoBanner"
import { MockServiceIndicator } from "@/components/MockServiceIndicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SofaCover Pro - Premium Sofa Covers & Custom Fabric Solutions",
  description:
    "Transform your living space with our premium sofa covers. Custom-made, high-quality fabrics, and professional installation services.",
  keywords: "sofa covers, custom fabric, furniture protection, home decor, upholstery",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <DemoBanner />
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
                <MockServiceIndicator />
              </div>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
