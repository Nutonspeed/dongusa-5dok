// Comprehensive component tests

import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render, createMockBill, mockApiResponse, mockApiError, measureRenderTime } from "../utils/test-utils"
import CustomerBillView from "@/app/bill/[id]/page"
import { jest } from "@jest/globals"

// Mock the useParams hook
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useParams: () => ({ id: "bill-1" }),
}))

describe("CustomerBillView", () => {
  const mockBill = createMockBill({
    remainingBalance: 500,
    status: "partially_paid",
  })

  beforeEach(() => {
    mockApiResponse(mockBill)
  })

  describe("Rendering", () => {
    it("renders bill information correctly", async () => {
      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText(mockBill.billNumber)).toBeInTheDocument()
        expect(screen.getByText(mockBill.customer.name)).toBeInTheDocument()
        expect(screen.getByText("$10.70")).toBeInTheDocument() // formatted total
      })
    })

    it("shows loading state initially", () => {
      render(<CustomerBillView />)
      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })

    it("displays overdue warning for overdue bills", async () => {
      const overdueBill = createMockBill({
        dueDate: new Date("2020-01-01"), // Past date
        status: "sent",
      })
      mockApiResponse(overdueBill)

      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText(/overdue/i)).toBeInTheDocument()
      })
    })
  })

  describe("Address Editing", () => {
    it("allows editing customer address", async () => {
      const user = userEvent.setup()
      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText("Edit Address")).toBeInTheDocument()
      })

      // Click edit button
      await user.click(screen.getByText("Edit Address"))

      // Check if form fields appear
      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
    })

    it("validates address fields before saving", async () => {
      const user = userEvent.setup()
      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText("Edit Address")).toBeInTheDocument()
      })

      await user.click(screen.getByText("Edit Address"))

      // Clear required field
      const streetInput = screen.getByLabelText(/street address/i)
      await user.clear(streetInput)

      // Try to save
      await user.click(screen.getByText("Save Changes"))

      await waitFor(() => {
        expect(screen.getByText(/street address is required/i)).toBeInTheDocument()
      })
    })

    it("handles address update API errors", async () => {
      const user = userEvent.setup()
      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText("Edit Address")).toBeInTheDocument()
      })

      await user.click(screen.getByText("Edit Address"))

      // Mock API error for address update
      mockApiError("Address update failed", 500)

      await user.click(screen.getByText("Save Changes"))

      await waitFor(() => {
        expect(screen.getByText(/error updating address/i)).toBeInTheDocument()
      })
    })
  })

  describe("Payment Notification", () => {
    it("sends payment notification successfully", async () => {
      const user = userEvent.setup()
      mockApiResponse({ success: true })

      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText("I Have Paid")).toBeInTheDocument()
      })

      // Mock successful notification API
      mockApiResponse({ success: true })

      await user.click(screen.getByText("I Have Paid"))

      await waitFor(() => {
        expect(screen.getByText(/payment notification sent/i)).toBeInTheDocument()
      })
    })

    it("handles payment notification failures gracefully", async () => {
      const user = userEvent.setup()
      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText("I Have Paid")).toBeInTheDocument()
      })

      // Mock API error
      mockApiError("Notification service unavailable", 503)

      await user.click(screen.getByText("I Have Paid"))

      await waitFor(() => {
        expect(screen.getByText(/notification failed/i)).toBeInTheDocument()
        expect(screen.getByText(/contact us directly/i)).toBeInTheDocument()
      })
    })
  })

  describe("QR Code Generation", () => {
    it("shows QR code when requested", async () => {
      const user = userEvent.setup()
      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText("Show QR")).toBeInTheDocument()
      })

      await user.click(screen.getByText("Show QR"))

      await waitFor(() => {
        expect(screen.getByAltText("Payment QR Code")).toBeInTheDocument()
      })
    })

    it("shows fallback payment methods when QR fails", async () => {
      const user = userEvent.setup()
      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText("Show QR")).toBeInTheDocument()
      })

      // Simulate QR generation failure
      jest.spyOn(Math, "random").mockReturnValue(0.05) // Force failure

      await user.click(screen.getByText("Show QR"))

      await waitFor(() => {
        expect(screen.getByText(/qr code unavailable/i)).toBeInTheDocument()
        expect(screen.getByText(/bank transfer/i)).toBeInTheDocument()
      })

      jest.spyOn(Math, "random").mockRestore()
    })
  })

  describe("Error Handling", () => {
    it("shows error state when bill not found", async () => {
      mockApiError("Bill not found", 404)

      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText(/bill not found/i)).toBeInTheDocument()
      })
    })

    it("shows retry option on network errors", async () => {
      const user = userEvent.setup()
      mockApiError("Network error", 0)

      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText("Try Again")).toBeInTheDocument()
      })

      // Mock successful retry
      mockApiResponse(mockBill)
      await user.click(screen.getByText("Try Again"))

      await waitFor(() => {
        expect(screen.getByText(mockBill.billNumber)).toBeInTheDocument()
      })
    })
  })

  describe("Accessibility", () => {
    it("has proper ARIA labels and roles", async () => {
      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByRole("main")).toBeInTheDocument()
        expect(screen.getByLabelText(/customer name/i)).toBeInTheDocument()
      })
    })

    it("supports keyboard navigation", async () => {
      const user = userEvent.setup()
      render(<CustomerBillView />)

      await waitFor(() => {
        expect(screen.getByText("Edit Address")).toBeInTheDocument()
      })

      // Tab to edit button and activate with Enter
      await user.tab()
      await user.keyboard("{Enter}")

      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument()
    })
  })

  describe("Performance", () => {
    it("renders within performance budget", async () => {
      const renderTime = await measureRenderTime(() => {
        render(<CustomerBillView />)
      })

      expect(renderTime).toBeLessThan(100) // 100ms budget
    })

    it("memoizes expensive calculations", async () => {
      const spy = jest.spyOn(console, "log")

      render(<CustomerBillView />)

      // Re-render with same props shouldn't trigger recalculations
      render(<CustomerBillView />)

      expect(spy).not.toHaveBeenCalledWith("Expensive calculation")
      spy.mockRestore()
    })
  })
})
