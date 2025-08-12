export interface ConfigField {
  id: string
  key: string
  value: any
  type: "string" | "number" | "boolean" | "json" | "date" | "array"
  category: string
  description?: string
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
    enum?: string[]
  }
  metadata?: {
    createdAt: Date
    updatedAt: Date
    createdBy: string
    updatedBy: string
    version: number
  }
}

export interface ConfigCategory {
  id: string
  name: string
  description?: string
  icon?: string
  order: number
  permissions?: string[]
}

export interface ConfigValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ConfigAuditLog {
  id: string
  configId: string
  action: "create" | "update" | "delete"
  oldValue?: any
  newValue?: any
  userId: string
  timestamp: Date
  reason?: string
}

export interface DynamicConfigState {
  configs: Record<string, ConfigField>
  categories: Record<string, ConfigCategory>
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}
