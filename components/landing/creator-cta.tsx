import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, DollarSign, BarChart3 } from "lucide-react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Suba seu Arquivo",
    description: "Envie seu PDF, e-book, planilha ou pack de templates com apenas 1 clique."
  },
  {
    icon: DollarSign,
    step: "02",
    title: "Defina seu Preço",
    description: "Escolha quanto quer cobrar. Nós já entregamos o link de pagamento pronto."
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Notificações de Venda",
    description: "Divulgue seu link e veja as notificações de \"venda realizada\" chegarem no celular."
  }
]

export function CreatorCTA() {
  return (
    <section className="relative overflow-hidden bg-primary py-16 lg:py-24">
      {/* Subtle pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary-foreground"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="section-container relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            O caminho mais curto entre sua ideia e o dinheiro no bolso.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
            Junte-se a milhares de parceiros que estão lucrando diariamente.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 sm:mt-16 sm:grid-cols-3">
          {steps.map((item, index) => (
            <div key={index} className="relative rounded-xl bg-primary-foreground/5 p-6 text-center backdrop-blur-sm">
              <div className="mb-4 inline-flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10">
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
            size="xl" 
            className="bg-background text-foreground shadow-lg hover:bg-background/90"
            asChild
          >
            <Link href="/register">
              Quero começar a vender agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
