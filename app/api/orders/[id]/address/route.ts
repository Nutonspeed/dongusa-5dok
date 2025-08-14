import { logger } from '@/lib/logger';
import { sessionManager } from '@/lib/session-management';
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = request.cookies.get("session_id")?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validation = await sessionManager.validateSession(
      sessionId,
      request.headers.get("x-forwarded-for") || "unknown",
      request.headers.get("user-agent") || "",
    );

    if (!validation.isValid || !validation.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { address } = await request.json();

    if (!address || typeof address !== "string") {
      return NextResponse.json({ error: "ที่อยู่ไม่ถูกต้อง" }, { status: 400 });
    }

    const supabase = createClient();
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "ไม่พบคำสั่งซื้อ" }, { status: 404 });
    }

    if (
      order.user_id !== validation.session.userId &&
      validation.session.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    logger.info(`Updating address for order ${params.id}:`, address);

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        shipping_address: { address: address.trim() },
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (updateError) {
      throw updateError;
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: "อัพเดทที่อยู่สำเร็จ",
      orderId: params.id,
      newAddress: address.trim(),
    });
  } catch (error) {
    logger.error("Address update error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัพเดทที่อยู่" }, { status: 500 });
  }
}
