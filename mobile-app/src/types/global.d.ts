// Global type definitions for React Native

declare var __DEV__: boolean;

// React Native global types
declare module "@react-native-async-storage/async-storage" {
  interface AsyncStorageStatic {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<readonly string[]>;
    multiGet(
      keys: readonly string[],
    ): Promise<readonly [string, string | null][]>;
    multiSet(keyValuePairs: readonly [string, string][]): Promise<void>;
    multiRemove(keys: readonly string[]): Promise<void>;
  }
  const AsyncStorage: AsyncStorageStatic;
  export default AsyncStorage;
}

declare module "@react-native-community/netinfo" {
  export interface NetInfoState {
    type: string;
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    details: any;
  }

  export interface NetInfoSubscription {
    (): void;
  }

  const NetInfo: {
    fetch(): Promise<NetInfoState>;
    addEventListener(
      listener: (state: NetInfoState) => void,
    ): NetInfoSubscription;
  };

  export default NetInfo;
}

// Fetch API types for React Native
declare global {
  interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    integrity?: string;
    keepalive?: boolean;
    signal?: AbortSignal | null;
  }

  interface HeadersInit {
    [key: string]: string;
  }

  type BodyInit = string | Blob | BufferSource | FormData | URLSearchParams;
  type RequestMode = "cors" | "navigate" | "no-cors" | "same-origin";
  type RequestCredentials = "include" | "omit" | "same-origin";
  type RequestCache =
    | "default"
    | "force-cache"
    | "no-cache"
    | "no-store"
    | "only-if-cached"
    | "reload";
  type RequestRedirect = "error" | "follow" | "manual";
  type ReferrerPolicy =
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
}

// React Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  ProductDetails: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  Profile: undefined;
  Orders: undefined;
  OrderDetails: { orderId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Profile: undefined;
};

// App-specific types
export interface AppUser {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AppProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category_id: string;
  category?: AppCategory;
  variants: AppProductVariant[];
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
  sku: string;
}

export interface AppCategory {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

export interface AppCartItem {
  id: string;
  user_id: string;
  product_id: string;
  product: AppProduct;
  quantity: number;
  variant_id?: string;
  variant?: AppProductVariant;
  created_at: string;
  updated_at: string;
}

export interface AppOrder {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  shipping_address: AppAddress;
  payment_method: string;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: AppOrderItem[];
}

export interface AppOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: AppProduct;
  variant_id?: string;
  variant?: AppProductVariant;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface AppAddress {
  id?: string;
  user_id?: string;
  type: "shipping" | "billing";
  first_name: string;
  last_name: string;
  company?: string;
  street: string;
  street_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

// Redux Store types
export interface AppState {
  auth: AuthState;
  products: ProductsState;
  cart: CartState;
  orders: OrdersState;
  app: AppConfigState;
}

export interface AuthState {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ProductsState {
  items: AppProduct[];
  categories: AppCategory[];
  featured: AppProduct[];
  currentProduct: AppProduct | null;
  filters: ProductFilters;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;
}

export interface CartState {
  items: AppCartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface OrdersState {
  items: AppOrder[];
  currentOrder: AppOrder | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppConfigState {
  isOnline: boolean;
  theme: "light" | "dark";
  language: string;
  currency: string;
  firstLaunch: boolean;
  pushNotificationsEnabled: boolean;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: "name" | "price" | "created_at";
  sortOrder?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
