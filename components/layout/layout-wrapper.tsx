"use client";

import { usePathname } from "next/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");
  const isLanding = pathname.startsWith("/landing")

  return <main className={(!isDashboard || !isLanding) ? "pt-[72px]" : ""}>{children}</main>;
}
