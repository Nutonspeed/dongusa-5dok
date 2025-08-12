import type {
  DynamicConfigField,
  DynamicConfigValue,
  ConfigCategory,
  ConfigValidationResult,
} from "./types/dynamic-config"

class DynamicConfigSystem {
  private fields: DynamicConfigField[] = []
  private values: DynamicConfigValue[] = []
  private categories: ConfigCategory[] = []

  constructor() {
    this.initializeDefaultCategories()
    this.initializeDefaultFields()
  }

  private initializeDefaultCategories() {
    this.categories = [
      {
        id: "business",
        name: "ข้อมูลธุรกิจ",
        nameEn: "Business Information",
        description: "ข้อมูลพื้นฐานของธุรกิจ",
        descriptionEn: "Basic business information",
        icon: "Building",
        order: 1,
        isActive: true,
      },
      {
        id: "pricing",
        name: "ราคาและต้นทุน",
        nameEn: "Pricing & Costs",
        description: "ข้อมูลราคาและต้นทุนต่างๆ",
        descriptionEn: "Pricing and cost information",
        icon: "DollarSign",
        order: 2,
        isActive: true,
      },
      {
        id: "analytics",
        name: "การวิเคราะห์",
        nameEn: "Analytics",
        description: "ข้อมูลสำหรับการวิเคราะห์",
        descriptionEn: "Analytics and tracking data",
        icon: "BarChart",
        order: 3,
        isActive: true,
      },
      {
        id: "technical",
        name: "ข้อมูลเทคนิค",
        nameEn: "Technical Settings",
        description: "การตั้งค่าทางเทคนิค",
        descriptionEn: "Technical configuration",
        icon: "Settings",
        order: 4,
        isActive: true,
      },
      {
        id: "marketing",
        name: "การตลาด",
        nameEn: "Marketing",
        description: "ข้อมูลการตลาดและโปรโมชั่น",
        descriptionEn: "Marketing and promotion data",
        icon: "Megaphone",
        order: 5,
        isActive: true,
      },
    ]
  }

  private initializeDefaultFields() {
    this.fields = [
      // Business Information
      {
        id: "business-name",
        key: "businessName",
        label: "ชื่อธุรกิจ",
        labelEn: "Business Name",
        type: "text",
        category: "business",
        required: true,
        description: "ชื่อทางการของธุรกิจ",
        descriptionEn: "Official business name",
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },
      {
        id: "business-registration",
        key: "businessRegistration",
        label: "เลขทะเบียนธุรกิจ",
        labelEn: "Business Registration Number",
        type: "text",
        category: "business",
        required: false,
        description: "เลขทะเบียนการค้าหรือเลขประจำตัวผู้เสียภาษี",
        descriptionEn: "Business registration or tax ID number",
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },

      // Pricing Information
      {
        id: "base-price-sofa-cover",
        key: "basePriceSofaCover",
        label: "ราคาพื้นฐานผ้าคลุมโซฟา",
        labelEn: "Base Price Sofa Cover",
        type: "number",
        category: "pricing",
        required: false,
        validation: { min: 0 },
        description: "ราคาพื้นฐานสำหรับผ้าคลุมโซฟาขนาดมาตรฐาน",
        descriptionEn: "Base price for standard sofa cover",
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },
      {
        id: "material-cost-premium",
        key: "materialCostPremium",
        label: "ต้นทุนวัสดุพรีเมียม",
        labelEn: "Premium Material Cost",
        type: "number",
        category: "pricing",
        required: false,
        validation: { min: 0 },
        description: "ต้นทุนเพิ่มเติมสำหรับวัสดุพรีเมียม",
        descriptionEn: "Additional cost for premium materials",
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },

      // Analytics
      {
        id: "google-analytics-id",
        key: "googleAnalyticsId",
        label: "Google Analytics ID",
        labelEn: "Google Analytics ID",
        type: "text",
        category: "analytics",
        required: false,
        validation: { pattern: "^G-[A-Z0-9]+$" },
        description: "รหัส Google Analytics สำหรับติดตามผู้เยี่ยมชม",
        descriptionEn: "Google Analytics tracking ID",
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },
      {
        id: "conversion-rate-target",
        key: "conversionRateTarget",
        label: "เป้าหมาย Conversion Rate (%)",
        labelEn: "Target Conversion Rate (%)",
        type: "number",
        category: "analytics",
        required: false,
        validation: { min: 0, max: 100 },
        description: "เป้าหมายอัตราการแปลงลูกค้า",
        descriptionEn: "Target customer conversion rate",
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },

      // Technical Settings
      {
        id: "api-rate-limit",
        key: "apiRateLimit",
        label: "ขีดจำกัด API (requests/minute)",
        labelEn: "API Rate Limit (requests/minute)",
        type: "number",
        category: "technical",
        required: false,
        defaultValue: 100,
        validation: { min: 1, max: 10000 },
        description: "จำนวนคำขอ API สูงสุดต่อนาที",
        descriptionEn: "Maximum API requests per minute",
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },
      {
        id: "cache-duration",
        key: "cacheDuration",
        label: "ระยะเวลา Cache (วินาที)",
        labelEn: "Cache Duration (seconds)",
        type: "number",
        category: "technical",
        required: false,
        defaultValue: 3600,
        validation: { min: 60, max: 86400 },
        description: "ระยะเวลาเก็บข้อมูลใน Cache",
        descriptionEn: "Data caching duration",
        isActive: true,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },

      // Marketing
      {
        id: "discount-percentage",
        key: "discountPercentage",
        label: "เปอร์เซ็นต์ส่วนลดมาตรฐาน",
        labelEn: "Standard Discount Percentage",
        type: "number",
        category: "marketing",
        required: false,
        validation: { min: 0, max: 50 },
        description: "เปอร์เซ็นต์ส่วนลดมาตรฐานสำหรับลูกค้าใหม่",
        descriptionEn: "Standard discount for new customers",
        isActive: true,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "system",
      },
    ]
  }

  // Field Management
  async createField(
    fieldData: Omit<DynamicConfigField, "id" | "createdAt" | "updatedAt">,
  ): Promise<DynamicConfigField> {
    const newField: DynamicConfigField = {
      ...fieldData,
      id: `field-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.fields.push(newField)
    return newField
  }

  async updateField(id: string, updates: Partial<DynamicConfigField>): Promise<DynamicConfigField | null> {
    const fieldIndex = this.fields.findIndex((field) => field.id === id)
    if (fieldIndex === -1) return null

    this.fields[fieldIndex] = {
      ...this.fields[fieldIndex],
      ...updates,
      updatedAt: new Date(),
    }

    return this.fields[fieldIndex]
  }

  async deleteField(id: string): Promise<boolean> {
    const fieldIndex = this.fields.findIndex((field) => field.id === id)
    if (fieldIndex === -1) return false

    // Soft delete - mark as inactive
    this.fields[fieldIndex].isActive = false
    this.fields[fieldIndex].updatedAt = new Date()

    return true
  }

  async getFields(category?: string): Promise<DynamicConfigField[]> {
    let filteredFields = this.fields.filter((field) => field.isActive)

    if (category) {
      filteredFields = filteredFields.filter((field) => field.category === category)
    }

    return filteredFields.sort((a, b) => a.order - b.order)
  }

  // Value Management
  async setValue(fieldId: string, value: any, userId: string): Promise<DynamicConfigValue | null> {
    const field = this.fields.find((f) => f.id === fieldId)
    if (!field) return null

    // Validate value
    const validation = await this.validateValue(field, value)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`)
    }

    // Check if value already exists
    const existingValueIndex = this.values.findIndex((v) => v.fieldId === fieldId && v.isActive)

    if (existingValueIndex !== -1) {
      // Update existing value
      this.values[existingValueIndex] = {
        ...this.values[existingValueIndex],
        value,
        updatedAt: new Date(),
        validatedAt: new Date(),
        validatedBy: userId,
      }
      return this.values[existingValueIndex]
    } else {
      // Create new value
      const newValue: DynamicConfigValue = {
        id: `value-${Date.now()}`,
        fieldId,
        value,
        isActive: true,
        validatedAt: new Date(),
        validatedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      this.values.push(newValue)
      return newValue
    }
  }

  async getValue(fieldId: string): Promise<any> {
    const value = this.values.find((v) => v.fieldId === fieldId && v.isActive)
    if (value) return value.value

    // Return default value if no custom value set
    const field = this.fields.find((f) => f.id === fieldId)
    return field?.defaultValue
  }

  async getAllValues(category?: string): Promise<Record<string, any>> {
    const fields = await this.getFields(category)
    const result: Record<string, any> = {}

    for (const field of fields) {
      result[field.key] = await this.getValue(field.id)
    }

    return result
  }

  // Validation
  async validateValue(field: DynamicConfigField, value: any): Promise<ConfigValidationResult> {
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    }

    // Required validation
    if (field.required && (value === null || value === undefined || value === "")) {
      result.isValid = false
      result.errors.push(`${field.label} is required`)
      return result
    }

    // Type validation
    if (value !== null && value !== undefined) {
      switch (field.type) {
        case "number":
          if (isNaN(Number(value))) {
            result.isValid = false
            result.errors.push(`${field.label} must be a number`)
          } else {
            const numValue = Number(value)
            if (field.validation?.min !== undefined && numValue < field.validation.min) {
              result.isValid = false
              result.errors.push(`${field.label} must be at least ${field.validation.min}`)
            }
            if (field.validation?.max !== undefined && numValue > field.validation.max) {
              result.isValid = false
              result.errors.push(`${field.label} must be at most ${field.validation.max}`)
            }
          }
          break

        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            result.isValid = false
            result.errors.push(`${field.label} must be a valid email address`)
          }
          break

        case "url":
          try {
            new URL(value)
          } catch {
            result.isValid = false
            result.errors.push(`${field.label} must be a valid URL`)
          }
          break

        case "select":
          if (field.validation?.options && !field.validation.options.includes(value)) {
            result.isValid = false
            result.errors.push(`${field.label} must be one of: ${field.validation.options.join(", ")}`)
          }
          break
      }

      // Pattern validation
      if (field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern)
        if (!regex.test(value)) {
          result.isValid = false
          result.errors.push(`${field.label} format is invalid`)
        }
      }
    }

    return result
  }

  // Categories
  async getCategories(): Promise<ConfigCategory[]> {
    return this.categories.filter((cat) => cat.isActive).sort((a, b) => a.order - b.order)
  }

  async createCategory(categoryData: Omit<ConfigCategory, "id">): Promise<ConfigCategory> {
    const newCategory: ConfigCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    }

    this.categories.push(newCategory)
    return newCategory
  }

  // Export/Import
  async exportConfig(): Promise<string> {
    const config = {
      categories: this.categories,
      fields: this.fields,
      values: this.values,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    }

    return JSON.stringify(config, null, 2)
  }

  async importConfig(configJson: string): Promise<boolean> {
    try {
      const config = JSON.parse(configJson)

      // Validate structure
      if (!config.categories || !config.fields || !config.values) {
        throw new Error("Invalid configuration format")
      }

      // Backup current config
      const backup = {
        categories: [...this.categories],
        fields: [...this.fields],
        values: [...this.values],
      }

      try {
        // Import new config
        this.categories = config.categories
        this.fields = config.fields
        this.values = config.values

        return true
      } catch (error) {
        // Restore backup on error
        this.categories = backup.categories
        this.fields = backup.fields
        this.values = backup.values
        throw error
      }
    } catch (error) {
      console.error("Failed to import configuration:", error)
      return false
    }
  }
}

export const dynamicConfigSystem = new DynamicConfigSystem()
