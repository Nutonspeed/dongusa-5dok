import { USE_SUPABASE } from "@/lib/runtime"
import { supabase } from "@/lib/supabase/client"

export interface Bill {
  id: string
  billNumber: string
  customerEmail: string
  customerName: string
  amount: number
  status: "pending" | "paid" | "overdue" | "draft"
  createdAt: string
  dueDate: string
  paidAmount?: number
  paymentMethod?: string
  paidAt?: string
  subtotal?: number
  tax?: number
  shipping?: number
  customerPhone?: string
  notes?: string
  items: Array<{
    description: string
    quantity: number
    price: number
    total?: number
  }>
}

// Mock database for development
class MockBillDatabase {
  private bills = new Map<string, Bill>()

  constructor() {
    const id = "1"
    const mockBill: Bill = {
      id,
      billNumber: "BILL-001",
      customerEmail: "customer@example.com",
      customerName: "John Doe",
      amount: 299.99,
      subtotal: 299.99,
      tax: 0,
      shipping: 0,
      status: "pending",
      paymentMethod: "bank_transfer",
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          description: "Custom Sofa Cover",
          quantity: 1,
          price: 299.99,
          total: 299.99,
        },
      ],
    }
    this.bills.set(id, mockBill)
  }

  async getBill(id: string): Promise<Bill | null> {
    return this.bills.get(id) || null
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
    const existingBill = this.bills.get(id)
    if (!existingBill) return null

    const updatedBill = { ...existingBill, ...updates }
    this.bills.set(id, updatedBill)
    return updatedBill
  }

  async createBill(bill: Omit<Bill, "id">): Promise<Bill> {
    const id = Math.random().toString(36).slice(2, 11)
    const newBill = { ...bill, id }
    this.bills.set(id, newBill)
    return newBill
  }

  async getBills(filters: Partial<Pick<Bill, "status" | "customerEmail">> = {}, limit = 10): Promise<Bill[]> {
    let list = Array.from(this.bills.values())
    if (filters.status) list = list.filter((b) => b.status === filters.status)
    if (filters.customerEmail) list = list.filter((b) => b.customerEmail === filters.customerEmail)
    return list.slice(0, limit)
  }

  async deleteBill(id: string): Promise<boolean> {
    return this.bills.delete(id)
  }
}

class SupabaseBillDatabase {
  async getBills(filters: { status?: string; customerEmail?: string } = {}, limit = 10): Promise<Bill[]> {
    let query = supabase
      .from("bills")
      .select(
        `
        id,
        bill_number,
        customer_email,
        customer_name,
        customer_phone,
        amount,
        subtotal,
        tax,
        shipping,
        status,
        payment_method,
        notes,
        created_at,
        due_date,
        paid_amount,
        paid_at,
        bill_items:bill_items(id, description, quantity, price, total)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit)

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }
    if (filters.customerEmail) {
      query = query.eq("customer_email", filters.customerEmail)
    }

    const { data, error } = await query
    if (error) throw error

    return (data || []).map((row: any) => this.rowToBill(row))
  }

  async getBill(id: string): Promise<Bill | null> {
    const { data, error } = await supabase
      .from("bills")
      .select(
        `
        id,
        bill_number,
        customer_email,
        customer_name,
        customer_phone,
        amount,
        subtotal,
        tax,
        shipping,
        status,
        payment_method,
        notes,
        created_at,
        due_date,
        paid_amount,
        paid_at,
        bill_items:bill_items(id, description, quantity, price, total)
      `,
      )
      .eq("id", id)
      .single()

    if (error && (error as any).code !== "PGRST116") throw error
    if (!data) return null
    return this.rowToBill(data)
  }

  async createBill(bill: Omit<Bill, "id">): Promise<Bill> {
    const { items, ...header } = bill
    const payload = {
      bill_number: header.billNumber,
      customer_email: header.customerEmail,
      customer_name: header.customerName,
      customer_phone: header.customerPhone ?? null,
      amount: header.amount,
      subtotal: header.subtotal ?? header.amount,
      tax: header.tax ?? 0,
      shipping: header.shipping ?? 0,
      status: header.status,
      payment_method: header.paymentMethod ?? null,
      notes: header.notes ?? null,
      created_at: header.createdAt ?? new Date().toISOString(),
      due_date: header.dueDate,
      paid_amount: header.paidAmount ?? null,
      paid_at: header.paidAt ?? null,
    }

    const { data, error } = await supabase.from("bills").insert(payload).select("id").single()
    if (error) throw error

    const billId = (data as any).id as string

    if (items && items.length > 0) {
      const itemsPayload = items.map((it) => ({
        bill_id: billId,
        description: it.description,
        quantity: it.quantity,
        price: it.price,
        total: it.total ?? it.price * it.quantity,
      }))
      const { error: itemErr } = await supabase.from("bill_items").insert(itemsPayload)
      if (itemErr) throw itemErr
    }

    const created = await this.getBill(billId)
    if (!created) throw new Error("bill_creation_failed")
    return created
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | null> {
    const { items, ...rest } = updates

    const payload: any = {}
    if (rest.billNumber !== undefined) payload.bill_number = rest.billNumber
    if (rest.customerEmail !== undefined) payload.customer_email = rest.customerEmail
    if (rest.customerName !== undefined) payload.customer_name = rest.customerName
    if (rest.customerPhone !== undefined) payload.customer_phone = rest.customerPhone
    if (rest.amount !== undefined) payload.amount = rest.amount
    if (rest.subtotal !== undefined) payload.subtotal = rest.subtotal
    if (rest.tax !== undefined) payload.tax = rest.tax
    if (rest.shipping !== undefined) payload.shipping = rest.shipping
    if (rest.status !== undefined) payload.status = rest.status
    if (rest.paymentMethod !== undefined) payload.payment_method = rest.paymentMethod
    if (rest.notes !== undefined) payload.notes = rest.notes
    if (rest.paidAmount !== undefined) payload.paid_amount = rest.paidAmount
    if (rest.paidAt !== undefined) payload.paid_at = rest.paidAt
    if (rest.dueDate !== undefined) payload.due_date = rest.dueDate

    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from("bills").update(payload).eq("id", id)
      if (error) throw error
    }

    // Optional: update items if provided (simple replace strategy)
    if (items) {
      const { error: delErr } = await supabase.from("bill_items").delete().eq("bill_id", id)
      if (delErr) throw delErr

      if (items.length > 0) {
        const itemsPayload = items.map((it) => ({
          bill_id: id,
          description: it.description,
          quantity: it.quantity,
          price: it.price,
          total: it.total ?? it.price * it.quantity,
        }))
        const { error: insErr } = await supabase.from("bill_items").insert(itemsPayload)
        if (insErr) throw insErr
      }
    }

    return this.getBill(id)
  }

  async deleteBill(id: string): Promise<boolean> {
    const { error: delItemsErr } = await supabase.from("bill_items").delete().eq("bill_id", id)
    if (delItemsErr) throw delItemsErr

    const { error } = await supabase.from("bills").delete().eq("id", id)
    if (error) throw error
    return true
  }

  private rowToBill(row: any): Bill {
    return {
      id: row.id,
      billNumber: row.bill_number,
      customerEmail: row.customer_email,
      customerName: row.customer_name,
      customerPhone: row.customer_phone ?? undefined,
      amount: Number(row.amount ?? 0),
      subtotal: row.subtotal != null ? Number(row.subtotal) : undefined,
      tax: row.tax != null ? Number(row.tax) : undefined,
      shipping: row.shipping != null ? Number(row.shipping) : undefined,
      status: row.status,
      paymentMethod: row.payment_method ?? undefined,
      notes: row.notes ?? undefined,
      createdAt: row.created_at,
      dueDate: row.due_date,
      paidAmount: row.paid_amount != null ? Number(row.paid_amount) : undefined,
      paidAt: row.paid_at ?? undefined,
      items: (row.bill_items || []).map((it: any) => ({
        description: it.description,
        quantity: it.quantity,
        price: Number(it.price),
        total: it.total != null ? Number(it.total) : Number(it.price) * it.quantity,
      })),
    }
  }
}

export const enhancedBillDatabase: {
  getBills: (filters?: { status?: string; customerEmail?: string }, limit?: number) => Promise<Bill[]>
  getBill: (id: string) => Promise<Bill | null>
  createBill: (bill: Omit<Bill, "id">) => Promise<Bill>
  updateBill: (id: string, updates: Partial<Bill>) => Promise<Bill | null>
  deleteBill: (id: string) => Promise<boolean>
} = USE_SUPABASE ? (new SupabaseBillDatabase() as any) : (new MockBillDatabase() as any)
