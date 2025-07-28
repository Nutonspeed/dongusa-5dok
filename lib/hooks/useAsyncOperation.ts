"use client"

// Custom hook for handling async operations with state management
import { useState, useCallback, useRef, useEffect } from "react"
import { useUIActions } from "@/lib/store"
import { useBillsActions } from "@/lib/store/bills"
import { useCustomersActions } from "@/lib/store/customers"
import { billsApi } from "@/lib/api/bills"
import { customersApi } from "@/lib/api/customers"

interface AsyncOperationOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  showSuccessNotification?: boolean
  showErrorNotification?: boolean
  successMessage?: string
  errorMessage?: string
}

interface AsyncOperationState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useAsyncOperation<T = any, P extends any[] = any[]>(
  asyncFunction: (...args: P) => Promise<T>,
  options: AsyncOperationOptions<T> = {},
) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const { addNotification } = useUIActions()
  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(
    async (...args: P) => {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }))

      try {
        const data = await asyncFunction(...args)

        // Check if operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return
        }

        setState({
          data,
          loading: false,
          error: null,
        })

        options.onSuccess?.(data)

        if (options.showSuccessNotification) {
          addNotification({
            type: "success",
            title: "Success",
            message: options.successMessage || "Operation completed successfully",
          })
        }

        return data
      } catch (error) {
        // Check if operation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return
        }

        const errorObj = error instanceof Error ? error : new Error(String(error))

        setState({
          data: null,
          loading: false,
          error: errorObj,
        })

        options.onError?.(errorObj)

        if (options.showErrorNotification) {
          addNotification({
            type: "error",
            title: "Error",
            message: options.errorMessage || errorObj.message,
          })
        }

        throw errorObj
      }
    },
    [asyncFunction, options, addNotification],
  )

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setState({
      data: null,
      loading: false,
      error: null,
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

// Specialized hooks for common operations
export function useBillOperations() {
  const { addNotification } = useUIActions()
  const { addBill, updateBill, deleteBill } = useBillsActions()

  const createBill = useAsyncOperation(
    async (billData: any) => {
      const response = await billsApi.create(billData)
      return response.data
    },
    {
      onSuccess: (bill) => {
        addBill(bill)
      },
      showSuccessNotification: true,
      successMessage: "Bill created successfully",
      showErrorNotification: true,
    },
  )

  const updateBillOperation = useAsyncOperation(
    async ({ id, updates }: { id: string; updates: any }) => {
      const response = await billsApi.update(id, updates)
      return response.data
    },
    {
      onSuccess: (bill) => {
        updateBill(bill.id, bill)
      },
      showSuccessNotification: true,
      successMessage: "Bill updated successfully",
      showErrorNotification: true,
    },
  )

  const deleteBillOperation = useAsyncOperation(
    async (id: string) => {
      await billsApi.delete(id)
      return id
    },
    {
      onSuccess: (id) => {
        deleteBill(id)
      },
      showSuccessNotification: true,
      successMessage: "Bill deleted successfully",
      showErrorNotification: true,
    },
  )

  return {
    createBill,
    updateBill: updateBillOperation,
    deleteBill: deleteBillOperation,
  }
}

export function useCustomerOperations() {
  const { addCustomer, updateCustomer, deleteCustomer } = useCustomersActions()

  const createCustomer = useAsyncOperation(
    async (customerData: any) => {
      const response = await customersApi.create(customerData)
      return response.data
    },
    {
      onSuccess: (customer) => {
        addCustomer(customer)
      },
      showSuccessNotification: true,
      successMessage: "Customer created successfully",
      showErrorNotification: true,
    },
  )

  const updateCustomerOperation = useAsyncOperation(
    async ({ id, updates }: { id: string; updates: any }) => {
      const response = await customersApi.update(id, updates)
      return response.data
    },
    {
      onSuccess: (customer) => {
        updateCustomer(customer.id, customer)
      },
      showSuccessNotification: true,
      successMessage: "Customer updated successfully",
      showErrorNotification: true,
    },
  )

  const deleteCustomerOperation = useAsyncOperation(
    async (id: string) => {
      await customersApi.delete(id)
      return id
    },
    {
      onSuccess: (id) => {
        deleteCustomer(id)
      },
      showSuccessNotification: true,
      successMessage: "Customer deleted successfully",
      showErrorNotification: true,
    },
  )

  return {
    createCustomer,
    updateCustomer: updateCustomerOperation,
    deleteCustomer: deleteCustomerOperation,
  }
}
