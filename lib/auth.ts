import { createHash } from "crypto"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "manager" | "staff" | "customer"
  permissions: string[]
  avatar?: string
  createdAt: string
  lastLoginAt?: string
  isActive: boolean
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

// Role-based permissions
export const PERMISSIONS = {
  // User Management
  "users.view": "View users",
  "users.create": "Create users",
  "users.edit": "Edit users",
  "users.delete": "Delete users",

  // Product Management
  "products.view": "View products",
  "products.create": "Create products",
  "products.edit": "Edit products",
  "products.delete": "Delete products",

  // Order Management
  "orders.view": "View orders",
  "orders.create": "Create orders",
  "orders.edit": "Edit orders",
  "orders.delete": "Delete orders",
  "orders.approve": "Approve orders",

  // Invoice Management
  "invoices.view": "View invoices",
  "invoices.create": "Create invoices",
  "invoices.edit": "Edit invoices",
  "invoices.delete": "Delete invoices",
  "invoices.send": "Send invoices",

  // Analytics & Reports
  "analytics.view": "View analytics",
  "reports.view": "View reports",
  "reports.export": "Export reports",

  // System Settings
  "settings.view": "View settings",
  "settings.edit": "Edit settings",

  // AI Features
  "ai.use": "Use AI features",
  "ai.manage": "Manage AI settings",
}

export const ROLE_PERMISSIONS = {
  admin: Object.keys(PERMISSIONS),
  manager: [
    "users.view",
    "users.create",
    "users.edit",
    "products.view",
    "products.create",
    "products.edit",
    "orders.view",
    "orders.create",
    "orders.edit",
    "orders.approve",
    "invoices.view",
    "invoices.create",
    "invoices.edit",
    "invoices.send",
    "analytics.view",
    "reports.view",
    "reports.export",
    "ai.use",
  ],
  staff: [
    "products.view",
    "products.edit",
    "orders.view",
    "orders.create",
    "orders.edit",
    "invoices.view",
    "invoices.create",
    "invoices.edit",
    "ai.use",
  ],
  customer: ["orders.view"],
}

// Mock user database
const MOCK_USERS: User[] = [
  {
    id: "admin-1",
    email: "admin@sofacover.com",
    name: "ผู้ดูแลระบบ",
    role: "admin",
    permissions: ROLE_PERMISSIONS.admin,
    avatar: "/placeholder-user.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-25T10:30:00Z",
    isActive: true,
  },
  {
    id: "manager-1",
    email: "manager@sofacover.com",
    name: "ผู้จัดการ สมชาย",
    role: "manager",
    permissions: ROLE_PERMISSIONS.manager,
    avatar: "/placeholder-user.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-25T09:15:00Z",
    isActive: true,
  },
  {
    id: "staff-1",
    email: "staff@sofacover.com",
    name: "พนักงาน สมหญิง",
    role: "staff",
    permissions: ROLE_PERMISSIONS.staff,
    avatar: "/placeholder-user.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-25T08:45:00Z",
    isActive: true,
  },
  {
    id: "customer-1",
    email: "customer@sofacover.com",
    name: "ลูกค้า ทดสอบ",
    role: "customer",
    permissions: ROLE_PERMISSIONS.customer,
    avatar: "/placeholder-user.jpg",
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-25T11:00:00Z",
    isActive: true,
  },
]

// Hash password function
function hashPassword(password: string): string {
  return createHash("sha256")
    .update(password + "sofa-cover-salt")
    .digest("hex")
}

// Mock password storage (in real app, use proper hashing)
const MOCK_PASSWORDS: Record<string, string> = {
  "admin@sofacover.com": hashPassword("admin123"),
  "manager@sofacover.com": hashPassword("manager123"),
  "staff@sofacover.com": hashPassword("staff123"),
  "customer@sofacover.com": hashPassword("customer123"),
}

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const hashedPassword = hashPassword(password)
      const storedPassword = MOCK_PASSWORDS[email]

      if (!storedPassword || storedPassword !== hashedPassword) {
        return {
          success: false,
          message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        }
      }

      const user = MOCK_USERS.find((u) => u.email === email)
      if (!user || !user.isActive) {
        return {
          success: false,
          message: "บัญชีผู้ใช้ไม่พบหรือถูกปิดใช้งาน",
        }
      }

      // Generate token (in real app, use JWT)
      const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }))

      // Update last login
      user.lastLoginAt = new Date().toISOString()

      return {
        success: true,
        user,
        token,
        message: "เข้าสู่ระบบสำเร็จ",
      }
    } catch (error) {
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      }
    }
  }

  static async register(userData: {
    email: string
    password: string
    name: string
    role?: "customer"
  }): Promise<AuthResponse> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if user already exists
      if (MOCK_USERS.find((u) => u.email === userData.email)) {
        return {
          success: false,
          message: "อีเมลนี้ถูกใช้งานแล้ว",
        }
      }

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role || "customer",
        permissions: ROLE_PERMISSIONS[userData.role || "customer"],
        createdAt: new Date().toISOString(),
        isActive: true,
      }

      // Store password
      MOCK_PASSWORDS[userData.email] = hashPassword(userData.password)
      MOCK_USERS.push(newUser)

      // Generate token
      const token = btoa(JSON.stringify({ userId: newUser.id, timestamp: Date.now() }))

      return {
        success: true,
        user: newUser,
        token,
        message: "สมัครสมาชิกสำเร็จ",
      }
    } catch (error) {
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการสมัครสมาชิก",
      }
    }
  }

  static async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const decoded = JSON.parse(atob(token))
      const user = MOCK_USERS.find((u) => u.id === decoded.userId)

      if (!user || !user.isActive) {
        return {
          success: false,
          message: "Token ไม่ถูกต้องหรือหมดอายุ",
        }
      }

      // Check if token is not too old (24 hours)
      const tokenAge = Date.now() - decoded.timestamp
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return {
          success: false,
          message: "Token หมดอายุแล้ว",
        }
      }

      return {
        success: true,
        user,
        token,
      }
    } catch (error) {
      return {
        success: false,
        message: "Token ไม่ถูกต้อง",
      }
    }
  }

  static hasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission)
  }

  static hasAnyPermission(user: User, permissions: string[]): boolean {
    return permissions.some((permission) => user.permissions.includes(permission))
  }

  static isBackendUser(user: User): boolean {
    return ["admin", "manager", "staff"].includes(user.role)
  }

  static getRedirectPath(user: User): string {
    if (this.isBackendUser(user)) {
      return "/admin"
    }
    return "/"
  }
}
