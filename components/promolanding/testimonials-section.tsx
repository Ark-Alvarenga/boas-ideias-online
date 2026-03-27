export function TestimonialsSection() {
  const testimonials = [
    {
      text: "Queria agradecer porque o livro é demais, aprender um pouco do marketing me ajudou muito, inclusive aproveitando os assuntos do momentos alavancei meu negócio com uma simples promoção",
      hasImage: true,
      subtext: "Aumentei quase 100% das minhas vendas em apenas 3 dias com essa promoção",
      comment: "O livro realmente é muito bom 👊🔥🙏",
    },
    {
      text: "Cara, eu comprei seu livro a alguns dias atrás, isso foi logo após eu começar meus estudos na faculdade no curso de economia, e cara como eu não descobri isso antes!!!! Seu livro é a melhor coisa que me abriu a mente!",
      secondText: "A dias eu to perdendo o sono, para começar meu projeto no mundo digital para falar sobre educação financeira, conforme eu estou aprendendo e lendo alguns livros, eu vou passando para as pessoas no mundo digital, eu decidi que vou começar isso amanhã!",
      comment: "Obrigado por ter escrito este livro 🙏🙏🙏🙏 já fico pensando se terá outro!?",
    },
    {
      text: "Cara, não sei nem se vai ver essa publicação...mas em Janeiro desse ano quando tinha 1 loja só, comprei a Bíblia do Milhão, juro achando que não ia agregar tanto. Mas meu, ajudou demais em meu amadurecimento principalmente no bônus que veio que era de treinamento de redes sociais...o que aconteceu? Em um ano, em meio a pandemia vendi 3 franquias, virei de MEI para ME em 10 meses e hoje a minha marca própria tem 5 lojas...",
      isInstagram: true,
    },
    {
      text: "Opa boa noite",
      messages: [
        "Passando aqui para agradecer pelo conteúdo do livro bíblia para o milhão",
        "Esse livro me mudou completamente, hj me comporto de forma diferente,observo e converso de forma diferente",
        "Esse livro abriu minha mente,me deu foco e motivação para fazer oq preciso fazer",
      ],
    },
    {
      text: "Boa noite, comprei o livro a bíblia para o milhão, cara muito bom, depois que li minha visão sobre fazer o dinheiro render já começou a dar resultado 🤑🤑comecei a estudar mais sobre investimentos e estou indo bem demais. Comecei a investir estou gostando... PROJETO MILHÃO...",
      hasHeart: true,
    },
    {
      text: "Olá bom dia, tudo bom? Comprei o livro tem alguns dias estou terminando e adquirir o curso para iniciante na bolsa que você sempre indica, agora é estudar, estudar e aplicar os conhecimentos adquirimos, já tenho uma micro empresa de Personalizados que com seu livro já está clareando bastante coisas que posso melhorar para crescer cada vez mas, muito obrigado pela dias e rumo ao sucesso 💰👨👏",
    },
    {
      isComment: true,
      username: "emersondesantana",
      text: "Acabei de ler ontem o livro.... Muito foda o livro pra quem está interessado em aprender algo e não sabe por onde começar... Comece por esse A biblia do milhão muito foda o livro!!!! Parabéns",
    },
    {
      text: "Deixa, eu te falar uma coisa.... Eu estava doida atrás de uma renda extra, comprei seu livro e comecei a ler cheia de preconceitos kkkkkk (coisas erradas de ser humano) Ainda não terminei, mas seu livro foi um gatilho positivo para eu iniciar minhaloja de calçados femininos online e no primeiro mês já faturei mais de R$ 2.000,00. O preconceito acabou e gostaria de agradecer.",
    },
    {
      text: "Eu sempre agradeço nos posts, mas hoje decidi dar um depoimento mais especial porque realmente o livro está transformando a minha vida. Muito obrigado do fundo do coração por praticamente dar de graça esse material. Eu já consegui implementar na minha loja várias dicas de vendas e em 1 mês eu já tive resultados que eu nunca imaginei que eu teria. Na minha própria vida também estou percebendo mudanças. Eu me sinto mais feliz com...",
    },
    {
      text: "Esse livro é foda terminei ontem de ler apartir de Moçambique esta de parabéns 🙏",
      reply: "Obrigado Castro!! Muito sucesso pra você!! 💰✅",
      secondText: "Este livro mudou muito a minha forma de ver o negócio, de hoje em diante será meu aconchego sempre irei reler o livro um dos melhores do pais não até hoe, vou criar um negócio com inspiração deste livro para brevemente",
    },
    {
      isEmail: true,
      subject: "Agradecimento",
      from: "Jose Wilson Do Nascime...",
      text: "Bom dia!! Vim através desse email lhe comunicar que estou terminando de ler o livro a bíblia para o milhão, e agradecer por todos ensinamentos pois abriu minha mente e tenha uma visão bem mais empreendedora, inclusive investidora também, pois sou empregado a 09 anos e não consegui nada além de construir uma humilde casa, mesmo assim sou grato a Deus por essa...",
    },
  ]

  return (
    <section className="bg-[#1a1a1a] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-white text-2xl md:text-3xl font-bold text-center mb-12">
          RELATOS SOBRE O LIVRO:
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
              {testimonial.isEmail ? (
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2 border-b pb-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                      J
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
                    <div className="text-white text-xs font-bold">sara.silva95 <span className="font-normal opacity-75">14min</span></div>
                    <button className="ml-auto text-white">×</button>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 mb-2">
                    <div className="text-white text-lg font-bold mb-2">Afiando o Machado.</div>
                    <div className="aspect-video bg-gray-300/50 rounded flex items-center justify-center">
                      <span className="text-white/50 text-xs">Imagem</span>
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
                      <div className="text-xs text-gray-400 mt-1">26 min · 1 curtida · Responder</div>
                    </div>
                  </div>
                </div>
              ) : testimonial.messages ? (
                <div className="p-3 bg-gray-100">
                  <div className="text-xs text-gray-500 text-center mb-2">8:09 PM</div>
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
                        <span className="text-white/80 text-xs">Imagem Promocional</span>
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
