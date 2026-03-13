import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function CentralDeAjudaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:px-8 lg:py-20">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Central de Ajuda
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Encontre respostas rápidas para as dúvidas mais comuns sobre o uso da plataforma, tanto para compradores
            quanto para criadores.
          </p>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">
              Não recebi o e-mail com o download. O que faço?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Verifique a caixa de spam e promoções do seu e-mail. Caso não encontre, você pode entrar em contato pela
              página de Contato informando o e-mail usado na compra para reenviarmos o link.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">
              Como posso começar a vender meus produtos?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie uma conta, acesse o dashboard e use a opção de criar produto. Você poderá enviar seu PDF, definir
              preço, descrição e categoria. Em seguida, é só publicar.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-6">
            <h2 className="text-base font-semibold text-foreground">Outras dúvidas</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta central é um ponto de partida e pode ser expandida no futuro com mais perguntas frequentes, tutoriais
              e links para materiais de suporte. Use este conteúdo como placeholder inicial.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

