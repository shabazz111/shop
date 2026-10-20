'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

// PostHog is initialized once in src/instrumentation-client.ts.
export function PHProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  )
}
