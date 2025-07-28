import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CartProvider } from "./contexts/CartContext"
import DemoBanner from "@/components/DemoBanner"
import MockServiceIndicator from "@/components/MockServiceIndicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ระบบจัดการผ้าคลุมโซฟา - Sofa Cover Management System",
  description: "ระบบจัดการธุรกิจผ้าคลุมโซฟาแบบครบวงจร พร้อมระบบ AI ช่วยเหลือ",
  keywords: "ผ้าคลุมโซฟา, sofa cover, e-commerce, AI assistant, invoice management",
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
          <AuthProvider>
            <LanguageProvider>
              <CartProvider>
                <DemoBanner />
                <MockServiceIndicator />
                {children}
                <Toaster />
              </CartProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
