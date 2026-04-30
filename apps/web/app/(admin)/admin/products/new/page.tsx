"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { AdminProductFullForm } from "@/src/features/admin/admin-product-full-form"
import { useCreateAdminProductMutation } from "@/src/hooks/queries/useAdminProducts"

export default function AdminNewProductPage() {
  const router = useRouter()
  const createMut = useCreateAdminProductMutation()
  const [err, setErr] = useState<string | null>(null)

  return (
    <div className="pb-16">
      {err ? (
        <p className="text-destructive mb-4 text-sm" role="alert">
          {err}
        </p>
      ) : null}
      <AdminProductFullForm
        product={null}
        pending={createMut.isPending}
        onSubmit={async ({ body, imageFiles }) => {
          setErr(null)
          try {
            const res = await createMut.mutateAsync({ body, imageFiles })
            const id = res.product?.id
            if (id) router.replace(`/admin/products/${id}`)
          } catch (e) {
            setErr(e instanceof Error ? e.message : "Failed to create")
          }
        }}
      />
    </div>
  )
}
