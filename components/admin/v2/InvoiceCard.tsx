"use client"

import React, { useState } from "react"
import StatusStepper, { StepKey } from "./StatusStepper"
import { 
  Printer, 
  Link as LinkIcon, 
  MessageCircle, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Loader2, 
  Phone, 
  MessageSquare, 
  FileText, 
  ShoppingCart, 
  CheckCircle, 
  Scissors, 
  Truck 
} from "lucide-react"
import { Menu, Transition } from "@headlessui/react"

export type Invoice = {
  id: string
  customerName: string
  amount: number
  createdAt: string
  dueDate: string
  phone: string
  status: StepKey
}

export type InvoiceCardProps = {
  invoice: Invoice
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: StepKey) => void
  className?: string
}

export const formatTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n)

const statusColors = {
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    icon: FileText,
  },
  ordered: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: ShoppingCart,
  },
  paid: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: CheckCircle,
  },
  sewing: {
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: Scissors,
  },
  shipped: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: Truck,
  },
} as const

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ 
  invoice, 
  onView, 
  onEdit, 
  onDelete, 
  onStatusChange,
  className = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const status = statusColors[invoice.status]
  const StatusIcon = status.icon
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('th-TH', options)
  }

  const handleDelete = async () => {
    if (window.confirm('ยืนยันการลบบิลนี้?')) {
      try {
        setIsDeleting(true)
        await onDelete?.(invoice.id)
      } catch (error) {
        console.error('Error deleting invoice:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div 
      className={[
        'relative overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-md',
        status.border,
        className
      ].join(' ')}
    >
      {/* Header */}
      <div className={`px-4 py-3 ${status.bg} flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-5 h-5 ${status.text}`} />
          <span className={`text-sm font-medium ${status.text}`}>
            {invoice.status === 'draft' && 'ฉบับร่าง'}
            {invoice.status === 'ordered' && 'สั่งซื้อ'}
            {invoice.status === 'paid' && 'ชำระแล้ว'}
            {invoice.status === 'sewing' && 'ตัดเย็บ'}
            {invoice.status === 'shipped' && 'จัดส่ง'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {formatDate(invoice.createdAt)}
          </span>
          
          <Menu as="div" className="relative">
            <Menu.Button 
              className="p-1 rounded-full hover:bg-white/20 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(!isMenuOpen)
              }}
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </Menu.Button>
            
            <Transition
              show={isMenuOpen}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items 
                static
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onView?.(invoice.id)}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } flex w-full items-center px-4 py-2 text-sm`}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        ดูรายละเอียด
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onEdit?.(invoice.id)}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } flex w-full items-center px-4 py-2 text-sm`}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        แก้ไข
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(invoice.id)
                          alert('คัดลอกเลขที่บิลเรียบร้อยแล้ว')
                        }}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } flex w-full items-center px-4 py-2 text-sm`}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        คัดลอกเลขที่บิล
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className={`${
                          active ? 'bg-red-50 text-red-700' : 'text-red-600'
                        } flex w-full items-center px-4 py-2 text-sm disabled:opacity-50`}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            กำลังลบ...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            ลบบิล
                          </>
                        )}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {invoice.customerName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              <Phone className="inline w-3.5 h-3.5 mr-1.5" />
              {invoice.phone}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(invoice.amount)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ครบกำหนด: {new Date(invoice.dueDate).toLocaleDateString('th-TH')}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              เลขที่บิล: <span className="font-mono">{invoice.id.slice(0, 8)}</span>
            </span>
            
            <div className="flex space-x-2">
              <button
                onClick={() => window.open(`/api/invoices/${invoice.id}/print`, '_blank')}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                พิมพ์
              </button>
              
              <button
                onClick={() => {
                  const message = `บิลหมายเลข ${invoice.id}\nลูกค้า: ${invoice.customerName}\nยอดชำระ: ${invoice.amount} บาท\n\nลิงก์ชำระเงิน: https://yourdomain.com/pay/${invoice.id}`
                  window.open(`https://wa.me/${invoice.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
                }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                แชร์
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Stepper */}
      <div className="px-4 pb-4">
        <StatusStepper 
          value={invoice.status} 
          onChange={(status) => onStatusChange?.(invoice.id, status as any)}
        />
      </div>
      
      {/* Loading overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      )}
    </div>
  )
}

export default InvoiceCard
