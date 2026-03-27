import * as amplitude from "@amplitude/analytics-browser";

let initialized = false;

/**
 * Initialize Amplitude Browser SDK.
 * Safe to call multiple times — only runs once.
 */
export function initAmplitude() {
  if (initialized || typeof window === "undefined") return;

  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  if (!apiKey) {
    console.warn("[Amplitude] NEXT_PUBLIC_AMPLITUDE_API_KEY not set — skipping init.");
    return;
  }

  amplitude.init(apiKey, {
    defaultTracking: {
      pageViews: true,
      sessions: true,
    },
  });

  initialized = true;
}

/**
 * Identify a user so all future events are tied to their account.
 */
export function identifyUser(
  userId: string,
  props?: Record<string, unknown>,
) {
  if (!initialized) return;

  amplitude.setUserId(userId);

  if (props) {
    const identifyObj = new amplitude.Identify();
    for (const [key, value] of Object.entries(props)) {
      identifyObj.set(key, value as string | number | boolean);
    }
    amplitude.identify(identifyObj);
  }
}

/**
 * Track a named event with optional properties.
 */
export function trackEvent(
  name: string,
  props?: Record<string, unknown>,
) {
  if (!initialized) return;
  amplitude.track(name, props);
}

/**
 * Reset Amplitude on logout (clears userId + device).
 */
export function resetAmplitude() {
  if (!initialized) return;
  amplitude.reset();
}
