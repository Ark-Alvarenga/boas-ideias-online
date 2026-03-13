import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { GreekColumnLeft, GreekColumnRight, GreekKeyBorder, LaurelWreath } from "@/components/ui/greek-patterns"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary">
      {/* Marble-like subtle texture overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Greek columns on sides - desktop only */}
      <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-16 text-primary-foreground lg:block">
        <GreekColumnLeft className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-16 text-primary-foreground lg:block">
        <GreekColumnRight className="h-full w-full" />
      </div>
      
      {/* Radial gradient for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/80" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-3xl" />
      
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <div className="max-w-xl lg:max-w-none">
            {/* Laurel wreath above badge */}
            <div className="mb-4 flex justify-start">
              <LaurelWreath className="h-8 w-24 text-secondary" />
            </div>
            
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              <span className="text-sm font-medium text-primary-foreground/90">
                Sabedoria digital para criadores modernos
              </span>
            </div>

            <h1 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              <span className="text-balance">Ideias que iluminam.</span>{" "}
              <span className="text-secondary">Produtos que vendem.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-primary-foreground/80 lg:text-xl">
              O marketplace onde a sabedoria ancestral encontra a inovação digital. 
              Transforme seu conhecimento em produtos que geram renda passiva.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button 
                size="lg" 
                className="h-13 bg-secondary px-7 text-secondary-foreground shadow-lg shadow-secondary/25 hover:bg-secondary/90" 
                asChild
              >
                <Link href="/marketplace">
                  Explorar Produtos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-13 border-primary-foreground/30 bg-transparent px-7 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" 
                asChild
              >
                <Link href="/dashboard">
                  Começar a Vender
                </Link>
              </Button>
            </div>

            {/* Stats with Greek key separator */}
            <div className="mt-14">
              <GreekKeyBorder className="mb-6 h-3 w-full text-primary-foreground" />
              <div className="flex items-center gap-8 lg:gap-12">
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-secondary">2.500+</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">Produtos digitais</p>
                </div>
                <div className="h-12 w-px bg-primary-foreground/20" />
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-secondary">15k+</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">Criadores ativos</p>
                </div>
                <div className="hidden h-12 w-px bg-primary-foreground/20 sm:block" />
                <div className="hidden sm:block">
                  <p className="text-3xl font-semibold tracking-tight text-secondary">R$2M+</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">Em vendas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="relative lg:ml-auto">
            {/* Golden glow behind image */}
            <div className="absolute -inset-8 rounded-3xl bg-secondary/20 blur-3xl" />
            
            <div className="relative overflow-hidden rounded-2xl border-2 border-secondary/30 shadow-2xl shadow-secondary/20">
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
                    <p className="font-semibold text-primary-foreground">Ideias que geram valor</p>
                    <p className="text-sm text-primary-foreground/70">Conhecimento transformado em renda</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Greek key border */}
      <div className="absolute bottom-0 left-0 right-0">
        <GreekKeyBorder className="h-3 w-full text-primary-foreground" />
      </div>
    </section>
  )
}
