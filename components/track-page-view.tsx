"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/amplitude";

/**
 * Lightweight client component to fire an Amplitude event on mount.
 * Drop this into server components that need to track page views.
 *
 * Usage:
 *   <TrackPageView event="dashboard_viewed" properties={{ has_products: true }} />
 */
export function TrackPageView({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, unknown>;
}) {
  useEffect(() => {
    trackEvent(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
