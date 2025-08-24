"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { SegmentedTabs } from "@/components/admin/v2/SegmentedTabs"
import StatCard from "@/components/admin/v2/StatCard"
import InvoiceCard, { Invoice } from "@/components/admin/v2/InvoiceCard"
import { FileText, ShoppingCart, CreditCard, Scissors, Truck, Plus, Search, Filter } from "lucide-react"
import TopBarV2 from "@/components/admin/v2/TopBarV2"
import SidebarV2 from "@/components/admin/v2/SidebarV2"
import NewBillModal from "@/components/admin/v2/NewBillModal"
import BottomNav from "@/components/admin/v2/BottomNav"

export default function BillsV2Page() {
  const router = useRouter()
  const [tab, setTab] = React.useState<"bills" | "orders">("bills")
  const [query, setQuery] = React.useState("")
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [items, setItems] = React.useState<Invoice[]>([
    {
      id: "INV-001",
      customer: "สมชาย ใจดี",
      total: 2775,
      dateISO: new Date().toISOString(),
      status: "paid"
    },
    {
      id: "INV-002",
      customer: "สมหญิง รักดี",
      total: 4180,
      dateISO: new Date(Date.now() - 86400000).toISOString(),
      status: "ordered"
    },
    {
      id: "INV-003",
      customer: "นางสาวสวย งามสม",
      total: 3250,
      dateISO: new Date(Date.now() - 2 * 86400000).toISOString(),
      status: "sewing"
    },
    {
      id: "INV-004",
      customer: "นายดี ใจบุญ",
      total: 1890,
      dateISO: new Date(Date.now() - 3 * 86400000).toISOString(),
      status: "shipped"
    },
    {
      id: "INV-005",
      customer: "บริษัท ตัวอย่าง จำกัด",
      total: 7560,
      dateISO: new Date(Date.now() - 4 * 86400000).toISOString(),
      status: "draft"
    }
  ])
  const [isNewBillModalOpen, setIsNewBillModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const filtered = items.filter(i =>
    [i.id, i.customer].some(x => x.toLowerCase().includes(query.toLowerCase()))
  )

  const updateStatus = (id: string, status: Invoice['status']) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, status } : i)))
  }

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        ;(document.getElementById("bills-v2-search") as HTMLInputElement | null)?.focus()
      } else if (e.key.toLowerCase() === "n") {
        setIsNewBillModalOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle new bill submission
  const handleNewBillSubmit = async (data: {
    customerName: string
    phone: string
    address: string
    product: string
    amount: number
    dueDate: string
  }) => {
    // In a real app, you would make an API call here
    console.log('Submitting new bill:', data)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Add the new bill to the list
    const newBill: Invoice = {
      id: `INV-${Date.now()}`,
      customer: data.customerName,
      total: data.amount,
      dateISO: data.dueDate,
      status: 'draft',
    }
    
    setItems(prev => [newBill, ...prev])
    return Promise.resolve()
  }

  // Handle FAB click
  const handleFabClick = useCallback(() => {
    setIsNewBillModalOpen(true)
  }, [])

  return (
    <main className="min-h-[calc(100vh-64px)] p-4 sm:p-6 bg-gradient-to-br from-rose-100/70 via-amber-100/60 to-rose-50">
      <div className="mx-auto max-w-7xl">
        {/* Top bar */}
        <TopBarV2 
          title="จัดการบิลและคำสั่งซื้อ" 
          query={query} 
          onQueryChange={setQuery} 
          onToggleSidebar={() => setSidebarOpen(true)} 
          notifications={5} 
        />

        <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">บิลและคำสั่งซื้อ</h1>
            <p className="text-neutral-600">จัดการบิลและติดตามสถานะคำสั่งซื้อ</p>
          </div>
          <button
            onClick={() => setIsNewBillModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B8323C] to-[#F0A500] text-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>สร้างบิลใหม่</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="บิลทั้งหมด" 
            value={items.length.toString()} 
            icon={<FileText />} 
          />
          <StatCard 
            label="ยอดขายรวม" 
            value={formatTHB(items.reduce((sum, item) => sum + item.total, 0))}
            icon={<CreditCard />} 
          />
          <StatCard 
            label="รอชำระเงิน" 
            value={items.filter(i => i.status === 'ordered').length.toString()}
            icon={<ShoppingCart />} 
          />
          <StatCard 
            label="กำลังดำเนินการ" 
            value={items.filter(i => ['sewing', 'shipped'].includes(i.status)).length.toString()}
            icon={<Scissors />} 
          />
        </div>

        {/* Main Content */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <SegmentedTabs 
              value={tab} 
              onValueChange={setTab as any}
              tabs={[
                { value: 'bills', label: 'บิลทั้งหมด', count: items.length },
                { value: 'orders', label: 'คำสั่งซื้อ', count: items.filter(i => i.status !== 'draft').length },
              ]} 
            />
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="bills-v2-search"
                type="text"
                placeholder="ค้นหาบิล..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all"
              />
            </div>
          </div>

          {/* Invoice List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <InvoiceCard
                  key={item.id}
                  data={item}
                  onStatusChange={updateStatus}
                  className="hover:scale-[1.02] transition-transform duration-200"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                ไม่พบบิลที่ตรงกับการค้นหา
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={handleFabClick}
        className="lg:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#B8323C] to-[#F0A500] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-40"
        aria-label="สร้างบิลใหม่"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* New Bill Modal */}
      <NewBillModal 
        isOpen={isNewBillModalOpen} 
        onClose={() => setIsNewBillModalOpen(false)} 
        onSubmit={handleNewBillSubmit}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav 
        activeTab="bills"
        onNewBillClick={handleFabClick}
      />

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      >
        <div 
          className={`absolute left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <SidebarV2 mode="mobile" onClose={() => setSidebarOpen(false)} />
        </div>
      </div>
    </main>
  )
}

function formatTHB(value: number) {
  return value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })
}
