import { NextRequest, NextResponse } from "next/server"
import { productsService } from "./service"
import type { ProductUpsertInput } from "./types"

export const productsController = {
  async list(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") ?? undefined
    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined

    if (pathname.includes("/api/admin/")) {
      const q = searchParams.get("q") ?? undefined
      const page = searchParams.get("page")
        ? Number(searchParams.get("page"))
        : undefined
      const limit = searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : undefined
      const sort = (searchParams.get("sort") ?? undefined) as
        | "name"
        | "price_desc"
        | "created_desc"
        | undefined
      const { products, total } = await productsService.listAdmin({
        q,
        category,
        page,
        limit,
        sort,
      })
      return NextResponse.json({ products, total })
    }

    const products = await productsService.list({ category, minPrice, maxPrice })
    return NextResponse.json({ products, total: products.length })
  },

  async getById(id: string) {
    const product = await productsService.getById(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ product })
  },

  async create(request: NextRequest) {
    const input = (await request.json()) as ProductUpsertInput
    const created = await productsService.create(input)
    return NextResponse.json({ product: created }, { status: 201 })
  },

  async update(request: NextRequest, id: string) {
    const input = (await request.json()) as Partial<ProductUpsertInput>
    const updated = await productsService.update(id, input)
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ product: updated })
  },
}
