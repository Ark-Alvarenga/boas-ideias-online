import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HelpCircle, Mail, MessageCircleQuestion } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Central de Ajuda | FAQ e Suporte",
  description: "Encontre respostas para as perguntas mais frequentes sobre como comprar e vender produtos digitais.",
  alternates: {
    canonical: "/ajuda",
  },
};

export default function CentralDeAjudaPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />
      <main className="py-12 lg:py-18">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Hero Section */}
          <section className="mb-16 text-center md:text-left">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-bold text-primary mb-6 border-2 border-primary shadow-[2px_2px_0px_text-primary]">
              SUPORTE
            </div>
            <h1 className="font-serif text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
              Como podemos <span className="text-primary">ajudar?</span>
            </h1>
            <p className="max-w-2xl text-lg font-medium text-muted-foreground md:mx-0 mx-auto md:text-xl leading-relaxed">
              Encontre respostas rápidas para as dúvidas mais comuns sobre o uso
              da plataforma.
            </p>
          </section>

          {/* Contact Cards */}
          <section className="mb-16 grid gap-6 sm:grid-cols-2">
            <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground bg-primary/20">
                <Mail className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">
                Fale com a gente
              </h3>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Envie um e-mail para suporte@boasideias.com.br e responderemos
                em até 24 horas.
              </p>
            </div>

            <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] transition-all dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground bg-emerald-500/20">
                <MessageCircleQuestion className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">
                Comunidade
              </h3>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Acesse nossa comunidade no Discord e tire dúvidas com outros
                criadores.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="mb-8 font-serif text-3xl font-black text-foreground">
              Dúvidas Frequentes
            </h2>
            <div className="space-y-6">
              <div className="group rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] transition-all">
                <h3 className="flex items-start text-lg font-bold text-foreground">
                  <HelpCircle className="mr-3 h-6 w-6 shrink-0 text-primary" />
                  <span>Não recebi o e-mail com o download. O que faço?</span>
                </h3>
                <p className="ml-9 mt-3 text-base font-medium text-muted-foreground leading-relaxed">
                  Verifique a caixa de spam e promoções do seu e-mail. Caso não
                  encontre, você pode entrar em contato pela página de Contato
                  informando o e-mail usado na compra para reenviarmos o link.
                </p>
              </div>

              <div className="group rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] transition-all">
                <h3 className="flex items-start text-lg font-bold text-foreground">
                  <HelpCircle className="mr-3 h-6 w-6 shrink-0 text-primary" />
                  <span>Como posso começar a vender meus produtos?</span>
                </h3>
                <p className="ml-9 mt-3 text-base font-medium text-muted-foreground leading-relaxed">
                  Crie uma conta, acesse o dashboard e use a opção de criar
                  produto. Você poderá enviar seu PDF, definir preço, descrição
                  e categoria. Em seguida, é só publicar.
                </p>
              </div>

              <div className="group rounded-2xl border-2 border-dashed border-foreground bg-muted/30 p-8">
                <h3 className="flex items-start text-lg font-bold text-foreground">
                  <HelpCircle className="mr-3 h-6 w-6 shrink-0 text-muted-foreground" />
                  <span>Mais dúvidas em breve...</span>
                </h3>
                <p className="ml-9 mt-3 text-base font-medium text-muted-foreground leading-relaxed">
                  Esta central é um ponto de partida e será expandida com mais
                  perguntas frequentes, tutoriais e links para materiais de
                  suporte em breve.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
