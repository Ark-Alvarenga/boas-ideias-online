import {
  Upload,
  Link as LinkIcon,
  Banknote,
  ArrowRight,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export function HowItWorksSection() {
  return (
    <section className="border-t-2 border-foreground bg-accent/30 py-20 lg:py-32">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Tão fácil que parece mentira.
          </h2>
        </div>

        {/* Visual Flow Indicator */}
        <div className="mx-auto mt-12 mb-8 flex items-center justify-center gap-3 sm:gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground bg-background shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
              <User className="h-5 w-5 text-foreground" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Você
            </span>
          </div>
          <ArrowRight className="h-6 w-6 text-foreground/40" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground bg-background shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
              <Upload className="h-5 w-5 text-foreground" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Produto
            </span>
          </div>
          <ArrowRight className="h-6 w-6 text-foreground/40" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground bg-background shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
              <LinkIcon className="h-5 w-5 text-foreground" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Link
            </span>
          </div>
          <ArrowRight className="h-6 w-6 text-foreground/40" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground bg-green-500 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
              <Banknote className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Venda
            </span>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl grid gap-10 sm:grid-cols-3 sm:gap-8">
          {/* Step 1 */}
          <div className="relative rounded-xl border-2 border-foreground bg-background p-8 flex flex-col justify-between shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
            <div>
              <div className="absolute -left-6 -top-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground bg-primary text-xl font-black text-primary-foreground shadow-[2px_2px_0px_#000]">
                1
              </div>

              <h3 className="text-2xl font-bold">Crie seu produto</h3>

              <p className="mt-3 text-lg font-medium text-muted-foreground">
                Faça upload do seu PDF ou adicione o link do seu material. Dê um
                nome, defina um preço e pronto.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-foreground bg-accent shadow-[2px_2px_0px_#000]">
                <Upload className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-xl border-2 border-foreground bg-background p-8 flex flex-col justify-between shadow-[4px_4px_0px_#000]">
            <div>
              <div className="absolute -left-6 -top-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground bg-primary text-xl font-black text-primary-foreground shadow-[2px_2px_0px_#000]">
                2
              </div>

              <h3 className="text-2xl font-bold">Compartilhe o link</h3>

              <p className="mt-3 text-lg font-medium text-muted-foreground">
                Sua página de pagamento segura é criada na hora. Envie no
                WhatsApp, Instagram, TikTok ou onde quiser.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-foreground bg-accent shadow-[2px_2px_0px_#000]">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-xl border-2 border-foreground bg-background p-8 flex flex-col justify-between shadow-[4px_4px_0px_#000]">
            <div>
              <div className="absolute -left-6 -top-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground bg-primary text-xl font-black text-primary-foreground shadow-[2px_2px_0px_#000]">
                3
              </div>

              <h3 className="text-2xl font-bold">Receba seu dinheiro</h3>

              <p className="mt-3 text-lg font-medium text-muted-foreground">
                A cada venda, o dinheiro vai direto para você e o cliente recebe
                o material automaticamente, até enquanto você dorme.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-foreground bg-green-500 shadow-[2px_2px_0px_#000]">
                <Banknote className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 flex justify-center">
          <Button
            size="xl"
            className="h-16 rounded-md border-2 border-foreground bg-background px-12 text-xl font-bold text-foreground shadow-[6px_6px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] hover:bg-[#fab72a] active:translate-y-1 active:shadow-[2px_2px_0px_#000]"
            asChild
          >
            <Link href="/sobre">Saiba Mais</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
