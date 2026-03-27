import { CTAButton } from "./cta-button"
import { Shield, Clock, CreditCard } from "lucide-react"

export function FinalCTASection() {
  return (
    <section className="bg-[#1a1a1a] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-cyan-500 text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          SÓ HOJE!
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Aproveite esta oferta exclusiva antes que acabe
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Shield className="w-5 h-5 text-cyan-500" />
            <span>Compra 100% segura</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-5 h-5 text-cyan-500" />
            <span>Acesso imediato</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <CreditCard className="w-5 h-5 text-cyan-500" />
            <span>Parcelamento em até 12x</span>
          </div>
        </div>

        <CTAButton />
      </div>
    </section>
  )
}
