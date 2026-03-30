"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react"
import { trackEvent } from "@/lib/amplitude"
import { TrackPageView } from "@/components/track-page-view"

interface DownloadResponse {
  success?: boolean
  productTitle?: string
  downloadUrl?: string | null
  message?: string
  error?: string
}

export default function DownloadPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const orderId = params.id

  const [data, setData] = useState<DownloadResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDownload = async () => {
      try {
        const res = await fetch(`/api/download/${orderId}`, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        })

        const json = (await res.json()) as DownloadResponse
        setData(json)

        if (!res.ok || !json.success) {
          console.error("Download error:", json.error || json.message)
        }
      } catch (error) {
        console.error("Failed to load download info", error)
        setData({
          success: false,
          error: "Falha ao carregar informações de download.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (orderId) {
      void loadDownload()
    } else {
      setIsLoading(false)
    }
  }, [orderId])

  const handleBackToMarketplace = () => {
    router.push("/marketplace")
  }

  const hasFile = !!data?.downloadUrl

  return (
    <div className="min-h-screen bg-background">
      <TrackPageView event="download_page_viewed" properties={{ order_id: orderId }} />
      <Header />

      <main className="py-12 lg:py-16">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <nav className="mb-8">
            <button
              type="button"
              onClick={handleBackToMarketplace}
              className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao marketplace
            </button>
          </nav>

          <Card className="border-border/50 bg-card shadow-lg shadow-primary/5">
            <CardContent className="p-6 lg:p-8">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Preparando seu download seguro...
                  </p>
                </div>
              ) : data?.success && hasFile ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold text-foreground">
                        Seu download está pronto
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {data.productTitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Este link é exclusivo do seu pedido e foi gerado a partir de
                    uma verificação no banco de dados. Guarde o arquivo em um
                    local seguro após o download.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      asChild
                      size="lg"
                      className="h-11 w-full sm:w-auto"
                      onClick={() => {
                        trackEvent("download_started", {
                          order_id: orderId,
                          product_title: data.productTitle,
                        })
                      }}
                    >
                      <a href={data.downloadUrl ?? "#"} target="_blank">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar PDF
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-11 w-full border-border/50 sm:w-auto"
                      onClick={handleBackToMarketplace}
                    >
                      Explorar mais produtos
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h1 className="text-lg font-semibold text-foreground">
                    Não foi possível liberar o download
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {data?.error ||
                      data?.message ||
                      "Não encontramos um pedido concluído para este identificador."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verifique se você usou o link mais recente enviado após a
                    compra. Caso o problema persista, entre em contato com o
                    suporte do produto.
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="h-10 border-border/50"
                      onClick={handleBackToMarketplace}
                    >
                      Voltar ao marketplace
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

