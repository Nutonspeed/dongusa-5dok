import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import { USE_SUPABASE } from "@/lib/runtime"
import { createServerClient } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { OrderStatus } from "@/lib/i18n/status"
import { requireAdmin } from "@/lib/auth/requireAdmin"

export async function POST(request: NextRequest) {
  await requireAdmin(request)
  try {
    const schema = z.object({
      ids: z.array(z.string().min(1)).min(1),
      status: z.nativeEnum(OrderStatus),
      idempotencyKey: z.string().optional(),
    })
    const { ids, status, idempotencyKey } = schema.parse(await request.json())

    if (USE_SUPABASE) {
      try {
  const supabase = await createServerClient()

        if (idempotencyKey) {
          const { data: existing } = await supabase
            .from("ops_log")
            .select("result")
            .eq("idempotency_key", idempotencyKey)
            .maybeSingle()
          if (existing?.result) {
            return NextResponse.json(existing.result as any)
          }
        }

        const { data, error } = await supabase
          .from("orders")
          .update({ status, updated_at: new Date().toISOString() })
          .in("id", ids)
          .select("id")

        if (error) {
          logger.error("Database update failed:", error)
          throw error
        }

        const updatedCount = data?.length || 0
        const result = { updatedCount }

        if (idempotencyKey) {
          const payloadHash = crypto
            .createHash("sha256")
            .update(JSON.stringify({ ids, status }))
            .digest("hex")
          await supabase.from("ops_log").insert({
            idempotency_key: idempotencyKey,
            op: "bulk-status",
            payload_hash: payloadHash,
            result,
            created_at: new Date().toISOString(),
          })
        }

        logger.info(`Updated ${updatedCount} orders to status: ${status}`)

        return NextResponse.json(result)
      } catch (error) {
        logger.error("Bulk status update failed:", error)
        return NextResponse.json(
          {
            success: false,
            message: "Database update failed",
          },
          { status: 500 },
        )
      }
    }

    // Mock mode - simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 800))

    logger.info("Mock bulk status change:", { ids, status })

    return NextResponse.json({ updatedCount: ids.length, mode: "mock" })
  } catch (error) {
    logger.error("Bulk status update error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
