"use client";

import { useCallback, useEffect, useState } from "react";
import { clearLocalEvents, readLocalEvents } from "@/lib/analytics";
import { computeLocalMetrics, type Metrics } from "@/lib/metrics";
import { formatPrice } from "@/lib/products";

const RANGES = [1, 7, 30, 90];
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const num = (v: number) => v.toLocaleString("en-US");

export default function DashboardPage() {
  const [days, setDays] = useState(7);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/analytics?days=${days}`, { cache: "no-store" });
    if (res.ok) {
      setNotice(null);
      setMetrics(await res.json());
      return;
    }
    const body = await res.json().catch(() => ({}));
    setNotice(
      res.status === 501
        ? "PostHog query access isn't configured, so this dashboard shows events recorded in this browser."
        : `Couldn't reach PostHog (${body.error ?? res.status}). Showing events recorded in this browser.`,
    );
    setMetrics(computeLocalMetrics(readLocalEvents(), days));
  }, [days]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Store analytics</h1>
          <p className="text-sm text-muted">
            Source: {metrics?.source === "posthog" ? "PostHog" : "Local browser events"}
          </p>
        </div>
        <div className="ml-auto flex gap-1 rounded-lg border border-border bg-surface p-1 text-sm">
          {RANGES.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-3 py-1 ${d === days ? "bg-accent text-white" : "text-muted"}`}
            >
              {d === 1 ? "24h" : `${d}d`}
            </button>
          ))}
        </div>
        <button onClick={load} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm">
          Refresh
        </button>
      </div>

      {notice && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          <span aria-hidden>ℹ️</span>
          <span className="flex-1">{notice}</span>
          <button
            onClick={() => {
              clearLocalEvents();
              load();
            }}
            className="text-critical hover:underline"
          >
            Reset local data
          </button>
        </div>
      )}

      {metrics && <DashboardBody metrics={metrics} />}
    </div>
  );
}

function DashboardBody({ metrics }: { metrics: Metrics }) {
  const { kpis, funnel, topProducts, topSearches } = metrics;

  return (
    <>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Visitors" value={num(kpis.visitors)} />
        <Stat label="Product views" value={num(kpis.productViews)} />
        <Stat label="Add-to-carts" value={num(kpis.addToCarts)} />
        <Stat label="Orders" value={num(kpis.orders)} />
        <Stat label="Revenue" value={formatPrice(kpis.revenue)} hint={`AOV ${formatPrice(kpis.avgOrderValue)}`} />
        <Stat label="Conversion rate" value={pct(kpis.conversionRate)} hint="Visitors who ordered" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Conversion funnel" subtitle="Unique visitors reaching each step">
          <Funnel steps={funnel} />
        </Card>
        <Card title="Top searches" subtitle="What shoppers looked for">
          {topSearches.length ? (
            <table className="w-full text-sm">
              <thead className="text-left text-muted">
                <tr>
                  <th className="pb-2 font-normal">Query</th>
                  <th className="pb-2 text-right font-normal">Searches</th>
                </tr>
              </thead>
              <tbody>
                {topSearches.map((s) => (
                  <tr key={s.query} className="border-t border-border">
                    <td className="py-2">
                      {s.query}
                      {s.zeroResults && (
                        <span className="ml-2 rounded bg-critical/10 px-1.5 py-0.5 text-xs text-critical">
                          ⚠ No results
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right tabular-nums">{num(s.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty />
          )}
        </Card>
      </div>

      <Card title="Product interest" subtitle="Ranked by product page views">
        {topProducts.length ? <ProductTable rows={topProducts} /> : <Empty />}
      </Card>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-semibold">{title}</h2>
      <p className="mb-4 text-sm text-muted">{subtitle}</p>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="py-8 text-center text-sm text-muted">No data yet — browse the shop to generate events.</p>;
}

function Funnel({ steps }: { steps: Metrics["funnel"] }) {
  const top = steps[0]?.users || 1;
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((s, i) => {
        const prev = i ? steps[i - 1].users : s.users;
        const dropOff = i && prev ? 1 - s.users / prev : 0;
        const tooltip = `${s.step}: ${num(s.users)} visitors (${pct(s.users / top)} of all)${
          i ? `, ${pct(dropOff)} dropped off from previous step` : ""
        }`;
        return (
          <li key={s.step} title={tooltip} className="group">
            <div className="mb-1 flex justify-between text-sm">
              <span>{s.step}</span>
              <span className="tabular-nums">
                <span className="font-medium">{num(s.users)}</span>
                <span className="ml-2 text-muted">{pct(s.users / top)}</span>
              </span>
            </div>
            <div className="h-3 rounded bg-accent-soft">
              <div
                className="h-full rounded bg-accent transition-[width] group-hover:opacity-80"
                style={{ width: `${(s.users / top) * 100}%` }}
              />
            </div>
            {i > 0 && dropOff > 0 && (
              <p className="mt-1 text-xs text-muted tabular-nums">↓ {pct(dropOff)} drop-off</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ProductTable({ rows }: { rows: Metrics["topProducts"] }) {
  const maxViews = Math.max(...rows.map((r) => r.views), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="text-left text-muted">
          <tr>
            <th className="pb-2 font-normal">Product</th>
            <th className="w-1/3 pb-2 font-normal">Views</th>
            <th className="pb-2 text-right font-normal">Added to cart</th>
            <th className="pb-2 text-right font-normal">Purchased</th>
            <th className="pb-2 text-right font-normal">View → cart</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.productId} className="border-t border-border">
              <td className="py-2 pr-4">{r.name}</td>
              <td className="py-2 pr-4" title={`${r.name}: ${num(r.views)} views`}>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 flex-1 rounded bg-accent-soft">
                    <div className="h-full rounded bg-accent" style={{ width: `${(r.views / maxViews) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right tabular-nums">{num(r.views)}</span>
                </div>
              </td>
              <td className="py-2 text-right tabular-nums">{num(r.addedToCart)}</td>
              <td className="py-2 text-right tabular-nums">{num(r.purchased)}</td>
              <td className="py-2 text-right tabular-nums">{r.views ? pct(Math.min(r.addedToCart / r.views, 1)) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
