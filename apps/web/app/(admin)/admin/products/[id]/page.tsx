"use client"

import { useParams } from "next/navigation"
import { useState } from "react"

import { Skeleton } from "@workspace/ui/components/skeleton"
import { AdminProductFullForm } from "@/src/features/admin/admin-product-full-form"
import { getUserFacingErrorMessage } from "@/src/lib/errors"
import { useAdminProductQuery, useUpdateAdminProductMutation } from "@/src/hooks/queries/useAdminProducts"

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ""
  const { data, isPending, isError, error } = useAdminProductQuery(id || null)
  const updateMut = useUpdateAdminProductMutation()
  const [localErr, setLocalErr] = useState<string | null>(null)

  if (!id) {
    return <p className="text-muted-foreground text-sm">Missing product id.</p>
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError || !data?.product) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {getUserFacingErrorMessage(error)}
      </p>
    )
  }

  return (
    <div className="pb-16">
      {localErr ? (
        <p className="text-destructive mb-4 text-sm" role="alert">
          {localErr}
        </p>
      ) : null}
      <AdminProductFullForm
        product={data.product as never}
        pending={updateMut.isPending}
        onSubmit={async ({ body, imageFiles }) => {
          setLocalErr(null)
          try {
            await updateMut.mutateAsync({ id, body, newImages: imageFiles })
          } catch (e) {
            setLocalErr(e instanceof Error ? e.message : "Failed to save")
          }
        }}
      />
    </div>
  )
}
