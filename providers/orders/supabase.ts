import { IOrdersProvider } from './types';
import { Order, OrderStatus } from '@/lib/mock-orders';
import { createClient } from '@supabase/supabase-js';
import { buildCSV } from '@/lib/export/csv';
import { statusToTH } from '@/lib/i18n/status';
import { logger } from '@/lib/logger';

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY || '';

const client = createClient(url, anon);

const supabaseProvider: IOrdersProvider = {
  async getById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as Order;
    } catch (err) {
      logger.error('orders.getById', err);
      return null;
    }
  },

  async list(): Promise<Order[]> {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as Order[]) || [];
    } catch (err) {
      logger.error('orders.list', err);
      return [];
    }
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    try {
      const { data, error } = await client
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data as unknown as Order;
    } catch (err) {
      logger.error('orders.updateStatus', err);
      return null;
    }
  },

  async bulkUpdate(ids: string[], status: OrderStatus): Promise<number> {
    try {
      const { data, error } = await client
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', ids)
        .select('id');
      if (error) throw error;
      return data ? data.length : 0;
    } catch (err) {
      logger.error('orders.bulkUpdate', err);
      return 0;
    }
  },

  async exportCSV(): Promise<string> {
    try {
      const { data, error } = await client
        .from('orders')
        .select('id, customer_name, status, total_amount');
      if (error) throw error;
      const headers = ['id', 'customer', 'status', 'total'];
      const rows = (data || []).map((o: any) => [
        o.id,
        o.customer_name,
        statusToTH(o.status as any),
        o.total_amount,
      ]);
      return buildCSV(headers, rows);
    } catch (err) {
      logger.error('orders.exportCSV', err);
      return '';
    }
  },
};

export default supabaseProvider;
