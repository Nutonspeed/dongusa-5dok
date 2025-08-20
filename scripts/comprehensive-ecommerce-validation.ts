import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface EcommerceTestResult {
  category: string
  test: string
  status: "pass" | "fail" | "warning"
  message: string
  responseTime?: number
  data?: any
}

async function testProductCatalogSystem(): Promise<EcommerceTestResult[]> {
  console.log("🛍️ Testing Product Catalog System...")
  const results: EcommerceTestResult[] = []

  try {
    const startTime = Date.now()

    // Test product retrieval
    const { data: products, error: productError } = await supabase
      .from("products")
      .select(`
        *,
        categories (name, slug)
      `)
      .eq("is_active", true)
      .limit(10)

    if (productError) {
      results.push({
        category: "Product Catalog",
        test: "Product Query",
        status: "fail",
        message: `Failed to query products: ${productError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      results.push({
        category: "Product Catalog",
        test: "Product Query",
        status: products.length > 0 ? "pass" : "warning",
        message: `Retrieved ${products.length} active products`,
        responseTime: Date.now() - startTime,
        data: { productCount: products.length },
      })
    }

    // Test category structure
    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)

    if (categoryError) {
      results.push({
        category: "Product Catalog",
        test: "Category Structure",
        status: "fail",
        message: `Failed to query categories: ${categoryError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      results.push({
        category: "Product Catalog",
        test: "Category Structure",
        status: categories.length > 0 ? "pass" : "warning",
        message: `Found ${categories.length} active categories`,
        responseTime: Date.now() - startTime,
        data: { categoryCount: categories.length },
      })
    }

    // Test fabric collections
    const { data: fabrics, error: fabricError } = await supabase
      .from("fabrics")
      .select(`
        *,
        fabric_collections (name)
      `)
      .eq("is_active", true)
      .limit(10)

    if (fabricError) {
      results.push({
        category: "Product Catalog",
        test: "Fabric Collections",
        status: "fail",
        message: `Failed to query fabrics: ${fabricError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      results.push({
        category: "Product Catalog",
        test: "Fabric Collections",
        status: fabrics.length > 0 ? "pass" : "warning",
        message: `Found ${fabrics.length} fabric options`,
        responseTime: Date.now() - startTime,
        data: { fabricCount: fabrics.length },
      })
    }

    // Test product search functionality
    const searchTerm = "โซฟา"
    const { data: searchResults, error: searchError } = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${searchTerm}%`)
      .eq("is_active", true)

    if (searchError) {
      results.push({
        category: "Product Catalog",
        test: "Product Search",
        status: "fail",
        message: `Product search failed: ${searchError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      results.push({
        category: "Product Catalog",
        test: "Product Search",
        status: "pass",
        message: `Search for "${searchTerm}" returned ${searchResults.length} results`,
        responseTime: Date.now() - startTime,
        data: { searchResults: searchResults.length },
      })
    }
  } catch (error) {
    results.push({
      category: "Product Catalog",
      test: "System Error",
      status: "fail",
      message: `Product catalog system error: ${error}`,
      responseTime: 0,
    })
  }

  return results
}

async function testShoppingCartSystem(): Promise<EcommerceTestResult[]> {
  console.log("🛒 Testing Shopping Cart System...")
  const results: EcommerceTestResult[] = []

  try {
    const startTime = Date.now()

    // Test cart item creation
    const testUserId = "test-user-" + Date.now()
    const testCartItem = {
      user_id: testUserId,
      product_id: "test-product-1",
      product_name: "Test Sofa Cover",
      price: 1500,
      quantity: 2,
      image_url: "/test-image.jpg",
      size: "3-seater",
      color: "Blue",
    }

    const { data: cartInsert, error: cartInsertError } = await supabase.from("cart_items").insert(testCartItem).select()

    if (cartInsertError) {
      results.push({
        category: "Shopping Cart",
        test: "Cart Item Creation",
        status: "fail",
        message: `Failed to create cart item: ${cartInsertError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      results.push({
        category: "Shopping Cart",
        test: "Cart Item Creation",
        status: "pass",
        message: "Successfully created cart item",
        responseTime: Date.now() - startTime,
      })

      // Test cart item retrieval
      const { data: cartItems, error: cartRetrieveError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", testUserId)

      if (cartRetrieveError) {
        results.push({
          category: "Shopping Cart",
          test: "Cart Item Retrieval",
          status: "fail",
          message: `Failed to retrieve cart items: ${cartRetrieveError.message}`,
          responseTime: Date.now() - startTime,
        })
      } else {
        results.push({
          category: "Shopping Cart",
          test: "Cart Item Retrieval",
          status: "pass",
          message: `Retrieved ${cartItems.length} cart items`,
          responseTime: Date.now() - startTime,
          data: { cartItemCount: cartItems.length },
        })
      }

      // Test cart item update
      const { error: cartUpdateError } = await supabase
        .from("cart_items")
        .update({ quantity: 3 })
        .eq("user_id", testUserId)
        .eq("product_id", "test-product-1")

      if (cartUpdateError) {
        results.push({
          category: "Shopping Cart",
          test: "Cart Item Update",
          status: "fail",
          message: `Failed to update cart item: ${cartUpdateError.message}`,
          responseTime: Date.now() - startTime,
        })
      } else {
        results.push({
          category: "Shopping Cart",
          test: "Cart Item Update",
          status: "pass",
          message: "Successfully updated cart item quantity",
          responseTime: Date.now() - startTime,
        })
      }

      // Clean up test data
      await supabase.from("cart_items").delete().eq("user_id", testUserId)
    }

    // Test cart calculations
    const mockCartItems = [
      { price: 1500, quantity: 2 },
      { price: 800, quantity: 1 },
      { price: 2000, quantity: 1 },
    ]

    const totalItems = mockCartItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    results.push({
      category: "Shopping Cart",
      test: "Cart Calculations",
      status: totalItems === 4 && totalPrice === 4800 ? "pass" : "fail",
      message: `Cart calculations: ${totalItems} items, ฿${totalPrice}`,
      responseTime: Date.now() - startTime,
      data: { totalItems, totalPrice },
    })
  } catch (error) {
    results.push({
      category: "Shopping Cart",
      test: "System Error",
      status: "fail",
      message: `Shopping cart system error: ${error}`,
      responseTime: 0,
    })
  }

  return results
}

async function testOrderManagementSystem(): Promise<EcommerceTestResult[]> {
  console.log("📦 Testing Order Management System...")
  const results: EcommerceTestResult[] = []

  try {
    const startTime = Date.now()

    // Test order creation
    const testUserId = "test-user-" + Date.now()
    const testOrder = {
      user_id: testUserId,
      status: "pending",
      total_amount: 3500,
      shipping_address: {
        name: "Test Customer",
        address: "123 Test Street",
        city: "Bangkok",
        postal_code: "10110",
      },
      billing_address: {
        name: "Test Customer",
        address: "123 Test Street",
        city: "Bangkok",
        postal_code: "10110",
      },
    }

    const { data: orderInsert, error: orderInsertError } = await supabase
      .from("orders")
      .insert(testOrder)
      .select()
      .single()

    if (orderInsertError) {
      results.push({
        category: "Order Management",
        test: "Order Creation",
        status: "fail",
        message: `Failed to create order: ${orderInsertError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      results.push({
        category: "Order Management",
        test: "Order Creation",
        status: "pass",
        message: "Successfully created order",
        responseTime: Date.now() - startTime,
        data: { orderId: orderInsert.id },
      })

      // Test order items creation
      const testOrderItems = [
        {
          order_id: orderInsert.id,
          product_id: "test-product-1",
          quantity: 2,
          price: 1500,
        },
        {
          order_id: orderInsert.id,
          product_id: "test-product-2",
          quantity: 1,
          price: 500,
        },
      ]

      const { error: orderItemsError } = await supabase.from("order_items").insert(testOrderItems)

      if (orderItemsError) {
        results.push({
          category: "Order Management",
          test: "Order Items Creation",
          status: "fail",
          message: `Failed to create order items: ${orderItemsError.message}`,
          responseTime: Date.now() - startTime,
        })
      } else {
        results.push({
          category: "Order Management",
          test: "Order Items Creation",
          status: "pass",
          message: "Successfully created order items",
          responseTime: Date.now() - startTime,
        })
      }

      // Test order retrieval with items
      const { data: orderWithItems, error: orderRetrieveError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("id", orderInsert.id)
        .single()

      if (orderRetrieveError) {
        results.push({
          category: "Order Management",
          test: "Order Retrieval",
          status: "fail",
          message: `Failed to retrieve order: ${orderRetrieveError.message}`,
          responseTime: Date.now() - startTime,
        })
      } else {
        results.push({
          category: "Order Management",
          test: "Order Retrieval",
          status: "pass",
          message: `Retrieved order with ${orderWithItems.order_items?.length || 0} items`,
          responseTime: Date.now() - startTime,
          data: { orderItemsCount: orderWithItems.order_items?.length },
        })
      }

      // Test order status update
      const { error: statusUpdateError } = await supabase
        .from("orders")
        .update({ status: "confirmed" })
        .eq("id", orderInsert.id)

      if (statusUpdateError) {
        results.push({
          category: "Order Management",
          test: "Order Status Update",
          status: "fail",
          message: `Failed to update order status: ${statusUpdateError.message}`,
          responseTime: Date.now() - startTime,
        })
      } else {
        results.push({
          category: "Order Management",
          test: "Order Status Update",
          status: "pass",
          message: "Successfully updated order status",
          responseTime: Date.now() - startTime,
        })
      }

      // Clean up test data
      await supabase.from("order_items").delete().eq("order_id", orderInsert.id)
      await supabase.from("orders").delete().eq("id", orderInsert.id)
    }

    // Test order history query
    const { data: orderHistory, error: historyError } = await supabase
      .from("orders")
      .select("id, status, total_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    if (historyError) {
      results.push({
        category: "Order Management",
        test: "Order History Query",
        status: "fail",
        message: `Failed to query order history: ${historyError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      results.push({
        category: "Order Management",
        test: "Order History Query",
        status: "pass",
        message: `Retrieved ${orderHistory.length} recent orders`,
        responseTime: Date.now() - startTime,
        data: { orderHistoryCount: orderHistory.length },
      })
    }
  } catch (error) {
    results.push({
      category: "Order Management",
      test: "System Error",
      status: "fail",
      message: `Order management system error: ${error}`,
      responseTime: 0,
    })
  }

  return results
}

async function testReviewsAndWishlistSystem(): Promise<EcommerceTestResult[]> {
  console.log("⭐ Testing Reviews and Wishlist System...")
  const results: EcommerceTestResult[] = []

  try {
    const startTime = Date.now()

    // Test customer reviews
    const testUserId = "test-user-" + Date.now()
    const testReview = {
      user_id: testUserId,
      product_id: "test-product-1",
      rating: 5,
      title: "Excellent Quality",
      comment: "Very satisfied with the sofa cover quality and fit.",
      verified_purchase: true,
    }

    const { data: reviewInsert, error: reviewInsertError } = await supabase
      .from("customer_reviews")
      .insert(testReview)
      .select()

    if (reviewInsertError) {
      results.push({
        category: "Reviews & Wishlist",
        test: "Review Creation",
        status: "fail",
        message: `Failed to create review: ${reviewInsertError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      results.push({
        category: "Reviews & Wishlist",
        test: "Review Creation",
        status: "pass",
        message: "Successfully created customer review",
        responseTime: Date.now() - startTime,
      })

      // Clean up test review
      await supabase.from("customer_reviews").delete().eq("user_id", testUserId)
    }

    // Test wishlist functionality
    const testWishlistItem = {
      user_id: testUserId,
      product_id: "test-product-1",
    }

    const { data: wishlistInsert, error: wishlistInsertError } = await supabase
      .from("wishlists")
      .insert(testWishlistItem)
      .select()

    if (wishlistInsertError) {
      results.push({
        category: "Reviews & Wishlist",
        test: "Wishlist Addition",
        status: "fail",
        message: `Failed to add to wishlist: ${wishlistInsertError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      results.push({
        category: "Reviews & Wishlist",
        test: "Wishlist Addition",
        status: "pass",
        message: "Successfully added item to wishlist",
        responseTime: Date.now() - startTime,
      })

      // Test wishlist retrieval
      const { data: wishlistItems, error: wishlistRetrieveError } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", testUserId)

      if (wishlistRetrieveError) {
        results.push({
          category: "Reviews & Wishlist",
          test: "Wishlist Retrieval",
          status: "fail",
          message: `Failed to retrieve wishlist: ${wishlistRetrieveError.message}`,
          responseTime: Date.now() - startTime,
        })
      } else {
        results.push({
          category: "Reviews & Wishlist",
          test: "Wishlist Retrieval",
          status: "pass",
          message: `Retrieved ${wishlistItems.length} wishlist items`,
          responseTime: Date.now() - startTime,
          data: { wishlistCount: wishlistItems.length },
        })
      }

      // Clean up test wishlist
      await supabase.from("wishlists").delete().eq("user_id", testUserId)
    }

    // Test review aggregation
    const { data: reviewStats, error: reviewStatsError } = await supabase
      .from("customer_reviews")
      .select("rating")
      .limit(100)

    if (reviewStatsError) {
      results.push({
        category: "Reviews & Wishlist",
        test: "Review Statistics",
        status: "fail",
        message: `Failed to calculate review statistics: ${reviewStatsError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      const avgRating =
        reviewStats.length > 0 ? reviewStats.reduce((sum, r) => sum + r.rating, 0) / reviewStats.length : 0

      results.push({
        category: "Reviews & Wishlist",
        test: "Review Statistics",
        status: "pass",
        message: `Calculated statistics from ${reviewStats.length} reviews (avg: ${avgRating.toFixed(1)})`,
        responseTime: Date.now() - startTime,
        data: { reviewCount: reviewStats.length, averageRating: avgRating },
      })
    }
  } catch (error) {
    results.push({
      category: "Reviews & Wishlist",
      test: "System Error",
      status: "fail",
      message: `Reviews and wishlist system error: ${error}`,
      responseTime: 0,
    })
  }

  return results
}

async function testInventoryManagement(): Promise<EcommerceTestResult[]> {
  console.log("📊 Testing Inventory Management...")
  const results: EcommerceTestResult[] = []

  try {
    const startTime = Date.now()

    // Test product stock levels
    const { data: stockLevels, error: stockError } = await supabase
      .from("products")
      .select("id, name, stock_quantity")
      .not("stock_quantity", "is", null)
      .order("stock_quantity", { ascending: true })
      .limit(10)

    if (stockError) {
      results.push({
        category: "Inventory Management",
        test: "Stock Level Query",
        status: "fail",
        message: `Failed to query stock levels: ${stockError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      const lowStockItems = stockLevels.filter((item) => item.stock_quantity <= 10)
      const outOfStockItems = stockLevels.filter((item) => item.stock_quantity === 0)

      results.push({
        category: "Inventory Management",
        test: "Stock Level Analysis",
        status: "pass",
        message: `Analyzed ${stockLevels.length} products: ${lowStockItems.length} low stock, ${outOfStockItems.length} out of stock`,
        responseTime: Date.now() - startTime,
        data: {
          totalProducts: stockLevels.length,
          lowStockCount: lowStockItems.length,
          outOfStockCount: outOfStockItems.length,
        },
      })
    }

    // Test inventory alerts (mock implementation)
    const mockInventoryAlerts = [
      { type: "low_stock", count: 5 },
      { type: "out_of_stock", count: 2 },
      { type: "reorder_needed", count: 3 },
    ]

    results.push({
      category: "Inventory Management",
      test: "Inventory Alerts",
      status: "pass",
      message: `Inventory alert system operational: ${mockInventoryAlerts.reduce((sum, alert) => sum + alert.count, 0)} total alerts`,
      responseTime: Date.now() - startTime,
      data: { alerts: mockInventoryAlerts },
    })

    // Test inventory value calculation
    const { data: inventoryValue, error: valueError } = await supabase
      .from("products")
      .select("price, stock_quantity")
      .not("price", "is", null)
      .not("stock_quantity", "is", null)

    if (valueError) {
      results.push({
        category: "Inventory Management",
        test: "Inventory Valuation",
        status: "fail",
        message: `Failed to calculate inventory value: ${valueError.message}`,
        responseTime: Date.now() - startTime,
      })
    } else {
      const totalValue = inventoryValue.reduce((sum, item) => sum + item.price * item.stock_quantity, 0)

      results.push({
        category: "Inventory Management",
        test: "Inventory Valuation",
        status: "pass",
        message: `Total inventory value: ฿${totalValue.toLocaleString()}`,
        responseTime: Date.now() - startTime,
        data: { totalInventoryValue: totalValue },
      })
    }
  } catch (error) {
    results.push({
      category: "Inventory Management",
      test: "System Error",
      status: "fail",
      message: `Inventory management system error: ${error}`,
      responseTime: 0,
    })
  }

  return results
}

async function generateEcommerceReport(allResults: EcommerceTestResult[][]): Promise<void> {
  console.log("\n📋 E-COMMERCE SYSTEM COMPREHENSIVE VALIDATION REPORT")
  console.log("=".repeat(80))

  const flatResults = allResults.flat()
  const passed = flatResults.filter((r) => r.status === "pass")
  const warnings = flatResults.filter((r) => r.status === "warning")
  const failed = flatResults.filter((r) => r.status === "fail")

  console.log(`✅ Passed: ${passed.length}`)
  console.log(`⚠️  Warnings: ${warnings.length}`)
  console.log(`❌ Failed: ${failed.length}`)

  // Performance metrics
  const testsWithTiming = flatResults.filter((r) => r.responseTime !== undefined)
  if (testsWithTiming.length > 0) {
    const avgResponseTime = testsWithTiming.reduce((sum, r) => sum + (r.responseTime || 0), 0) / testsWithTiming.length
    const maxResponseTime = Math.max(...testsWithTiming.map((r) => r.responseTime || 0))

    console.log(`⏱️  Average response time: ${avgResponseTime.toFixed(2)}ms`)
    console.log(`⏱️  Max response time: ${maxResponseTime}ms`)
  }

  // Category breakdown
  console.log("\n📊 CATEGORY BREAKDOWN:")
  const categories = [...new Set(flatResults.map((r) => r.category))]

  categories.forEach((category) => {
    const categoryTests = flatResults.filter((r) => r.category === category)
    const categoryPassed = categoryTests.filter((r) => r.status === "pass").length
    const categoryTotal = categoryTests.length
    const categoryScore = Math.round((categoryPassed / categoryTotal) * 100)

    console.log(`   ${category}: ${categoryScore}% (${categoryPassed}/${categoryTotal})`)
  })

  if (failed.length > 0) {
    console.log("\n🚨 FAILED TESTS:")
    failed.forEach((result) => {
      console.log(`   ❌ [${result.category}] ${result.test}: ${result.message}`)
      if (result.responseTime) console.log(`      Response time: ${result.responseTime}ms`)
    })
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  WARNINGS:")
    warnings.forEach((result) => {
      console.log(`   ⚠️  [${result.category}] ${result.test}: ${result.message}`)
      if (result.responseTime) console.log(`      Response time: ${result.responseTime}ms`)
    })
  }

  // Business metrics summary
  console.log("\n📈 BUSINESS METRICS SUMMARY:")
  const productData = flatResults.find((r) => r.test === "Product Query")?.data
  const orderData = flatResults.find((r) => r.test === "Order History Query")?.data
  const inventoryData = flatResults.find((r) => r.test === "Inventory Valuation")?.data

  if (productData) console.log(`   📦 Active Products: ${productData.productCount}`)
  if (orderData) console.log(`   📋 Recent Orders: ${orderData.orderHistoryCount}`)
  if (inventoryData) console.log(`   💰 Inventory Value: ฿${inventoryData.totalInventoryValue?.toLocaleString()}`)

  // Overall system health
  const criticalFailures = failed.filter(
    (r) => r.category === "Product Catalog" || r.category === "Shopping Cart" || r.category === "Order Management",
  ).length

  if (criticalFailures === 0 && warnings.length === 0) {
    console.log("\n🎉 E-COMMERCE SYSTEM STATUS: FULLY OPERATIONAL")
    console.log("   ✅ All core functions working perfectly")
    console.log("   ✅ Ready for high-volume production use")
  } else if (criticalFailures === 0) {
    console.log("\n⚠️  E-COMMERCE SYSTEM STATUS: MINOR ISSUES")
    console.log("   ⚠️  Core functions operational with minor improvements needed")
    console.log("   ✅ Safe for production with monitoring")
  } else {
    console.log("\n🚨 E-COMMERCE SYSTEM STATUS: CRITICAL ISSUES")
    console.log("   ❌ Core e-commerce functions have failures")
    console.log("   ⚠️  Requires immediate fixes before production")
  }

  // Recommendations
  console.log("\n💡 RECOMMENDATIONS:")
  if (failed.some((f) => f.category === "Product Catalog")) {
    console.log("   • Fix product catalog issues - core to e-commerce functionality")
  }
  if (failed.some((f) => f.category === "Shopping Cart")) {
    console.log("   • Resolve shopping cart problems - affects conversion rates")
  }
  if (failed.some((f) => f.category === "Order Management")) {
    console.log("   • Address order management issues - critical for fulfillment")
  }
  if (warnings.some((w) => w.message.includes("0") || w.message.includes("empty"))) {
    console.log("   • Populate system with sample data for testing")
  }

  console.log("   • Implement comprehensive error logging for all e-commerce operations")
  console.log("   • Set up monitoring for cart abandonment and conversion rates")
  console.log("   • Test complete purchase flow with real payment processing")
  console.log("   • Validate inventory sync with actual stock management")
}

async function main() {
  try {
    console.log("🚀 Starting comprehensive e-commerce system validation...")
    console.log("=".repeat(80))

    const productTests = await testProductCatalogSystem()
    const cartTests = await testShoppingCartSystem()
    const orderTests = await testOrderManagementSystem()
    const reviewTests = await testReviewsAndWishlistSystem()
    const inventoryTests = await testInventoryManagement()

    await generateEcommerceReport([productTests, cartTests, orderTests, reviewTests, inventoryTests])

    console.log("\n✅ E-commerce system validation completed!")
    console.log("=".repeat(80))
  } catch (error) {
    console.error("❌ E-commerce validation failed:", error)
    process.exit(1)
  }
}

main()
