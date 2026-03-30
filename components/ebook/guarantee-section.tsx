import { Check } from "lucide-react";

export function GuaranteeSection() {
  return (
    <section className="bg-[#222222] py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Badge */}
          <div className="flex-shrink-0">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              {/* Outer circle */}
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500"></div>

              {/* Inner circle */}
              <div className="absolute inset-4 rounded-full border border-cyan-400 opacity-70"></div>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl"></div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <Check className="w-8 h-8 text-cyan-400 mb-2" />

                <span className="text-cyan-400 text-[10px] md:text-xs font-semibold tracking-[0.3em]">
                  RISCO
                </span>

                <span className="text-white text-3xl md:text-5xl font-extrabold leading-none">
                  ZERO
                </span>

                <span className="text-cyan-400 text-[10px] md:text-xs font-semibold tracking-[0.3em]">
                  SEGURANÇA TOTAL
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-cyan-500 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Teste por 7 dias. Se não gostar, devolvemos seu dinheiro.
            </h2>

            <p className="text-gray-400 leading-relaxed mb-4">
              Você pode acessar todo o conteúdo, aplicar as estratégias e ver
              por conta própria.
            </p>

            <p className="text-gray-300 leading-relaxed mb-4">
              Se por qualquer motivo você achar que não vale a pena, basta pedir
              reembolso dentro de 7 dias e devolvemos 100% do seu dinheiro.
            </p>

            <p className="text-white font-semibold">
              Sem perguntas. Sem burocracia. Sem risco.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
