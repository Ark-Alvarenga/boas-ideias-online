import { Lightbulb, TrendingUp, Users, Zap } from "lucide-react"

const benefits = [
  {
    icon: Lightbulb,
    title: "Transforme Conhecimento em Renda",
    description: "Monetize sua expertise criando produtos digitais que geram renda passiva."
  },
  {
    icon: TrendingUp,
    title: "Aprenda com Especialistas",
    description: "Acesse recursos criados por quem já trilhou o caminho do sucesso digital."
  },
  {
    icon: Zap,
    title: "Monetize sua Criatividade",
    description: "Venda prompts, toolkits e recursos que ajudam outros criadores a crescer."
  },
  {
    icon: Users,
    title: "Comunidade Engajada",
    description: "Faça parte de uma rede de empreendedores digitais que compartilham conhecimento."
  }
]

export function BenefitsSection() {
  return (
    <section className="border-y border-border/50 bg-muted/30 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Por que escolher
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Uma plataforma feita para criadores
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Tudo que você precisa para transformar conhecimento em produtos digitais de valor.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:gap-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="group relative flex gap-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
