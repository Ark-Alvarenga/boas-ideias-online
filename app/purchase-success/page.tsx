"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Download, ArrowRight } from "lucide-react"

interface OrderLookupResult {
  success?: boolean
  orderId?: string
  productTitle?: string
  error?: string
}

function PurchaseSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const router = useRouter()

  const [orderInfo, setOrderInfo] = useState<OrderLookupResult | null>(null)
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(!!sessionId)

  useEffect(() => {
    if (!sessionId) {
      setIsLoadingOrder(false)
      return
    }

    let cancelled = false

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        })
        const data = (await res.json()) as OrderLookupResult
        if (cancelled) return
        if (!res.ok || !data.success || !data.orderId) {
          setOrderInfo({ success: false, error: data.error || "Não foi possível localizar seu pedido ainda." })
        } else {
          setOrderInfo(data)
        }
      } catch (error) {
        console.error("Failed to resolve order by session:", error)
        if (!cancelled) {
          setOrderInfo({
            success: false,
            error: "Não foi possível localizar seu pedido ainda.",
          })
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOrder(false)
        }
      }
    }

    void fetchOrder()

    return () => {
      cancelled = true
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-16 lg:py-24">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <Card className="border-border/50 bg-card shadow-xl shadow-primary/5 overflow-hidden">
            {/* Success banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-8 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Compra confirmada!
              </h1>
              <p className="mt-2 text-sm text-white/80">
                Seu pagamento foi processado com sucesso
              </p>
            </div>

            <CardContent className="p-6 lg:p-8">
              <div className="space-y-6">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <Download className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        Seu download está disponível
                      </p>
                      {isLoadingOrder ? (
                        <p className="text-sm text-muted-foreground">
                          Localizando seu pedido e preparando o link de download...
                        </p>
                      ) : orderInfo?.success && orderInfo.orderId ? (
                        <p className="text-sm text-muted-foreground">
                          Você pode baixar diretamente agora ou acessar depois em
                          &quot;Meus produtos comprados&quot; no painel.
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Seu pagamento foi confirmado. Caso o link direto não apareça
                          em instantes, você poderá baixar pelo painel em
                          &quot;Meus produtos comprados&quot;.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {sessionId && (
                  <p className="text-center text-xs text-muted-foreground">
                    ID da sessão: {sessionId.slice(0, 20)}...
                  </p>
                )}

                <div className="flex flex-col gap-3">
                  {orderInfo?.success && orderInfo.orderId && (
                    <Button
                      className="h-12 w-full"
                      onClick={() => router.push(`/download/${orderInfo.orderId}`)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar agora
                    </Button>
                  )}

                  <Button className="h-11 w-full" variant="outline" asChild>
                    <Link href="/dashboard">
                      Ir para o Painel — Meus produtos comprados
                    </Link>
                  </Button>

                  <Button variant="outline" className="h-11 w-full" asChild>
                    <Link href="/marketplace">
                      Continuar explorando
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      }
    >
      <PurchaseSuccessContent />
    </Suspense>
  )
}
