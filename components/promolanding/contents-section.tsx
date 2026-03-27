export function ContentsSection() {
  const items = [
    {
      number: 1,
      title: "Como começar do zero\nna internet",
      description:
        "Descubra exatamente por onde começar, mesmo sem experiência, sem dinheiro e sem saber nada sobre ganhar dinheiro online.",
      position: "left",
    },
    {
      number: 2,
      title: "As formas mais rápidas\nde ganhar dinheiro online",
      description:
        "Conheça os métodos mais usados hoje para gerar renda na internet e escolha o melhor para começar ainda hoje.",
      position: "right",
    },
    {
      number: 3,
      title: "Como ganhar dinheiro\nsem aparecer",
      description:
        "Aprenda estratégias que permitem faturar online sem precisar gravar vídeos, mostrar o rosto ou ter seguidores.",
      position: "left",
    },
    {
      number: 4,
      title: "Como escalar e viver\nda internet",
      description:
        "Entenda como transformar sua primeira renda em algo consistente e construir múltiplas fontes de dinheiro online.",
      position: "right",
    },
  ]

  return (
    <section className="bg-[#1a1a1a] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-center mb-16">
          <span className="text-gray-400 text-2xl md:text-3xl italic">O QUE VOCÊ</span>
          <br />
          <span className="text-cyan-500 text-3xl md:text-4xl font-bold">
            VAI APRENDER NO GUIA?
          </span>
        </h2>

        <div className="relative">
          {/* Vertical dashed line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-gray-600 -translate-x-1/2 hidden md:block" />

          <div className="space-y-12 md:space-y-0">
            {items.map((item, index) => (
              <div
                key={item.number}
                className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${index > 0 ? "md:mt-8" : ""
                  }`}
              >
                {item.position === "left" ? (
                  <>
                    {/* Left content */}
                    <div className="flex-1 text-center md:text-right order-2 md:order-1">
                      <h3 className="text-cyan-500 text-xl md:text-2xl font-bold whitespace-pre-line mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm md:text-base">
                        {item.description}
                      </p>
                    </div>

                    {/* Number circle */}
                    <div className="relative z-10 order-1 md:order-2">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-cyan-500 bg-[#1a1a1a] flex items-center justify-center">
                        <span className="text-cyan-500 text-2xl md:text-3xl font-bold">
                          {item.number}
                        </span>
                      </div>
                    </div>

                    {/* Empty right space */}
                    <div className="flex-1 hidden md:block order-3" />
                  </>
                ) : (
                  <>
                    {/* Empty left space */}
                    <div className="flex-1 hidden md:block order-1" />

                    {/* Number circle */}
                    <div className="relative z-10 order-1 md:order-2">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-cyan-500 bg-[#1a1a1a] flex items-center justify-center">
                        <span className="text-cyan-500 text-2xl md:text-3xl font-bold">
                          {item.number}
                        </span>
                      </div>
                    </div>

                    {/* Right content */}
                    <div className="flex-1 text-center md:text-left order-2 md:order-3">
                      <h3 className="text-cyan-500 text-xl md:text-2xl font-bold whitespace-pre-line mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm md:text-base">
                        {item.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}