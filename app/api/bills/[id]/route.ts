import { type NextRequest, NextResponse } from "next/server"
import { enhancedBillDatabase } from "@/lib/enhanced-bill-database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const bill = await enhancedBillDatabase.getBill(id)

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Error fetching bill:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    const updatedBill = await enhancedBillDatabase.updateBill(id, updates)

    if (!updatedBill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json(updatedBill)
  } catch (error) {
    console.error("Error updating bill:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const success = await enhancedBillDatabase.deleteBill(id)

    if (!success) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting bill:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
