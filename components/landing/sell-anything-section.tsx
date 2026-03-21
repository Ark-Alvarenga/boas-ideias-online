import { Book, FileText, Image, Grid} from "lucide-react"

const examples = [
  { icon: Book, title: "E-book simples de receitas" },
  { icon: FileText, title: "Guia prático de viagem em PDF" },
  { icon: Grid, title: "Planilha de controle financeiro" },
  { icon: Image, title: "Pack de templates para Instagram" },
]

export function SellAnythingSection() {
  return (
    <section className="border-y-2 border-foreground bg-accent py-20 lg:py-28">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Você já tem algo de valor.
          </h2>
          <p className="mt-6 text-xl font-medium text-foreground/80">
            Qualquer conhecimento pode virar dinheiro no bolso.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {examples.map((example, i) => (
            <div 
              key={i} 
              className="flex w-full flex-col gap-4 rounded-xl border-2 border-foreground bg-background p-3 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[6px_6px_0px_#fff]"
            >
              {/* Thumbnail Placeholder */}
              <div className="relative flex w-full items-center justify-center overflow-hidden rounded-lg border-2 border-foreground/5 bg-accent/50 aspect-[4/3]">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/20" />
                <example.icon className="h-12 w-12 text-muted-foreground/20" />
              </div>
              
              {/* Content */}
              <div className="flex items-start gap-3 px-1 pb-1">
                <example.icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                <span className="font-bold leading-snug text-foreground">{example.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
