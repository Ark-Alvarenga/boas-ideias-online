import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/8 blur-3xl" />

      <div className="section-container relative py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div className="max-w-xl lg:max-w-none">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="text-sm font-medium text-primary-foreground/90">
                🔥 A plataforma de vendas mais simples do Brasil
              </span>
            </div>

            <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              <span className="text-balance">Crie seu produto digital em 5 minutos</span>{" "}
              <span className="text-secondary">e faça sua primeira venda hoje.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-primary-foreground/80 lg:text-xl">
              O jeito mais rápido, fácil e seguro de transformar seu conhecimento em dinheiro na conta. 
              Sem taxas de adesão, sem precisar saber programar. Suba seu PDF, defina o preço e nós cuidamos do resto.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button 
                size="xl" 
                className="bg-secondary px-7 text-secondary-foreground shadow-lg shadow-secondary/25 hover:bg-secondary/90" 
                asChild
              >
                <Link href="/register">
                  Criar Minha Conta Grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="xl" 
                variant="outline" 
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" 
                asChild
              >
                <Link href="/marketplace">
                  Explorar Marketplace
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-medium text-primary-foreground/80">
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Pagamentos seguros via Stripe
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Checkout de alta conversão
              </span>
            </div>

            {/* Social proof stats */}
            <div className="mt-10 border-t border-primary-foreground/15 pt-8">
              <div className="flex items-center gap-6 sm:gap-10">
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-secondary sm:text-3xl">2.500+</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">Produtos digitais</p>
                </div>
                <div className="h-10 w-px bg-primary-foreground/20" />
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-secondary sm:text-3xl">15k+</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">Criadores ativos</p>
                </div>
                <div className="hidden h-10 w-px bg-primary-foreground/20 sm:block" />
                <div className="hidden sm:block">
                  <p className="text-2xl font-semibold tracking-tight text-secondary sm:text-3xl">R$2M+</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">Em vendas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="relative mx-auto max-w-md lg:mx-0 lg:ml-auto lg:max-w-none">
            <div className="relative overflow-hidden rounded-2xl border-2 border-secondary/30 shadow-2xl shadow-secondary/10">
              <Image
                src="/images/hero-statue.jpg"
                alt="Busto grego clássico com iluminação dourada representando sabedoria e ideias"
                width={560}
                height={640}
                className="h-auto w-full object-cover"
                priority
              />
              
              {/* Floating insight card */}
              <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-secondary/30 bg-primary/95 p-4 shadow-xl backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                    <Sparkles className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-foreground">Acesso imediato</p>
                    <p className="text-sm text-primary-foreground/70">Download instantâneo após compra</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
