import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade | Segurança de Dados",
  description: "Entenda como protegemos seus dados e garantimos sua privacidade na Boas Ideias Online.",
  alternates: {
    canonical: "/privacidade",
  },
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:px-8 lg:py-20">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Política de Privacidade
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Esta página descreve, em termos gerais, como as informações dos usuários podem ser tratadas na plataforma
            Boas Ideias. Use o texto como modelo inicial e ajuste com suporte jurídico.
          </p>
        </section>

        <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-base font-semibold text-foreground">1. Coleta de informações</h2>
            <p className="mt-2">
              Podemos coletar dados fornecidos diretamente por você, como nome e e-mail, além de informações técnicas
              de navegação para melhorar a experiência de uso da plataforma.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">2. Uso dos dados</h2>
            <p className="mt-2">
              As informações podem ser utilizadas para operar o marketplace, processar compras, comunicar atualizações
              e oferecer suporte. Não vendemos seus dados pessoais para terceiros.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-foreground">3. Segurança</h2>
            <p className="mt-2">
              Empregamos medidas técnicas razoáveis para proteger as informações armazenadas. No entanto, nenhum
              sistema é completamente livre de riscos, e recomendamos boas práticas de segurança por parte dos usuários.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">
              Este texto é apenas um placeholder informativo. Substitua-o por uma política de privacidade completa,
              elaborada com apoio de um especialista e em conformidade com a LGPD e demais normas aplicáveis.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

