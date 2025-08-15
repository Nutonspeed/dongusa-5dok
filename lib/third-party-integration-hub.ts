import { logger } from "@/lib/logger"
import { createClient } from "@/lib/supabase/client"

export interface IntegrationConfig {
  name: string
  enabled: boolean
  apiKey?: string
  apiSecret?: string
  webhookUrl?: string
  settings: Record<string, any>
}

export interface EcommerceIntegration {
  platform: "shopee" | "lazada" | "amazon" | "ebay"
  sellerId: string
  accessToken: string
  refreshToken?: string
  shopId?: string
  lastSync?: string
}

export interface ShippingIntegration {
  provider: "thailand_post" | "kerry" | "flash" | "j_t"
  apiKey: string
  apiSecret?: string
  customerCode?: string
  merchantId?: string
  trackingEnabled: boolean
}

export interface PaymentIntegration {
  gateway: "stripe" | "paypal" | "omise" | "scb_easy"
  publicKey: string
  secretKey: string
  webhookSecret: string
  currency: string
  testMode: boolean
}

export class ThirdPartyIntegrationHub {
  private supabase = createClient()

  // E-commerce Platform Integrations
  async syncShopeeProducts(sellerId: string): Promise<{ success: boolean; synced: number; errors: string[] }> {
    try {
      logger.info(`[Shopee] Starting product sync for seller: ${sellerId}`)

      const shopeeAPI = new ShopeeAPI(process.env.SHOPEE_PARTNER_ID!, process.env.SHOPEE_PARTNER_KEY!)
      const products = await shopeeAPI.getProducts(sellerId)

      const syncResults = {
        success: true,
        synced: 0,
        errors: [] as string[],
      }

      for (const product of products) {
        try {
          const mappedProduct = {
            name: product.item_name,
            description: product.description,
            price: product.price_info?.[0]?.current_price || 0,
            images: product.image?.image_url_list || [],
            category_id: await this.mapShopeeCategory(product.category_id),
            external_id: `shopee_${product.item_id}`,
            platform: "shopee",
            stock_quantity: product.stock_info?.[0]?.current_stock || 0,
            status: product.item_status === "NORMAL" ? "active" : "inactive",
          }

          const { error } = await this.supabase.from("products").upsert(mappedProduct, { onConflict: "external_id" })

          if (error) {
            syncResults.errors.push(`Product ${product.item_name}: ${error.message}`)
          } else {
            syncResults.synced++
          }
        } catch (error) {
          syncResults.errors.push(`Product ${product.item_name}: ${error}`)
        }
      }

      logger.info(`[Shopee] Sync completed: ${syncResults.synced} products synced, ${syncResults.errors.length} errors`)
      return syncResults
    } catch (error) {
      logger.error("[Shopee] Sync failed:", error)
      return { success: false, synced: 0, errors: [error instanceof Error ? error.message : "Unknown error"] }
    }
  }

  async syncLazadaProducts(sellerId: string): Promise<{ success: boolean; synced: number; errors: string[] }> {
    try {
      logger.info(`[Lazada] Starting product sync for seller: ${sellerId}`)

      const lazadaAPI = new LazadaAPI(process.env.LAZADA_APP_KEY!, process.env.LAZADA_APP_SECRET!)
      const products = await lazadaAPI.getProducts(sellerId)

      const syncResults = {
        success: true,
        synced: 0,
        errors: [] as string[],
      }

      for (const product of products) {
        try {
          const mappedProduct = {
            name: product.attributes.name,
            description: product.attributes.description,
            price: Number.parseFloat(product.skus[0]?.price || "0"),
            images: product.images || [],
            category_id: await this.mapLazadaCategory(product.primary_category),
            external_id: `lazada_${product.item_id}`,
            platform: "lazada",
            stock_quantity: Number.parseInt(product.skus[0]?.quantity || "0"),
            status: product.status === "active" ? "active" : "inactive",
          }

          const { error } = await this.supabase.from("products").upsert(mappedProduct, { onConflict: "external_id" })

          if (error) {
            syncResults.errors.push(`Product ${product.attributes.name}: ${error.message}`)
          } else {
            syncResults.synced++
          }
        } catch (error) {
          syncResults.errors.push(`Product ${product.attributes.name}: ${error}`)
        }
      }

      logger.info(`[Lazada] Sync completed: ${syncResults.synced} products synced, ${syncResults.errors.length} errors`)
      return syncResults
    } catch (error) {
      logger.error("[Lazada] Sync failed:", error)
      return { success: false, synced: 0, errors: [error instanceof Error ? error.message : "Unknown error"] }
    }
  }

  // Shipping Integrations
  async createShippingLabel(
    orderId: string,
    provider: string,
  ): Promise<{ success: boolean; trackingNumber?: string; labelUrl?: string; error?: string }> {
    try {
      const { data: order } = await this.supabase
        .from("orders")
        .select("*, shipping_address")
        .eq("id", orderId)
        .single()

      if (!order) {
        return { success: false, error: "Order not found" }
      }

      switch (provider) {
        case "thailand_post":
          return await this.createThailandPostLabel(order)
        case "kerry":
          return await this.createKerryLabel(order)
        case "flash":
          return await this.createFlashLabel(order)
        default:
          return { success: false, error: "Unsupported shipping provider" }
      }
    } catch (error) {
      logger.error(`[Shipping] Label creation failed for order ${orderId}:`, error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  private async createThailandPostLabel(
    order: any,
  ): Promise<{ success: boolean; trackingNumber?: string; labelUrl?: string; error?: string }> {
    try {
      const thailandPostAPI = new ThailandPostAPI(
        process.env.THAILAND_POST_API_KEY!,
        process.env.THAILAND_POST_CUSTOMER_CODE!,
      )

      const shipment = await thailandPostAPI.createShipment({
        sender: {
          name: process.env.STORE_NAME || "SofaCover Pro",
          address: process.env.STORE_ADDRESS || "",
          phone: process.env.STORE_PHONE || "",
          postcode: process.env.STORE_POSTCODE || "",
        },
        receiver: {
          name: order.shipping_address.full_name,
          address: order.shipping_address.address,
          phone: order.shipping_address.phone,
          postcode: order.shipping_address.postal_code,
        },
        package: {
          weight: order.total_weight || 1000, // grams
          width: order.package_width || 30,
          length: order.package_length || 40,
          height: order.package_height || 10,
          value: order.total_amount,
        },
        service: "EMS",
      })

      await this.supabase
        .from("orders")
        .update({
          tracking_number: shipment.trackingNumber,
          shipping_provider: "thailand_post",
          shipping_status: "shipped",
          shipped_at: new Date().toISOString(),
        })
        .eq("id", order.id)

      return {
        success: true,
        trackingNumber: shipment.trackingNumber,
        labelUrl: shipment.labelUrl,
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Thailand Post API error" }
    }
  }

  private async createKerryLabel(
    order: any,
  ): Promise<{ success: boolean; trackingNumber?: string; labelUrl?: string; error?: string }> {
    try {
      const kerryAPI = new KerryAPI(process.env.KERRY_API_KEY!, process.env.KERRY_API_SECRET!)

      const booking = await kerryAPI.createBooking({
        from: {
          name: process.env.STORE_NAME || "SofaCover Pro",
          address: process.env.STORE_ADDRESS || "",
          phone: process.env.STORE_PHONE || "",
          postcode: process.env.STORE_POSTCODE || "",
        },
        to: {
          name: order.shipping_address.full_name,
          address: order.shipping_address.address,
          phone: order.shipping_address.phone,
          postcode: order.shipping_address.postal_code,
        },
        parcel: {
          weight: (order.total_weight || 1000) / 1000, // kg
          width: order.package_width || 30,
          length: order.package_length || 40,
          height: order.package_height || 10,
          cod_amount: order.payment_method === "cod" ? order.total_amount : 0,
        },
      })

      await this.supabase
        .from("orders")
        .update({
          tracking_number: booking.consignmentNumber,
          shipping_provider: "kerry",
          shipping_status: "shipped",
          shipped_at: new Date().toISOString(),
        })
        .eq("id", order.id)

      return {
        success: true,
        trackingNumber: booking.consignmentNumber,
        labelUrl: booking.labelUrl,
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Kerry API error" }
    }
  }

  private async createFlashLabel(
    order: any,
  ): Promise<{ success: boolean; trackingNumber?: string; labelUrl?: string; error?: string }> {
    try {
      const flashAPI = new FlashAPI(process.env.FLASH_API_KEY!, process.env.FLASH_MERCHANT_ID!)

      const shipment = await flashAPI.createOrder({
        merchant_order_number: order.id,
        service_type: "standard",
        pickup: {
          contact_name: process.env.STORE_NAME || "SofaCover Pro",
          phone: process.env.STORE_PHONE || "",
          address: process.env.STORE_ADDRESS || "",
          postcode: process.env.STORE_POSTCODE || "",
        },
        dropoff: {
          contact_name: order.shipping_address.full_name,
          phone: order.shipping_address.phone,
          address: order.shipping_address.address,
          postcode: order.shipping_address.postal_code,
        },
        package_detail: {
          weight: (order.total_weight || 1000) / 1000, // kg
          width: order.package_width || 30,
          length: order.package_length || 40,
          height: order.package_height || 10,
          cod_amount: order.payment_method === "cod" ? order.total_amount : 0,
        },
      })

      await this.supabase
        .from("orders")
        .update({
          tracking_number: shipment.tracking_number,
          shipping_provider: "flash",
          shipping_status: "shipped",
          shipped_at: new Date().toISOString(),
        })
        .eq("id", order.id)

      return {
        success: true,
        trackingNumber: shipment.tracking_number,
        labelUrl: shipment.label_url,
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Flash API error" }
    }
  }

  // Payment Gateway Integrations
  async processStripePayment(
    orderId: string,
    paymentMethodId: string,
  ): Promise<{ success: boolean; paymentIntentId?: string; error?: string }> {
    try {
      const stripe = new StripeAPI(process.env.STRIPE_SECRET_KEY!)

      const { data: order } = await this.supabase.from("orders").select("*").eq("id", orderId).single()

      if (!order) {
        return { success: false, error: "Order not found" }
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total_amount * 100), // cents
        currency: "thb",
        payment_method: paymentMethodId,
        confirmation_method: "manual",
        confirm: true,
        metadata: {
          order_id: orderId,
          customer_email: order.customer_email,
        },
      })

      if (paymentIntent.status === "succeeded") {
        await this.supabase
          .from("orders")
          .update({
            payment_status: "paid",
            payment_method: "stripe",
            payment_reference: paymentIntent.id,
            paid_at: new Date().toISOString(),
          })
          .eq("id", orderId)

        return { success: true, paymentIntentId: paymentIntent.id }
      } else {
        return { success: false, error: `Payment failed: ${paymentIntent.status}` }
      }
    } catch (error) {
      logger.error(`[Stripe] Payment failed for order ${orderId}:`, error)
      return { success: false, error: error instanceof Error ? error.message : "Stripe payment error" }
    }
  }

  // Social Media Integrations
  async postToFacebook(
    message: string,
    imageUrl?: string,
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const facebookAPI = new FacebookAPI(process.env.FACEBOOK_ACCESS_TOKEN!)

      const postData: any = {
        message,
        access_token: process.env.FACEBOOK_ACCESS_TOKEN,
      }

      if (imageUrl) {
        postData.url = imageUrl
      }

      const response = await facebookAPI.post(`/${process.env.FACEBOOK_PAGE_ID}/photos`, postData)

      return { success: true, postId: response.id }
    } catch (error) {
      logger.error("[Facebook] Post failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Facebook API error" }
    }
  }

  async postToInstagram(
    imageUrl: string,
    caption: string,
  ): Promise<{ success: boolean; mediaId?: string; error?: string }> {
    try {
      const instagramAPI = new InstagramAPI(process.env.INSTAGRAM_ACCESS_TOKEN!)

      // Create media object
      const mediaResponse = await instagramAPI.post(`/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`, {
        image_url: imageUrl,
        caption,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      })

      // Publish media
      const publishResponse = await instagramAPI.post(`/${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`, {
        creation_id: mediaResponse.id,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      })

      return { success: true, mediaId: publishResponse.id }
    } catch (error) {
      logger.error("[Instagram] Post failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Instagram API error" }
    }
  }

  // Webhook Handlers
  async handleShopeeWebhook(payload: any): Promise<void> {
    try {
      switch (payload.code) {
        case 1: // Order update
          await this.handleShopeeOrderUpdate(payload.data)
          break
        case 2: // Product update
          await this.handleShopeeProductUpdate(payload.data)
          break
        default:
          logger.warn("[Shopee Webhook] Unknown event code:", payload.code)
      }
    } catch (error) {
      logger.error("[Shopee Webhook] Processing failed:", error)
    }
  }

  async handleStripeWebhook(payload: any): Promise<void> {
    try {
      switch (payload.type) {
        case "payment_intent.succeeded":
          await this.handleStripePaymentSuccess(payload.data.object)
          break
        case "payment_intent.payment_failed":
          await this.handleStripePaymentFailed(payload.data.object)
          break
        default:
          logger.warn("[Stripe Webhook] Unhandled event type:", payload.type)
      }
    } catch (error) {
      logger.error("[Stripe Webhook] Processing failed:", error)
    }
  }

  // Helper methods
  private async mapShopeeCategory(categoryId: number): Promise<string> {
    const categoryMap: Record<number, string> = {
      100629: "sofa-covers", // Home & Living > Furniture > Sofa Covers
      100630: "cushion-covers", // Home & Living > Furniture > Cushion Covers
      // Add more mappings as needed
    }

    return categoryMap[categoryId] || "uncategorized"
  }

  private async mapLazadaCategory(categoryId: number): Promise<string> {
    const categoryMap: Record<number, string> = {
      10002075: "sofa-covers", // Home & Garden > Home Decor > Sofa Covers
      10002076: "cushion-covers", // Home & Garden > Home Decor > Cushion Covers
      // Add more mappings as needed
    }

    return categoryMap[categoryId] || "uncategorized"
  }

  private async handleShopeeOrderUpdate(orderData: any): Promise<void> {
    const { error } = await this.supabase.from("external_orders").upsert(
      {
        platform: "shopee",
        external_order_id: orderData.ordersn,
        status: orderData.order_status,
        updated_at: new Date().toISOString(),
        raw_data: orderData,
      },
      { onConflict: "platform,external_order_id" },
    )

    if (error) {
      logger.error("[Shopee] Order update failed:", error)
    }
  }

  private async handleShopeeProductUpdate(productData: any): Promise<void> {
    const { error } = await this.supabase
      .from("products")
      .update({
        stock_quantity: productData.stock_info?.[0]?.current_stock || 0,
        status: productData.item_status === "NORMAL" ? "active" : "inactive",
        updated_at: new Date().toISOString(),
      })
      .eq("external_id", `shopee_${productData.item_id}`)

    if (error) {
      logger.error("[Shopee] Product update failed:", error)
    }
  }

  private async handleStripePaymentSuccess(paymentIntent: any): Promise<void> {
    const orderId = paymentIntent.metadata.order_id

    const { error } = await this.supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_reference: paymentIntent.id,
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (error) {
      logger.error("[Stripe] Payment success update failed:", error)
    }
  }

  private async handleStripePaymentFailed(paymentIntent: any): Promise<void> {
    const orderId = paymentIntent.metadata.order_id

    const { error } = await this.supabase
      .from("orders")
      .update({
        payment_status: "failed",
        payment_reference: paymentIntent.id,
        payment_failure_reason: paymentIntent.last_payment_error?.message,
      })
      .eq("id", orderId)

    if (error) {
      logger.error("[Stripe] Payment failure update failed:", error)
    }
  }
}

// API Client Classes (simplified interfaces)
class ShopeeAPI {
  constructor(
    private partnerId: string,
    private partnerKey: string,
  ) {}
  async getProducts(sellerId: string): Promise<any[]> {
    return []
  }
}

class LazadaAPI {
  constructor(
    private appKey: string,
    private appSecret: string,
  ) {}
  async getProducts(sellerId: string): Promise<any[]> {
    return []
  }
}

class ThailandPostAPI {
  constructor(
    private apiKey: string,
    private customerCode: string,
  ) {}
  async createShipment(data: any): Promise<any> {
    return {}
  }
}

class KerryAPI {
  constructor(
    private apiKey: string,
    private apiSecret: string,
  ) {}
  async createBooking(data: any): Promise<any> {
    return {}
  }
}

class FlashAPI {
  constructor(
    private apiKey: string,
    private merchantId: string,
  ) {}
  async createOrder(data: any): Promise<any> {
    return {}
  }
}

class StripeAPI {
  paymentIntents = {
    create: async (data: any): Promise<any> => ({}),
  }
  constructor(private secretKey: string) {}
}

class FacebookAPI {
  constructor(private accessToken: string) {}
  async post(endpoint: string, data: any): Promise<any> {
    return {}
  }
}

class InstagramAPI {
  constructor(private accessToken: string) {}
  async post(endpoint: string, data: any): Promise<any> {
    return {}
  }
}

export const thirdPartyHub = new ThirdPartyIntegrationHub()
