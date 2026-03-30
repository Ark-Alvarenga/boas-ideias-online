"use client";

import { usePathname } from "next/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");
  const isEbookPage = pathname.startsWith("/ebook");

  return (
    <main className={!(isDashboard || isEbookPage) ? "pt-[72px]" : ""}>
      {children}
    </main>
  );
}
