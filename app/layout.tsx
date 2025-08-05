import type React from "react"
import type { Metadata } from "next"
import { Inter, Kanit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import ErrorBoundary from "@/components/ErrorBoundary"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "SofaCover Pro - ผ้าคลุมโซฟาคุณภาพสูง | สั่งทำตามขนาด",
    template: "%s | SofaCover Pro",
  },
  description: "ผ้าคลุมโซฟาคุณภาพสูง สั่งทำตามขนาด ผ้ากันน้ำ กันคราบ ดูแลง่าย จัดส่งทั่วประเทศ รับประกันคุณภาพ",
  keywords: [
    "ผ้าคลุมโซฟา",
    "sofa cover",
    "ผ้าคลุมโซฟาสั่งทำ",
    "ผ้าคลุมโซฟากันน้ำ",
    "ผ้าคลุมโซฟาคุณภาพสูง",
    "custom sofa cover",
    "waterproof sofa cover",
    "โซฟาคัฟเวอร์",
    "ผ้าคลุมเฟอร์นิเจอร์",
  ],
  authors: [{ name: "SofaCover Pro Team" }],
  creator: "SofaCover Pro",
  publisher: "SofaCover Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://sofacover.co.th"),
  alternates: {
    canonical: "/",
    languages: {
      "th-TH": "/th",
      "en-US": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "/",
    title: "SofaCover Pro - ผ้าคลุมโซฟาคุณภาพสูง",
    description: "ผ้าคลุมโซฟาคุณภาพสูง สั่งทำตามขนาด ผ้ากันน้ำ กันคราบ ดูแลง่าย จัดส่งทั่วประเทศ",
    siteName: "SofaCover Pro",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SofaCover Pro - ผ้าคลุมโซฟาคุณภาพสูง",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SofaCover Pro - ผ้าคลุมโซฟาคุณภาพสูง",
    description: "ผ้าคลุมโซฟาคุณภาพสูง สั่งทำตามขนาด ผ้ากันน้ำ กันคราบ ดูแลง่าย",
    images: ["/og-image.jpg"],
    creator: "@sofacoverpro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "mock-google-verification",
    yandex: process.env.YANDEX_VERIFICATION || "mock-yandex-verification",
    yahoo: process.env.YAHOO_VERIFICATION || "mock-yahoo-verification",
  },
  category: "e-commerce",
  classification: "Business",
  other: {
    "msapplication-TileColor": "#ec4899",
    "theme-color": "#ec4899",
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body className={`${inter.variable} ${kanit.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            <AuthProvider>
              <CartProvider>
                <LanguageProvider>
                  <div className="relative flex min-h-screen flex-col">
                    <div className="flex-1">{children}</div>
                  </div>
                  <Toaster />
                  <Sonner />
                </LanguageProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
