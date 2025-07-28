// API route testing

import { createMocks } from "node-mocks-http"
import handler from "@/app/api/bills/[id]/route"
import { enhancedMockDatabase } from "@/lib/mock-database-enhanced"
import { createMockBill } from "@/lib/mock-bill" // Import createMockBill
import jest from "jest" // Import jest

describe("/api/bills/[id]", () => {
  beforeEach(() => {
    // Reset database state
    enhancedMockDatabase.clear()
  })

  describe("GET", () => {
    it("returns bill by ID", async () => {
      const mockBill = createMockBill()
      await enhancedMockDatabase.insert("bills", mockBill)

      const { req, res } = createMocks({
        method: "GET",
        query: { id: mockBill.id },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.id).toBe(mockBill.id)
    })

    it("returns 404 for non-existent bill", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { id: "non-existent" },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(404)
    })

    it("handles database errors gracefully", async () => {
      // Mock database error
      jest.spyOn(enhancedMockDatabase, "selectById").mockRejectedValue(new Error("Database error"))

      const { req, res } = createMocks({
        method: "GET",
        query: { id: "bill-1" },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(500)
    })
  })

  describe("PUT", () => {
    it("updates bill successfully", async () => {
      const mockBill = createMockBill()
      await enhancedMockDatabase.insert("bills", mockBill)

      const updates = { status: "paid" }

      const { req, res } = createMocks({
        method: "PUT",
        query: { id: mockBill.id },
        body: updates,
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.status).toBe("paid")
    })

    it("validates update data", async () => {
      const mockBill = createMockBill()
      await enhancedMockDatabase.insert("bills", mockBill)

      const invalidUpdates = { status: "invalid-status" }

      const { req, res } = createMocks({
        method: "PUT",
        query: { id: mockBill.id },
        body: invalidUpdates,
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(400)
    })
  })

  describe("Rate Limiting", () => {
    it("enforces rate limits", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { id: "bill-1" },
        headers: { "x-forwarded-for": "192.168.1.1" },
      })

      // Make multiple requests rapidly
      for (let i = 0; i < 101; i++) {
        await handler(req, res)
      }

      expect(res._getStatusCode()).toBe(429)
    })
  })
})
