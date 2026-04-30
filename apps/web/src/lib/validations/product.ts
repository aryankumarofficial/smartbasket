import { z } from "zod"

const tagCategory = z.enum(["use_case", "audience", "price_segment", "type"])

const manualTagSchema = z.object({
  tag: z.string().min(1),
  category: tagCategory,
  weight: z.coerce.number().min(0).max(1),
  source: z.literal("manual"),
})

export const productFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  price: z.string().min(1, "Price is required").refine((v) => !Number.isNaN(Number.parseFloat(v)) && Number.parseFloat(v) >= 0, {
    message: "Invalid price",
  }),
  category: z.string().trim().min(1, "Category is required").max(120),
  images: z.array(z.string().min(1)),
  manualTags: z.array(manualTagSchema),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
