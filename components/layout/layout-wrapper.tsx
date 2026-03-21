"use client";

import { usePathname } from "next/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");

  return <main className={!isDashboard ? "pt-[72px]" : ""}>{children}</main>;
}
