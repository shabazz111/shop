"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { getProduct } from "@/lib/products";
import { track } from "@/lib/analytics";
import { useCart } from "@/lib/cart";

export function ProductActions({ productId }: { productId: string }) {
  const product = getProduct(productId)!;
  const { add, lines } = useCart();
  const inCart = lines.find((l) => l.product.id === productId)?.quantity ?? 0;

  const viewed = useRef<string | null>(null);

useEffect(() => {
  if (viewed.current === product.id) return;

  viewed.current = product.id;

  track("product_viewed", {
    product_id: product.id,
    product_name: product.name,
    category: product.category,
    price: product.price,
  });
}, [
  product.id,
  product.name,
  product.category,
  product.price,
]);

  return (
    <div className="mt-4 flex items-center gap-4">
      <button
        onClick={() => add(product, "product_page")}
        className="rounded-lg bg-accent px-6 py-3 font-medium text-white hover:opacity-90"
      >
        Add to cart
      </button>
      {inCart > 0 && (
        <Link href="/cart" className="text-sm text-muted hover:text-foreground">
          {inCart} in cart — view cart →
        </Link>
      )}
    </div>
  );
}
