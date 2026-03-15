import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    quote: "Consegui sair do zero e fazer R$ 15.000 em vendas no primeiro mês vendendo meu curso de copywriting. A plataforma é incrível!",
    author: "Carla Mendes",
    role: "Criadora de Conteúdo",
    initials: "CM"
  },
  {
    quote: "Os recursos que encontrei aqui aceleraram minha jornada como empreendedor digital em pelo menos 6 meses. Vale cada centavo.",
    author: "Rafael Torres",
    role: "Empreendedor Digital",
    initials: "RT"
  },
  {
    quote: "Como designer, criei templates e vendia por R$ 50. Hoje faturo mais de R$ 8.000/mês com renda passiva. Obrigado Boas Ideias!",
    author: "Juliana Costa",
    role: "Designer e Criadora",
    initials: "JC"
  }
]

export function TestimonialsSection() {
  return (
    <section className="bg-background py-16 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Depoimentos
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            O que dizem nossos criadores
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Histórias reais de pessoas que transformaram conhecimento em renda.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-16 sm:gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="border-border/50 bg-card"
            >
              <CardContent className="p-6 lg:p-8">
                <div className="mb-6 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-foreground leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-4 border-t border-border/50 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
