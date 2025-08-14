import { IOrdersProvider } from './types';
import { Order, OrderStatus } from '@/lib/mock-orders';

const supabaseProvider: IOrdersProvider = {
  async getById(id: string): Promise<Order | null> {
    // TODO: implement with Supabase
    return null;
  },
  async list(): Promise<Order[]> {
    return [];
  },
  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    return null;
  },
  async bulkUpdate(ids: string[], status: OrderStatus): Promise<number> {
    return 0;
  },
  async exportCSV(): Promise<string> {
    return '';
  },
};

export default supabaseProvider;
