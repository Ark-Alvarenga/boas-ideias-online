import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-5 lg:py-8">
      <div className="section-container relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        {/* TEXT */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:w-[45%]">
          {/* Badge */}
          <div className="mb-8 mt-1 inline-flex items-center rounded-sm border-2 border-foreground px-4 py-1.5 bg-[#fab72a] font-bold uppercase tracking-wider text-sm shadow-[4px_4px_0px_#000]">
            A maneira mais fácil de vender online
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl font-serif text-5xl font-black leading-[1.1] tracking-tight text-foreground sm:text-7xl lg:text-6xl xl:text-7xl">
            Transforme uma ideia simples em{" "}
            <span className="underline decoration-secondary decoration-8 underline-offset-8">
              dinheiro hoje.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto lg:mx-0 mt-8 max-w-2xl text-xl font-medium leading-relaxed text-muted-foreground sm:text-2xl">
            Crie seu produto, compartilhe o link e receba pagamentos. O jeito
            mais fácil do Brasil de fazer sua primeira venda online na vida.
          </p>

          {/* CTAs */}
          <div className="mt-12 flex flex-col items-center justify-center lg:justify-start gap-5 sm:flex-row sm:gap-6">
            <Button
              size="xl"
              className="h-16 rounded-md border-2 border-foreground bg-primary px-10 text-xl font-bold text-primary-foreground shadow-[6px_6px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] active:translate-y-1 active:shadow-[2px_2px_0px_#000]"
              asChild
            >
              <Link href="/register">Criar meu primeiro produto</Link>
            </Button>

            <Button
              size="xl"
              variant="ghost"
              className="h-16 border-2 border-transparent px-8 text-xl font-bold hover:border-foreground hover:bg-transparent"
              asChild
            >
              <Link href="/marketplace">Ver exemplos</Link>
            </Button>
          </div>
        </div>

        {/* IMAGE */}
        <div className="w-full lg:w-[55%] flex justify-center lg:justify-end items-center mt-8 lg:mt-0">
          <div className="relative w-full max-w-[600px] lg:max-w-none aspect-[4/3]">
            <Image
              src="/images/hero-image.webp"
              alt="Venda online simplificada"
              fill
              className="object-contain drop-shadow-2xl lg:translate-x-8"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
