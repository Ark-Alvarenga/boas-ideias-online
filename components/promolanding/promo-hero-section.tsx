export function PromoHeroSection() {
  const features = [
    "Empreender no mundo atual.",
    "Investir como os milionários.",
    "Vender qualquer produto a qualquer pessoa.",
    "Desenvolver toda a sua inteligência emocional.",
    "Dominar a comunicação com pessoas.",
    "Influenciar e persuadir de forma eficaz.",
    "Encontrar o mentor ideal.",
    "Aumentar sua produtividade.",
    "Liderar e motivar uma equipe.",
    "Assumir riscos calculados.",
    "Negociar como um mestre.",
    "Conquistar a liberdade.",
  ]

  return (
    <section className="bg-[#1a1a1a] py-8 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Logo */}
        <div className="mb-8 md:mb-12">
          <div className="text-white">
            <span className="text-sm font-bold tracking-wider">PROJETO</span>
            <div className="text-3xl font-bold">1M</div>
            <div className="flex gap-1 mt-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          {/* Book Image Placeholder */}
          <div className="w-full max-w-sm lg:max-w-md flex-shrink-0">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg p-8 aspect-[3/4] flex flex-col justify-center items-center shadow-2xl transform perspective-1000 rotate-y-[-5deg]">
                <span className="text-xs text-white/80 tracking-widest mb-2">PROJETO</span>
                <span className="text-2xl font-bold text-white mb-4">1M</span>
                <div className="text-center text-white/80 text-xs mb-4">O QUE OS RICOS SABEM E NÃO CONTAM</div>
                <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
                  A BÍBLIA PARA<br />O MILHÃO
                </h3>
                <p className="text-xs text-white/70 text-center mb-6">
                  O GUIA COMPLETO COM DICAS PRÁTICAS PARA VOCÊ MUDAR DE VIDA
                </p>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-xs text-white/60 text-center">
                  OS 10 PILARES PARA VOCÊ CONQUISTAR O MILHÃO
                </p>
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
              <span className="text-cyan-500">A BÍBLIA PARA O MILHÃO</span>
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold mb-6">
              O que os ricos sabem e não contam.
            </h2>

            <p className="text-gray-300 mb-4 leading-relaxed">
              Fruto da experiência dos maiores empreendedores e investidores do mundo,
              o livro <span className="text-cyan-500">{'"A Bíblia para o Milhão"'}</span> é um manual completo para todos aqueles que
              querem iniciar a jornada rumo ao primeiro Milhão.
            </p>

            <p className="text-gray-300 mb-6 leading-relaxed">
              Dividido em 32 capítulos totalmente práticos, o livro lhe ensinará passo a
              passo todas as estratégias e técnicas que você precisa saber para:
            </p>

            <ol className="text-gray-300 space-y-1 text-left">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-white font-medium">{index + 1}.</span>
                  <span className="italic">{feature}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
