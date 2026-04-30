"use client"

import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"
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
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
  const [q, setQ] = useState("")
  const [appliedQ, setAppliedQ] = useState("")
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<"created_desc" | "name" | "price_desc">("created_desc")
  const limit = 15

  const filters = useMemo(
    () => ({
      q: appliedQ.trim() || undefined,
      page,
      limit,
      sort,
    }),
    [appliedQ, page, limit, sort]
  )

  const { data, isPending, isError, error, refetch } = useAdminProductsQuery(filters)
  const createMut = useCreateAdminProductMutation()
  const updateMut = useUpdateAdminProductMutation()
  const deleteMut = useDeleteAdminProductMutation()

  const [createOpen, setCreateOpen] = useState(false)
  const [editRow, setEditRow] = useState<AdminProductDraft | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const rows: ProductListItem[] = useMemo(() => data?.products ?? [], [data])
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Search, paginate, and open the full editor for complex merchandising.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="default" className="gap-2">
            <Link href="/admin/products/new">
              <Plus className="size-4" />
              Full editor
            </Link>
          </Button>
          <Button
            className="gap-2"
            variant="outline"
            onClick={() => {
              setEditRow(null)
              setCreateOpen(true)
            }}
          >
            <Plus className="size-4" />
            Quick add
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex max-w-md flex-1 flex-col gap-1">
          <label className="text-muted-foreground text-xs font-medium">Search</label>
          <div className="flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name or description"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setAppliedQ(q)
                  setPage(1)
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Search"
              onClick={() => {
                setAppliedQ(q)
                setPage(1)
              }}
            >
              <Search className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-muted-foreground text-xs font-medium">Sort</label>
          <Select
            value={sort}
            onValueChange={(v) => {
              setSort(v as typeof sort)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">Newest</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
              <SelectItem value="price_desc">Price high → low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-2xl border border-dashed p-10 text-center text-sm">
          No products match your filters.
        </p>
      ) : (
        <div className="border-border rounded-2xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16" />
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.imageUrl || row.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(row.imageUrl ?? row.images?.[0]) as string}
                        alt=""
                        className="size-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="bg-muted size-12 rounded-md" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/products/${row.id}`}
                        className="font-medium hover:underline"
                      >
                        {row.name}
                      </Link>
                      <span className="text-muted-foreground text-xs">{row.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{String(row.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.inventoryCount ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-[220px] flex-wrap gap-1">
                      {(row.manualTags ?? []).slice(0, 4).map((t) => (
                        <Badge key={`${t.tag}-${t.category}`} variant="outline" className="text-[10px]">
                          {t.tag}
                        </Badge>
                      ))}
                      {(row.manualTags?.length ?? 0) > 4 ? (
                        <span className="text-muted-foreground text-xs">+{row.manualTags!.length - 4}</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Row actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${row.id}`} className="cursor-pointer gap-2">
                            <Pencil className="size-4" />
                            Edit (full)
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => {
                            setEditRow(toAdminProductDraft(row))
                            setCreateOpen(true)
                          }}
                        >
                          <Pencil className="size-4" />
                          Quick edit
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Page {page} of {totalPages} · {total} products
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <ProductFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        product={editRow}
        title={editRow ? "Edit product" : "Create product"}
        pending={busy}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the catalog record. Orders referencing it keep line-item
              snapshots.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteId) return
                void deleteMut.mutateAsync(deleteId).then(() => setDeleteId(null))
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
