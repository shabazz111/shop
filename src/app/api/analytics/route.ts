import { buildKpis, FUNNEL_STEPS, type Metrics } from "@/lib/metrics";

const HOST = process.env.POSTHOG_API_HOST ?? "https://us.posthog.com";
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

async function hogql(query: string): Promise<unknown[][]> {
  const res = await fetch(`${HOST}/api/projects/${PROJECT_ID}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PostHog query failed (${res.status}): ${await res.text()}`);
  return (await res.json()).results;
}

export async function GET(request: Request) {
  if (!PROJECT_ID || !API_KEY) {
    return Response.json({ configured: false }, { status: 501 });
  }

  const requested = Number(new URL(request.url).searchParams.get("days"));
  const days = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), 90) : 7;
  const window = `timestamp > now() - INTERVAL ${days} DAY`;

  const stepColumns = FUNNEL_STEPS.map(
    (s) => `count(DISTINCT if(event = '${s.event}', person_id, NULL))`,
  ).join(",\n      ");

  try {
    const [[summary], productRows, searchRows] = await Promise.all([
      hogql(`
        SELECT
          ${stepColumns},
          countIf(event = 'product_viewed'),
          countIf(event = 'product_added_to_cart'),
          countIf(event = 'order_completed'),
          sumIf(toFloat(properties.revenue), event = 'order_completed')
        FROM events
        WHERE ${window}`),
      hogql(`
        SELECT
          toString(properties.product_id) AS pid,
          any(toString(properties.product_name)),
          countIf(event = 'product_viewed') AS views,
          sumIf(toFloat(properties.quantity), event = 'product_added_to_cart'),
          sumIf(toFloat(properties.quantity), event = 'product_purchased')
        FROM events
        WHERE event IN ('product_viewed', 'product_added_to_cart', 'product_purchased') AND ${window}
        GROUP BY pid
        ORDER BY views DESC
        LIMIT 10`),
      hogql(`
        SELECT lower(trim(toString(properties.query))) AS q, count() AS c, max(toFloat(properties.results_count))
        FROM events
        WHERE event = 'products_searched' AND ${window}
        GROUP BY q
        ORDER BY c DESC
        LIMIT 10`),
    ]);

    const nums = (summary as unknown[]).map((v) => Number(v ?? 0));
    const funnelUsers = nums.slice(0, FUNNEL_STEPS.length);
    const [productViews, addToCarts, orders, revenue] = nums.slice(FUNNEL_STEPS.length);

    const metrics: Metrics = {
      source: "posthog",
      days,
      kpis: buildKpis(funnelUsers, { productViews, addToCarts, orders, revenue }),
      funnel: FUNNEL_STEPS.map((s, i) => ({ step: s.label, users: funnelUsers[i] })),
      topProducts: productRows.map(([productId, name, views, added, purchased]) => ({
        productId: String(productId),
        name: String(name),
        views: Number(views),
        addedToCart: Number(added ?? 0),
        purchased: Number(purchased ?? 0),
      })),
      topSearches: searchRows
        .filter(([q]) => q)
        .map(([query, count, maxResults]) => ({
          query: String(query),
          count: Number(count),
          zeroResults: Number(maxResults) === 0,
        })),
    };
    return Response.json(metrics);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 502 });
  }
}
