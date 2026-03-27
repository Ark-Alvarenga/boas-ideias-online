export function PromoHeroSection() {
  const features = [
    "Como ganhar dinheiro na internet começando do zero.",
    "As formas mais rápidas de fazer sua primeira renda online.",
    "Como usar redes sociais para gerar dinheiro todos os dias.",
    "Criar fontes de renda sem precisar aparecer.",
    "Vender produtos mesmo sem ter nada próprio.",
    "Como usar IA para acelerar seus resultados.",
    "Estratégias simples que qualquer iniciante consegue aplicar.",
    "Como sair do zero e chegar na sua primeira renda consistente.",
    "Erros que fazem 99% das pessoas desistirem.",
    "Como criar múltiplas fontes de renda online.",
    "Mentalidade prática para viver da internet.",
    "O caminho mais curto entre você e sua liberdade financeira.",
  ]

  return (
    <section className="bg-[#0f0f0f] py-5 md:py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Logo / Branding */}
        <div className="mb-8 md:mb-12">
          <div className="text-white">
            <span className="text-sm font-bold tracking-wider text-cyan-400">GUIA</span>
            <div className="text-3xl font-bold">ONLINE</div>
            <div className="flex gap-1 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">

          {/* Mockup do Ebook */}
          <div className="w-full max-w-sm lg:max-w-md flex-shrink-0">
            <div className="relative">
              <div className="bg-gradient-to-br from-cyan-700 to-blue-950 rounded-xl p-8 aspect-[3/4] flex flex-col justify-center items-center shadow-2xl transform rotate-y-[-5deg]">

                <span className="text-xs text-white/80 tracking-widest mb-2">GUIA</span>
                <span className="text-xl font-bold text-white mb-3">ONLINE</span>

                <div className="text-center text-white/80 text-xs mb-3">
                  COMO GANHAR DINHEIRO NA INTERNET DO ZERO
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
                  VIVER DA<br />INTERNET
                </h3>

                <p className="text-xs text-white/70 text-center mb-4">
                  O MÉTODO PRÁTICO PARA CONSTRUIR RENDA ONLINE
                </p>

                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>

                <p className="text-xs text-white/60 text-center">
                  DO ZERO ATÉ SUA PRIMEIRA RENDA ONLINE
                </p>

              </div>
            </div>
          </div>

          {/* Texto */}
          <div className="flex-1 text-center lg:text-left">

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              <span className="text-cyan-400">VIVER DA INTERNET</span>
            </h1>

            {/* Subheadline */}
            <h2 className="text-xl md:text-3xl text-white font-bold mb-6 leading-snug">
              Pare de perder tempo e descubra como ganhar dinheiro online mesmo começando do zero.
            </h2>

            {/* Trigger emocional */}
            <p className="text-gray-400 mb-4 text-sm md:text-base">
              Você não precisa de sorte, nem de milhões de seguidores…
            </p>

            {/* Parágrafo principal */}
            <p className="text-gray-300 mb-4 leading-relaxed">
              O guia <span className="text-cyan-400 font-semibold">"Viver da Internet"</span> foi criado para quem quer sair do zero e começar a gerar renda online de verdade — usando estratégias simples, atuais e que realmente funcionam.
            </p>

            {/* Reforço */}
            <p className="text-gray-300 mb-6 leading-relaxed">
              Aqui você vai aprender exatamente o que fazer, passo a passo, mesmo que nunca tenha ganhado R$1 na internet:
            </p>

            {/* Lista */}
            <ol className="text-gray-300 space-y-2 text-left mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">{index + 1}.</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ol>

            {/* Prova + urgência */}
            <div className="mb-6">
              <p className="text-green-400 font-semibold mb-2">
                ✔ Mais de 10 estratégias reais testadas
              </p>
              <p className="text-yellow-400 font-semibold mb-2">
                ⚡ Aplique hoje e veja resultados rapidamente
              </p>
              <p className="text-red-400 font-semibold">
                ⛔ Se continuar como está, nada muda
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center lg:items-start gap-3">
              <button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105">
                QUERO COMEÇAR AGORA 🚀
              </button>

              <p className="text-gray-400 text-sm">
                Acesso imediato • Comece hoje mesmo
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}