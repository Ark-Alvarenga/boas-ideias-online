import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function ParaCriadoresPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:px-8 lg:py-20">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Como funciona para criadores
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Entenda, passo a passo, como usar a Boas Ideias para transformar o seu conhecimento em produtos digitais
            práticos, como PDFs, templates e materiais educacionais.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">1. Crie sua conta</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cadastre-se em poucos minutos com seu nome e e-mail. Em seguida, configure seu perfil de criador para
              apresentar melhor o seu trabalho.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">2. Publique seus produtos</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Envie seus PDFs, templates ou outros materiais digitais, defina preços, categorias e descrição. Nossa
              interface foi pensada para ser simples mesmo para quem está começando.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">3. Comece a vender</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Assim que o produto é aprovado, ele já aparece no marketplace. Você recebe notificações de vendas e pode
              acompanhar resultados em tempo real no dashboard.
            </p>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">Pagamentos e repasses</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Utilizamos Stripe para processar pagamentos com segurança. Os repasses são feitos diretamente para a sua
              conta conectada, seguindo o calendário de pagamentos da plataforma.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">Suporte ao criador</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Precisa de ajuda com o envio de arquivos, descrição dos produtos ou configuração de preços? Nossa equipe
              está disponível para ajudar você a tirar o máximo proveito da plataforma.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

