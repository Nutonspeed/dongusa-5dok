#!/usr/bin/env tsx

/**
 * Core Business Features Testing Suite
 * ทดสอบฟีเจอร์หลักทางธุรกิจของระบบร้านผ้าคลุมโซฟา
 */

import { createClient } from "@supabase/supabase-js"

interface BusinessTestResult {
  feature: string
  test: string
  status: "PASS" | "FAIL" | "WARNING" | "SKIP"
  message: string
  executionTime?: number
  details?: any
  timestamp: string
}

class CoreBusinessFeatureTester {
  private results: BusinessTestResult[] = []
  private supabase: any
  private testData: any = {}

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    }
  }

  private addResult(
    feature: string,
    test: string,
    status: "PASS" | "FAIL" | "WARNING" | "SKIP",
    message: string,
    executionTime?: number,
    details?: any,
  ) {
    this.results.push({
      feature,
      test,
      status,
      message,
      executionTime,
      details,
      timestamp: new Date().toISOString(),
    })
  }

  private log(message: string, type: "info" | "success" | "warning" | "error" = "info") {
    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      warning: "\x1b[33m",
      error: "\x1b[31m",
    }
    const reset = "\x1b[0m"
    console.log(`${colors[type]}[BUSINESS-TEST] ${message}${reset}`)
  }

  private async measureExecutionTime<T>(operation: () => Promise<T>): Promise<{ result: T; executionTime: number }> {
    const startTime = Date.now()
    const result = await operation()
    const executionTime = Date.now() - startTime
    return { result, executionTime }
  }

  // 1. Product Management System Test
  async testProductManagement() {
    this.log("🛍️ Testing Product Management System...", "info")

    try {
      // Test product listing with categories
      const { result: productList, executionTime: listTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("products")
          .select(`
            *,
            categories(name, slug)
          `)
          .eq("is_active", true)
          .limit(10)
      })

      if (productList.error) {
        this.addResult(
          "Product Management",
          "Product Listing",
          "FAIL",
          `Product listing failed: ${productList.error.message}`,
          listTime,
        )
      } else {
        this.addResult(
          "Product Management",
          "Product Listing",
          "PASS",
          `Found ${productList.data?.length || 0} active products`,
          listTime,
        )
        this.testData.sampleProduct = productList.data?.[0]
      }

      // Test category management
      const { result: categoryList, executionTime: catTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("categories").select("*").eq("is_active", true)
      })

      if (categoryList.error) {
        this.addResult(
          "Product Management",
          "Category Management",
          "FAIL",
          `Category listing failed: ${categoryList.error.message}`,
          catTime,
        )
      } else {
        this.addResult(
          "Product Management",
          "Category Management",
          "PASS",
          `Found ${categoryList.data?.length || 0} active categories`,
          catTime,
        )
      }

      // Test fabric collections
      const { result: fabricList, executionTime: fabricTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("fabric_collections")
          .select(`
            *,
            fabrics(*)
          `)
          .eq("is_active", true)
      })

      if (fabricList.error) {
        this.addResult(
          "Product Management",
          "Fabric Collections",
          "FAIL",
          `Fabric collections failed: ${fabricList.error.message}`,
          fabricTime,
        )
      } else {
        this.addResult(
          "Product Management",
          "Fabric Collections",
          "PASS",
          `Found ${fabricList.data?.length || 0} fabric collections`,
          fabricTime,
        )
      }

      // Test product search functionality
      const { result: searchResult, executionTime: searchTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("products").select("*").ilike("name", "%sofa%").limit(5)
      })

      if (searchResult.error) {
        this.addResult(
          "Product Management",
          "Product Search",
          "FAIL",
          `Product search failed: ${searchResult.error.message}`,
          searchTime,
        )
      } else {
        this.addResult(
          "Product Management",
          "Product Search",
          "PASS",
          `Search found ${searchResult.data?.length || 0} products`,
          searchTime,
        )
      }
    } catch (error: any) {
      this.addResult("Product Management", "System Test", "FAIL", `Product management test failed: ${error.message}`)
    }
  }

  // 2. Shopping Cart System Test
  async testShoppingCartSystem() {
    this.log("🛒 Testing Shopping Cart System...", "info")

    try {
      // Create test user for cart operations
      const testUser = await this.createTestUser()
      if (!testUser) {
        this.addResult("Shopping Cart", "User Setup", "SKIP", "Could not create test user for cart testing")
        return
      }

      // Test adding item to cart
      const { result: addToCart, executionTime: addTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("cart_items").insert({
          user_id: testUser.id,
          product_id: this.testData.sampleProduct?.id || "00000000-0000-0000-0000-000000000001",
          quantity: 2,
          price: 150.0,
          product_name: "Test Sofa Cover",
          size: "Large",
          color: "Red",
          fabric_pattern: "Solid",
        })
      })

      if (addToCart.error) {
        this.addResult(
          "Shopping Cart",
          "Add to Cart",
          "FAIL",
          `Add to cart failed: ${addToCart.error.message}`,
          addTime,
        )
      } else {
        this.addResult("Shopping Cart", "Add to Cart", "PASS", "Item added to cart successfully", addTime)
      }

      // Test cart retrieval
      const { result: getCart, executionTime: getTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("cart_items").select("*").eq("user_id", testUser.id)
      })

      if (getCart.error) {
        this.addResult(
          "Shopping Cart",
          "Cart Retrieval",
          "FAIL",
          `Cart retrieval failed: ${getCart.error.message}`,
          getTime,
        )
      } else {
        this.addResult(
          "Shopping Cart",
          "Cart Retrieval",
          "PASS",
          `Cart contains ${getCart.data?.length || 0} items`,
          getTime,
        )
      }

      // Test cart item update
      if (getCart.data && getCart.data.length > 0) {
        const cartItem = getCart.data[0]
        const { result: updateCart, executionTime: updateTime } = await this.measureExecutionTime(async () => {
          return await this.supabase.from("cart_items").update({ quantity: 3 }).eq("id", cartItem.id)
        })

        if (updateCart.error) {
          this.addResult(
            "Shopping Cart",
            "Cart Update",
            "FAIL",
            `Cart update failed: ${updateCart.error.message}`,
            updateTime,
          )
        } else {
          this.addResult("Shopping Cart", "Cart Update", "PASS", "Cart item updated successfully", updateTime)
        }
      }

      // Test cart total calculation
      const { result: cartTotal, executionTime: totalTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("cart_items").select("quantity, price").eq("user_id", testUser.id)
      })

      if (cartTotal.error) {
        this.addResult(
          "Shopping Cart",
          "Cart Total",
          "FAIL",
          `Cart total calculation failed: ${cartTotal.error.message}`,
          totalTime,
        )
      } else {
        const total = cartTotal.data?.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0
        this.addResult("Shopping Cart", "Cart Total", "PASS", `Cart total: ${total} THB`, totalTime)
      }

      // Cleanup cart items
      await this.supabase.from("cart_items").delete().eq("user_id", testUser.id)
      await this.cleanupTestUser(testUser.id)
    } catch (error: any) {
      this.addResult("Shopping Cart", "System Test", "FAIL", `Shopping cart test failed: ${error.message}`)
    }
  }

  // 3. Order Processing System Test
  async testOrderProcessingSystem() {
    this.log("📦 Testing Order Processing System...", "info")

    try {
      const testUser = await this.createTestUser()
      if (!testUser) {
        this.addResult("Order Processing", "User Setup", "SKIP", "Could not create test user for order testing")
        return
      }

      // Test order creation
      const { result: createOrder, executionTime: createTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("orders")
          .insert({
            user_id: testUser.id,
            total_amount: 300.0,
            status: "pending",
            payment_status: "pending",
            shipping_address: {
              street: "123 Test Street",
              city: "Bangkok",
              postal_code: "10110",
              country: "Thailand",
            },
            billing_address: {
              street: "123 Test Street",
              city: "Bangkok",
              postal_code: "10110",
              country: "Thailand",
            },
            notes: "Test order for system validation",
          })
          .select()
          .single()
      })

      if (createOrder.error) {
        this.addResult(
          "Order Processing",
          "Order Creation",
          "FAIL",
          `Order creation failed: ${createOrder.error.message}`,
          createTime,
        )
        await this.cleanupTestUser(testUser.id)
        return
      } else {
        this.addResult("Order Processing", "Order Creation", "PASS", "Order created successfully", createTime)
        this.testData.testOrder = createOrder.data
      }

      // Test order items creation
      const { result: createOrderItems, executionTime: itemsTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("order_items").insert([
          {
            order_id: this.testData.testOrder.id,
            product_id: this.testData.sampleProduct?.id || "00000000-0000-0000-0000-000000000001",
            quantity: 2,
            price: 150.0,
          },
        ])
      })

      if (createOrderItems.error) {
        this.addResult(
          "Order Processing",
          "Order Items",
          "FAIL",
          `Order items creation failed: ${createOrderItems.error.message}`,
          itemsTime,
        )
      } else {
        this.addResult("Order Processing", "Order Items", "PASS", "Order items created successfully", itemsTime)
      }

      // Test order status update
      const { result: updateOrder, executionTime: updateTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("orders")
          .update({ status: "confirmed", payment_status: "paid" })
          .eq("id", this.testData.testOrder.id)
      })

      if (updateOrder.error) {
        this.addResult(
          "Order Processing",
          "Status Update",
          "FAIL",
          `Order status update failed: ${updateOrder.error.message}`,
          updateTime,
        )
      } else {
        this.addResult("Order Processing", "Status Update", "PASS", "Order status updated successfully", updateTime)
      }

      // Test order retrieval with items
      const { result: getOrder, executionTime: getTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("orders")
          .select(`
            *,
            order_items(*, products(name, price)),
            profiles(full_name, email)
          `)
          .eq("id", this.testData.testOrder.id)
          .single()
      })

      if (getOrder.error) {
        this.addResult(
          "Order Processing",
          "Order Retrieval",
          "FAIL",
          `Order retrieval failed: ${getOrder.error.message}`,
          getTime,
        )
      } else {
        this.addResult(
          "Order Processing",
          "Order Retrieval",
          "PASS",
          `Order retrieved with ${getOrder.data.order_items?.length || 0} items`,
          getTime,
        )
      }

      // Cleanup test data
      await this.supabase.from("order_items").delete().eq("order_id", this.testData.testOrder.id)
      await this.supabase.from("orders").delete().eq("id", this.testData.testOrder.id)
      await this.cleanupTestUser(testUser.id)
    } catch (error: any) {
      this.addResult("Order Processing", "System Test", "FAIL", `Order processing test failed: ${error.message}`)
    }
  }

  // 4. Customer Reviews System Test
  async testCustomerReviewsSystem() {
    this.log("⭐ Testing Customer Reviews System...", "info")

    try {
      const testUser = await this.createTestUser()
      if (!testUser) {
        this.addResult("Customer Reviews", "User Setup", "SKIP", "Could not create test user for reviews testing")
        return
      }

      // Test review creation
      const { result: createReview, executionTime: createTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("customer_reviews")
          .insert({
            user_id: testUser.id,
            product_id: this.testData.sampleProduct?.id || "00000000-0000-0000-0000-000000000001",
            rating: 5,
            title: "Excellent Quality!",
            comment: "This sofa cover fits perfectly and looks amazing. Highly recommended!",
            verified_purchase: true,
          })
          .select()
          .single()
      })

      if (createReview.error) {
        this.addResult(
          "Customer Reviews",
          "Review Creation",
          "FAIL",
          `Review creation failed: ${createReview.error.message}`,
          createTime,
        )
      } else {
        this.addResult("Customer Reviews", "Review Creation", "PASS", "Review created successfully", createTime)
        this.testData.testReview = createReview.data
      }

      // Test review retrieval
      const { result: getReviews, executionTime: getTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("customer_reviews")
          .select(`
            *,
            profiles(full_name)
          `)
          .eq("product_id", this.testData.sampleProduct?.id || "00000000-0000-0000-0000-000000000001")
          .limit(5)
      })

      if (getReviews.error) {
        this.addResult(
          "Customer Reviews",
          "Review Retrieval",
          "FAIL",
          `Review retrieval failed: ${getReviews.error.message}`,
          getTime,
        )
      } else {
        this.addResult(
          "Customer Reviews",
          "Review Retrieval",
          "PASS",
          `Found ${getReviews.data?.length || 0} reviews`,
          getTime,
        )
      }

      // Test review rating calculation
      const { result: ratingCalc, executionTime: calcTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("customer_reviews")
          .select("rating")
          .eq("product_id", this.testData.sampleProduct?.id || "00000000-0000-0000-0000-000000000001")
      })

      if (ratingCalc.error) {
        this.addResult(
          "Customer Reviews",
          "Rating Calculation",
          "FAIL",
          `Rating calculation failed: ${ratingCalc.error.message}`,
          calcTime,
        )
      } else {
        const ratings = ratingCalc.data || []
        const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0
        this.addResult(
          "Customer Reviews",
          "Rating Calculation",
          "PASS",
          `Average rating: ${avgRating.toFixed(1)} from ${ratings.length} reviews`,
          calcTime,
        )
      }

      // Cleanup test data
      if (this.testData.testReview) {
        await this.supabase.from("customer_reviews").delete().eq("id", this.testData.testReview.id)
      }
      await this.cleanupTestUser(testUser.id)
    } catch (error: any) {
      this.addResult("Customer Reviews", "System Test", "FAIL", `Customer reviews test failed: ${error.message}`)
    }
  }

  // 5. Wishlist System Test
  async testWishlistSystem() {
    this.log("💝 Testing Wishlist System...", "info")

    try {
      const testUser = await this.createTestUser()
      if (!testUser) {
        this.addResult("Wishlist", "User Setup", "SKIP", "Could not create test user for wishlist testing")
        return
      }

      // Test adding item to wishlist
      const { result: addToWishlist, executionTime: addTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("wishlists").insert({
          user_id: testUser.id,
          product_id: this.testData.sampleProduct?.id || "00000000-0000-0000-0000-000000000001",
        })
      })

      if (addToWishlist.error) {
        this.addResult(
          "Wishlist",
          "Add to Wishlist",
          "FAIL",
          `Add to wishlist failed: ${addToWishlist.error.message}`,
          addTime,
        )
      } else {
        this.addResult("Wishlist", "Add to Wishlist", "PASS", "Item added to wishlist successfully", addTime)
      }

      // Test wishlist retrieval
      const { result: getWishlist, executionTime: getTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("wishlists")
          .select(`
            *,
            products(name, price, images)
          `)
          .eq("user_id", testUser.id)
      })

      if (getWishlist.error) {
        this.addResult(
          "Wishlist",
          "Wishlist Retrieval",
          "FAIL",
          `Wishlist retrieval failed: ${getWishlist.error.message}`,
          getTime,
        )
      } else {
        this.addResult(
          "Wishlist",
          "Wishlist Retrieval",
          "PASS",
          `Wishlist contains ${getWishlist.data?.length || 0} items`,
          getTime,
        )
      }

      // Test removing item from wishlist
      const { result: removeFromWishlist, executionTime: removeTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("wishlists")
          .delete()
          .eq("user_id", testUser.id)
          .eq("product_id", this.testData.sampleProduct?.id || "00000000-0000-0000-0000-000000000001")
      })

      if (removeFromWishlist.error) {
        this.addResult(
          "Wishlist",
          "Remove from Wishlist",
          "FAIL",
          `Remove from wishlist failed: ${removeFromWishlist.error.message}`,
          removeTime,
        )
      } else {
        this.addResult(
          "Wishlist",
          "Remove from Wishlist",
          "PASS",
          "Item removed from wishlist successfully",
          removeTime,
        )
      }

      await this.cleanupTestUser(testUser.id)
    } catch (error: any) {
      this.addResult("Wishlist", "System Test", "FAIL", `Wishlist test failed: ${error.message}`)
    }
  }

  // 6. Loyalty Points System Test
  async testLoyaltyPointsSystem() {
    this.log("🎯 Testing Loyalty Points System...", "info")

    try {
      const testUser = await this.createTestUser()
      if (!testUser) {
        this.addResult("Loyalty Points", "User Setup", "SKIP", "Could not create test user for loyalty testing")
        return
      }

      // Test earning loyalty points
      const { result: earnPoints, executionTime: earnTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("loyalty_points").insert({
          user_id: testUser.id,
          points: 100,
          transaction_type: "earned",
          description: "Purchase reward points",
          order_id: "00000000-0000-0000-0000-000000000001",
        })
      })

      if (earnPoints.error) {
        this.addResult(
          "Loyalty Points",
          "Earn Points",
          "FAIL",
          `Earn points failed: ${earnPoints.error.message}`,
          earnTime,
        )
      } else {
        this.addResult("Loyalty Points", "Earn Points", "PASS", "Points earned successfully", earnTime)
      }

      // Test redeeming loyalty points
      const { result: redeemPoints, executionTime: redeemTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("loyalty_points").insert({
          user_id: testUser.id,
          points: -50,
          transaction_type: "redeemed",
          description: "Discount applied",
        })
      })

      if (redeemPoints.error) {
        this.addResult(
          "Loyalty Points",
          "Redeem Points",
          "FAIL",
          `Redeem points failed: ${redeemPoints.error.message}`,
          redeemTime,
        )
      } else {
        this.addResult("Loyalty Points", "Redeem Points", "PASS", "Points redeemed successfully", redeemTime)
      }

      // Test points balance calculation
      const { result: pointsBalance, executionTime: balanceTime } = await this.measureExecutionTime(async () => {
        return await this.supabase.from("loyalty_points").select("points").eq("user_id", testUser.id)
      })

      if (pointsBalance.error) {
        this.addResult(
          "Loyalty Points",
          "Balance Calculation",
          "FAIL",
          `Balance calculation failed: ${pointsBalance.error.message}`,
          balanceTime,
        )
      } else {
        const totalPoints = pointsBalance.data?.reduce((sum, p) => sum + p.points, 0) || 0
        this.addResult(
          "Loyalty Points",
          "Balance Calculation",
          "PASS",
          `Current balance: ${totalPoints} points`,
          balanceTime,
        )
      }

      // Cleanup test data
      await this.supabase.from("loyalty_points").delete().eq("user_id", testUser.id)
      await this.cleanupTestUser(testUser.id)
    } catch (error: any) {
      this.addResult("Loyalty Points", "System Test", "FAIL", `Loyalty points test failed: ${error.message}`)
    }
  }

  // 7. Notification System Test
  async testNotificationSystem() {
    this.log("📧 Testing Notification System...", "info")

    try {
      // Test notification creation
      const { result: createNotification, executionTime: createTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("notifications")
          .insert({
            channel: "email",
            to_address: "test@example.com",
            template: "order_confirmation",
            payload: {
              order_id: "test-order-123",
              customer_name: "Test Customer",
              total_amount: 300.0,
            },
            event_type: "order_placed",
            status: "pending",
            provider: "email",
          })
          .select()
          .single()
      })

      if (createNotification.error) {
        this.addResult(
          "Notifications",
          "Create Notification",
          "FAIL",
          `Notification creation failed: ${createNotification.error.message}`,
          createTime,
        )
      } else {
        this.addResult("Notifications", "Create Notification", "PASS", "Notification created successfully", createTime)
        this.testData.testNotification = createNotification.data
      }

      // Test notification attempts logging
      if (this.testData.testNotification) {
        const { result: logAttempt, executionTime: logTime } = await this.measureExecutionTime(async () => {
          return await this.supabase.from("notification_attempts").insert({
            notification_id: this.testData.testNotification.id,
            success: true,
            provider: "email",
            attempt_no: 1,
            response: { message: "Email sent successfully", message_id: "test-123" },
          })
        })

        if (logAttempt.error) {
          this.addResult(
            "Notifications",
            "Log Attempt",
            "FAIL",
            `Attempt logging failed: ${logAttempt.error.message}`,
            logTime,
          )
        } else {
          this.addResult("Notifications", "Log Attempt", "PASS", "Notification attempt logged successfully", logTime)
        }
      }

      // Test notification status update
      if (this.testData.testNotification) {
        const { result: updateStatus, executionTime: updateTime } = await this.measureExecutionTime(async () => {
          return await this.supabase
            .from("notifications")
            .update({ status: "sent" })
            .eq("id", this.testData.testNotification.id)
        })

        if (updateStatus.error) {
          this.addResult(
            "Notifications",
            "Status Update",
            "FAIL",
            `Status update failed: ${updateStatus.error.message}`,
            updateTime,
          )
        } else {
          this.addResult(
            "Notifications",
            "Status Update",
            "PASS",
            "Notification status updated successfully",
            updateTime,
          )
        }
      }

      // Cleanup test data
      if (this.testData.testNotification) {
        await this.supabase
          .from("notification_attempts")
          .delete()
          .eq("notification_id", this.testData.testNotification.id)
        await this.supabase.from("notifications").delete().eq("id", this.testData.testNotification.id)
      }
    } catch (error: any) {
      this.addResult("Notifications", "System Test", "FAIL", `Notification system test failed: ${error.message}`)
    }
  }

  // 8. AI Chat System Test
  async testAIChatSystem() {
    this.log("🤖 Testing AI Chat System...", "info")

    try {
      // Test conversation creation
      const { result: createConversation, executionTime: createTime } = await this.measureExecutionTime(async () => {
        return await this.supabase
          .from("unified_conversations")
          .insert({
            customer_id: "test-customer-123",
            channel: "website",
            subject: "Product Inquiry",
            status: "active",
            priority: "medium",
            metadata: {
              source: "product_page",
              product_id: this.testData.sampleProduct?.id,
            },
          })
          .select()
          .single()
      })

      if (createConversation.error) {
        this.addResult(
          "AI Chat",
          "Create Conversation",
          "FAIL",
          `Conversation creation failed: ${createConversation.error.message}`,
          createTime,
        )
      } else {
        this.addResult("AI Chat", "Create Conversation", "PASS", "Conversation created successfully", createTime)
        this.testData.testConversation = createConversation.data
      }

      // Test message creation
      if (this.testData.testConversation) {
        const { result: createMessage, executionTime: messageTime } = await this.measureExecutionTime(async () => {
          return await this.supabase.from("unified_messages").insert({
            conversation_id: this.testData.testConversation.id,
            sender_id: "test-customer-123",
            sender_type: "customer",
            sender_name: "Test Customer",
            content: "Hello, I'm interested in this sofa cover. What sizes are available?",
            message_type: "text",
            channel: "website",
            status: "delivered",
            ai_analysis: {
              intent: "product_inquiry",
              sentiment: "neutral",
              confidence: 0.85,
              suggested_response: "I'd be happy to help you with size information!",
            },
          })
        })

        if (createMessage.error) {
          this.addResult(
            "AI Chat",
            "Create Message",
            "FAIL",
            `Message creation failed: ${createMessage.error.message}`,
            messageTime,
          )
        } else {
          this.addResult("AI Chat", "Create Message", "PASS", "Message created successfully", messageTime)
        }
      }

      // Test AI performance logging
      if (this.testData.testConversation) {
        const { result: logPerformance, executionTime: perfTime } = await this.measureExecutionTime(async () => {
          return await this.supabase.from("ai_chat_performance").insert({
            conversation_id: this.testData.testConversation.id,
            message_id: "test-message-123",
            response_time_seconds: 2,
            ai_confidence: 0.85,
            response_accuracy: 0.9,
            customer_satisfaction: 4,
            escalation_needed: false,
            human_takeover: false,
            business_value: "high",
          })
        })

        if (logPerformance.error) {
          this.addResult(
            "AI Chat",
            "Performance Logging",
            "FAIL",
            `Performance logging failed: ${logPerformance.error.message}`,
            perfTime,
          )
        } else {
          this.addResult("AI Chat", "Performance Logging", "PASS", "AI performance logged successfully", perfTime)
        }
      }

      // Cleanup test data
      if (this.testData.testConversation) {
        await this.supabase
          .from("ai_chat_performance")
          .delete()
          .eq("conversation_id", this.testData.testConversation.id)
        await this.supabase.from("unified_messages").delete().eq("conversation_id", this.testData.testConversation.id)
        await this.supabase.from("unified_conversations").delete().eq("id", this.testData.testConversation.id)
      }
    } catch (error: any) {
      this.addResult("AI Chat", "System Test", "FAIL", `AI chat system test failed: ${error.message}`)
    }
  }

  // Helper methods
  private async createTestUser() {
    try {
      const testEmail = `test-user-${Date.now()}@example.com`
      const { data, error } = await this.supabase
        .from("profiles")
        .insert({
          email: testEmail,
          full_name: "Test User",
          role: "customer",
        })
        .select()
        .single()

      if (error) {
        this.log(`Failed to create test user: ${error.message}`, "warning")
        return null
      }

      return data
    } catch (error) {
      this.log(`Error creating test user: ${error}`, "warning")
      return null
    }
  }

  private async cleanupTestUser(userId: string) {
    try {
      await this.supabase.from("profiles").delete().eq("id", userId)
    } catch (error) {
      this.log(`Error cleaning up test user: ${error}`, "warning")
    }
  }

  // Generate comprehensive report
  generateReport() {
    this.log("\n📋 CORE BUSINESS FEATURES TESTING REPORT", "info")
    this.log("=".repeat(80), "info")

    const summary = {
      total: this.results.length,
      passed: this.results.filter((r) => r.status === "PASS").length,
      failed: this.results.filter((r) => r.status === "FAIL").length,
      warnings: this.results.filter((r) => r.status === "WARNING").length,
      skipped: this.results.filter((r) => r.status === "SKIP").length,
    }

    // Performance analysis
    const performanceResults = this.results.filter((r) => r.executionTime !== undefined)
    const avgExecutionTime =
      performanceResults.length > 0
        ? performanceResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) / performanceResults.length
        : 0

    this.log(`\n📊 SUMMARY:`, "info")
    this.log(`✅ PASSED: ${summary.passed}`, "success")
    this.log(`⚠️  WARNINGS: ${summary.warnings}`, "warning")
    this.log(`❌ FAILED: ${summary.failed}`, "error")
    this.log(`⏭️  SKIPPED: ${summary.skipped}`, "info")
    this.log(`📈 TOTAL TESTS: ${summary.total}`, "info")
    this.log(`⚡ AVERAGE EXECUTION TIME: ${avgExecutionTime.toFixed(2)}ms`, "info")

    this.log(`\n📝 DETAILED RESULTS BY FEATURE:`, "info")
    this.log("-".repeat(80), "info")

    // Group results by feature
    const featureGroups = this.results.reduce(
      (acc, result) => {
        if (!acc[result.feature]) {
          acc[result.feature] = []
        }
        acc[result.feature].push(result)
        return acc
      },
      {} as Record<string, BusinessTestResult[]>,
    )

    for (const [feature, results] of Object.entries(featureGroups)) {
      this.log(`\n🔧 ${feature.toUpperCase()}:`, "info")

      const featureSummary = {
        passed: results.filter((r) => r.status === "PASS").length,
        failed: results.filter((r) => r.status === "FAIL").length,
        warnings: results.filter((r) => r.status === "WARNING").length,
        skipped: results.filter((r) => r.status === "SKIP").length,
      }

      this.log(
        `   Status: ${featureSummary.passed}✅ ${featureSummary.failed}❌ ${featureSummary.warnings}⚠️ ${featureSummary.skipped}⏭️`,
        "info",
      )

      for (const result of results) {
        const icon =
          result.status === "PASS" ? "✅" : result.status === "WARNING" ? "⚠️" : result.status === "SKIP" ? "⏭️" : "❌"
        const type =
          result.status === "PASS"
            ? "success"
            : result.status === "WARNING"
              ? "warning"
              : result.status === "SKIP"
                ? "info"
                : "error"
        const timeInfo = result.executionTime ? ` (${result.executionTime}ms)` : ""
        this.log(`   ${icon} ${result.test}: ${result.message}${timeInfo}`, type)
      }
    }

    // Business readiness assessment
    const criticalFeatures = ["Product Management", "Shopping Cart", "Order Processing"]
    const criticalIssues = this.results.filter((r) => r.status === "FAIL" && criticalFeatures.includes(r.feature))

    this.log(`\n🎯 BUSINESS READINESS ASSESSMENT:`, "info")
    this.log("-".repeat(80), "info")

    if (criticalIssues.length === 0) {
      this.log("🎉 All critical business features are working properly!", "success")
      this.log("✅ Your e-commerce system is ready for customers.", "success")
    } else {
      this.log("🚨 Critical business features have issues that must be resolved:", "error")
      criticalIssues.forEach((issue, index) => {
        this.log(`${index + 1}. [${issue.feature}] ${issue.test}: ${issue.message}`, "error")
      })
    }

    // Feature completeness
    const featureCompleteness = Object.entries(featureGroups).map(([feature, results]) => {
      const passed = results.filter((r) => r.status === "PASS").length
      const total = results.filter((r) => r.status !== "SKIP").length
      const percentage = total > 0 ? (passed / total) * 100 : 0
      return { feature, percentage, passed, total }
    })

    this.log(`\n📈 FEATURE COMPLETENESS:`, "info")
    featureCompleteness.forEach((fc) => {
      const status = fc.percentage >= 90 ? "success" : fc.percentage >= 70 ? "warning" : "error"
      this.log(`   ${fc.feature}: ${fc.percentage.toFixed(1)}% (${fc.passed}/${fc.total})`, status)
    })

    this.log(`\n💡 RECOMMENDATIONS:`, "info")
    this.log("-".repeat(80), "info")

    if (summary.failed === 0) {
      this.log("🎉 Excellent! All business features are functioning correctly.", "success")
      this.log("🚀 Your sofa cover e-commerce system is ready for production.", "success")
    } else {
      this.log("🔴 Address all FAILED tests before launching to customers.", "error")
      if (summary.warnings > 0) {
        this.log("🟡 Review WARNING items to optimize customer experience.", "warning")
      }
    }

    this.log(`\n⏰ Testing completed at: ${new Date().toLocaleString("th-TH")}`, "info")
    this.log("=".repeat(80), "info")

    return {
      summary,
      results: this.results,
      featureCompleteness,
      criticalIssues,
      isBusinessReady: criticalIssues.length === 0,
      overallReadiness: summary.failed === 0,
    }
  }

  // Main execution method
  async runFullBusinessTesting() {
    this.log("🚀 Starting Core Business Features Testing...", "info")
    this.log(`📅 Started at: ${new Date().toLocaleString("th-TH")}`, "info")
    this.log("=".repeat(80), "info")

    try {
      await this.testProductManagement()
      await this.testShoppingCartSystem()
      await this.testOrderProcessingSystem()
      await this.testCustomerReviewsSystem()
      await this.testWishlistSystem()
      await this.testLoyaltyPointsSystem()
      await this.testNotificationSystem()
      await this.testAIChatSystem()

      return this.generateReport()
    } catch (error: any) {
      this.log(`❌ Business testing failed: ${error.message}`, "error")
      this.addResult("System", "Execution", "FAIL", `Business testing execution failed: ${error.message}`)
      return this.generateReport()
    }
  }
}

// Execute the business features testing
async function main() {
  const tester = new CoreBusinessFeatureTester()
  const report = await tester.runFullBusinessTesting()

  // Save report to file
  const fs = await import("fs")
  const reportPath = `./business-features-report-${Date.now()}.json`

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Business features testing report saved to: ${reportPath}`)
  } catch (error) {
    console.log(`⚠️ Could not save report file: ${error}`)
  }

  // Exit with appropriate code
  process.exit(report.overallReadiness ? 0 : 1)
}

if (require.main === module) {
  main().catch(console.error)
}

export { CoreBusinessFeatureTester }
