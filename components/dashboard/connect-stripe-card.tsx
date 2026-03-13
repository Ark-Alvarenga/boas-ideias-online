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
}

export function ConnectStripeCard({
  stripeAccountId: initialAccountId,
  stripeOnboardingComplete: initialOnboardingComplete,
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
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-primary" />
          Pagamentos Stripe
        </CardTitle>
        <CardDescription>
          Conecte sua conta Stripe para receber pagamentos quando vender
          produtos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-500">
            <CheckCircle2 className="h-5 w-5" />
            Stripe conectado
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="h-10"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecionando...
              </span>
            ) : (
              "Conectar Stripe para receber pagamentos"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
