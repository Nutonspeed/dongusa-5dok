import { OrderStatus } from '@/lib/mock-orders';
import { logger } from '@/lib/logger';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ from: jest.fn() })),
  __esModule: true,
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';

import provider from './supabase';
const { createClient } = require('@supabase/supabase-js') as { createClient: jest.Mock };
const fromMock = createClient.mock.results[0].value.from as jest.Mock;

describe('orders supabase provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getById returns order', async () => {
    const single = jest.fn().mockResolvedValue({ data: { id: '1' }, error: null });
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));
    fromMock.mockReturnValueOnce({ select });

    const res = await provider.getById('1');
    expect(fromMock).toHaveBeenCalledWith('orders');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('id', '1');
    expect(res).toEqual({ id: '1' });
  });

  test('list returns orders', async () => {
    const order = jest.fn().mockResolvedValue({ data: [{ id: '1' }], error: null });
    const select = jest.fn(() => ({ order }));
    fromMock.mockReturnValueOnce({ select });

    const res = await provider.list();
    expect(res).toEqual([{ id: '1' }]);
    expect(fromMock).toHaveBeenCalledWith('orders');
  });

  test('updateStatus updates and returns order', async () => {
    const single = jest.fn().mockResolvedValue({ data: { id: '1', status: 'PAID' }, error: null });
    const select = jest.fn(() => ({ single }));
    const eq = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ eq }));
    fromMock.mockReturnValueOnce({ update });

    const res = await provider.updateStatus('1', OrderStatus.PAID);
    expect(update).toHaveBeenCalledWith({ status: OrderStatus.PAID, updated_at: expect.any(String) });
    expect(eq).toHaveBeenCalledWith('id', '1');
    expect(res).toEqual({ id: '1', status: 'PAID' });
  });

  test('bulkUpdate updates multiple orders', async () => {
    const select = jest.fn().mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], error: null });
    const inFn = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ in: inFn }));
    fromMock.mockReturnValueOnce({ update });

    const res = await provider.bulkUpdate(['1', '2'], OrderStatus.PAID);
    expect(inFn).toHaveBeenCalledWith('id', ['1', '2']);
    expect(res).toBe(2);
  });

  test('exportCSV returns csv string', async () => {
    const data = [
      { id: '1', customer_name: 'Alice', status: 'PAID', total_amount: 100 },
    ];
    const select = jest.fn().mockResolvedValue({ data, error: null });
    fromMock.mockReturnValueOnce({ select });

    const csv = await provider.exportCSV();
    expect(csv).toContain('id,customer,status,total');
    expect(csv).toContain('1,Alice');
  });

  test('handles errors gracefully', async () => {
    const error = { message: 'fail' };
    const single = jest.fn().mockResolvedValue({ data: null, error });
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));
    fromMock.mockReturnValueOnce({ select });
    const spy = jest.spyOn(logger, 'error').mockImplementation(() => {});

    const res = await provider.getById('1');
    expect(res).toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

