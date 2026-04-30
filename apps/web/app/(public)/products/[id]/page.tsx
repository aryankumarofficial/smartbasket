import type { Metadata } from "next"

import { ProductDetailView } from "@/src/features/public/ProductDetailView"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: id ? `Product ${id.slice(0, 8)}…` : "Product",
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="space-y-8">
      <ProductDetailView productId={id} />
    </div>
  )
}
