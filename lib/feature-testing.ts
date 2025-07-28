import { enhancedMockDatabaseService, testingUtils } from "./enhanced-mock-database"

// Feature testing framework
export class FeatureTester {
  private testResults: Array<{
    feature: string
    test: string
    status: "passed" | "failed" | "skipped"
    message?: string
    duration: number
  }> = []

  async runFeatureTests(feature: string): Promise<void> {
    console.log(`🧪 [FEATURE TEST] Starting tests for: ${feature}`)

    switch (feature) {
      case "product-management":
        await this.testProductManagement()
        break
      case "order-processing":
        await this.testOrderProcessing()
        break
      case "customer-management":
        await this.testCustomerManagement()
        break
      case "inventory-tracking":
        await this.testInventoryTracking()
        break
      default:
        console.log(`❌ [FEATURE TEST] Unknown feature: ${feature}`)
    }

    this.printTestResults(feature)
  }

  private async testProductManagement(): Promise<void> {
    // Test product creation
    await this.runTest("product-management", "create-product", async () => {
      const product = await enhancedMockDatabaseService.createProduct({
        name: "Test Product",
        name_en: "Test Product EN",
        description: "Test product description",
        description_en: "Test product description EN",
        price: 999,
        images: ["/test-image.jpg"],
        category: "covers",
        specifications: {
          material: "Test Material",
          dimensions: "Test Dimensions",
          colors: ["Test Color"],
          care_instructions: "Test Care Instructions",
        },
        stock: 10,
        status: "active",
        sold_count: 0,
        rating: 0,
        reviews_count: 0,
      })

      if (!product.id) throw new Error("Product ID not generated")
      if (product.name !== "Test Product") throw new Error("Product name not saved correctly")
    })

    // Test product validation
    await this.runTest("product-management", "validate-product", async () => {
      try {
        await enhancedMockDatabaseService.createProduct({
          name: "", // Invalid: empty name
          name_en: "Test",
          description: "Test",
          description_en: "Test",
          price: -100, // Invalid: negative price
          images: [],
          category: "invalid-category", // Invalid: not in enum
          specifications: {
            material: "Test",
            dimensions: "Test",
            colors: ["Test"],
            care_instructions: "Test",
          },
          stock: 10,
          status: "active",
          sold_count: 0,
          rating: 0,
          reviews_count: 0,
        })
        throw new Error("Validation should have failed")
      } catch (error) {
        if (!error.message.includes("Validation failed")) {
          throw new Error("Expected validation error")
        }
      }
    })

    // Test product search
    await this.runTest("product-management", "search-products", async () => {
      const products = await enhancedMockDatabaseService.getProducts({ search: "Test" })
      if (products.length === 0) throw new Error("Search should return results")
    })
  }

  private async testOrderProcessing(): Promise<void> {
    // Test order creation
    await this.runTest("order-processing", "create-order", async () => {
      const customers = await enhancedMockDatabaseService.getCustomers()
      const products = await enhancedMockDatabaseService.getProducts()

      if (customers.length === 0 || products.length === 0) {
        throw new Error("Need customers and products for order test")
      }

      const customer = customers[0]
      const product = products[0]

      const order = await enhancedMockDatabaseService.createOrder({
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            quantity: 2,
            price: product.price,
            total: product.price * 2,
          },
        ],
        subtotal: product.price * 2,
        shipping: 100,
        tax: Math.floor(product.price * 2 * 0.07),
        total: product.price * 2 + 100 + Math.floor(product.price * 2 * 0.07),
        status: "pending",
        shipping_address: customer.address,
      })

      if (!order.id) throw new Error("Order ID not generated")
      if (order.items.length !== 1) throw new Error("Order items not saved correctly")
    })

    // Test stock reduction
    await this.runTest("order-processing", "stock-reduction", async () => {
      const products = await enhancedMockDatabaseService.getProducts()
      const product = products.find((p) => p.stock > 5)

      if (!product) throw new Error("Need product with stock > 5 for test")

      const initialStock = product.stock
      const customers = await enhancedMockDatabaseService.getCustomers()

      await enhancedMockDatabaseService.createOrder({
        customer_id: customers[0].id,
        customer_name: customers[0].name,
        customer_email: customers[0].email,
        customer_phone: customers[0].phone,
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            quantity: 3,
            price: product.price,
            total: product.price * 3,
          },
        ],
        subtotal: product.price * 3,
        shipping: 100,
        tax: 0,
        total: product.price * 3 + 100,
        status: "pending",
        shipping_address: customers[0].address,
      })

      const updatedProduct = await enhancedMockDatabaseService.getProduct(product.id)
      if (!updatedProduct) throw new Error("Product not found after order")
      if (updatedProduct.stock !== initialStock - 3) {
        throw new Error(`Stock not reduced correctly. Expected: ${initialStock - 3}, Got: ${updatedProduct.stock}`)
      }
    })
  }

  private async testCustomerManagement(): Promise<void> {
    // Test customer creation
    await this.runTest("customer-management", "create-customer", async () => {
      const customer = await enhancedMockDatabaseService.createCustomer({
        name: "Test Customer",
        email: "test@example.com",
        phone: "0812345678",
        address: "Test Address 123",
        total_orders: 0,
        total_spent: 0,
        status: "active",
      })

      if (!customer.id) throw new Error("Customer ID not generated")
      if (customer.email !== "test@example.com") throw new Error("Customer email not saved correctly")
    })

    // Test customer validation
    await this.runTest("customer-management", "validate-customer", async () => {
      try {
        await enhancedMockDatabaseService.createCustomer({
          name: "A", // Invalid: too short
          email: "invalid-email", // Invalid: bad format
          phone: "123", // Invalid: too short
          address: "Short", // Invalid: too short
          total_orders: 0,
          total_spent: 0,
          status: "active",
        })
        throw new Error("Validation should have failed")
      } catch (error) {
        if (!error.message.includes("Validation failed")) {
          throw new Error("Expected validation error")
        }
      }
    })
  }

  private async testInventoryTracking(): Promise<void> {
    // Test low stock detection
    await this.runTest("inventory-tracking", "low-stock-detection", async () => {
      await testingUtils.setupFeatureTest("low-stock")

      const products = await enhancedMockDatabaseService.getProducts()
      const lowStockProducts = products.filter((p) => p.stock <= 5)

      if (lowStockProducts.length === 0) {
        throw new Error("Should have low stock products after setup")
      }
    })

    // Test out of stock handling
    await this.runTest("inventory-tracking", "out-of-stock", async () => {
      const products = await enhancedMockDatabaseService.getProducts()
      const product = products[0]

      // Set stock to 0
      await enhancedMockDatabaseService.updateProduct(product.id, {
        stock: 0,
        status: "out_of_stock",
      })

      const updatedProduct = await enhancedMockDatabaseService.getProduct(product.id)
      if (!updatedProduct) throw new Error("Product not found")
      if (updatedProduct.status !== "out_of_stock") {
        throw new Error("Product status not updated to out_of_stock")
      }
    })
  }

  private async runTest(feature: string, testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = performance.now()

    try {
      await testFn()
      const duration = performance.now() - startTime

      this.testResults.push({
        feature,
        test: testName,
        status: "passed",
        duration,
      })

      console.log(`✅ [${feature}] ${testName} - PASSED (${duration.toFixed(2)}ms)`)
    } catch (error) {
      const duration = performance.now() - startTime

      this.testResults.push({
        feature,
        test: testName,
        status: "failed",
        message: error.message,
        duration,
      })

      console.log(`❌ [${feature}] ${testName} - FAILED: ${error.message} (${duration.toFixed(2)}ms)`)
    }
  }

  private printTestResults(feature: string): void {
    const featureTests = this.testResults.filter((t) => t.feature === feature)
    const passed = featureTests.filter((t) => t.status === "passed").length
    const failed = featureTests.filter((t) => t.status === "failed").length
    const totalTime = featureTests.reduce((sum, t) => sum + t.duration, 0)

    console.log(`\n📊 [TEST RESULTS] ${feature}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏱️  Total Time: ${totalTime.toFixed(2)}ms`)
    console.log(`📈 Success Rate: ${((passed / featureTests.length) * 100).toFixed(1)}%\n`)
  }

  getTestResults(): typeof this.testResults {
    return [...this.testResults]
  }

  clearResults(): void {
    this.testResults = []
  }
}

// Export singleton instance
export const featureTester = new FeatureTester()

// Utility functions for easy testing
export const runFeatureTest = async (feature: string): Promise<void> => {
  await featureTester.runFeatureTests(feature)
}

export const runAllFeatureTests = async (): Promise<void> => {
  const features = ["product-management", "order-processing", "customer-management", "inventory-tracking"]

  console.log("🚀 [FEATURE TESTS] Starting comprehensive feature testing...\n")

  for (const feature of features) {
    await featureTester.runFeatureTests(feature)
  }

  const results = featureTester.getTestResults()
  const totalPassed = results.filter((r) => r.status === "passed").length
  const totalFailed = results.filter((r) => r.status === "failed").length
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0)

  console.log("🏁 [COMPREHENSIVE TEST RESULTS]")
  console.log(`✅ Total Passed: ${totalPassed}`)
  console.log(`❌ Total Failed: ${totalFailed}`)
  console.log(`⏱️  Total Time: ${totalTime.toFixed(2)}ms`)
  console.log(`📈 Overall Success Rate: ${((totalPassed / results.length) * 100).toFixed(1)}%`)
}
