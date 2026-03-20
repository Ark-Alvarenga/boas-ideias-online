import { Book, FileText, Image, Grid, FileCode } from "lucide-react"

const examples = [
  { icon: Book, title: "E-book simples de receitas" },
  { icon: FileText, title: "Guia prático de viagem em PDF" },
  { icon: Grid, title: "Planilha de controle financeiro" },
  { icon: Image, title: "Pack de templates para Instagram" },
  { icon: FileCode, title: "Resumos de estudo para concursos" }
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

        <div className="mt-16 flex flex-wrap justify-center gap-6">
          {examples.map((example, i) => (
            <div 
              key={i} 
              className="flex items-center gap-4 rounded-md border-2 border-foreground bg-background p-6 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]"
            >
              <example.icon className="h-6 w-6 text-foreground" />
              <span className="text-lg font-bold text-foreground">{example.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
