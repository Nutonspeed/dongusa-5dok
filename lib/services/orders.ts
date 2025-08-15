import { createClient } from '@/lib/supabase/server';

interface OrderItem { product_id: string; quantity: number; price: number }
interface CreateOrderPayload {
  customer_id: string;
  total: number;
  items: OrderItem[];
}

export async function createOrder(payload: CreateOrderPayload) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .insert({ customer_id: payload.customer_id, total: payload.total })
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

export async function listOrdersByCustomer(uid: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, total, created_at')
    .eq('customer_id', uid)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
