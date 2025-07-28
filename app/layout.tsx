import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "./contexts/CartContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { DemoBanner } from "@/components/DemoBanner"
import { MockServiceIndicator } from "@/components/MockServiceIndicator"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Premium Sofa Covers - Custom Fit & Designer Fabrics",
  description:
    "Transform your furniture with our premium custom-fit sofa covers. Choose from designer fabrics, perfect fit guarantee, and professional installation.",
  keywords: "sofa covers, furniture protection, custom covers, designer fabrics, home decor",
  authors: [{ name: "Premium Sofa Covers" }],
  creator: "Premium Sofa Covers",
  publisher: "Premium Sofa Covers",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://premiumsofacovers.com",
    title: "Premium Sofa Covers - Custom Fit & Designer Fabrics",
    description: "Transform your furniture with our premium custom-fit sofa covers.",
    siteName: "Premium Sofa Covers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Sofa Covers - Custom Fit & Designer Fabrics",
    description: "Transform your furniture with our premium custom-fit sofa covers.",
    creator: "@premiumsofacovers",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <LanguageProvider>
              <CartProvider>
                <div className="min-h-screen flex flex-col">
                  <DemoBanner />
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <MockServiceIndicator />
                </div>
                <Toaster />
              </CartProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
