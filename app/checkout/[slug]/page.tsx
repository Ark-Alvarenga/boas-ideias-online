 "use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Shield,
  Lock,
  CheckCircle2,
  CreditCard,
  Loader2,
} from "lucide-react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

interface CheckoutProduct {
  _id?: string
  title: string
  slug: string
  description: string
  price: number
  category: string
  creatorName: string
}

export default function CheckoutPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug

  const [product, setProduct] = useState<CheckoutProduct | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Require login: if not authenticated, redirect to login with next=/checkout/[slug]
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        // Only redirect on a definitive "not authenticated".
        // If the server is rate-limiting or temporarily failing, keep the user on the page.
        if (res.status === 401) {
          const redirectPath = `/checkout/${slug}`
          router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)
          return
        }
        if (!res.ok) {
          console.warn("Auth check returned non-OK:", res.status)
          return
        }
      } catch (err) {
        console.error("Auth check failed", err)
        return
      } finally {
        setIsCheckingAuth(false)
      }
    }

    if (slug) {
      void checkAuth()
    } else {
      setIsCheckingAuth(false)
    }
  }, [router, slug])

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`, {
          cache: "no-store",
        })
        const json = await res.json()

        if (!res.ok) {
          setError(json.error || "Produto não encontrado.")
          setProduct(null)
          return
        }

        const apiProduct = json.product as CheckoutProduct
        setProduct(apiProduct)
      } catch (err) {
        console.error("Error loading product for checkout", err)
        setError("Falha ao carregar informações do produto.")
        setProduct(null)
      } finally {
        setIsLoadingProduct(false)
      }
    }

    if (slug) {
      void loadProduct()
    } else {
      setIsLoadingProduct(false)
      setProduct(null)
    }
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product?._id) {
      setError("Produto inválido para checkout.")
      return
    }

    setError(null)
    setIsProcessing(true)
    
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          buyerEmail: formData.email,
          buyerName: formData.name,
        }),
      })

      const json = await res.json()

      if (!res.ok || !json.success || !json.url) {
        setError(json.error || "Falha ao processar o pedido.")
        return
      }

      window.location.href = json.url as string
    } catch (err) {
      console.error("Checkout error", err)
      setError("Ocorreu um erro ao iniciar o pagamento.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-10 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-10">
            <Link 
              href={`/produto/${slug}`}
              className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao produto
            </Link>
          </nav>

          <h1 className="mb-10 font-serif text-3xl font-semibold tracking-tight text-foreground">
            Finalizar Compra
          </h1>

          {isCheckingAuth || isLoadingProduct ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando informações do checkout...
            </div>
          ) : !product ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
              {error || "Não foi possível encontrar este produto para checkout."}
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
            {/* Checkout Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit}>
                <Card className="border-border/50 bg-card shadow-sm">
                  <CardContent className="p-6 lg:p-8">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground">
                        Informações de Pagamento
                      </h2>
                    </div>
                    
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="name">Nome completo</FieldLabel>
                        <Input
                          id="name"
                          placeholder="Seu nome completo"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="h-11 border-border/50 bg-background"
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="h-11 border-border/50 bg-background"
                          required
                        />
                      </Field>

                      {/* Stripe coleta os dados do cartão na página segura dele */}
                    </FieldGroup>

                    <Button 
                      type="submit"
                      size="lg"
                      className="mt-8 h-12 w-full shadow-sm"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processando...
                        </span>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Pagar R${product.price}
                        </>
                      )}
                    </Button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Pagamento 100% seguro
                    </div>
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card className="border-border/50 bg-card shadow-sm">
                <CardContent className="p-6 lg:p-8">
                  <h2 className="mb-6 text-lg font-semibold text-foreground">
                    Resumo do Pedido
                  </h2>
                  
                    <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/15 to-indigo-500/15">
                      <span className="font-serif text-xl font-semibold text-foreground/30">
                        {product.title.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="mb-1 inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {product.category}
                      </span>
                      <h3 className="line-clamp-2 font-semibold text-foreground">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        por {product.creatorName}
                      </p>
                    </div>
                  </div>

                  <div className="my-6 h-px bg-border/50" />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">R${product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Desconto</span>
                      <span className="text-foreground">R$0</span>
                    </div>
                  </div>

                  <div className="my-4 h-px bg-border/50" />

                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-semibold tracking-tight text-foreground">
                      R${product.price}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      Acesso imediato após confirmação
                    </div>
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      Garantia de 7 dias
                    </div>
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      Suporte incluído
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          )}

          {error && product && (
            <p className="mt-6 text-sm text-red-500">{error}</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
