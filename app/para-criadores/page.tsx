import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  MousePointerClick,
  FileUp,
  DollarSign,
  Headphones,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function ParaCriadoresPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Header />
      <main className="py-12 lg:py-18">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          {/* Hero Section */}
          <section className="mb-20 text-center md:text-left">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-bold text-primary mb-6 border-2 border-primary shadow-[2px_2px_0px_text-primary]">
              PARA CRIADORES
            </div>
            <h1 className="font-serif text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
              Sua vitrine digital <br className="hidden md:block" />
              em <span className="text-primary">3 passos simples.</span>
            </h1>
            <p className="max-w-2xl text-lg font-medium text-muted-foreground md:mx-0 mx-auto md:text-xl leading-relaxed">
              Entenda como usar a Boas Ideias para transformar o seu
              conhecimento em produtos digitais práticos e começar a faturar
              hoje mesmo. Sem códigos, sem complexidade.
            </p>
          </section>

          {/* Steps Section */}
          <section className="mb-20 grid gap-8 md:grid-cols-3">
            <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-primary/20 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
                <MousePointerClick className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">
                1. Crie sua conta
              </h2>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Cadastre-se em poucos minutos com seu nome e e-mail. Em seguida,
                configure seu perfil de criador para apresentar melhor o seu
                trabalho e estabelecer autoridade.
              </p>
            </div>

            <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-rose-500/20 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
                <FileUp className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">
                2. Publique arquivos
              </h2>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Envie seus PDFs, adicione capas criativas, defina preços e
                escolha a categoria. Nossa interface foi pensada para ser ágil e
                direto ao ponto.
              </p>
            </div>

            <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-8 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-emerald-500/20 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
                <DollarSign className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">
                3. Comece a vender
              </h2>
              <p className="text-base font-medium text-muted-foreground leading-relaxed">
                Assim que aprovado, seu produto vai ao ar com um link de
                checkout próprio e para o marketplace. Acompanhe vendas e
                métricas em tempo real no dashboard.
              </p>
            </div>
          </section>

          {/* Details Section */}
          <section className="mb-20 grid gap-8 md:grid-cols-2">
            <div className="flex border-2 border-foreground rounded-2xl p-8 bg-indigo-50 dark:bg-card shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
              <div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground bg-indigo-200">
                  <ShieldCheck className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="mb-3 font-serif text-2xl font-bold text-foreground">
                  Pagamentos e segurança
                </h3>
                <p className="text-base font-medium text-muted-foreground leading-relaxed">
                  Utilizamos a Stripe para processar pagamentos com segurança
                  internacional. Os repasses são automatizados e enviados
                  diretamente para a sua conta bancária conectada.
                </p>
              </div>
            </div>

            <div className="flex border-2 border-foreground rounded-2xl p-8 bg-amber-50 dark:bg-card shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
              <div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground bg-amber-200">
                  <Headphones className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="mb-3 font-serif text-2xl font-bold text-foreground">
                  Suporte presente
                </h3>
                <p className="text-base font-medium text-muted-foreground leading-relaxed">
                  Nossa equipe cuida das necessidades técnicas dos seus
                  compradores (download, acesso, etc), deixando você focado em
                  apenas criar e vender.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="group relative flex flex-col items-center text-center rounded-2xl border-2 border-foreground bg-accent p-12 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
            <h2 className="font-serif text-3xl font-black text-foreground mb-4">
              Pronto para publicar sua primeira ideia?
            </h2>
            <p className="text-lg font-medium text-foreground/80 mb-8 max-w-xl">
              Não espere ter o material perfeito. Crie, publique e ajuste com o
              tempo.
            </p>
            <a
              href="/dashboard/create-product"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-foreground px-8 py-4 text-base font-bold text-background shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,0.2)]"
            >
              Adicionar produto agora <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
