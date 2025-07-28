import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CartProvider } from "./contexts/CartContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import DemoBanner from "@/components/DemoBanner"
import MockServiceIndicator from "@/components/MockServiceIndicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SofaCover - Premium Sofa Covers & Custom Solutions",
  description:
    "Transform your living space with our premium sofa covers. Custom-made solutions, high-quality fabrics, and perfect fit guaranteed.",
  keywords: "sofa covers, furniture protection, custom sofa covers, home decor, fabric covers",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <LanguageProvider>
            <CartProvider>
              <DemoBanner />
              <MockServiceIndicator />
              {children}
              <Toaster />
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
