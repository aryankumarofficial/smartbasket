"use client"

import type { ComponentProps } from "react"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

type PasswordFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label: string
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
}

export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  autoComplete = "current-password",
  disabled,
}: PasswordFieldProps<T>) {
  return (
    <FormField
      control={control as Control<FieldValues>}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder={placeholder}
              autoComplete={autoComplete}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
