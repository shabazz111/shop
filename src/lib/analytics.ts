"use client";

import posthog from "posthog-js";

export type EventName =
  | "$pageview"
  | "product_viewed"
  | "products_searched"
  | "product_added_to_cart"
  | "product_removed_from_cart"
  | "checkout_started"
  | "order_completed"
  | "product_purchased";

export type LocalEvent = {
  event: EventName;
  distinct_id: string;
  timestamp: string;
  properties: Record<string, unknown>;
};

const LOG_KEY = "shoppulse_events";
const ID_KEY = "shoppulse_distinct_id";
const MAX_LOCAL_EVENTS = 5000;

export const posthogEnabled = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

function localDistinctId() {
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ID_KEY, id);
  }
  return id;
}

/**
 * Sends an event to PostHog (when configured) and mirrors it to a local log so
 * the dashboard still has data to show when PostHog query access isn't set up.
 */

export function track(
  event: EventName,
  properties: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  if (event !== "$pageview") {
    if (posthogEnabled && posthog.__loaded) {
      posthog.capture(event, properties);
      console.log("[PostHog] Event sent:", event, properties);
    } else {
      console.warn("[PostHog] Not initialized; event not sent:", event, {
        enabled: posthogEnabled,
        loaded: posthog.__loaded,
      });
    }
  }

  try {
    const log = readLocalEvents();
    log.push({
      event,
      distinct_id: localDistinctId(),
      timestamp: new Date().toISOString(),
      properties,
    });
    localStorage.setItem(
      LOG_KEY,
      JSON.stringify(log.slice(-MAX_LOCAL_EVENTS)),
    );
  } catch {
    // Analytics must never break the store.
  }
}


export function identify(email: string, name: string) {
  if (posthogEnabled) posthog.identify(email, { email, name });
}

export function readLocalEvents(): LocalEvent[] {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function clearLocalEvents() {
  try {
    localStorage.removeItem(LOG_KEY);
  } catch {}
}
