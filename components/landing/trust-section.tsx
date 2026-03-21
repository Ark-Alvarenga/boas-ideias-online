export function TrustSection() {
  return (
    <section className="border-t-2 border-foreground bg-background py-20 lg:py-24">
      <div className="section-container text-center">
        <h2 className="font-serif text-3xl font-black sm:text-4xl text-foreground">
          Mais de 15.000 pessoas normais (como você) 
          <br className="hidden sm:block" /> já fizeram suas primeiras vendas online.
        </h2>
        
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-xl font-bold text-muted-foreground">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-primary">R$2M+</span>
            <span>Em vendas realizadas</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-primary">Zero</span>
            <span>Conhecimento técnico exigido</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-primary">100%</span>
            <span>Seguro e confiável</span>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 rounded-full border-2 border-foreground bg-background py-2 pl-2 pr-5 shadow-[2px_2px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] dark:shadow-[2px_2px_0px_#fff] dark:hover:shadow-[4px_4px_0px_#fff]">
            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500" />
            <span className="text-sm font-bold text-foreground">João fez sua primeira venda ontem</span>
          </div>
          <div className="flex items-center gap-3 rounded-full border-2 border-foreground bg-background py-2 pl-2 pr-5 shadow-[2px_2px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] dark:shadow-[2px_2px_0px_#fff] dark:hover:shadow-[4px_4px_0px_#fff]">
            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-500" />
            <span className="text-sm font-bold text-foreground">Maria vendeu R$97 hoje</span>
          </div>
          <div className="flex items-center gap-3 rounded-full border-2 border-foreground bg-background py-2 pl-2 pr-5 shadow-[2px_2px_0px_#000] transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] dark:shadow-[2px_2px_0px_#fff] dark:hover:shadow-[4px_4px_0px_#fff]">
            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
            <span className="text-sm font-bold text-foreground">Lucas acabou de criar um produto</span>
          </div>
        </div>

      </div>
    </section>
  )
}
