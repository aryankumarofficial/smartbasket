"use client"

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { getUserFacingErrorMessage } from "@/src/lib/errors"
import {
  useAdminProductsQuery,
  useCreateAdminProductMutation,
  useDeleteAdminProductMutation,
  useUpdateAdminProductMutation,
} from "@/src/hooks/queries/useAdminProducts"
import type { ProductUpsertInput } from "@/src/modules/products/types"
import type { AdminProductDraft } from "@/src/components/features/admin/product-form-dialog"
import { ProductFormDialog } from "@/src/components/features/admin/product-form-dialog"
import { toAdminProductDraft } from "@/src/components/features/admin/product-draft-utils"
import type { ProductListItem } from "@/src/types/product"

export function AdminProductsPanel() {
  const { data, isPending, isError, error, refetch } = useAdminProductsQuery()
  const createMut = useCreateAdminProductMutation()
  const updateMut = useUpdateAdminProductMutation()
  const deleteMut = useDeleteAdminProductMutation()

  const [createOpen, setCreateOpen] = useState(false)
  const [editRow, setEditRow] = useState<AdminProductDraft | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const rows: ProductListItem[] = useMemo(() => data?.products ?? [], [data])

  async function handleSubmit(payload: { body: ProductUpsertInput; imageFiles?: File[] }) {
    if (editRow) {
      await updateMut.mutateAsync({
        id: editRow.id,
        body: payload.body,
        newImages: payload.imageFiles,
      })
    } else {
      await createMut.mutateAsync({
        body: payload.body,
        imageFiles: payload.imageFiles,
      })
    }
  }

  const busy = createMut.isPending || updateMut.isPending || deleteMut.isPending

  if (isPending) {
    return <p className="text-muted-foreground text-sm">Loading products…</p>
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <p className="text-destructive text-sm">{getUserFacingErrorMessage(error)}</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage catalog items and media.</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditRow(null)
            setCreateOpen(true)
          }}
        >
          <Plus className="size-4" />
          Add product
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-2xl border border-dashed p-10 text-center text-sm">
          No products yet. Create your first SKU to get started.
        </p>
      ) : (
        <div className="border-border rounded-2xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.title ?? row.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {typeof row.price === "string" ? row.price : row.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Open row menu">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => {
                            setCreateOpen(false)
                            setEditRow(toAdminProductDraft(row))
                          }}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive gap-2"
                          onClick={() => setDeleteId(row.id)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductFormDialog
        open={createOpen || !!editRow}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false)
            setEditRow(null)
          }
        }}
        title={editRow ? "Edit product" : "New product"}
        product={editRow}
        pending={busy}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the SKU from the catalog. Orders referencing archived lines remain intact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={deleteMut.isPending}
              onClick={async (e) => {
                e.preventDefault()
                if (!deleteId) {
                  return
                }
                await deleteMut.mutateAsync(deleteId)
                setDeleteId(null)
              }}
            >
              {deleteMut.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
