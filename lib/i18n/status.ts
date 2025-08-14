export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  PRODUCTION = 'PRODUCTION',
  PACKING = 'PACKING',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED',
}

export const statusLabelTH: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: 'รอชำระเงิน',
  [OrderStatus.PAID]: 'ชำระแล้ว',
  [OrderStatus.PRODUCTION]: 'กำลังผลิต',
  [OrderStatus.PACKING]: 'กำลังแพ็ก',
  [OrderStatus.SHIPPED]: 'จัดส่งแล้ว',
  [OrderStatus.CANCELLED]: 'ยกเลิก',
};

export type OrderChannel =
  | 'facebook'
  | 'line'
  | 'tiktok'
  | 'lazada'
  | 'shopee'
  | 'walkin'
  | 'other';

export const channelLabelTH: Record<OrderChannel, string> = {
  facebook: 'Facebook',
  line: 'LINE',
  tiktok: 'TikTok',
  lazada: 'Lazada',
  shopee: 'Shopee',
  walkin: 'หน้าร้าน',
  other: 'อื่น ๆ',
};

export function toChannelLabelTH(v?: string) {
  const key = (v || 'other').toLowerCase() as OrderChannel;
  return channelLabelTH[key] ?? 'อื่น ๆ';
}

export function statusToTH(status: OrderStatus): string {
  return statusLabelTH[status];
}

export function statusFromString(str: string): OrderStatus | null {
  const key = str.toUpperCase() as keyof typeof OrderStatus;
  return OrderStatus[key] ?? null;
}

export function statusBadgeVariant(status: OrderStatus):
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline' {
  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
      return 'outline';
    case OrderStatus.PAID:
    case OrderStatus.PRODUCTION:
    case OrderStatus.PACKING:
      return 'secondary';
    case OrderStatus.SHIPPED:
      return 'default';
    case OrderStatus.CANCELLED:
      return 'destructive';
    default:
      return 'default';
  }
}
