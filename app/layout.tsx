import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "./contexts/LanguageContext"
import { CartProvider } from "./contexts/CartContext"
import { AuthProvider } from "./contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import ErrorBoundary from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ELF SofaCover Pro - Premium Custom Sofa Covers | ผ้าคลุมโซฟาพรีเมียม",
  description:
    "Transform your living space with premium custom sofa covers by ELF SofaCover Pro. Perfect fit guaranteed, premium materials, fast delivery.",
    generator: 'v0.app'
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
        {/* Match address bar color to burgundy primary */}
        <meta name="theme-color" content="#7f1d2d" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} antialiased`}>
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
