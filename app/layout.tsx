import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CartProvider } from "./contexts/CartContext"
import { Toaster } from "@/components/ui/toaster"
import DemoBanner from "@/components/DemoBanner"
import MockServiceIndicator from "@/components/MockServiceIndicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SofaCover Pro - ผ้าคลุมโซฟาคุณภาพสูง",
  description: "ผ้าคลุมโซฟาและเฟอร์นิเจอร์คุณภาพสูง ออกแบบตามสั่ง ส่งฟรีทั่วประเทศ",
  keywords: "ผ้าคลุมโซฟา, sofa cover, เฟอร์นิเจอร์, ตกแต่งบ้าน, ผ้าคลุมตามสั่ง",
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
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
