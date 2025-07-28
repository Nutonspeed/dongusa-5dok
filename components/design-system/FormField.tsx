"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

interface BaseFieldProps {
  label?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
  id?: string
}

interface TextFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url"
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  autoComplete?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  rows?: number
  maxLength?: number
  minLength?: number
  resize?: boolean
}

interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

interface RadioFieldProps extends BaseFieldProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  options: Array<{ value: string; label: string; disabled?: boolean }>
  orientation?: "horizontal" | "vertical"
}

// Base Field Wrapper Component
function FieldWrapper({
  children,
  label,
  description,
  error,
  required,
  className,
  id,
}: BaseFieldProps & { children: React.ReactNode }) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// Text Field Component
export function TextField({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  leftIcon,
  rightIcon,
  ...fieldProps
}: TextFieldProps) {
  const id = React.useId()
  const [showPassword, setShowPassword] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value || "")

  React.useEffect(() => {
    setInternalValue(value || "")
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  const inputType = type === "password" && showPassword ? "text" : type

  return (
    <FieldWrapper {...fieldProps} id={id}>
      <div className="relative">
        {leftIcon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{leftIcon}</div>}
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={internalValue}
          onChange={handleChange}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          className={cn(
            leftIcon && "pl-10",
            (rightIcon || type === "password") && "pr-10",
            fieldProps.error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          )}
          aria-invalid={!!fieldProps.error}
          aria-describedby={fieldProps.error ? `${id}-error` : undefined}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {rightIcon && type !== "password" && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">{rightIcon}</div>
        )}
      </div>
    </FieldWrapper>
  )
}

// Textarea Field Component
export function TextareaField({
  placeholder,
  value,
  onChange,
  disabled,
  rows = 3,
  maxLength,
  minLength,
  resize = true,
  ...fieldProps
}: TextareaFieldProps) {
  const id = React.useId()
  const [internalValue, setInternalValue] = React.useState(value || "")

  React.useEffect(() => {
    setInternalValue(value || "")
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <FieldWrapper {...fieldProps} id={id}>
      <Textarea
        id={id}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        minLength={minLength}
        className={cn(
          !resize && "resize-none",
          fieldProps.error && "border-red-500 focus:border-red-500 focus:ring-red-500",
        )}
        aria-invalid={!!fieldProps.error}
        aria-describedby={fieldProps.error ? `${id}-error` : undefined}
      />
      {maxLength && (
        <div className="text-right text-sm text-muted-foreground">
          {internalValue.length}/{maxLength}
        </div>
      )}
    </FieldWrapper>
  )
}

// Select Field Component
export function SelectField({
  placeholder = "Select an option",
  value,
  onChange,
  disabled,
  options,
  ...fieldProps
}: SelectFieldProps) {
  const id = React.useId()

  return (
    <FieldWrapper {...fieldProps} id={id}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className={cn(fieldProps.error && "border-red-500 focus:border-red-500 focus:ring-red-500")}
          aria-invalid={!!fieldProps.error}
          aria-describedby={fieldProps.error ? `${id}-error` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  )
}

// Checkbox Field Component
export function CheckboxField({ checked, onChange, disabled, ...fieldProps }: CheckboxFieldProps) {
  const id = React.useId()

  return (
    <div className={cn("flex items-start space-x-2", fieldProps.className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className={cn("mt-0.5", fieldProps.error && "border-red-500 data-[state=checked]:bg-red-500")}
        aria-invalid={!!fieldProps.error}
        aria-describedby={fieldProps.error ? `${id}-error` : undefined}
      />
      <div className="space-y-1">
        {fieldProps.label && (
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
            {fieldProps.label}
            {fieldProps.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        {fieldProps.description && <p className="text-sm text-muted-foreground">{fieldProps.description}</p>}
        {fieldProps.error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{fieldProps.error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Radio Field Component
export function RadioField({
  value,
  onChange,
  disabled,
  options,
  orientation = "vertical",
  ...fieldProps
}: RadioFieldProps) {
  const id = React.useId()

  return (
    <FieldWrapper {...fieldProps} id={id}>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className={cn(orientation === "horizontal" ? "flex flex-wrap gap-6" : "space-y-2")}
        aria-invalid={!!fieldProps.error}
        aria-describedby={fieldProps.error ? `${id}-error` : undefined}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${id}-${option.value}`}
              disabled={option.disabled}
              className={cn(fieldProps.error && "border-red-500 text-red-500")}
            />
            <Label htmlFor={`${id}-${option.value}`} className="text-sm font-medium cursor-pointer">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FieldWrapper>
  )
}
