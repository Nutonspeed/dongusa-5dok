// Testing utilities and helpers

import type React from "react"
import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import type { Bill, Customer, BillItem } from "@/types" // Import types for Bill, Customer, and BillItem

// Mock data factories
export const createMockBill = (overrides: Partial<Bill> = {}): Bill => ({
  id: "bill-1",
  billNumber: "INV-2024-001",
  customer: createMockCustomer(),
  items: [createMockBillItem()],
  subtotal: 1000,
  tax: 70,
  discount: 0,
  total: 1070,
  paidAmount: 0,
  remainingBalance: 1070,
  status: "sent",
  priority: "medium",
  tags: ["standard"],
  dueDate: new Date("2024-12-31"),
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  progressStages: [],
  purchaseOrders: [],
  supplierReceipts: [],
  ...overrides,
})

export const createMockCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  id: "customer-1",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zipCode: "12345",
    country: "USA",
  },
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
})

export const createMockBillItem = (overrides: Partial<BillItem> = {}): BillItem => ({
  id: "item-1",
  name: "Test Product",
  description: "Test product description",
  quantity: 1,
  unitPrice: 1000,
  total: 1000,
  category: "test",
  ...overrides,
})

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </QueryClientProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from "@testing-library/react"
export { customRender as render }

// API mocking utilities
export const mockApiResponse = <T>(data: T, status = 200) => {\
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  mockFetch.mockResolvedValueOnce({\
    ok: status >= 200 && status < 300,\
    status,\
    json: async () => data,\
    text: async () => JSON.stringify(data),
  } as Response);
};

export const mockApiError = (message: string, status = 500) => {\
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  mockFetch.mockRejectedValueOnce(new Error(message));
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {\
  const start = performance.now();
  renderFn();
  await new Promise(resolve => setTimeout(resolve, 0)); // Wait for render
  return performance.now() - start;
};

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement) => {\
  const { axe } = await import('@axe-core/react');
  const results = await axe(container);
  return results;\
};
