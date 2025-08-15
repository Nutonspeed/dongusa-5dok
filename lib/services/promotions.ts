// DO NOT remove or restructure UI; data wiring only
import { createClient } from '@/lib/supabase/server';

export async function validate(code: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('promotions')
    .select('discount_pct')
    .eq('code', code)
    .eq('active', true)
    .single();
  if (error || !data) return { valid: false, discountPct: 0 };
  return { valid: true, discountPct: data.discount_pct };
}
