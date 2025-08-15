import type React from "react"
import { render, type RenderOptions } from "@testing-library/react"
import type { ReactElement } from "react"
import { AuthProvider } from "@/app/contexts/AuthContext"
import { CartProvider } from "@/app/contexts/CartContext"

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from "@testing-library/react"
export { customRender as render }

// Mock data helpers
export const mockUser = {
  id: "test-user-1",
  email: "test@example.com",
  role: "customer" as const,
  name: "Test User",
}

export const mockAdmin = {
  id: "admin-user-1",
  email: "admin@example.com",
  role: "admin" as const,
  name: "Admin User",
}

export const mockProduct = {
  id: "product-1",
  name: "Test Sofa Cover",
  price: 1500,
  description: "A beautiful sofa cover for testing",
  category: "sofa-covers",
  images: ["/placeholder.svg?height=300&width=300"],
  inStock: true,
  stockQuantity: 10,
}
