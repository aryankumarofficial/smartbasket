import { Suspense } from "react"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { LoginForm } from "@/src/components/features/auth/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>
}) {
  const q = await searchParams
  const registered = q.registered === "1"

  return (
    <Suspense fallback={<Skeleton className="mx-auto h-[420px] w-full max-w-md rounded-2xl" />}>
      <LoginForm registered={registered} />
    </Suspense>
  )
}
