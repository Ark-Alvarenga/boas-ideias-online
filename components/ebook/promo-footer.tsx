import { Shield, Lock, CreditCard } from "lucide-react";

export function PromoFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#141414] py-8 md:py-12 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8 pb-8 border-b border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm">
            <Shield className="w-5 h-5 text-green-500" />
            <span>Ambiente 100% Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm">
            <Lock className="w-5 h-5 text-green-500" />
            <span>Seus dados protegidos</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm">
            <CreditCard className="w-5 h-5 text-green-500" />
            <span>Pagamento seguro</span>
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="text-center">
            <span className="text-xs font-bold tracking-wider text-gray-400">
              VIVER DA
            </span>
            <div className="text-2xl font-bold text-cyan-500">INTERNET</div>
            <div className="flex gap-1 mt-1 justify-center">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-gray-500 text-xs md:text-sm text-center">
          Viver da Internet © {currentYear} | Todos os direitos reservados.
        </p>

        {/* Disclaimer */}
        <p className="text-gray-600 text-[10px] md:text-xs text-center mt-4 max-w-2xl mx-auto leading-relaxed">
          Este produto não garante resultados específicos. Os resultados podem
          variar de acordo com o nível de dedicação, esforço e aplicação de cada
          pessoa. Todas as estratégias apresentadas têm caráter educacional.
        </p>
      </div>
    </footer>
  );
}
