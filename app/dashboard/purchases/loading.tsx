import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PurchaseCardSkeleton } from "./purchase-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader 
        title="Minhas Compras" 
        actions={
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-foreground font-bold shadow-[2px_2px_0px_#000]"
            asChild
          >
            <Link href="/marketplace">Marketplace</Link>
          </Button>
        }
      />

      <main className="mx-auto max-w-7xl p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <PurchaseCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
