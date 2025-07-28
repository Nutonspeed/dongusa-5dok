import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CartProvider } from "./contexts/CartContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ผ้าคลุมโซฟาตัดตามขนาด - Premium Custom Sofa Covers",
  description: "ผ้าคลุมโซฟาคุณภาพสูงตัดตามขนาด พร้อมลายผ้าสวยงามกว่า 1,000 แบบ จัดส่งฟรีทั่วประเทศ รับประกัน 1 ปี",
  keywords: "ผ้าคลุมโซฟา, sofa cover, custom sofa cover, ผ้าคลุมโซฟาตัดตามขนาด, โซฟาคัฟเวอร์",
  openGraph: {
    title: "ผ้าคลุมโซฟาตัดตามขนาด - Premium Custom Sofa Covers",
    description: "ผ้าคลุมโซฟาคุณภาพสูงตัดตามขนาด พร้อมลายผ้าสวยงามกว่า 1,000 แบบ",
    images: ["/modern-living-room-sofa-covers.png"],
  },
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
              {children}
              <Toaster />
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
