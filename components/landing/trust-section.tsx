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
      </div>
    </section>
  )
}
