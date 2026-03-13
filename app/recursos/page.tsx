import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function RecursosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:px-8 lg:py-20">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Recursos para criadores
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Tudo o que você precisa para criar, publicar e vender seus produtos digitais em um só lugar.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Publicação simples de PDFs</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Envie seus PDFs e materiais digitais em poucos passos, com suporte a descrições, categorias e recursos
              visuais para destacar o seu produto.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Dashboard de vendas</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Acompanhe vendas, faturamento e desempenho de cada produto em tempo real, direto do seu painel.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Integração com Stripe</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Receba pagamentos com segurança, com toda a infraestrutura de cobrança e repasse feita pela Stripe.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Marketplace dedicado</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Seus produtos aparecem em um marketplace focado em materiais em PDF e conteúdos de alta qualidade.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-6">
          <h2 className="text-base font-semibold text-foreground">Recursos em desenvolvimento</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Algumas funcionalidades descritas aqui podem estar em fase de implementação. Use este texto como
            placeholder e ajuste quando novos recursos forem lançados.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}

