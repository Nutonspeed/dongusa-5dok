export interface User {
  id: string
  email: string
  name: string
  password: string
  role: "admin" | "manager" | "staff" | "customer"
  permissions: string[]
  avatar?: string
  createdAt: string
  lastLoginAt?: string
  isActive: boolean
}

// Mock users database
export const mockUsers: User[] = [
  {
    id: "admin_1",
    email: "admin@sofacover.co.th",
    name: "ผู้ดูแลระบบ",
    password: "admin123",
    role: "admin",
    permissions: ["*"],
    avatar: "https://ui-avatars.com/api/?name=Admin&background=ec4899&color=fff",
    createdAt: "2024-01-01T00:00:00.000Z",
    lastLoginAt: "2024-01-15T10:30:00.000Z",
    isActive: true,
  },
  {
    id: "manager_1",
    email: "manager@sofacover.co.th",
    name: "ผู้จัดการ",
    password: "manager123",
    role: "manager",
    permissions: ["read:*", "write:products", "write:orders", "write:customers", "read:analytics"],
    avatar: "https://ui-avatars.com/api/?name=Manager&background=8b5cf6&color=fff",
    createdAt: "2024-01-01T00:00:00.000Z",
    lastLoginAt: "2024-01-15T09:15:00.000Z",
    isActive: true,
  },
  {
    id: "staff_1",
    email: "staff@sofacover.co.th",
    name: "พนักงาน",
    password: "staff123",
    role: "staff",
    permissions: ["read:products", "write:orders", "read:customers", "write:inventory"],
    avatar: "https://ui-avatars.com/api/?name=Staff&background=10b981&color=fff",
    createdAt: "2024-01-01T00:00:00.000Z",
    lastLoginAt: "2024-01-15T08:45:00.000Z",
    isActive: true,
  },
  {
    id: "customer_1",
    email: "customer@sofacover.co.th",
    name: "ลูกค้าทดลอง",
    password: "customer123",
    role: "customer",
    permissions: ["read:products", "write:orders"],
    avatar: "https://ui-avatars.com/api/?name=Customer&background=f59e0b&color=fff",
    createdAt: "2024-01-01T00:00:00.000Z",
    lastLoginAt: "2024-01-15T11:20:00.000Z",
    isActive: true,
  },
]

// Storage keys
export const AUTH_STORAGE_KEY = "sofacover_auth_token"
export const USER_STORAGE_KEY = "sofacover_user"

// Safe storage utilities
export const safeStorage = {
  get: (key: string): string | null => {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set: (key: string, value: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, value)
    } catch {
      // Handle storage errors silently
    }
  },
  remove: (key: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(key)
    } catch {
      // Handle storage errors silently
    }
  },
}

// Token utilities (simplified for demo)
export const generateToken = (userId: string): string => {
  const payload = {
    userId,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }
  return btoa(JSON.stringify(payload))
}

export const verifyToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now()) {
      return null // Token expired
    }
    return payload.userId
  } catch {
    return null // Invalid token
  }
}

// User utilities
export const getStoredUser = (): User | null => {
  const userStr = safeStorage.get(USER_STORAGE_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const getStoredToken = (): string | null => {
  return safeStorage.get(AUTH_STORAGE_KEY)
}

export const clearStoredAuth = (): void => {
  safeStorage.remove(AUTH_STORAGE_KEY)
  safeStorage.remove(USER_STORAGE_KEY)
}

// Permission utilities
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user || !user.isActive) return false
  if (user.permissions.includes("*")) return true
  return user.permissions.includes(permission)
}

export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  if (!user || !user.isActive) return false
  if (user.permissions.includes("*")) return true
  return permissions.some((permission) => user.permissions.includes(permission))
}

// Role utilities
export const isAdmin = (user: User | null): boolean => {
  return user?.role === "admin" && user.isActive
}

export const isManager = (user: User | null): boolean => {
  return (user?.role === "manager" || user?.role === "admin") && user.isActive
}

export const isStaff = (user: User | null): boolean => {
  return ["staff", "manager", "admin"].includes(user?.role || "") && user?.isActive
}

export const isCustomer = (user: User | null): boolean => {
  return user?.role === "customer" && user.isActive
}
