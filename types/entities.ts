export interface Profile {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
}

export interface Fabric {
  id: string;
  code: string;
  name?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  fabric_id?: string;
  qty: number;
  price: number;
  discount?: number;
}

export interface Order {
  id: string;
  customer_id: string;
  status: string;
  total: number;
  created_at: string;
}
