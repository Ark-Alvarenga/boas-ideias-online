import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PrecosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />
      <main className="py-12 lg:py-18">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          {/* Hero Section */}
          <section className="mb-20 text-center md:text-left">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-bold text-primary mb-6 border-2 border-primary shadow-[2px_2px_0px_text-primary]">
              SIMPLES E JUSTO
            </div>
            <h1 className="font-serif text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
              Você só paga quando <br className="hidden md:block" />
              <span className="text-primary">fizer uma venda.</span>
            </h1>
            <p className="max-w-2xl text-lg font-medium text-muted-foreground md:mx-0 mx-auto md:text-xl leading-relaxed">
              A Boas Ideias foi pensada para ser acessível. Sem mensalidades ou
              taxas ocultas. Você foca em criar e vender, e o resto nós
              cuidamos.
            </p>
          </section>

          {/* Pricing Cards */}
          <section className="mb-20 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto md:mx-0">
            {/* Standard Plan */}
            <div className="group relative flex flex-col rounded-3xl border-2 border-foreground bg-card p-10 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
              <div className="mb-2">
                <p className="text-sm font-bold uppercase tracking-widest text-primary">
                  CRIADORES
                </p>
                <h2 className="mt-2 text-4xl font-serif font-black text-foreground">
                  Essencial
                </h2>
              </div>
              <p className="mt-4 text-base font-medium text-muted-foreground">
                Tudo o que você precisa para começar a vender hoje mesmo.
              </p>

              <div className="my-8 text-5xl font-black text-foreground">
                Grátis{" "}
                <span className="text-xl font-bold text-muted-foreground">
                  /mês
                </span>
              </div>

              <ul className="mb-8 flex-1 space-y-4 text-base font-medium text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle2 className="mr-3 h-6 w-6 text-emerald-500" />
                  Taxa por venda competitiva
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="mr-3 h-6 w-6 text-emerald-500" />
                  Publicação ilimitada
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="mr-3 h-6 w-6 text-emerald-500" />
                  Dashboard de análises
                </li>
                <li className="flex items-center opacity-60">
                  <XCircle className="mr-3 h-6 w-6" />
                  Sem mensalidade fixa
                </li>
              </ul>

              <a
                href="/login"
                className="mt-auto inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-foreground px-8 py-4 text-base font-bold text-background shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,0.2)]"
              >
                Criar conta gratuita
              </a>
            </div>

            {/* Pro Plan (Em breve) */}
            <div className="group relative flex flex-col rounded-3xl border-2 border-foreground bg-primary p-10 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
              <div className="absolute right-6 top-6 inline-flex rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">
                EM BREVE
              </div>
              <div className="mb-2">
                <p className="text-sm font-bold uppercase tracking-widest text-foreground/80">
                  AVANÇADO
                </p>
                <h2 className="mt-2 text-4xl font-serif font-black text-foreground">
                  Pro
                </h2>
              </div>
              <p className="mt-4 text-base font-medium text-foreground/80">
                Para criadores com alto volume de vendas e necessidades
                avançadas.
              </p>

              <div className="my-8 text-5xl font-black text-foreground">
                --{" "}
                <span className="text-xl font-bold text-foreground/80">
                  /mês
                </span>
              </div>

              <ul className="mb-8 flex-1 space-y-4 text-base font-medium text-foreground/80">
                <li className="flex items-center text-foreground">
                  <CheckCircle2 className="mr-3 h-6 w-6" />
                  Taxas reduzidas por volume
                </li>
                <li className="flex items-center text-foreground">
                  <CheckCircle2 className="mr-3 h-6 w-6" />
                  Ferramentas avançadas de marketing
                </li>
                <li className="flex items-center text-foreground">
                  <CheckCircle2 className="mr-3 h-6 w-6" />
                  Suporte prioritário VIP
                </li>
              </ul>

              <button
                disabled
                className="mt-auto inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-foreground/20 px-8 py-4 text-base font-bold text-foreground cursor-not-allowed"
              >
                Lista de espera
              </button>
            </div>
          </section>

          {/* Details Section */}
          <section className="rounded-2xl border-2 border-dashed border-foreground bg-muted/30 p-8 max-w-4xl">
            <h2 className="mb-3 font-serif text-2xl font-bold text-foreground">
              Dúvidas sobre taxas?
            </h2>
            <p className="text-base font-medium text-muted-foreground leading-relaxed">
              A Boas Ideias Online processa os pagamentos através da Stripe,
              líder global em segurança de pagamentos. As taxas da plataforma e
              da processadora são descontadas automaticamente no momento da
              venda. Nenhuma cobrança extra ou boleto será gerado no final do
              mês para você.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
