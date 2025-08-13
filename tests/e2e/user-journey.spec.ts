import { test, expect } from "@playwright/test"

test.describe("User Journey E2E Tests", () => {
  test("complete shopping flow", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/")
    await expect(page.locator("h1")).toContainText("SofaCover Pro")

    // Browse products
    await page.click('[data-testid="products-link"]')
    await expect(page).toHaveURL("/products")

    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]')
    await expect(page.locator('[data-testid="cart-count"]')).toContainText("1")

    // Go to cart
    await page.click('[data-testid="cart-link"]')
    await expect(page).toHaveURL("/cart")

    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]')
    await expect(page).toHaveURL("/checkout")

    // Fill checkout form
    await page.fill('[data-testid="customer-name"]', "Test Customer")
    await page.fill('[data-testid="customer-email"]', "test@example.com")
    await page.fill('[data-testid="customer-phone"]', "0812345678")

    // Complete order
    await page.click('[data-testid="place-order"]')
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible()
  })

  test("admin panel access and management", async ({ page }) => {
    // Login as admin
    await page.goto("/admin")

    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/.*login.*/)

    // Login with admin credentials
    await page.fill('[data-testid="email"]', "admin@example.com")
    await page.fill('[data-testid="password"]', "adminpassword")
    await page.click('[data-testid="login-button"]')

    // Should access admin dashboard
    await expect(page).toHaveURL("/admin")
    await expect(page.locator("h1")).toContainText("Admin Dashboard")

    // Test admin functions
    await page.click('[data-testid="orders-link"]')
    await expect(page).toHaveURL("/admin/orders")
    await expect(page.locator('[data-testid="orders-table"]')).toBeVisible()
  })
})
