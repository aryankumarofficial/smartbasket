"use client"

import * as React from "react"
import { Controller, type ControllerProps, FormProvider, useFormContext } from "react-hook-form"

import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"

const Form = FormProvider

type FormFieldContextValue = {
  name: string
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

function FormField(props: ControllerProps) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const { getFieldState, formState } = useFormContext()
  if (!fieldContext?.name) {
    throw new Error("useFormField must be used within <FormField>")
  }
  return {
    name: fieldContext.name,
    ...getFieldState(fieldContext.name, formState),
  }
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-2", className)} data-slot="form-item" {...props} />
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error } = useFormField()
  return <Label className={cn(error && "text-destructive", className)} {...props} />
}

function FormControl({ className, ...props }: React.ComponentProps<"div">) {
  const { error } = useFormField()
  return (
    <div
      className={cn(className)}
      data-slot="form-control"
      data-invalid={error ? "true" : undefined}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-muted-foreground text-sm", className)} {...props} />
}

function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { error } = useFormField()
  const body = error ? String(error.message ?? "") : children
  if (!body) {
    return null
  }
  return (
    <p
      className={cn("text-destructive text-sm font-medium", className)}
      data-slot="form-message"
      {...props}
    >
      {body}
    </p>
  )
}

export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, useFormField }
