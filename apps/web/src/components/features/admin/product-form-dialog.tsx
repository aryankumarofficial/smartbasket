"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Form } from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import type { ProductUpsertInput } from "@/src/modules/products/types"
import { productFormSchema, type ProductFormValues } from "@/src/lib/validations/product"

function mapToUpsert(values: ProductFormValues): ProductUpsertInput {
  return {
    title: values.title,
    description: values.description,
    price: values.price,
    category: values.category,
    images: values.images,
    manualTags: values.manualTags.map((t) => ({
      tag: t.tag,
      category: t.category,
      weight: t.weight,
      source: "manual" as const,
    })),
  }
}

export type AdminProductDraft = {
  id: string
  name: string
  title?: string | null
  description?: string | null
  price: string
  category: string
  images?: string[] | null
  manualTags?: {
    tag: string
    category: ProductFormValues["manualTags"][number]["category"]
    weight: number
    source: "manual" | "ai"
  }[]
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  title,
  pending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: AdminProductDraft | null
  title: string
  pending?: boolean
  onSubmit: (payload: { body: ProductUpsertInput; imageFiles?: File[] }) => Promise<void>
}) {
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "0",
      category: "",
      images: [],
      manualTags: [],
    },
  })

  useEffect(() => {
    if (!product) {
      form.reset({
        title: "",
        description: "",
        price: "0",
        category: "",
        images: [],
        manualTags: [],
      })
      return
    }
    form.reset({
      title: product.title ?? product.name,
      description: product.description ?? "",
      price: String(product.price),
      category: product.category,
      images: product.images ?? [],
      manualTags:
        product.manualTags?.map((t) => ({
          tag: t.tag,
          category: t.category as ProductFormValues["manualTags"][number]["category"],
          weight: t.weight,
          source: "manual" as const,
        })) ?? [],
    })
  }, [product, form, open])

  async function handleSubmit(values: ProductFormValues) {
    await onSubmit({ body: mapToUpsert(values), imageFiles: imageFiles.length ? imageFiles : undefined })
    onOpenChange(false)
    setImageFiles([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Catalog fields sync with the product API. Images upload after the product is saved.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="pf-title">Title</Label>
              <Input id="pf-title" {...form.register("title")} />
              {form.formState.errors.title ? (
                <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-desc">Description</Label>
              <Textarea id="pf-desc" rows={3} {...form.register("description")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pf-price">Price</Label>
                <Input id="pf-price" inputMode="decimal" {...form.register("price")} />
                {form.formState.errors.price ? (
                  <p className="text-destructive text-sm">{form.formState.errors.price.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-cat">Category</Label>
                <Input id="pf-cat" {...form.register("category")} />
                {form.formState.errors.category ? (
                  <p className="text-destructive text-sm">{form.formState.errors.category.message}</p>
                ) : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-files">Images</Label>
              <Input
                id="pf-files"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const list = e.target.files
                  setImageFiles(list ? Array.from(list) : [])
                }}
              />
              <p className="text-muted-foreground text-xs">New uploads merge with existing image URLs.</p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : product ? "Save changes" : "Create product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
