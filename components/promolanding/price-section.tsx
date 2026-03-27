import { CTAButton } from "./cta-button"

export function PriceSection() {
  return (
    <section className="bg-[#1a1a1a] py-6 md:py-10">
      <div className="max-w-4xl mx-auto px-4 text-center">

        {/* Trigger mental */}
        <p className="text-gray-400 text-sm md:text-base mb-4">
          A diferença entre quem vive da internet e quem continua tentando…
          <br />
          <span className="text-white font-semibold">
            é ter o conhecimento certo e agir.
          </span>
        </p>

        {/* Price comparison */}
        <div className="mb-2">
          <span className="text-gray-500 text-lg line-through">De R$ 197,00</span>
        </div>

        {/* Preço principal */}
        <h2 className="text-cyan-500 text-3xl md:text-4xl lg:text-5xl font-bold italic mb-3">
          HOJE POR APENAS R$ 49,90
        </h2>

        {/* Savings badge */}
        <div className="inline-block bg-green-500/20 text-green-400 text-sm font-semibold px-4 py-1 rounded-full mb-4">
          Acesso imediato com mais de 74% de desconto
        </div>

        {/* Reforço emocional */}
        <p className="text-gray-300 text-lg md:text-xl mb-2">
          Você pode continuar onde está…
        </p>

        <p className="text-white text-xl md:text-2xl font-bold mb-4">
          ou começar hoje a construir sua renda online.
        </p>

        {/* Mentalidade + decisão */}
        <p className="text-gray-400 text-sm md:text-base mb-6 max-w-xl mx-auto">
          Pessoas comuns estão começando todos os dias.
          <br />
          A única diferença é quem decide agir agora.
        </p>

        {/* Parcelamento */}
        <p className="text-gray-500 text-sm mb-8">
          ou 12x de R$ 4,99 no cartão
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <CTAButton />

          <p className="text-green-400 text-sm font-medium">
            ✔ Acesso imediato após a compra
          </p>
        </div>

      </div>
    </section>
  )
}