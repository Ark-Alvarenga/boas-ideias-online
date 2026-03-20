"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, Loader2, CreditCard } from "lucide-react"

interface ConnectStripeCardProps {
  stripeAccountId?: string | null
  stripeOnboardingComplete?: boolean | null
  compact?: boolean
}

export function ConnectStripeCard({
  stripeAccountId: initialAccountId,
  stripeOnboardingComplete: initialOnboardingComplete,
  compact = false,
}: ConnectStripeCardProps) {
  const [stripeAccountId, setStripeAccountId] = useState(initialAccountId ?? null)
  const [stripeOnboardingComplete, setStripeOnboardingComplete] = useState(
    initialOnboardingComplete ?? false,
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const sync = async () => {
      try {
        const res = await fetch("/api/stripe/connect/status", { cache: "no-store" })
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (!cancelled) {
          setStripeAccountId(data.stripeAccountId ?? null)
          setStripeOnboardingComplete(data.stripeOnboardingComplete ?? false)
        }
      } catch {
        // keep initial props
      }
    }
    sync()
    return () => {
      cancelled = true
    }
  }, [])

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/stripe/connect/create-account", {
        method: "POST",
      })
      const data = await res.json()
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl
        return
      }
      if (data.error) {
        console.error(data.error)
      }
    } catch (err) {
      console.error("Connect Stripe error", err)
    } finally {
      setIsLoading(false)
    }
  }

  const isConnected =
    !!stripeAccountId && !!stripeOnboardingComplete

  return (
    <Card className={compact ? "border-none bg-transparent shadow-none" : "border-border/50 bg-card shadow-sm"}>
      {!compact && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Conta de Recebimentos
          </CardTitle>
          <CardDescription>
            É assim que você receberá o dinheiro das suas vendas. Rápido e seguro.
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-0" : ""}>
        {isConnected ? (
          <div className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-500">
            <CheckCircle2 className="h-5 w-5" />
            Pronto para receber vendas
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className={`font-bold shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] border-2 border-foreground ${compact ? 'h-12 text-lg w-full sm:w-auto px-8' : 'h-10'}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Abrindo cofre...
              </span>
            ) : (
              "Conectar meu banco agora"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
