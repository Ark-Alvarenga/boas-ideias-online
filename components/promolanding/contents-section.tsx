export function ContentsSection() {
  const items = [
    {
      number: 1,
      title: "Como funciona\na mente dos campeões",
      description:
        "Descubra quais são as 12 principais características que as pessoas de sucesso têm em comum e o que você precisa fazer para conquistar também.",
      position: "left",
    },
    {
      number: 2,
      title: "Quais são os\npilares para o sucesso",
      description:
        "Aprenda tudo sobre as 15 principais habilidades dos milionários que começaram do zero.",
      position: "right",
    },
    {
      number: 3,
      title: "Como ganhar\nmuito dinheiro",
      description:
        "Tudo o que você precisa saber sobre os três grandes pilares que os ricos utilizam para a construção de riqueza.",
      position: "left",
    },
    {
      number: 4,
      title: "Como dar o\nprimeiro passo",
      description:
        "Um passo a passo com tudo o que você precisa fazer para iniciar a sua jornada rumo ao primeiro Milhão.",
      position: "right",
    },
  ]

  return (
    <section className="bg-[#1a1a1a] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-center mb-16">
          <span className="text-gray-400 text-2xl md:text-3xl italic">O QUE VOCÊ</span>
          <br />
          <span className="text-cyan-500 text-3xl md:text-4xl font-bold">ENCONTRARÁ NO LIVRO?</span>
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
                      <p className="text-gray-400 text-sm md:text-base">{item.description}</p>
                    </div>
                    {/* Number circle */}
                    <div className="relative z-10 order-1 md:order-2">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-cyan-500 bg-[#1a1a1a] flex items-center justify-center">
                        <span className="text-cyan-500 text-2xl md:text-3xl font-bold">{item.number}</span>
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
                        <span className="text-cyan-500 text-2xl md:text-3xl font-bold">{item.number}</span>
                      </div>
                    </div>
                    {/* Right content */}
                    <div className="flex-1 text-center md:text-left order-2 md:order-3">
                      <h3 className="text-cyan-500 text-xl md:text-2xl font-bold whitespace-pre-line mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm md:text-base">{item.description}</p>
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
