import { type NextRequest, NextResponse } from "next/server"
import { billDatabase } from "@/lib/enhanced-bill-database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billId = params.id

    if (!billId) {
      return NextResponse.json({ error: "Bill ID is required", code: "MISSING_BILL_ID" }, { status: 400 })
    }

    const bill = await billDatabase.getBillById(billId)

    if (!bill) {
      return NextResponse.json({ error: "Bill not found", code: "BILL_NOT_FOUND" }, { status: 404 })
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Error fetching bill:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        message: "Failed to fetch bill details",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billId = params.id
    const updates = await request.json()

    if (!billId) {
      return NextResponse.json({ error: "Bill ID is required", code: "MISSING_BILL_ID" }, { status: 400 })
    }

    // Validate updates
    if (typeof updates !== "object" || updates === null) {
      return NextResponse.json({ error: "Invalid update data", code: "INVALID_DATA" }, { status: 400 })
    }

    const updatedBill = await billDatabase.updateBill(billId, updates)

    if (!updatedBill) {
      return NextResponse.json({ error: "Bill not found", code: "BILL_NOT_FOUND" }, { status: 404 })
    }

    return NextResponse.json(updatedBill)
  } catch (error) {
    console.error("Error updating bill:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        message: "Failed to update bill",
      },
      { status: 500 },
    )
  }
}
