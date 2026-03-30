export function StatsSection() {
  const stats = [
    { number: "10+", label: "FORMAS REAIS DE", sublabel: "GANHAR DINHEIRO ONLINE" },
    { number: "100%", label: "FOCADO EM", sublabel: "INICIANTES" },
    { number: "PASSO A PASSO", label: "MÉTODO", sublabel: "SIMPLIFICADO", isText: true },
    { number: "ACESSO", label: "IMEDIATO", sublabel: "COMECE HOJE", isText: true },
  ]

  return (
    <section className="bg-cyan-600 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-gray-900">
              <div
                className={`font-bold mb-1 ${stat.isText ? "text-2xl md:text-4xl" : "text-4xl md:text-6xl"
                  }`}
              >
                {stat.number}
              </div>
              <div className="text-xs md:text-sm font-medium tracking-wide">
                {stat.label}
                <br />
                {stat.sublabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}