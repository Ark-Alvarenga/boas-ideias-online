import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BookText, LineChart, Link, Store } from "lucide-react";

export default function RecursosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />
      <main className="py-12 lg:py-18">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          {/* Hero Section */}
          <section className="mb-20 text-center md:text-left">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-bold text-primary mb-6 border-2 border-primary shadow-[2px_2px_0px_text-primary]">
              FERRAMENTAS
            </div>
            <h1 className="font-serif text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
              Tudo para você <br className="hidden md:block" />
              <span className="text-primary">vender mais.</span>
            </h1>
            <p className="max-w-2xl text-lg font-medium text-muted-foreground md:mx-0 mx-auto md:text-xl leading-relaxed">
              Descubra os recursos projetados para facilitar a criação,
              publicação e distribuição dos seus produtos digitais.
            </p>
          </section>

          {/* Resources Grid */}
          <section className="mb-20 grid gap-8 md:grid-cols-2">
            <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-blue-500/20">
                <BookText className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="mb-3 font-serif text-2xl font-bold text-foreground">
                Publicação simples de PDFs
              </h2>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Envie seus PDFs e materiais digitais em poucos passos, com
                suporte a descrições ricas, categorias e recursos visuais para
                destacar o seu produto na vitrine.
              </p>
            </div>

            <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-emerald-500/20">
                <LineChart className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="mb-3 font-serif text-2xl font-bold text-foreground">
                Dashboard de vendas
              </h2>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Acompanhe vendas, faturamento diário, cliques e desempenho de
                cada produto em tempo real direto do seu elegante painel de
                controle.
              </p>
            </div>

            <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-indigo-500/20">
                <Link className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="mb-3 font-serif text-2xl font-bold text-foreground">
                Integração com Stripe
              </h2>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Receba pagamentos com segurança através do seu próprio checkout.
                Toda a infraestrutura de cobrança e repasse internacional
                automática feita pela Stripe.
              </p>
            </div>

            <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-amber-500/20">
                <Store className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="mb-3 font-serif text-2xl font-bold text-foreground">
                Marketplace dedicado
              </h2>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Além do seu link próprio, seus produtos ganham visibilidade em
                um marketplace aberto, sendo descobertos por novos compradores
                todos os dias.
              </p>
            </div>
          </section>

          {/* Coming Soon Section */}
          <section className="rounded-2xl border-2 border-dashed border-foreground bg-muted/30 p-8 text-center max-w-3xl mx-auto">
            <h2 className="mb-3 font-serif text-2xl font-bold text-foreground">
              Recursos em desenvolvimento
            </h2>
            <p className="text-base font-medium text-muted-foreground leading-relaxed">
              Estamos trabalhando em programas de afiliados, upsells 1-clique,
              cupons de desconto e muito mais. A plataforma cresce junto com
              você.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
