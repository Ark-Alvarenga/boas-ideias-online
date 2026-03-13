import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:px-8 lg:py-20">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Fale com a gente
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Use esta página como ponto de contato para suporte, dúvidas sobre compras, parcerias ou sugestões de
            melhorias para a plataforma.
          </p>
        </section>

        <section className="grid gap-10 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Canais de atendimento</h2>
            <ul className="mt-2 space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">E-mail:</span>{" "}
                suporte@boasideias.online{" "}
                <span className="text-xs text-muted-foreground">(placeholder – ajuste para o endereço real)</span>
              </li>
              <li>
                <span className="font-medium text-foreground">Horário de atendimento:</span> dias úteis, das 9h às 18h
                (horário de Brasília).
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-6">
            <h2 className="text-base font-semibold text-foreground">Formulário de contato</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Aqui você pode futuramente adicionar um formulário funcional para que os usuários enviem mensagens
              diretamente pelo site. Por enquanto, use este texto como placeholder e direcione o contato para o e-mail
              acima.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

