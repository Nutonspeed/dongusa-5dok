import { createClient } from '@/lib/supabase/server';

interface ListParams {
  categoryId?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export async function listProducts(params: ListParams = {}) {
  const supabase = createClient();
  const { categoryId, q, limit = 20, offset = 0 } = params;
  let query = supabase.from('products').select('*');
  if (categoryId) query = query.eq('category_id', categoryId);
  if (q) query = query.ilike('name', `%${q}%`);
  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

export async function getProduct(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}
