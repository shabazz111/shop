"use client";

import Link from "next/link";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
        <div className="flex aspect-[4/3] items-center justify-center bg-accent-soft text-6xl transition group-hover:scale-[1.02]">
          {product.emoji}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <span className="text-xs uppercase tracking-wide text-muted">{product.category}</span>
          <span className="font-medium">{product.name}</span>
          <span className="mt-auto pt-2 font-semibold tabular-nums">{formatPrice(product.price)}</span>
        </div>
      </Link>
      <button
        onClick={() => add(product, "product_card")}
        className="m-4 mt-0 rounded-lg bg-accent py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Add to cart
      </button>
    </div>
  );
}
