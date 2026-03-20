import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="section-container relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center rounded-sm border-2 border-foreground px-4 py-1.5 font-bold uppercase tracking-wider text-sm shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
          Maneira mais fácil de vender online
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl font-serif text-5xl font-black leading-[1.1] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
          Transforme uma ideia simples em <span className="underline decoration-secondary decoration-8 underline-offset-8">dinheiro hoje.</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-8 max-w-2xl text-xl font-medium leading-relaxed text-muted-foreground sm:text-2xl">
          Crie seu produto, compartilhe o link e receba pagamentos. O jeito mais fácil do Brasil de fazer sua primeira venda online na vida.
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <Button 
            size="xl" 
            className="h-16 rounded-md border-2 border-foreground bg-primary px-10 text-xl font-bold text-primary-foreground shadow-[6px_6px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] active:translate-y-1 active:shadow-[2px_2px_0px_#000] dark:shadow-[6px_6px_0px_#fff] dark:hover:shadow-[10px_10px_0px_#fff] dark:active:shadow-[2px_2px_0px_#fff]" 
            asChild
          >
            <Link href="/register">
              Criar meu primeiro produto
            </Link>
          </Button>
          <Button 
            size="xl" 
            variant="ghost" 
            className="h-16 border-2 border-transparent px-8 text-xl font-bold hover:border-foreground hover:bg-transparent" 
            asChild
          >
            <Link href="/marketplace">
              Ver exemplos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
