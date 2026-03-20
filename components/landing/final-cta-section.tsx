import Link from "next/link"
import { Button } from "@/components/ui/button"

export function FinalCtaSection() {
  return (
    <section className="border-t-2 border-foreground bg-primary py-24 lg:py-32">
      <div className="section-container text-center">
        <h2 className="font-serif text-5xl font-black tracking-tight text-primary-foreground sm:text-7xl">
          Sua primeira venda está <br className="hidden sm:block"/> mais perto do que você imagina.
        </h2>
        
        <div className="mt-12">
          <Button 
            size="xl" 
            className="h-16 rounded-md border-2 border-foreground bg-background px-12 text-xl font-bold text-foreground shadow-[6px_6px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] active:translate-y-1 active:shadow-[2px_2px_0px_#000] dark:shadow-[6px_6px_0px_#fff] dark:hover:shadow-[10px_10px_0px_#fff] dark:active:shadow-[2px_2px_0px_#fff]" 
            asChild
          >
            <Link href="/register">
              Começar hoje (É grátis)
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
