"use client";

import { useEffect } from "react";
import { initAmplitude, identifyUser } from "@/lib/amplitude";

/**
 * Client component that initializes Amplitude on mount
 * and (optionally) identifies the logged-in user.
 *
 * Should be rendered once in the root layout.
 */
export function AmplitudeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAmplitude();

    // Try to identify the current user from the auth endpoint
    const identify = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.authenticated && data.user) {
          identifyUser(data.user.id, {
            email: data.user.email,
            name: data.user.name,
          });
        }
      } catch {
        // silently ignore — user may not be logged in
      }
    };

    void identify();
  }, []);

  return <>{children}</>;
}
