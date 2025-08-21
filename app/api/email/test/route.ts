import { NextResponse } from "next/server"
// Temporarily disabled to avoid importing nodemailer during build
// import { emailService } from "@/lib/email"

export async function GET() {
  return NextResponse.json(
    { disabled: true, reason: "email test endpoint temporarily disabled" },
    { status: 503 },
  )
}
