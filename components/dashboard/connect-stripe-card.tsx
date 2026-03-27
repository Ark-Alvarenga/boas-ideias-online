"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { trackEvent } from "@/lib/amplitude";

interface ConnectStripeCardProps {
  stripeAccountId?: string | null;
  stripeOnboardingComplete?: boolean | null;
  compact?: boolean;
}

export function ConnectStripeCard({
  stripeAccountId: initialAccountId,
  stripeOnboardingComplete: initialOnboardingComplete,
  compact = false,
}: ConnectStripeCardProps) {
  const [stripeAccountId, setStripeAccountId] = useState(
    initialAccountId ?? null,
  );
  const [stripeOnboardingComplete, setStripeOnboardingComplete] = useState(
    initialOnboardingComplete ?? false,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const res = await fetch("/api/stripe/connect/status", {
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) {
          setStripeAccountId(data.stripeAccountId ?? null);
          setStripeOnboardingComplete(data.stripeOnboardingComplete ?? false);
        }
      } catch {
        // keep initial props
      }
    };
    sync();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    trackEvent("stripe_connect_started");
    try {
      const res = await fetch("/api/stripe/connect/create-account", {
        method: "POST",
      });
      const data = await res.json();
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
        return;
      }
      if (data.error) {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Connect Stripe error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = !!stripeAccountId && !!stripeOnboardingComplete;

  return (
    <Card
      className={
        compact
          ? "border-none bg-transparent shadow-none"
          : "rounded-3xl border-2 border-foreground bg-card shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]"
      }
    >
      {!compact && (
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 font-serif text-2xl font-black">
            <div className="rounded-xl border-2 border-foreground bg-accent p-2">
              <CreditCard className="h-6 w-6 text-foreground" />
            </div>
            Configurar Recebimentos
          </CardTitle>
          <CardDescription className="text-base font-bold text-muted-foreground">
            É assim que o dinheiro das suas vendas cai na sua conta. Seguro,
            rápido e automático via Stripe.
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-0" : "pt-2"}>
        {isConnected ? (
          <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 p-4 font-black tracking-tight text-emerald-600 dark:text-emerald-400 shadow-[4px_4px_0px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="h-6 w-6 stroke-[3px]" />
            CONTA CONECTADA E PRONTA PARA VENDAS
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className={`rounded-xl border-2 border-foreground bg-accent font-black uppercase tracking-widest text-foreground shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[6px_6px_0px_#fff] hover:text-white ${compact ? "h-14 text-lg w-full sm:w-auto px-10" : "h-12 px-8"}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                CONECTANDO...
              </span>
            ) : (
              "Conectar minha conta bancária"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
