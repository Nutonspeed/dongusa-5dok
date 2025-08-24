"use client"

import React from "react"
import { Home, FileText, ShoppingCart, User, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type BottomNavProps = {
  activeTab?: string
  onNewBillClick?: () => void
}

export default function BottomNav({ 
  activeTab = "home",
  onNewBillClick = () => {}
}: BottomNavProps) {
  const pathname = usePathname()
  const isActive = (tab: string) => pathname === tab || activeTab === tab

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16">
        <Link 
          href="/admin/dashboard" 
          className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/admin/dashboard') ? 'text-[#B8323C]' : 'text-gray-500'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">หน้าหลัก</span>
        </Link>
        
        <Link 
          href="/admin/bills-v2" 
          className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/admin/bills-v2') ? 'text-[#B8323C]' : 'text-gray-500'}`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-xs mt-1">บิล</span>
        </Link>
        
        {/* New Bill Button */}
        <button 
          onClick={onNewBillClick}
          className="flex items-center justify-center -mt-8 w-16 h-16 rounded-full bg-gradient-to-r from-[#B8323C] to-[#F0A500] text-white shadow-lg transform hover:scale-105 transition-transform"
          aria-label="New Bill"
        >
          <Plus className="w-6 h-6" />
        </button>
        
        <Link 
          href="/admin/orders" 
          className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/admin/orders') ? 'text-[#B8323C]' : 'text-gray-500'}`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs mt-1">ออเดอร์</span>
        </Link>
        
        <Link 
          href="/admin/profile" 
          className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/admin/profile') ? 'text-[#B8323C]' : 'text-gray-500'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs mt-1">โปรไฟล์</span>
        </Link>
      </div>
    </div>
  )
}
