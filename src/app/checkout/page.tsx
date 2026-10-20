"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { identify, track } from "@/lib/analytics";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, total, itemCount, clear } = useCart();
  const [processing, setProcessing] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !lines.length) return;
    started.current = true;
    track("checkout_started", { cart_value: total, item_count: itemCount });
  }, [lines.length, total, itemCount]);

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setProcessing(true);

    // Simulated payment processing — no real charge is made.
    await new Promise((r) => setTimeout(r, 1200));

    const orderId = `SP-${Date.now().toString(36).toUpperCase()}`;
    identify(String(form.get("email")), String(form.get("name")));
    for (const { product, quantity } of lines) {
      track("product_purchased", {
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        price: product.price,
        quantity,
      });
    }
    track("order_completed", { order_id: orderId, revenue: total, item_count: itemCount });

    clear();
    router.push(`/checkout/success?order=${orderId}`);
  }

  if (!lines.length && !processing) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold">Nothing to check out</h1>
        <Link href="/" className="mt-4 inline-block text-accent hover:underline">
          Browse products →
        </Link>
      </div>
    );
  }

  const field = "w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form onSubmit={placeOrder} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <label className="flex flex-col gap-1 text-sm">
          Full name
          <input name="name" required className={field} autoComplete="name" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input name="email" type="email" required className={field} autoComplete="email" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Shipping address
          <input name="address" required className={field} autoComplete="street-address" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Card number <span className="text-muted">(demo — use any digits)</span>
          <input
            name="card"
            required
            inputMode="numeric"
            pattern="[0-9 ]{12,23}"
            placeholder="4242 4242 4242 4242"
            className={field}
            autoComplete="off"
          />
        </label>
        <button
          disabled={processing}
          className="mt-2 rounded-lg bg-accent py-3 font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {processing ? "Processing…" : `Pay ${formatPrice(total)}`}
        </button>
      </form>
      <aside className="h-fit rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-3 font-semibold">Order summary</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="flex justify-between gap-2">
              <span>
                {product.name} × {quantity}
              </span>
              <span className="tabular-nums">{formatPrice(product.price * quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-4 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(total)}</span>
        </div>
      </aside>
    </div>
  );
}
