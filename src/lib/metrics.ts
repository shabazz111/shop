import type { LocalEvent } from "./analytics";

export type Metrics = {
  source: "posthog" | "local";
  days: number;
  kpis: {
    visitors: number;
    productViews: number;
    addToCarts: number;
    orders: number;
    revenue: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  funnel: { step: string; users: number }[];
  topProducts: { productId: string; name: string; views: number; addedToCart: number; purchased: number }[];
  topSearches: { query: string; count: number; zeroResults: boolean }[];
};

export const FUNNEL_STEPS = [
  { event: "$pageview", label: "Visited store" },
  { event: "product_viewed", label: "Viewed a product" },
  { event: "product_added_to_cart", label: "Added to cart" },
  { event: "checkout_started", label: "Started checkout" },
  { event: "order_completed", label: "Completed order" },
] as const;

/** Builds the KPI block from per-step unique users plus a few raw totals. */
export function buildKpis(
  funnelUsers: number[],
  totals: { productViews: number; addToCarts: number; orders: number; revenue: number },
): Metrics["kpis"] {
  const visitors = funnelUsers[0] ?? 0;
  const buyers = funnelUsers[funnelUsers.length - 1] ?? 0;
  return {
    visitors,
    ...totals,
    conversionRate: visitors ? buyers / visitors : 0,
    avgOrderValue: totals.orders ? totals.revenue / totals.orders : 0,
  };
}

/** Computes dashboard metrics from the browser's local event mirror. */
export function computeLocalMetrics(events: LocalEvent[], days: number): Metrics {
  const since = Date.now() - days * 86_400_000;
  const recent = events.filter((e) => Date.parse(e.timestamp) >= since);
  const ofType = (name: string) => recent.filter((e) => e.event === name);

  const funnelUsers = FUNNEL_STEPS.map((s) => new Set(ofType(s.event).map((e) => e.distinct_id)).size);

  const orders = ofType("order_completed");
  const kpis = buildKpis(funnelUsers, {
    productViews: ofType("product_viewed").length,
    addToCarts: ofType("product_added_to_cart").length,
    orders: orders.length,
    revenue: orders.reduce((sum, e) => sum + Number(e.properties.revenue ?? 0), 0),
  });

  const byProduct = new Map<string, Metrics["topProducts"][number]>();
  for (const e of recent) {
    const id = e.properties.product_id as string | undefined;
    if (!id) continue;
    const row = byProduct.get(id) ?? {
      productId: id,
      name: String(e.properties.product_name ?? id),
      views: 0,
      addedToCart: 0,
      purchased: 0,
    };
    const qty = Number(e.properties.quantity ?? 1);
    if (e.event === "product_viewed") row.views++;
    if (e.event === "product_added_to_cart") row.addedToCart += qty;
    if (e.event === "product_purchased") row.purchased += qty;
    byProduct.set(id, row);
  }

  const bySearch = new Map<string, Metrics["topSearches"][number]>();
  for (const e of ofType("products_searched")) {
    const query = String(e.properties.query ?? "").trim().toLowerCase();
    if (!query) continue;
    const row = bySearch.get(query) ?? { query, count: 0, zeroResults: false };
    row.count++;
    row.zeroResults = Number(e.properties.results_count) === 0;
    bySearch.set(query, row);
  }

  return {
    source: "local",
    days,
    kpis,
    funnel: FUNNEL_STEPS.map((s, i) => ({ step: s.label, users: funnelUsers[i] })),
    topProducts: [...byProduct.values()].sort((a, b) => b.views - a.views).slice(0, 10),
    topSearches: [...bySearch.values()].sort((a, b) => b.count - a.count).slice(0, 10),
  };
}
