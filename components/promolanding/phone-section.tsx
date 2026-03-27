export function PhoneSection() {
  return (
    <section className="bg-[#1a1a1a] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Phone mockup placeholder */}
          <div className="w-full max-w-xs flex-shrink-0">
            <div className="relative mx-auto">
              <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-2 shadow-2xl">
                <div className="bg-cyan-900 rounded-2xl aspect-[9/16] flex flex-col items-center justify-center p-4">
                  <div className="bg-white/20 rounded-lg w-full h-32 mb-4 flex items-center justify-center">
                    <span className="text-white/50 text-xs">A Bíblia para o Milhão</span>
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="bg-white/10 h-2 rounded w-full"></div>
                    <div className="bg-white/10 h-2 rounded w-3/4"></div>
                    <div className="bg-white/10 h-2 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-cyan-500 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              LEIA NO SEU CELULAR
            </h2>
            <p className="text-gray-300 text-lg mb-4">
              Nosso livro pode ser lido em qualquer lugar.
            </p>
            <p className="text-gray-400 mb-4">
              Com seu celular você pode consultar sempre que desejar todas as
              dicas que você precisa para construir o seu Milhão.
            </p>
            <p className="text-gray-400">
              Antes de uma reunião crucial, abra seu celular e veja as melhores
              dicas de negociação.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
