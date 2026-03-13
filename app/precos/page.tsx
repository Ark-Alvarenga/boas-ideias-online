import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function PrecosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:px-8 lg:py-20">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Preços para criadores
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            A Boas Ideias foi pensada para ser acessível. Você paga apenas uma taxa sobre cada venda e mantém a maior
            parte da receita do seu produto digital.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Criadores</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Modelo simples</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Sem mensalidade fixa. Você só paga quando vende.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Taxa por venda competitiva (defina no futuro)</li>
              <li>• Sem custos para publicar produtos</li>
              <li>• Acesso ao dashboard de vendas</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Em breve</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Plano Pro</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Plano pensado para criadores com volume maior de vendas, com benefícios exclusivos.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Taxas reduzidas por volume</li>
              <li>• Ferramentas avançadas de analytics</li>
              <li>• Suporte prioritário</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Dúvidas sobre taxas?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Este conteúdo é informativo e pode ser ajustado de acordo com o modelo de negócios final. Use esta seção
              como placeholder até que as regras de monetização sejam definidas.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

