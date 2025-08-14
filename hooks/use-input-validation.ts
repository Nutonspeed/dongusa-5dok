"use client"

import { useState, useCallback } from "react"
import { inputValidator, type ValidationSchemas } from "@/lib/input-validation"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitized: string
}

export function useInputValidation() {
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({})

  const validateField = useCallback(
    (name: string, value: string, type: keyof typeof ValidationSchemas): ValidationResult => {
      const result = inputValidator.validateInput(value, type)

      setValidationResults((prev) => ({
        ...prev,
        [name]: result,
      }))

      return result
    },
    [],
  )

  const validateForm = useCallback(
    (data: Record<string, any>, schema: Record<string, keyof typeof ValidationSchemas>) => {
      const result = inputValidator.validateForm(data, schema)

      // Update individual field results
      Object.entries(result.errors).forEach(([field, errors]) => {
        setValidationResults((prev) => ({
          ...prev,
          [field]: {
            isValid: false,
            errors,
            sanitized: result.sanitized[field],
          },
        }))
      })

      return result
    },
    [],
  )

  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationResults((prev) => {
        const { [fieldName]: _, ...rest } = prev
        return rest
      })
    } else {
      setValidationResults({})
    }
  }, [])

  const getFieldValidation = useCallback(
    (fieldName: string): ValidationResult | null => {
      return validationResults[fieldName] || null
    },
    [validationResults],
  )

  return {
    validateField,
    validateForm,
    clearValidation,
    getFieldValidation,
    validationResults,
  }
}
