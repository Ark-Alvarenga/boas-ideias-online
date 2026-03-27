export function StatsSection() {
  const stats = [
    { number: "283", label: "TOTAL DE", sublabel: "PÁGINAS" },
    { number: "14", label: "HORAS", sublabel: "DE LEITURA" },
    { number: "445", label: "DICAS", sublabel: "PRÁTICAS" },
    { number: "+1 MILHÃO", label: "SEGUIDORES", sublabel: "NO INSTAGRAM", isText: true },
  ]

  return (
    <section className="bg-cyan-600 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className={`font-bold mb-1 ${stat.isText ? "text-2xl md:text-4xl" : "text-4xl md:text-6xl"}`}>
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
