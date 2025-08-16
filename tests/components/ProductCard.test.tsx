import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "../utils/test-helpers"
import { ProductCard } from "@/app/components/ProductCard"
import { mockProduct } from "../utils/test-helpers"

describe("ProductCard", () => {
  it("renders product information correctly", () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText("Test Sofa Cover")).toBeInTheDocument()
    expect(screen.getByText("฿1,500")).toBeInTheDocument()
    expect(screen.getByText("A beautiful sofa cover for testing")).toBeInTheDocument()
  })

  it("shows out of stock when product is not in stock", () => {
    const outOfStockProduct = { ...mockProduct, inStock: false }
    render(<ProductCard product={outOfStockProduct} />)

    expect(screen.getByText("Out of Stock")).toBeInTheDocument()
  })

  it("calls onAddToCart when add to cart button is clicked", () => {
    const mockAddToCart = vi.fn()
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />)

    const addButton = screen.getByText("Add to Cart")
    fireEvent.click(addButton)

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct)
  })
})
