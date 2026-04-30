"use client"

import Image from "next/image"
import Link from "next/link"

import type { RecommendedProduct } from "@/lib/types/recommendations"
import type { ProductListItem } from "@/src/types/product"

import { formatInr } from "@/src/components/public/format-price"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

export type ProductCardProps = {
  product: ProductListItem
  href: string
  onNavigate?: () => void
  reason?: RecommendedProduct["reason"]
  className?: string
}

export function ProductCard({ product, href, onNavigate, reason, className }: ProductCardProps) {
  const title = product.title ?? product.name
  const thumb = product.imageUrl ?? product.images?.[0] ?? null

  return (
    <Link
      href={href}
      onClick={() => onNavigate?.()}
      className={cn(
        "group block h-full rounded-3xl outline-none transition-[transform,box-shadow] duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg focus-visible:-translate-y-0.5 focus-visible:shadow-lg focus-visible:ring-4 focus-visible:ring-ring/30",
        className
      )}
    >
      <Card className="h-full overflow-hidden border-border/70 bg-card/85 shadow-sm backdrop-blur-sm dark:bg-card/55">
        <div className="relative aspect-[4/3] bg-muted">
          {thumb ? (
            <Image
              src={thumb}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="flex size-full items-center justify-center font-mono text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardHeader className="gap-2 pb-2">
          <CardTitle className="font-heading line-clamp-2 text-lg leading-snug">{title}</CardTitle>
          {reason ? (
            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">{reason}</p>
          ) : (
            product.description && (
              <CardDescription className="line-clamp-2">{product.description}</CardDescription>
            )
          )}
        </CardHeader>
        <CardFooter className="justify-between pb-5">
          <p className="font-mono text-sm tracking-tight text-foreground">
            {formatInr(product.price)}
          </p>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs capitalize text-secondary-foreground">
            {product.category}
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
