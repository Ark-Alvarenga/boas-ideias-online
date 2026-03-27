import { X, Check } from "lucide-react"

export function StartSmallSection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="section-container">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-serif text-5xl font-black tracking-tight text-foreground sm:text-6xl">
            Você já tem tudo o que precisa.
          </h2>

          <div className="mt-16 text-left inline-flex flex-col gap-8 text-xl sm:text-2xl font-bold">
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                <X className="h-6 w-6" strokeWidth={3} />
              </div>
              <p>Você <span className="line-through decoration-2">não precisa de seguidores.</span></p>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                <X className="h-6 w-6" strokeWidth={3} />
              </div>
              <p>Você <span className="line-through decoration-2">não precisa de dinheiro para investir.</span></p>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                <X className="h-6 w-6" strokeWidth={3} />
              </div>
              <p>Você <span className="line-through decoration-2">não precisa de mais tempo.</span></p>
            </div>
            <div className="flex items-center gap-4 text-foreground mt-4 p-6 border-2 border-foreground bg-primary/10 rounded-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-gray-900">
                <Check className="h-7 w-7" strokeWidth={4} />
              </div>
              <p className="text-3xl">Você só precisa de uma ideia e <span className="text-primary underline">5 minutos.</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
