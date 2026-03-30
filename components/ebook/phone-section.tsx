import Image from "next/image";

export function PhoneSection() {
  return (
    <section className="bg-gray-100 py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          {/* Phone mockup */}
          <div className="w-full max-w-xs flex-shrink-0">
            <div className="relative mx-auto">
              <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-2 shadow-2xl">
                <div className="bg-cyan-900 rounded-2xl aspect-[9/16] flex flex-col items-center justify-center p-1">
                  <Image
                    src="/images/phone-intro.png"
                    alt="Capa do ebook Viver da Internet"
                    width={400}
                    height={600}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-cyan-500 text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              ACESSE DE QUALQUER LUGAR
            </h2>

            <p className="text-gray-900 text-lg mb-4 font-semibold">
              Tudo direto no seu celular, sem complicação.
            </p>

            <p className="text-gray-600 mb-4">
              Você pode acessar o guia a qualquer momento e aplicar as
              estratégias no seu ritmo — seja em casa, no trabalho ou até no
              tempo livre.
            </p>

            <p className="text-gray-600 mb-4">
              Não precisa de computador, não precisa de nada complicado. Apenas
              seu celular e vontade de começar.
            </p>

            <p className="text-gray-700 font-medium">
              Quanto mais você aplica, mais rápido você começa a ver resultado.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
