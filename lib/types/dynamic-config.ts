// Dynamic Configuration System Types
export interface DynamicConfigField {
  id: string
  key: string
  label: string
  labelEn: string
  type: "text" | "number" | "boolean" | "select" | "multiselect" | "date" | "url" | "email" | "textarea" | "json"
  category: "business" | "technical" | "marketing" | "analytics" | "pricing" | "inventory" | "customer"
  required: boolean
  defaultValue?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
    options?: string[]
    customValidator?: string
  }
  description: string
  descriptionEn: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface DynamicConfigValue {
  id: string
  fieldId: string
  value: any
  isActive: boolean
  validatedAt?: Date
  validatedBy?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ConfigCategory {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  icon: string
  order: number
  isActive: boolean
}

export interface ConfigValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}
