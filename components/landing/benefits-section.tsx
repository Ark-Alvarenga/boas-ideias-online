import { Rocket, DollarSign, ShoppingCart, Zap } from "lucide-react"

const benefits = [
  {
    icon: Rocket,
    title: "Comece em Minutos",
    description: "Não perca semanas configurando sistemas. Suba seu arquivo, copie seu link de checkout e comece a divulgar no Instagram, TikTok ou WhatsApp."
  },
  {
    icon: DollarSign,
    title: "Dinheiro Direto na Conta",
    description: "Suas vendas, seu dinheiro. Receba pagamentos via Pix e Cartão com as taxas mais competitivas do mercado."
  },
  {
    icon: ShoppingCart,
    title: "Checkout que Vende Sozinho",
    description: "Nossa página de pagamento foi desenhada por especialistas para garantir que o seu cliente compre por impulso, sem fricção."
  },
  {
    icon: Zap,
    title: "Venda Automática",
    description: "O cliente pagou? O acesso é enviado na mesma hora, automaticamente. Você ganha dinheiro até dormindo."
  }
]

export function BenefitsSection() {
  return (
    <section className="section-y border-y border-border/50 bg-muted/30">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            SEM COMPLICAÇÃO
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Tudo configurado para você só se preocupar em vender.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            A infraestrutura completa para você empacotar seu conhecimento e faturar rápido.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="group flex gap-5 rounded-xl border border-border/50 bg-card p-6 transition-colors hover:border-border hover:shadow-sm"
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
