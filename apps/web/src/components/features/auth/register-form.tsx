"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Form } from "@workspace/ui/components/form"
import { InputField } from "@/src/components/forms/input-field"
import { PasswordField } from "@/src/components/forms/password-field"
import { ApiError } from "@/src/lib/api"
import { registerSchema, type RegisterFormValues } from "@/src/lib/validations/auth"
import { useAuth } from "@/src/hooks/useAuth"

export function RegisterForm() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const pending = form.formState.isSubmitting

  async function onSubmit(values: RegisterFormValues) {
    setError(null)
    try {
      await registerUser(values)
      router.replace("/login?registered=1")
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Registration failed")
    }
  }

  return (
    <Card className="w-full max-w-md border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">Create account</CardTitle>
        <CardDescription>Join SmartBasket to track orders and recommendations.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            <InputField control={form.control} name="name" label="Full name" autoComplete="name" />
            <InputField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
            <PasswordField
              control={form.control}
              name="password"
              label="Password"
              autoComplete="new-password"
            />
            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline-offset-4 hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
