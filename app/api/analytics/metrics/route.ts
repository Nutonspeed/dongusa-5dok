import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// Rate limiting to prevent abuse
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (clientData.count >= RATE_LIMIT) {
    return false;
  }

  clientData.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientId =
      request.ip || request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    const metricData: PerformanceMetric = await request.json();

    // Validate required fields
    if (!metricData.name || metricData.value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, value" },
        { status: 400 },
      );
    }

    // Validate metric values
    if (typeof metricData.value !== "number" || !isFinite(metricData.value)) {
      return NextResponse.json(
        { error: "Invalid metric value" },
        { status: 400 },
      );
    }

    // Add timestamp if not provided
    if (!metricData.timestamp) {
      metricData.timestamp = new Date().toISOString();
    }

    // Store in database instead of memory
    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("performance_metrics")
      .insert([
        {
          name: metricData.name,
          value: metricData.value,
          unit: metricData.unit || "ms",
          timestamp: metricData.timestamp,
          user_id: metricData.userId,
          session_id: metricData.sessionId,
          client_id: clientId,
        },
      ]);

    if (insertError) {
      // Fallback: log to console if database fails
      logger.warn("Database insert failed, logging metric:", metricData);
    }

    // Log slow performance metrics
    if (metricData.name.includes("load_time") && metricData.value > 2000) {
      logger.warn("Slow performance detected:", metricData);
    }

    return NextResponse.json({
      success: true,
      message: "Metric recorded successfully",
    });
  } catch (error) {
    logger.error("Error recording performance metric:", error);
    return NextResponse.json(
      { error: "Failed to record metric" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") || "100"),
      1000,
    ); // Cap at 1000
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const supabase = createClient();
    let query = supabase
      .from("performance_metrics")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (name) {
      query = query.eq("name", name);
    }

    if (startDate) {
      query = query.gte("timestamp", startDate);
    }

    if (endDate) {
      query = query.lte("timestamp", endDate);
    }

    const { data: metrics, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate averages for performance metrics
    const averages: Record<string, number> = {};
    const metricGroups = (metrics || []).reduce(
      (groups, metric) => {
        if (!groups[metric.name]) {
          groups[metric.name] = [];
        }
        groups[metric.name].push(metric.value);
        return groups;
      },
      {} as Record<string, number[]>,
    );

    Object.keys(metricGroups).forEach((metricName) => {
      const values = metricGroups[metricName];
      averages[metricName] =
        values.reduce((sum, value) => sum + value, 0) / values.length;
    });

    return NextResponse.json({
      metrics: metrics || [],
      averages,
      total: metrics?.length || 0,
    });
  } catch (error) {
    logger.error("Error fetching performance metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 },
    );
  }
}
