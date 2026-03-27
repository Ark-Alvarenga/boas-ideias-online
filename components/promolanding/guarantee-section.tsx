import { Check } from "lucide-react"

export function GuaranteeSection() {
  return (
    <section className="bg-[#222222] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">

          {/* Badge */}
          <div className="flex-shrink-0">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path
                    d="M100,10 L108,25 L125,15 L128,33 L147,28 L145,47 L164,47 L157,64 L175,70 L163,84 L178,95 L162,105 L172,122 L153,126 L158,145 L138,143 L138,162 L118,155 L112,173 L95,161 L83,177 L73,160 L55,170 L52,150 L32,155 L35,135 L15,133 L25,115 L7,106 L23,92 L10,78 L30,70 L22,52 L43,50 L40,30 L62,35 L70,17 L88,28 L100,10"
                    fill="none"
                    stroke="#0891b2"
                    strokeWidth="3"
                  />
                </svg>
              </div>

              <div className="absolute inset-8 flex flex-col items-center justify-center text-center">
                <Check className="w-8 h-8 text-cyan-500 mb-2" />
                <span className="text-cyan-500 text-xs md:text-sm font-bold tracking-wider">RISCO</span>
                <span className="text-cyan-500 text-4xl md:text-5xl font-bold">ZERO</span>
                <span className="text-cyan-500 text-xs md:text-sm font-bold tracking-wider">TOTAL</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">

            <h2 className="text-cyan-500 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Teste por 7 dias. Se não gostar, devolvemos seu dinheiro.
            </h2>

            <p className="text-gray-400 leading-relaxed mb-4">
              Você pode acessar todo o conteúdo, aplicar as estratégias e ver por conta própria.
            </p>

            <p className="text-gray-300 leading-relaxed mb-4">
              Se por qualquer motivo você achar que não vale a pena, basta pedir reembolso dentro de 7 dias e devolvemos 100% do seu dinheiro.
            </p>

            <p className="text-white font-semibold">
              Sem perguntas. Sem burocracia. Sem risco.
            </p>

          </div>
        </div>
      </div>
    </section>
  )
}