"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useInputValidation, type ValidationResult } from "@/hooks/use-input-validation"
import type { ValidationSchemas } from "@/lib/input-validation"
import { cn } from "@/lib/utils"

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  validationType: keyof typeof ValidationSchemas
  onValidationChange?: (result: ValidationResult) => void
  showValidation?: boolean
  validateOnBlur?: boolean
  validateOnChange?: boolean
}

export function ValidatedInput({
  label,
  validationType,
  onValidationChange,
  showValidation = true,
  validateOnBlur = true,
  validateOnChange = false,
  className,
  ...props
}: ValidatedInputProps) {
  const [value, setValue] = useState(props.value || "")
  const [touched, setTouched] = useState(false)
  const { validateField, getFieldValidation } = useInputValidation()

  const fieldName = props.name || "input"
  const validation = getFieldValidation(fieldName)

  const performValidation = (inputValue: string) => {
    const result = validateField(fieldName, inputValue, validationType)
    onValidationChange?.(result)
    return result
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    props.onChange?.(e)

    if (validateOnChange && touched) {
      performValidation(newValue)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true)
    props.onBlur?.(e)

    if (validateOnBlur) {
      performValidation(e.target.value)
    }
  }

  const hasErrors = validation && !validation.isValid && touched
  const hasSuccess = validation && validation.isValid && touched

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id || fieldName} className="text-sm font-medium">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          className,
          hasErrors && "border-red-500 focus:border-red-500",
          hasSuccess && "border-green-500 focus:border-green-500",
        )}
      />

      {showValidation && hasErrors && validation && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-sm">{validation.errors[0]}</AlertDescription>
        </Alert>
      )}

      {showValidation && hasSuccess && <div className="text-sm text-green-600">✓ Valid input</div>}
    </div>
  )
}
