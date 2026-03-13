import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:px-8 lg:py-20">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Termos de Uso
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Este texto é um esboço geral de termos de uso para a plataforma Boas Ideias. Adapte com o apoio de um
            profissional jurídico antes de usar em produção.
          </p>
        </section>

        <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-base font-semibold text-foreground">1. Aceitação dos termos</h2>
            <p className="mt-2">
              Ao utilizar a plataforma Boas Ideias, você concorda com estes Termos de Uso e com todas as políticas
              complementares aqui mencionadas. Caso não concorde com alguma condição, recomendamos que não utilize o
              serviço.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">2. Cadastro e conta</h2>
            <p className="mt-2">
              Para criar ou comprar produtos digitais, pode ser necessário criar uma conta. Você se compromete a
              fornecer informações verdadeiras, mantê-las atualizadas e proteger a confidencialidade de sua senha.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">3. Conteúdo dos criadores</h2>
            <p className="mt-2">
              Os produtos publicados são de responsabilidade dos criadores. A plataforma pode remover conteúdos que
              violem direitos de terceiros, legislação aplicável ou estas condições de uso.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">
              Este documento é apenas um placeholder ilustrativo. Substitua-o por termos de uso revisados
              juridicamente, adequados ao seu modelo de negócio e à legislação aplicável.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

