# ShopPulse

A mini e-commerce storefront with a built-in analytics dashboard. Customers browse products, search, add items to a cart and complete a simulated checkout. PostHog tracks their behavior so the dashboard can show which products attract interest, where customers drop off, and how well the store converts visitors into buyers.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your PostHog keys (optional)
npm run dev
```

Open http://localhost:3000 for the store and http://localhost:3000/dashboard for analytics.

Without PostHog keys the app still works: every event is also mirrored to `localStorage`, and the dashboard falls back to those local events.

## Routes

| Route | What it does |
|---|---|
| `/` | Product grid with search and category filters |
| `/products/[id]` | Product detail page |
| `/cart` | Cart with quantity controls |
| `/checkout` | Simulated checkout (no payment is taken) |
| `/dashboard` | KPIs, conversion funnel, product interest, top searches |
| `/api/analytics?days=7` | Runs HogQL queries against PostHog and returns dashboard metrics |

## Tracked events

| Event | Properties |
|---|---|
| `$pageview` | captured automatically by PostHog |
| `products_searched` | `query`, `results_count`, `category` |
| `product_viewed` | `product_id`, `product_name`, `category`, `price` |
| `product_added_to_cart` | `product_id`, `product_name`, `category`, `price`, `quantity`, `source` |
| `product_removed_from_cart` | `product_id`, `product_name` |
| `checkout_started` | `cart_value`, `item_count` |
| `product_purchased` | one per order line: `order_id`, `product_id`, `product_name`, `price`, `quantity` |
| `order_completed` | `order_id`, `revenue`, `item_count` |

Buyers are identified by email at checkout (`posthog.identify`).

## Project layout

```
src/
  instrumentation-client.ts   PostHog init
  lib/analytics.ts            track() / identify() + local event mirror
  lib/metrics.ts              dashboard metric types and local aggregation
  lib/cart.tsx                cart context (persisted to localStorage)
  lib/products.ts             product catalog
  app/api/analytics/route.ts  PostHog HogQL queries
  app/dashboard/page.tsx      analytics dashboard
```
# ShopPulse
