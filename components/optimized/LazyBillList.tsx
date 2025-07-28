"use client"

import React from "react"

// Optimized bill list component with virtual scrolling and lazy loading

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useVirtualScroll, useDebouncedSearch, useIntersectionObserver } from "@/lib/performance-optimizations"
import { formatCurrency, formatDate, getBillStatusColor } from "@/lib/utils"
import type { Bill } from "@/lib/types/bill"

interface LazyBillListProps {
  searchQuery: string
  onBillSelect: (bill: Bill) => void
  className?: string
}

const ITEM_HEIGHT = 120
const CONTAINER_HEIGHT = 600

export default function LazyBillList({ searchQuery, onBillSelect, className }: LazyBillListProps) {
  const [allBills, setAllBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  // Debounced search
  const { results: searchResults, loading: searchLoading } = useDebouncedSearch(async (query: string) => {
    const response = await fetch(`/api/bills/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error("Search failed")
    return response.json()
  }, 300)

  // Use search results if searching, otherwise use all bills
  const displayBills = searchQuery ? searchResults : allBills

  // Virtual scrolling
  const { visibleItems, totalHeight, offsetY, startIndex, setScrollTop } = useVirtualScroll({
    items: displayBills,
    itemHeight: ITEM_HEIGHT,
    containerHeight: CONTAINER_HEIGHT,
  })

  // Load initial bills
  useEffect(() => {
    const loadBills = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/bills")
        if (!response.ok) throw new Error("Failed to load bills")
        const bills = await response.json()
        setAllBills(bills)
      } catch (error) {
        console.error("Error loading bills:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBills()
  }, [])

  // Memoized bill items to prevent unnecessary re-renders
  const billItems = useMemo(() => {
    return visibleItems.map((bill: Bill, index: number) => (
      <BillListItem key={bill.id} bill={bill} index={startIndex + index} onClick={() => onBillSelect(bill)} />
    ))
  }, [visibleItems, startIndex, onBillSelect])

  if (loading) {
    return (
      <div className={className}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[120px] mb-4" />
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        style={{ height: CONTAINER_HEIGHT, overflow: "auto" }}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {searchLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>
            ) : (
              billItems
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Memoized bill list item component
const BillListItem = React.memo(
  ({
    bill,
    index,
    onClick,
  }: {
    bill: Bill
    index: number
    onClick: () => void
  }) => {
    const { ref, isIntersecting } = useIntersectionObserver({
      threshold: 0.1,
      rootMargin: "50px",
    })

    // Only render content when item is visible or about to be visible
    if (!isIntersecting && ref) {
      return (
        <div ref={ref} style={{ height: ITEM_HEIGHT }} className="mb-4">
          <Skeleton className="h-full" />
        </div>
      )
    }

    return (
      <Card
        ref={ref}
        className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
        style={{ height: ITEM_HEIGHT }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-medium text-gray-900">{bill.billNumber}</h3>
                <Badge className={getBillStatusColor(bill.status)}>{bill.status.replace("_", " ")}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">{bill.customer.name}</p>
              <p className="text-xs text-gray-500">
                Created: {formatDate(bill.createdAt)} • Due: {formatDate(bill.dueDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{formatCurrency(bill.total)}</p>
              {bill.remainingBalance > 0 && (
                <p className="text-sm text-red-600">Due: {formatCurrency(bill.remainingBalance)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  },
)

BillListItem.displayName = "BillListItem"
