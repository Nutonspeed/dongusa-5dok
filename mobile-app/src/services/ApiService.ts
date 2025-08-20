import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createClient } from "@supabase/supabase-js";

// Configuration
const API_BASE_URL = __DEV__
  ? "http://localhost:3000/api"
  : "https://your-production-domain.com/api";

const SUPABASE_URL = process.env.SUPABASE_URL || "your-supabase-url";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || "your-supabase-anon-key";

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category_id: string;
  variants: ProductVariant[];
  in_stock: boolean;
  featured: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  price: number;
  stock_quantity: number;
  sku: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  variant_id?: string;
  variant?: ProductVariant;
}

export interface Order {
  id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  items: OrderItem[];
  shipping_address: Address;
  created_at: string;
  tracking_number?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
}

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  addresses: Address[];
}

class ApiService {
  private authToken: string | null = null;
  private isOnline: boolean = true;

  constructor() {
    this.initializeNetworkListener();
    this.loadStoredToken();
  }

  private async initializeNetworkListener() {
    const unsubscribe = NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected ?? false;
    });

    return unsubscribe;
  }

  private async loadStoredToken() {
    try {
      this.authToken = await AsyncStorage.getItem("auth_token");
    } catch (error) {
      console.error("Failed to load stored token:", error);
    }
  }

  private async storeToken(token: string) {
    try {
      this.authToken = token;
      await AsyncStorage.setItem("auth_token", token);
    } catch (error) {
      console.error("Failed to store token:", error);
    }
  }

  private async clearToken() {
    try {
      this.authToken = null;
      await AsyncStorage.removeItem("auth_token");
    } catch (error) {
      console.error("Failed to clear token:", error);
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    if (!this.isOnline) {
      throw new Error("No internet connection available");
    }

    try {
      const url = endpoint.startsWith("http")
        ? endpoint
        : `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Authentication Methods
  async signIn(
    email: string,
    password: string,
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(
      "/auth/signin",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );

    if (response.success && response.data?.token) {
      await this.storeToken(response.data.token);
    }

    return response;
  }

  async signUp(
    email: string,
    password: string,
    userData: Partial<User>,
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(
      "/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({ email, password, ...userData }),
      },
    );

    if (response.success && response.data?.token) {
      await this.storeToken(response.data.token);
    }

    return response;
  }

  async signOut(): Promise<ApiResponse> {
    await this.clearToken();
    return { success: true };
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/me");
  }

  // Product Methods
  async getProducts(filters?: {
    category?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ products: Product[]; total: number }>> {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.featured) params.append("featured", "true");
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";

    return this.request<{ products: Product[]; total: number }>(endpoint);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>("/products?featured=true&limit=10");
  }

  // Cart Methods
  async getCart(): Promise<ApiResponse<CartItem[]>> {
    return this.request<CartItem[]>("/cart");
  }

  async addToCart(
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<ApiResponse<CartItem>> {
    return this.request<CartItem>("/cart", {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        quantity,
        variant_id: variantId,
      }),
    });
  }

  async updateCartItem(
    itemId: string,
    quantity: number,
  ): Promise<ApiResponse<CartItem>> {
    return this.request<CartItem>(`/cart/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string): Promise<ApiResponse> {
    return this.request(`/cart/${itemId}`, {
      method: "DELETE",
    });
  }

  async clearCart(): Promise<ApiResponse> {
    return this.request("/cart", {
      method: "DELETE",
    });
  }

  // Order Methods
  async createOrder(orderData: {
    shipping_address: Address;
    payment_method: string;
    items: Array<{
      product_id: string;
      quantity: number;
      variant_id?: string;
    }>;
  }): Promise<ApiResponse<Order>> {
    return this.request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    return this.request<Order[]>("/orders");
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}`);
  }

  // User Profile Methods
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async addAddress(
    address: Omit<Address, "id">,
  ): Promise<ApiResponse<Address>> {
    return this.request<Address>("/user/addresses", {
      method: "POST",
      body: JSON.stringify(address),
    });
  }

  async updateAddress(
    addressId: string,
    address: Partial<Address>,
  ): Promise<ApiResponse<Address>> {
    return this.request<Address>(`/user/addresses/${addressId}`, {
      method: "PUT",
      body: JSON.stringify(address),
    });
  }

  async deleteAddress(addressId: string): Promise<ApiResponse> {
    return this.request(`/user/addresses/${addressId}`, {
      method: "DELETE",
    });
  }

  // Categories
  async getCategories(): Promise<
    ApiResponse<Array<{ id: string; name: string; slug: string }>>
  > {
    return this.request<Array<{ id: string; name: string; slug: string }>>(
      "/categories",
    );
  }

  // Search
  async searchProducts(
    query: string,
    limit = 20,
  ): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    return this.request<Product[]>(`/search/products?${params.toString()}`);
  }

  // Offline support methods
  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache expires after 1 hour
        if (Date.now() - timestamp < 3600000) {
          return data;
        }
      }
    } catch (error) {
      console.error("Failed to get cached data:", error);
    }
    return null;
  }

  async setCachedData<T>(key: string, data: T): Promise<void> {
    try {
      const cacheObject = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheObject));
    } catch (error) {
      console.error("Failed to cache data:", error);
    }
  }

  // Network status
  isOnlineStatus(): boolean {
    return this.isOnline;
  }
}

export const apiService = new ApiService();
export default apiService;
