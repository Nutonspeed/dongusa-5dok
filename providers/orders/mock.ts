import { IOrdersProvider } from './types';
import {
  getOrderById,
  getOrders,
  updateOrderStatus,
  OrderStatus,
} from '@/lib/mock-orders';
import { buildCSV } from '@/lib/export/csv';
import { statusToTH } from '@/lib/i18n/status';

const mockProvider: IOrdersProvider = {
  getById: getOrderById,
  list: () => getOrders(),
  updateStatus: updateOrderStatus,
  bulkUpdate: async (ids, status) => {
    let count = 0;
    for (const id of ids) {
      const res = await updateOrderStatus(id, status);
      if (res) count++;
    }
    return count;
  },
  exportCSV: async () => {
    const orders = await getOrders();
    const headers = ['id', 'customer', 'status', 'total'];
    const rows = orders.map((o) => [
      o.id,
      o.customerName,
      statusToTH(o.status as any),
      o.totalAmount,
    ]);
    return buildCSV(headers, rows);
  },
};

export default mockProvider;
