"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({ title, actions }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between px-6 lg:px-8">
        <span className="font-serif text-xl font-black tracking-tight text-foreground uppercase">
          {title}
        </span>

        <div className="flex items-center gap-3">
          {actions || (
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-foreground font-bold shadow-[2px_2px_0px_#000]"
              asChild
            >
              <Link href="/marketplace">
                Marketplace
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
