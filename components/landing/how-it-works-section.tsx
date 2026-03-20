export function HowItWorksSection() {
  return (
    <section className="border-t-2 border-foreground bg-accent/30 py-20 lg:py-32">
      <div className="section-container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Tão fácil que parece mentira.
          </h2>
        </div>

        <div className="mx-auto mt-16 max-w-5xl grid gap-8 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="relative rounded-xl border-2 border-foreground bg-background p-8 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
            <div className="absolute -top-6 -left-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-foreground bg-primary text-2xl font-black text-primary-foreground shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
              1
            </div>
            <h3 className="mt-4 text-2xl font-bold">Crie seu produto</h3>
            <p className="mt-3 text-lg font-medium text-muted-foreground">
              Faça upload do seu PDF ou adicione o link do seu material. Dê um nome, defina um preço e pronto.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-xl border-2 border-foreground bg-background p-8 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
            <div className="absolute -top-6 -left-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-foreground bg-primary text-2xl font-black text-primary-foreground shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
              2
            </div>
            <h3 className="mt-4 text-2xl font-bold">Compartilhe o link</h3>
            <p className="mt-3 text-lg font-medium text-muted-foreground">
              Sua página de pagamento segura é criada na hora. Envie no WhatsApp, Instagram, TikTok ou onde quiser.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-xl border-2 border-foreground bg-background p-8 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]">
            <div className="absolute -top-6 -left-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-foreground bg-primary text-2xl font-black text-primary-foreground shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
              3
            </div>
            <h3 className="mt-4 text-2xl font-bold">Receba seu dinheiro</h3>
            <p className="mt-3 text-lg font-medium text-muted-foreground">
              A cada venda, o dinheiro vai direto para você e o cliente recebe o material automaticamente, até enquanto você dorme.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
