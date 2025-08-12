import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CartProvider } from "./contexts/CartContext"
import { AuthProvider } from "./contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SofaCover Pro - Premium Custom Sofa Covers | ผ้าคลุมโซฟาพรีเมียม",
  description:
    "Transform your living space with premium custom sofa covers. Perfect fit guaranteed, premium materials, fast delivery. เปลี่ยนโฉมพื้นที่นั่งเล่นด้วยผ้าคลุมโซฟาตามสั่งพรีเมียม",
  keywords: "sofa covers, custom sofa covers, furniture protection, home decor, ผ้าคลุมโซฟา, ผ้าคลุมโซฟาตามสั่ง",
  authors: [{ name: "SofaCover Pro Team" }],
  creator: "SofaCover Pro",
  publisher: "SofaCover Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://sofacoverpro.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "th-TH": "/th",
    },
  },
  openGraph: {
    title: "SofaCover Pro - Premium Custom Sofa Covers",
    description:
      "Transform your living space with premium custom sofa covers. Perfect fit guaranteed, premium materials, fast delivery.",
    url: "https://sofacoverpro.com",
    siteName: "SofaCover Pro",
    images: [
      {
        url: "/modern-living-room-sofa-covers.png",
        width: 1200,
        height: 630,
        alt: "Premium Sofa Covers by SofaCover Pro",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SofaCover Pro - Premium Custom Sofa Covers",
    description:
      "Transform your living space with premium custom sofa covers. Perfect fit guaranteed, premium materials, fast delivery.",
    images: ["/modern-living-room-sofa-covers.png"],
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
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SofaCover Pro",
    url: "https://sofacoverpro.com",
    logo: "https://sofacoverpro.com/logo.png",
    description: "Premium custom sofa covers with perfect fit guarantee and fast delivery",
    address: {
      "@type": "PostalAddress",
      addressCountry: "TH",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+66-xxx-xxx-xxxx",
      contactType: "customer service",
      availableLanguage: ["Thai", "English"],
    },
    sameAs: ["https://facebook.com/sofacoverpro", "https://instagram.com/sofacoverpro"],
  }

  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B1538" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <LanguageProvider>
          <CartProvider>
            <AuthProvider>
              <div id="root">{children}</div>
              <Toaster />
            </AuthProvider>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
