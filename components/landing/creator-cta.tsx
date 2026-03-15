import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, DollarSign, BarChart3 } from "lucide-react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Faça Upload",
    description: "Envie seu PDF, guia ou recurso digital"
  },
  {
    icon: DollarSign,
    step: "02",
    title: "Defina o Preço",
    description: "Você decide quanto vale seu conhecimento"
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Comece a Vender",
    description: "Alcance milhares de compradores"
  }
]

export function CreatorCTA() {
  return (
    <section className="relative overflow-hidden bg-primary py-16 lg:py-32">
      {/* Subtle pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-foreground"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            Venda seus produtos digitais para milhares de compradores
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
            Junte-se a mais de 15.000 criadores que já transformam conhecimento em renda passiva.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-3">
          {steps.map((item, index) => (
            <div key={index} className="relative text-center">
              <div className="mb-5 inline-flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">
                Passo {item.step}
              </p>
              <h3 className="text-lg font-semibold text-primary-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-primary-foreground/70">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Button 
            size="lg" 
            className="h-12 bg-background px-8 text-foreground shadow-lg hover:bg-background/90"
            asChild
          >
            <Link href="/dashboard">
              Começar a Vender Agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
