// DO NOT remove or restructure UI; data wiring only

import { createClient } from '@/lib/supabase/server';

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

interface CreateOrderPayload {
  customer: string;
  items: OrderItem[];
  shipping?: Record<string, any>;
  paymentIntent?: string;
}

export async function createOrder(payload: CreateOrderPayload) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .insert({
      customer_id: payload.customer,
      shipping: payload.shipping || null,
      payment_intent: payload.paymentIntent || null,
      status: 'PENDING_PAYMENT',
    })
    .select()
    .single();
  if (error) throw error;
  if (payload.items?.length) {
    const items = payload.items.map((i) => ({ ...i, order_id: data.id }));
    const { error: itemErr } = await supabase.from('order_items').insert(items);
    if (itemErr) throw itemErr;
  }
  return data;
}

export async function getOrderById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function listOrdersByCustomer(
  uid: string,
  opts: { limit?: number; offset?: number } = {},
) {
  const supabase = createClient();
  const { limit = 20, offset = 0 } = opts;
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, total, created_at')
    .eq('customer_id', uid)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}
