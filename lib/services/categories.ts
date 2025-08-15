import { createClient } from '@/lib/supabase/server';

export async function listCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}
