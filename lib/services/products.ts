// DO NOT remove or restructure UI; data wiring only

import { createServerClient } from '@/lib/supabase';

interface ListParams {
  categorySlug?: string;
  q?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  isActive?: boolean;
}

export async function listProducts(params: ListParams = {}) {
  const supabase = await createServerClient();
  const {
    categorySlug,
    q,
    sort,
    limit = 24,
    offset = 0,
    isActive = true,
  } = params;
  let query = supabase.from('products').select('*');
  if (categorySlug) query = query.eq('category_slug', categorySlug);
  if (typeof isActive === 'boolean') query = query.eq('is_active', isActive);
  if (q) query = query.ilike('name', `%${q}%`);
  if (sort) query = query.order(sort as any);
  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}

export async function getProduct(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}
