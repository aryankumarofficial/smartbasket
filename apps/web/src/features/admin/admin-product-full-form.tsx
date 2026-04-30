"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { GripVertical, Plus, Trash2, Upload } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { productFormSchema, type ProductFormValues } from "@/src/lib/validations/product"
import type { ProductUpsertInput } from "@/src/modules/products/types"

const variantRowSchema = z.object({
  label: z.string().min(1, "Label required"),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  priceModifier: z.string().optional(),
})

const adminProductSchema = productFormSchema.extend({
  originalPrice: z.string().optional(),
  inventoryCount: z.coerce.number().int().min(0),
  inStock: z.boolean(),
  subcategory: z.string().max(160).optional(),
  brand: z.string().max(160).optional(),
  variantRows: z.array(variantRowSchema),
  metadataJson: z.string().max(20000).optional(),
})

export type AdminProductFullValues = z.infer<typeof adminProductSchema>

function mapToUpsert(values: AdminProductFullValues): ProductUpsertInput {
  let metadata: Record<string, unknown> | undefined
  if (values.metadataJson?.trim()) {
    try {
      metadata = JSON.parse(values.metadataJson) as Record<string, unknown>
    } catch {
      metadata = { raw: values.metadataJson }
    }
  }
  if (values.variantRows?.length) {
    metadata = { ...(metadata ?? {}), variants: { rows: values.variantRows } }
  }
  return {
    title: values.title,
    description: values.description,
    price: values.price,
    originalPrice: values.originalPrice?.trim() || undefined,
    category: values.category,
    subcategory: values.subcategory?.trim() || undefined,
    brand: values.brand?.trim() || undefined,
    images: values.images,
    manualTags: values.manualTags.map((t) => ({
      tag: t.tag,
      category: t.category,
      weight: t.weight,
      source: "manual" as const,
    })),
    metadata,
    inventoryCount: values.inventoryCount,
    inStock: values.inStock,
  }
}

type ProductRecord = {
  id: string
  name: string
  title?: string | null
  description?: string | null
  price: string | number
  originalPrice?: string | null
  category: string
  subcategory?: string | null
  brand?: string | null
  images?: string[] | null
  manualTags?: ProductFormValues["manualTags"] | null
  aiTags?: { tag: string; category: string; weight: number; source: string }[] | null
  finalTags?: { tag: string; category: string; weight: number; source: string }[] | null
  inventoryCount?: number | null
  inStock?: boolean | null
  metadata?: Record<string, unknown> | null
}

export function AdminProductFullForm({
  product,
  pending,
  onSubmit,
}: {
  product: ProductRecord | null
  pending?: boolean
  onSubmit: (payload: { body: ProductUpsertInput; imageFiles?: File[] }) => Promise<void>
}) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadPct, setUploadPct] = useState(0)

  const defaults = useMemo((): AdminProductFullValues => {
    const meta = product?.metadata ?? undefined
    const rows =
      meta &&
      typeof meta === "object" &&
      "variants" in meta &&
      meta.variants &&
      typeof meta.variants === "object" &&
      "rows" in (meta.variants as object) &&
      Array.isArray((meta.variants as { rows?: unknown }).rows)
        ? ((meta.variants as { rows: z.infer<typeof variantRowSchema>[] }).rows as AdminProductFullValues["variantRows"])
        : []

    return {
      title: product?.title ?? product?.name ?? "",
      description: product?.description ?? "",
      price: String(product?.price ?? "0"),
      originalPrice: product?.originalPrice ? String(product.originalPrice) : "",
      category: product?.category ?? "",
      subcategory: product?.subcategory ?? "",
      brand: product?.brand ?? "",
      images: product?.images ?? [],
      manualTags:
        product?.manualTags?.map((t) => ({
          tag: t.tag,
          category: t.category,
          weight: t.weight,
          source: "manual" as const,
        })) ?? [],
      inventoryCount: product?.inventoryCount ?? 0,
      inStock: product?.inStock ?? true,
      variantRows: rows,
      metadataJson: meta ? JSON.stringify(meta, null, 2) : "",
    }
  }, [product])

  const form = useForm<AdminProductFullValues>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: defaults,
    values: defaults,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variantRows",
  })

  const images = form.watch("images")

  function moveImage(index: number, dir: -1 | 1) {
    const next = [...(form.getValues("images") ?? [])]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    const t = next[index]
    next[index] = next[j]!
    next[j] = t!
    form.setValue("images", next, { shouldDirty: true })
  }

  async function handleSubmit(values: AdminProductFullValues) {
    setUploadPct(0)
    const id = window.setInterval(() => {
      setUploadPct((p) => (p >= 90 ? 90 : p + 12))
    }, 120)
    try {
      await onSubmit({
        body: mapToUpsert(values),
        imageFiles: files.length ? files : undefined,
      })
      setFiles([])
      setUploadPct(100)
    } finally {
      window.clearInterval(id)
      setTimeout(() => setUploadPct(0), 400)
    }
  }

  return (
    <Form {...form}>
      <form className="mx-auto max-w-4xl space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {product ? "Edit product" : "New product"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Full catalog record with inventory, variants, media, and SmartBasket tagging.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/products">Back to list</Link>
          </Button>
        </div>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Basic</CardTitle>
            <CardDescription>Title, description, and merchandising category.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Primary price and optional strike-through original.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="originalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original / list price (optional)</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Stock count and availability flag.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="inventoryCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock count</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inStock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 rounded-xl border p-4">
                  <FormControl>
                    <input
                      id="admin-product-in-stock"
                      type="checkbox"
                      className="border-primary text-primary focus-visible:ring-ring size-4 shrink-0 rounded border shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <div>
                    <FormLabel htmlFor="admin-product-in-stock">In stock</FormLabel>
                    <p className="text-muted-foreground text-xs">Uncheck to mark unavailable.</p>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Optional rows (bundle / size / SKU) stored in product metadata.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => append({ label: "", sku: "", stock: 0, priceModifier: "" })}
            >
              <Plus className="size-4" /> Add row
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.length === 0 ? (
              <p className="text-muted-foreground text-sm">No variant rows. Add rows for operational SKUs.</p>
            ) : null}
            {fields.map((f, i) => (
              <div
                key={f.id}
                className="border-border/80 flex flex-col gap-3 rounded-xl border p-3 md:grid md:grid-cols-12 md:items-end"
              >
                <GripVertical className="text-muted-foreground hidden size-4 md:col-span-1 md:block" aria-hidden />
                <FormField
                  control={form.control}
                  name={`variantRows.${i}.label`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 500g pack" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variantRows.${i}.sku`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variantRows.${i}.stock`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`variantRows.${i}.priceModifier`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Δ price</FormLabel>
                      <FormControl>
                        <Input placeholder="+20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove row">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Drag files in, reorder URLs, remove unwanted shots.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" size="sm" className="relative gap-2" asChild>
                <label>
                  <Upload className="size-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => {
                      const list = e.target.files ? Array.from(e.target.files) : []
                      setFiles((prev) => [...prev, ...list])
                      e.target.value = ""
                    }}
                  />
                </label>
              </Button>
              {files.length > 0 ? (
                <span className="text-muted-foreground text-xs">{files.length} new file(s) staged</span>
              ) : null}
            </div>
            {uploadPct > 0 ? (
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-2 transition-all"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
            ) : null}
            <ul className="space-y-2">
              {(images ?? []).map((url, idx) => (
                <li
                  key={`${url}-${idx}`}
                  className="border-border/80 flex flex-wrap items-center gap-2 rounded-lg border p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="size-14 rounded-md object-cover" />
                  <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">{url}</span>
                  <div className="flex gap-1">
                    <Button type="button" size="icon" variant="outline" onClick={() => moveImage(idx, -1)}>
                      ↑
                    </Button>
                    <Button type="button" size="icon" variant="outline" onClick={() => moveImage(idx, 1)}>
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        const next = [...(form.getValues("images") ?? [])]
                        next.splice(idx, 1)
                        form.setValue("images", next, { shouldDirty: true })
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Tagging</CardTitle>
            <CardDescription>
              Manual tags feed SmartBasket search. AI tags refresh after save (async job).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Manual tags</Label>
              {form.watch("manualTags").map((_, i) => (
                <div key={i} className="grid gap-2 md:grid-cols-12">
                  <FormField
                    control={form.control}
                    name={`manualTags.${i}.tag`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-5">
                        <FormControl>
                          <Input placeholder="tag" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`manualTags.${i}.category`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-4">
                        <FormControl>
                          <select
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          >
                            <option value="use_case">use_case</option>
                            <option value="audience">audience</option>
                            <option value="price_segment">price_segment</option>
                            <option value="type">type</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`manualTags.${i}.weight`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormControl>
                          <Input type="number" step="0.05" min={0} max={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const cur = form.getValues("manualTags")
                      form.setValue(
                        "manualTags",
                        cur.filter((_, j) => j !== i),
                        { shouldDirty: true },
                      )
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  form.setValue(
                    "manualTags",
                    [...form.getValues("manualTags"), { tag: "", category: "type", weight: 0.5, source: "manual" }],
                    { shouldDirty: true },
                  )
                }
              >
                Add manual tag
              </Button>
            </div>
            <div className="space-y-2">
              <Label>AI tags (read-only)</Label>
              <div className="flex flex-wrap gap-2">
                {(product?.aiTags ?? []).map((t) => (
                  <Badge key={`${t.tag}-${t.category}`} variant="secondary">
                    {t.tag}{" "}
                    <span className="text-muted-foreground ml-1 text-[10px] uppercase">{t.category}</span>
                  </Badge>
                ))}
                {(!product?.aiTags || product.aiTags.length === 0) ? (
                  <span className="text-muted-foreground text-sm">No AI tags yet.</span>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Final merged tags</Label>
              <div className="flex flex-wrap gap-2">
                {(product?.finalTags ?? []).map((t) => (
                  <Badge key={`f-${t.tag}-${t.category}`}>{t.tag}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Metadata (JSON)</CardTitle>
            <CardDescription>Optional structured payload merged with variant rows on save.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="metadataJson"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea rows={8} className="font-mono text-xs" spellCheck={false} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save product"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
