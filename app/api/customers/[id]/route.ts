import { type NextRequest, NextResponse } from "next/server"
import { billDatabase } from "@/lib/enhanced-bill-database"

// Address validation schema
function validateAddress(address: any): string[] {
  const errors: string[] = []

  if (!address || typeof address !== "object") {
    errors.push("Address is required")
    return errors
  }

  if (!address.street?.trim()) {
    errors.push("Street address is required")
  } else if (address.street.length > 200) {
    errors.push("Street address must be less than 200 characters")
  }

  if (!address.city?.trim()) {
    errors.push("City is required")
  } else if (address.city.length > 100) {
    errors.push("City must be less than 100 characters")
  }

  if (!address.state?.trim()) {
    errors.push("State/Province is required")
  } else if (address.state.length > 100) {
    errors.push("State/Province must be less than 100 characters")
  }

  if (!address.zipCode?.trim()) {
    errors.push("Postal code is required")
  } else if (!/^[A-Za-z0-9\s-]{3,20}$/.test(address.zipCode)) {
    errors.push("Invalid postal code format")
  }

  if (!address.country?.trim()) {
    errors.push("Country is required")
  }

  return errors
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customerId = params.id
    const updates = await request.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required", code: "MISSING_CUSTOMER_ID" }, { status: 400 })
    }

    // Validate address if provided
    if (updates.address) {
      const addressErrors = validateAddress(updates.address)
      if (addressErrors.length > 0) {
        return NextResponse.json(
          {
            error: "Address validation failed",
            code: "VALIDATION_ERROR",
            details: addressErrors,
          },
          { status: 400 },
        )
      }
    }

    const updatedCustomer = await billDatabase.updateCustomer(customerId, updates)

    if (!updatedCustomer) {
      return NextResponse.json({ error: "Customer not found", code: "CUSTOMER_NOT_FOUND" }, { status: 404 })
    }

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error("Error updating customer:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        message: "Failed to update customer",
      },
      { status: 500 },
    )
  }
}
