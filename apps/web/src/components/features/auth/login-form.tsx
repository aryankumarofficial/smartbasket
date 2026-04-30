"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Form } from "@workspace/ui/components/form"
import { InputField } from "@/src/components/forms/input-field"
import { PasswordField } from "@/src/components/forms/password-field"
import { ApiError } from "@/src/lib/api"
import { loginSchema, type LoginFormValues } from "@/src/lib/validations/auth"
import { useAuth } from "@/src/hooks/useAuth"

export function LoginForm({ registered }: { registered?: boolean }) {
  const router = useRouter()
  const params = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const pending = form.formState.isSubmitting

  async function onSubmit(values: LoginFormValues) {
    setError(null)
    try {
      const session = await login(values)
      const next = params.get("from")
      if (session.user.role === "admin") {
        router.replace(next?.startsWith("/admin") ? next : "/admin/dashboard")
      } else {
        router.replace(next && !next.startsWith("/admin") ? next : "/")
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Sign in failed")
    }
  }

  return (
    <Card className="w-full max-w-md border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">Sign in</CardTitle>
        <CardDescription>Use your SmartBasket account credentials.</CardDescription>
      </CardHeader>
      <CardContent>
        {registered ? (
          <Alert className="mb-6 rounded-2xl">
            <AlertTitle>Account ready</AlertTitle>
            <AlertDescription>You can sign in with the email you just registered.</AlertDescription>
          </Alert>
        ) : null}
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            <InputField control={form.control} name="email" label="Email" type="email" autoComplete="email" />
            <PasswordField
              control={form.control}
              name="password"
              label="Password"
              autoComplete="current-password"
            />
            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          No account?{" "}
          <Link className="text-primary font-medium underline-offset-4 hover:underline" href="/register">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
