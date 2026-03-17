"use client"

import { useState, useCallback } from "react"
import type { ZodObject, ZodRawShape } from "zod"
import { z } from "zod"

export type FieldStatus = "neutral" | "valid" | "invalid"

export interface UseFormValidationReturn<T extends Record<string, unknown>> {
  fieldErrors: Partial<Record<keyof T, string>>
  fieldStatus: Partial<Record<keyof T, FieldStatus>>
  validateField: (name: keyof T, value: unknown) => boolean
  validateAll: (data: T) => boolean
  setFieldError: (name: keyof T, message: string) => void
  clearFieldError: (name: keyof T) => void
  setServerErrors: (details: Array<{ path: (string | number)[]; message: string }>) => void
  hasErrors: boolean
  resetValidation: () => void
}

/**
 * Shared validation hook that uses Zod schemas as single source of truth.
 * Works with both full-object schemas (productCreateSchema) and partial schemas (productUpdateSchema).
 */
export function useFormValidation<T extends Record<string, unknown>>(
  schema: ZodObject<ZodRawShape>,
): UseFormValidationReturn<T> {
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [fieldStatus, setFieldStatus] = useState<Partial<Record<keyof T, FieldStatus>>>({})

  const validateField = useCallback(
    (name: keyof T, value: unknown): boolean => {
      // Extract the shape for this specific field and validate just that field
      const shape = schema.shape as Record<string, z.ZodTypeAny>
      const fieldSchema = shape[name as string]

      if (!fieldSchema) return true

      // Unwrap .optional() to validate the inner type when value is non-empty
      let innerSchema = fieldSchema
      if (innerSchema instanceof z.ZodOptional) {
        if (value === undefined || value === null || value === "") {
          // Optional field with no value - valid
          setFieldErrors((prev) => {
            const next = { ...prev }
            delete next[name]
            return next
          })
          setFieldStatus((prev) => ({ ...prev, [name]: "neutral" as const }))
          return true
        }
        innerSchema = innerSchema.unwrap()
      }

      const result = innerSchema.safeParse(value)

      if (result.success) {
        setFieldErrors((prev) => {
          const next = { ...prev }
          delete next[name]
          return next
        })
        setFieldStatus((prev) => ({ ...prev, [name]: "valid" as const }))
        return true
      } else {
        const message = result.error.errors[0]?.message || "Campo inválido"
        setFieldErrors((prev) => ({ ...prev, [name]: message }))
        setFieldStatus((prev) => ({ ...prev, [name]: "invalid" as const }))
        return false
      }
    },
    [schema],
  )

  const validateAll = useCallback(
    (data: T): boolean => {
      const result = schema.safeParse(data)
      if (result.success) {
        setFieldErrors({})
        // Mark all provided fields as valid
        const statuses: Partial<Record<keyof T, FieldStatus>> = {}
        for (const key of Object.keys(data)) {
          statuses[key as keyof T] = "valid"
        }
        setFieldStatus(statuses)
        return true
      }

      const errors: Partial<Record<keyof T, string>> = {}
      const statuses: Partial<Record<keyof T, FieldStatus>> = {}

      for (const err of result.error.errors) {
        const fieldName = err.path[0] as keyof T
        if (fieldName && !errors[fieldName]) {
          errors[fieldName] = err.message
          statuses[fieldName] = "invalid"
        }
      }

      // Mark fields without errors as valid
      for (const key of Object.keys(data)) {
        if (!errors[key as keyof T]) {
          statuses[key as keyof T] = "valid"
        }
      }

      setFieldErrors(errors)
      setFieldStatus(statuses)
      return false
    },
    [schema],
  )

  const setFieldError = useCallback((name: keyof T, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [name]: message }))
    setFieldStatus((prev) => ({ ...prev, [name]: "invalid" as const }))
  }, [])

  const clearFieldError = useCallback((name: keyof T) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
    setFieldStatus((prev) => ({ ...prev, [name]: "neutral" as const }))
  }, [])

  const setServerErrors = useCallback(
    (details: Array<{ path: (string | number)[]; message: string }>) => {
      const errors: Partial<Record<keyof T, string>> = {}
      const statuses: Partial<Record<keyof T, FieldStatus>> = {}
      for (const detail of details) {
        const fieldName = detail.path[0] as keyof T
        if (fieldName && !errors[fieldName]) {
          errors[fieldName] = detail.message
          statuses[fieldName] = "invalid"
        }
      }
      setFieldErrors((prev) => ({ ...prev, ...errors }))
      setFieldStatus((prev) => ({ ...prev, ...statuses }))
    },
    [],
  )

  const hasErrors = Object.keys(fieldErrors).length > 0

  const resetValidation = useCallback(() => {
    setFieldErrors({})
    setFieldStatus({})
  }, [])

  return {
    fieldErrors,
    fieldStatus,
    validateField,
    validateAll,
    setFieldError,
    clearFieldError,
    setServerErrors,
    hasErrors,
    resetValidation,
  }
}
