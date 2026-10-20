"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, products } from "@/lib/products";
import { track } from "@/lib/analytics";
import { ProductCard } from "@/components/ProductCard";

export function Storefront() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q)),
    );
  }, [query, category]);

  // Track a search once the shopper stops typing, so each keystroke isn't an event.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const timer = setTimeout(
      () => track("products_searched", { query: q, results_count: results.length, category }),
      800,
    );
    return () => clearTimeout(timer);
  }, [query, results.length, category]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 outline-none focus:border-accent sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1 text-sm ${
                c === category ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {results.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">
          No products match “{query}”. Try a different search.
        </p>
      )}
    </>
  );
}
