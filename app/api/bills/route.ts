import { NextResponse, type NextRequest } from 'next/server'
import { enhancedBillDatabase } from '@/lib/enhanced-bill-database'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const bill = await enhancedBillDatabase.createBill({
      billNumber: data.billNumber || `BILL-${Date.now()}`,
      customerEmail: data.customerEmail || 'customer@example.com',
      customerName: data.customerName || 'Mock Customer',
      amount: data.amount || 0,
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate || new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      items: data.items || [],
    })
    return NextResponse.json(bill)
  } catch (error) {
    logger.error('Error creating bill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
