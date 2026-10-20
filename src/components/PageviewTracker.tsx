"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

/** Records storefront pageviews in the local log (PostHog captures its own). */
export function PageviewTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (last.current === pathname || pathname.startsWith("/dashboard")) return;
    last.current = pathname;
    track("$pageview", { path: pathname });
  }, [pathname]);

  return null;
}
