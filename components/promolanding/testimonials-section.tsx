export function TestimonialsSection() {
  const testimonials = [
    {
      text: "Comprei sem muita expectativa… mas comecei a aplicar no mesmo dia e fiz minha primeira venda online em menos de 48h.",
      hasImage: true,
      subtext: "Nunca tinha ganhado R$1 na internet antes disso.",
      comment: "Isso aqui funciona de verdade 🔥",
    },
    {
      text: "Eu sempre achei que ganhar dinheiro online era complicado ou precisava aparecer…",
      secondText:
        "Depois do guia, percebi que estava complicando tudo. Comecei um perfil simples e já estou vendo resultado. Ainda não acredito que demorei tanto pra começar.",
      comment: "Mudou minha forma de pensar 🙏",
    },
    {
      text: "Eu estava perdido, não sabia por onde começar. Testava várias coisas e nada dava certo…",
      secondText:
        "O que mais me ajudou foi a clareza. Escolhi um método e foquei. Em poucas semanas já fiz minhas primeiras vendas.",
      isInstagram: true,
    },
    {
      text: "Boa noite",
      messages: [
        "Passei aqui pra agradecer pelo conteúdo",
        "Comecei do zero total e já fiz minha primeira grana online",
        "Agora estou focado em escalar",
      ],
    },
    {
      text: "Comprei achando que era mais um ebook… mas esse realmente mostra o caminho.",
      hasHeart: true,
    },
    {
      text: "Já tentei várias coisas antes, mas sempre desistia. Esse guia me fez entender exatamente o que fazer e parei de pular de estratégia em estratégia.",
    },
    {
      isComment: true,
      username: "lucasdigital",
      text: "Se você tá perdido e não sabe como começar na internet, esse guia aqui já resolve metade do problema. Direto ao ponto.",
    },
    {
      text: "Eu só queria uma renda extra… apliquei uma das estratégias e no primeiro mês já fiz mais de R$1.500.",
    },
    {
      text: "Além de ensinar a ganhar dinheiro, o que mais me pegou foi a mentalidade. Parei de procrastinar e comecei a agir.",
    },
    {
      text: "Eu sempre ficava só consumindo conteúdo… esse guia foi o que me fez sair da teoria e começar de verdade.",
      reply: "Esse é o objetivo. Ação acima de tudo 🚀",
      secondText:
        "Agora estou focado todos os dias e vendo evolução real.",
    },
    {
      isEmail: true,
      subject: "Agradecimento",
      from: "Carlos Henrique...",
      text: "Comprei o guia e comecei a aplicar no mesmo dia. Já tentei outras coisas antes, mas nunca tive clareza. Agora finalmente sinto que estou no caminho certo para viver da internet.",
    },
  ]

  return (
    <section className="bg-white-50 py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4">

        <h2 className="text-gray-900 text-2xl md:text-3xl font-bold text-center mb-4">
          RESULTADOS DE QUEM DECIDIU COMEÇAR:
        </h2>

        <p className="text-gray-400 text-center mb-12 text-sm md:text-base">
          Pessoas comuns, começando do zero, aplicando e vendo resultado.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
              {testimonial.isEmail ? (
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2 border-b pb-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-gray-900 text-xs font-bold">
                      C
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold">{testimonial.subject}</div>
                      <div className="text-xs text-gray-500">{testimonial.from}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{testimonial.text}</p>
                </div>
              ) : testimonial.isInstagram ? (
                <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-white/20" />
                    <div className="text-gray-900 text-xs font-bold">
                      user.online <span className="font-normal opacity-75">12min</span>
                    </div>
                    <button className="ml-auto text-white">×</button>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 mb-2">
                    <div className="text-white text-lg font-bold mb-2">Primeira venda 💰</div>
                    <div className="aspect-video bg-gray-300/50 rounded flex items-center justify-center">
                      <span className="text-gray-900 text-xs">Print de resultado</span>
                    </div>
                  </div>
                  <p className="text-white text-xs leading-relaxed">{testimonial.text}</p>
                </div>
              ) : testimonial.isComment ? (
                <div className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold">{testimonial.username}</span>
                      <p className="text-xs text-gray-700 leading-relaxed">{testimonial.text}</p>
                      <div className="text-xs text-gray-400 mt-1">Agora mesmo · 1 curtida · Responder</div>
                    </div>
                  </div>
                </div>
              ) : testimonial.messages ? (
                <div className="p-3 bg-gray-100">
                  <div className="text-xs text-gray-500 text-center mb-2">Hoje</div>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-2 text-xs">{testimonial.text}</div>
                    {testimonial.messages.map((msg, i) => (
                      <div key={i} className="bg-white rounded-lg p-2 text-xs">{msg}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  {testimonial.hasImage && (
                    <div className="mb-2">
                      <div className="aspect-video bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center">
                        <span className="text-white/80 text-xs">Resultado</span>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-700 leading-relaxed mb-2">{testimonial.text}</p>
                  {testimonial.subtext && (
                    <p className="text-xs text-gray-600 mb-2">{testimonial.subtext}</p>
                  )}
                  {testimonial.secondText && (
                    <p className="text-xs text-gray-700 leading-relaxed mb-2">{testimonial.secondText}</p>
                  )}
                  {testimonial.comment && (
                    <div className="border-t pt-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-300" />
                        <span className="text-xs">{testimonial.comment}</span>
                      </div>
                    </div>
                  )}
                  {testimonial.reply && (
                    <div className="bg-green-100 rounded p-2 mt-2">
                      <p className="text-xs text-green-800">{testimonial.reply}</p>
                    </div>
                  )}
                  {testimonial.hasHeart && (
                    <div className="flex items-center gap-2 mt-2 text-gray-400">
                      <span className="text-xs">❤️ Toque duas vezes para curtir</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}