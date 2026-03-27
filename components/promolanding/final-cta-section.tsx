import { CTAButton } from "./cta-button"
import { Shield, Clock, CreditCard } from "lucide-react"

export function FinalCTASection() {
  return (
    <section className="bg-white-50 py-6 md:py-10">
      <div className="max-w-4xl mx-auto px-4 text-center">

        {/* Headline */}
        <h2 className="text-cyan-500 text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          COMEÇAR OU CONTINUAR NA MESMA?
        </h2>

        {/* Subheadline */}
        <p className="text-gray-900 text-lg md:text-xl font-semibold mb-4">
          A decisão é sua.
        </p>

        <p className="text-gray-400 text-sm md:text-base mb-8 max-w-xl mx-auto">
          Você pode sair dessa página e continuar tentando sozinho…
          <br />
          ou começar agora com um método simples e direto para ganhar dinheiro na internet.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Shield className="w-5 h-5 text-cyan-500" />
            <span>Compra 100% segura</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-5 h-5 text-cyan-500" />
            <span>Acesso imediato após pagamento</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <CreditCard className="w-5 h-5 text-cyan-500" />
            <span>Parcelamento em até 12x</span>
          </div>
        </div>

        {/* CTA forte */}
        <div className="flex flex-col items-center gap-3">
          <CTAButton />

          <p className="text-green-400 text-sm font-medium">
            ✔ Comece hoje mesmo • Acesso liberado na hora
          </p>
        </div>

        {/* Último empurrão */}
        <p className="text-red-400 text-sm font-semibold mt-6">
          ⚠️ Quanto mais você espera, mais tempo perde sem ganhar dinheiro online
        </p>

      </div>
    </section>
  )
}