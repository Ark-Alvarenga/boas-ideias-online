import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos de Uso | Diretrizes da Plataforma",
  description: "Leia nossos termos de uso para entender seus direitos e responsabilidades ao usar a Boas Ideias Online.",
  alternates: {
    canonical: "/termos",
  },
}

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
            Ao acessar e utilizar a plataforma Boas Ideias Online, você concorda com as diretrizes e regras estabelecidas neste documento.
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
              Os produtos publicados são de exclusiva responsabilidade dos criadores. A plataforma Boas Ideias atua como intermediadora e se reserva o direito de remover conteúdos que
              violem direitos de terceiros, propriedade intelectual, legislação aplicável ou estas condições de uso.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">4. Política de Reembolso</h2>
            <p className="mt-2">
              A Boas Ideias obedece à legislação vigente (Art. 49 do CDC), garantindo prazo de 7 dias de arrependimento para compras de infoprodutos, processados diretamente pela plataforma.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

