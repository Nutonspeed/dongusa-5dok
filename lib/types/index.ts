export interface Product {
  id: string
  name: string
  sku?: string
  price: number
  description?: string
  images?: string[]
  inStock?: boolean
  createdAt?: string
  updatedAt?: string
}

// Re-export other types if needed
export * from "./bill"
