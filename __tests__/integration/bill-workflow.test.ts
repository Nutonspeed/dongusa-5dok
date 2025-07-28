// Integration tests for complete workflows

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMockBill, mockApiResponse, mockApiError, CustomerBillView } from "../utils/test-utils"

describe("Bill Management Workflow", () => {
  it("completes full bill lifecycle", async () => {
    const user = userEvent.setup()

    // 1. Create bill
    const newBill = createMockBill({ status: "draft" })
    mockApiResponse(newBill)

    // 2. Send bill to customer
    mockApiResponse({ ...newBill, status: "sent" })

    // 3. Customer views bill
    render(<CustomerBillView />)

    await waitFor(() => {
      expect(screen.getByText(newBill.billNumber)).toBeInTheDocument()
    })

    // 4. Customer notifies payment
    mockApiResponse({ success: true })
    await user.click(screen.getByText("I Have Paid"))

    await waitFor(() => {
      expect(screen.getByText(/payment notification sent/i)).toBeInTheDocument()
    })

    // 5. Admin marks as paid
    mockApiResponse({ ...newBill, status: "paid", remainingBalance: 0 })

    // Verify final state
    expect(screen.getByText("PAID")).toBeInTheDocument()
  })

  it("handles payment failures and retries", async () => {
    const user = userEvent.setup()
    const bill = createMockBill({ remainingBalance: 1000 })

    render(<CustomerBillView />)

    // First payment attempt fails
    mockApiError("Payment service unavailable", 503)
    await user.click(screen.getByText("I Have Paid"))

    await waitFor(() => {
      expect(screen.getByText(/notification failed/i)).toBeInTheDocument()
    })

    // Retry succeeds
    mockApiResponse({ success: true })
    await user.click(screen.getByText("I Have Paid"))

    await waitFor(() => {
      expect(screen.getByText(/payment notification sent/i)).toBeInTheDocument()
    })
  })
})
