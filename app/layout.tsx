import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ConfigProvider } from "@/components/ConfigProvider"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dongusa - Premium Sofa Covers",
  description: "Custom-made sofa covers with premium materials and expert craftsmanship",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ConfigProvider>
            {children}
            <Toaster />
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
