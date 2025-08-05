import type { User } from "../app/contexts/AuthContext"

// Mock user database
const mockUsers = [
  {
    id: "1",
    email: "admin@sofacover.com",
    password: "admin123",
    name: "Admin User",
    role: "admin" as const,
    permissions: [
      "analytics.view",
      "invoices.view",
      "invoices.create",
      "invoices.edit",
      "invoices.delete",
      "orders.view",
      "orders.create",
      "orders.edit",
      "orders.delete",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
      "settings.view",
      "settings.edit",
      "ai.use",
    ],
    avatar: "/placeholder-user.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-15T10:30:00Z",
    isActive: true,
  },
  {
    id: "2",
    email: "manager@sofacover.com",
    password: "manager123",
    name: "Manager User",
    role: "manager" as const,
    permissions: [
      "analytics.view",
      "invoices.view",
      "invoices.create",
      "invoices.edit",
      "orders.view",
      "orders.create",
      "orders.edit",
      "products.view",
      "products.create",
      "products.edit",
      "users.view",
      "settings.view",
    ],
    avatar: "/placeholder-user.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-15T09:15:00Z",
    isActive: true,
  },
  {
    id: "3",
    email: "staff@sofacover.com",
    password: "staff123",
    name: "Staff User",
    role: "staff" as const,
    permissions: ["invoices.view", "invoices.create", "orders.view", "orders.create", "products.view", "users.view"],
    avatar: "/placeholder-user.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-15T08:45:00Z",
    isActive: true,
  },
  {
    id: "4",
    email: "customer@sofacover.com",
    password: "customer123",
    name: "Customer User",
    role: "customer" as const,
    permissions: ["orders.view"],
    avatar: "/placeholder-user.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-15T11:20:00Z",
    isActive: true,
  },
]

// Mock token storage (in production, use a proper database)
const tokenStorage = new Map<string, { userId: string; expiresAt: number }>()

export class AuthService {
  static async login(email: string, password: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return {
        success: false,
        message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      }
    }

    if (!user.isActive) {
      return {
        success: false,
        message: "บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ",
      }
    }

    // Generate token
    const token = `token_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    // Store token
    tokenStorage.set(token, { userId: user.id, expiresAt })

    // Update last login
    user.lastLoginAt = new Date().toISOString()

    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword as User,
      token,
      message: "เข้าสู่ระบบสำเร็จ",
    }
  }

  static async verifyToken(token: string) {
    const tokenData = tokenStorage.get(token)

    if (!tokenData) {
      return {
        success: false,
        message: "Token ไม่ถูกต้อง",
      }
    }

    if (Date.now() > tokenData.expiresAt) {
      tokenStorage.delete(token)
      return {
        success: false,
        message: "Token หมดอายุ",
      }
    }

    const user = mockUsers.find((u) => u.id === tokenData.userId)

    if (!user || !user.isActive) {
      tokenStorage.delete(token)
      return {
        success: false,
        message: "ผู้ใช้ไม่พบหรือถูกระงับ",
      }
    }

    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword as User,
      token,
    }
  }

  static async logout(token: string) {
    tokenStorage.delete(token)
    return {
      success: true,
      message: "ออกจากระบบสำเร็จ",
    }
  }

  static async refreshToken(token: string) {
    const result = await this.verifyToken(token)
    if (!result.success) {
      return result
    }

    // Generate new token
    const newToken = `token_${result.user!.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    // Remove old token and store new one
    tokenStorage.delete(token)
    tokenStorage.set(newToken, { userId: result.user!.id, expiresAt })

    return {
      success: true,
      user: result.user,
      token: newToken,
    }
  }
}
