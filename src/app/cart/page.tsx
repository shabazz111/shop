
"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { lines, total, setQuantity, remove } = useCart();

  const handleCheckout = () => {
    posthog.capture("checkout_started", {
      cart_total: total,
      currency: "INR",
      item_count: lines.reduce((sum, line) => sum + line.quantity, 0),
    });
  };

  if (!lines.length) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Link href="/" className="mt-4 inline-block text-accent hover:underline">
          Continue shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section>
        <h1 className="mb-4 text-2xl font-semibold">Cart</h1>
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-center gap-4 p-4">
              <span className="flex size-14 items-center justify-center rounded-lg bg-accent-soft text-3xl">
                {product.emoji}
              </span>
              <div className="flex-1">
                <Link href={`/products/${product.id}`} className="font-medium hover:underline">
                  {product.name}
                </Link>
                <p className="text-sm text-muted tabular-nums">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div className="flex items-center rounded-lg border border-border">
                <button
                  className="px-3 py-1"
                  onClick={() => setQuantity(product.id, quantity - 1)}
                  aria-label="Decrease"
                >
                  −
                </button>
                <span className="w-8 text-center tabular-nums">{quantity}</span>
                <button
                  className="px-3 py-1"
                  onClick={() => setQuantity(product.id, quantity + 1)}
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
              <span className="w-20 text-right font-medium tabular-nums">
                {formatPrice(product.price * quantity)}
              </span>
              <button
                onClick={() => remove(product.id)}
                className="text-sm text-muted hover:text-critical"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="h-fit rounded-xl border border-border bg-surface p-6">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(total)}</span>
        </div>
        <Link
          href="/checkout"
          onClick={handleCheckout}
          className="mt-6 block rounded-lg bg-accent py-3 text-center font-medium text-white hover:opacity-90"
        >
          Checkout
        </Link>
      </aside>
    </div>
  );
}
