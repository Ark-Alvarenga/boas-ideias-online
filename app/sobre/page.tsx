import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, BookOpen, Star, Users } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nós | Nossa Missão e Valores",
  description: "Conheça a história e a missão da Boas Ideias Online. Ajudamos criadores a transformarem conhecimento em produtos digitais de sucesso.",
  alternates: {
    canonical: "/sobre",
  },
};

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />

      <main className="py-12 lg:py-18">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          {/* Hero Section */}
          <section className="mb-20 text-center md:text-left">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-bold text-primary mb-6 border-2 border-primary shadow-[2px_2px_0px_text-primary]">
              NOSSA MISSÃO
            </div>
            <h1 className="font-serif text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
              Simplificar a venda de <br className="hidden md:block" />
              <span className="text-primary">conhecimento online.</span>
            </h1>
            <p className="max-w-2xl text-lg font-medium text-muted-foreground md:mx-0 mx-auto md:text-xl leading-relaxed">
              A Boas Ideias é um marketplace focado em produtos digitais em PDF,
              criado para ajudar especialistas, educadores e criadores
              independentes a transformarem conhecimento em produtos simples de
              consumir e fáceis de vender.
            </p>
          </section>

          {/* Core Values / Blocks */}
          <div className="grid gap-8 md:grid-cols-2">
            <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-primary/20 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
                <Users className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="mb-3 font-serif text-2xl font-bold text-foreground">
                Para quem é
              </h2>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Para criadores que querem vender guias, cursos em PDF,
                templates, apostilas, checklists e outros materiais digitais sem
                precisar montar uma infraestrutura própria de pagamentos,
                hospedagem de arquivos e painel de controle.
              </p>
            </div>

            <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-emerald-500/20 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
                <BookOpen className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="mb-3 font-serif text-2xl font-bold text-foreground">
                Como funciona
              </h2>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Você cria uma conta, envia seus PDFs, adiciona uma capa em PNG e
                define preço e categoria. A plataforma cuida da página de
                vendas, checkout seguro com Stripe e entrega do arquivo ao
                comprador.
              </p>
            </div>

            <div className="md:col-span-2 group relative flex flex-col rounded-2xl border-2 border-foreground bg-accent p-10 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
              <div className="md:flex items-center justify-between">
                <div className="mb-6 md:mb-0 md:max-w-lg">
                  <h2 className="font-serif text-3xl font-black text-foreground mb-4">
                    Comece sua jornada hoje
                  </h2>
                  <p className="text-lg font-medium text-foreground/80">
                    Junte-se a criadores que já estão transformando ideias em
                    renda extra todos os dias.
                  </p>
                </div>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-foreground px-8 py-4 text-base font-bold text-background shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
                >
                  Criar minha conta <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
