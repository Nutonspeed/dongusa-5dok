import { NextResponse } from "next/server";
import { validate } from "@/lib/services/promotions";

export async function POST(req: Request) {
  const { code } = await req.json();
  const result = await validate(code);
  return NextResponse.json(result);
}
