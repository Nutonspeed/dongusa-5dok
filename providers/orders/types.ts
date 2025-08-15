import { Order, OrderStatus } from '@/lib/mock-orders';

export interface IOrdersProvider {
  getById(id: string): Promise<Order | null>;
  list(): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>;
  bulkUpdate(ids: string[], status: OrderStatus): Promise<number>;
  exportCSV(): Promise<string>;
}
