import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    // Captures $pageview on client-side navigations as well as full loads.
    capture_pageview: "history_change",
    person_profiles: "always",
  });
}
