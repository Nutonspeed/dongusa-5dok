// NOTE: Boundary fix only. Do NOT restructure or remove existing UI.

import { NextResponse } from "next/server";
import { BruteForceProtection } from "@/lib/brute-force-protection";

const protection = new BruteForceProtection();

export async function POST(req: Request) {
  const { action, ...payload } = await req.json();
  if (action === "check") {
    const { identifier, ipAddress, userAgent, success } = payload;
    const result = await protection.checkLoginAttempt(identifier, ipAddress, userAgent, success);
    return NextResponse.json(result);
  }
  if (action === "status") {
    const { email } = payload;
    const result = await protection.getAccountStatus(email);
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
