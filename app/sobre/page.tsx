import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <section className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Sobre a plataforma
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Boas Ideias Online
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              A Boas Ideias é um marketplace focado em produtos digitais em PDF, criado para ajudar
              especialistas, educadores e criadores independentes a transformarem conhecimento em
              produtos simples de consumir e fáceis de vender.
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 bg-card/80">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-foreground">
                  Para quem é
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Para criadores que querem vender guias, cursos em PDF, templates, apostilas,
                  checklists e outros materiais digitais sem precisar montar uma infraestrutura
                  própria de pagamentos, hospedagem de arquivos e painel de controle.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/80">
              <CardContent className="p-6">
                <h2 className="text-base font-semibold text-foreground">
                  Como funciona
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Você cria uma conta, envia seus PDFs, adiciona uma capa em PNG e define preço e
                  categoria. A plataforma cuida da página de vendas, checkout seguro com Stripe e
                  entrega do arquivo ao comprador.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

