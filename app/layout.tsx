import ErrorBoundary from "@/components/error-boundary"
import HealthBanner from "@/components/HealthBanner"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import type React from "react"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import "./globals.css"

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
  weight: ["400", "500", "600", "700", "800"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "ELF SofaCover Pro - Premium Custom Sofa Covers | ผ้าคลุมโซฟาพรีเมียม",
  description:
    "Transform your living space with premium custom sofa covers by ELF SofaCover Pro. Perfect fit guaranteed, premium materials, fast delivery.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#800000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${workSans.variable} ${openSans.variable} ${openSans.className} antialiased`}>
        <HealthBanner />
        <ErrorBoundary>
          <LanguageProvider>
            <CartProvider>
              <AuthProvider>
                <div id="root">{children}</div>
                <Toaster />
              </AuthProvider>
            </CartProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
