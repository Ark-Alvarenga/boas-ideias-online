import { CTAButton } from "./cta-button"

export function PriceSection() {
  return (
    <section className="bg-[#1a1a1a] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Price comparison */}
        <div className="mb-4">
          <span className="text-gray-500 text-lg line-through">De R$ 197,00</span>
        </div>

        <h2 className="text-cyan-500 text-3xl md:text-4xl lg:text-5xl font-bold italic mb-2">
          TUDO ISSO POR R$ 49,95!
        </h2>

        {/* Savings badge */}
        <div className="inline-block bg-green-500/20 text-green-400 text-sm font-semibold px-4 py-1 rounded-full mb-4">
          Economize mais de 74%
        </div>

        <p className="text-gray-300 text-lg md:text-xl mb-2">
          Faça HOJE o melhor investimento da sua vida.
        </p>

        <p className="text-gray-500 text-sm mb-8">
          ou 12x de R$ 4,99 no cartão
        </p>

        <CTAButton />
      </div>
    </section>
  )
}
