export function BookPreviewSection() {
  return (
    <section className="bg-[#1a1a1a] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Index Page */}
          <div className="bg-white rounded-lg overflow-hidden shadow-xl">
            <div className="bg-cyan-500 py-4 px-6">
              <h3 className="text-white text-xl md:text-2xl font-bold text-center">ÍNDICE</h3>
            </div>
            <div className="p-4 md:p-6 text-xs md:text-sm text-gray-700 max-h-96 overflow-auto">
              <div className="space-y-1">
                <div className="flex justify-between"><span>Introdução</span><span>4</span></div>
                <div className="font-bold mt-3">Parte I – A Mente dos Campeões</div>
                <div className="pl-4 space-y-1">
                  <div className="flex justify-between"><span>1. Otimismo</span><span>6</span></div>
                  <div className="flex justify-between"><span>2. Automotivação</span><span>12</span></div>
                  <div className="flex justify-between"><span>3. Orientação a propósito e a conquista de objetivos</span><span>18</span></div>
                  <div className="flex justify-between"><span>4. Autorresponsabilidade</span><span>24</span></div>
                  <div className="flex justify-between"><span>5. Autodisciplina</span><span>30</span></div>
                  <div className="flex justify-between"><span>6. Autoestima</span><span>36</span></div>
                  <div className="flex justify-between"><span>7. Autoconhecimento</span><span>42</span></div>
                  <div className="flex justify-between"><span>8. Inteligência Emocional</span><span>49</span></div>
                  <div className="flex justify-between"><span>9. Persistência</span><span>57</span></div>
                  <div className="flex justify-between"><span>10. Paixão</span><span>63</span></div>
                  <div className="flex justify-between"><span>11. Empatia</span><span>69</span></div>
                  <div className="flex justify-between"><span>12. Proatividade</span><span>75</span></div>
                </div>
                <div className="font-bold mt-3">Parte II – Os Pilares para o Sucesso</div>
                <div className="pl-4 space-y-1">
                  <div className="flex justify-between"><span>1. Gestão dos medos e os riscos calculados</span><span>82</span></div>
                  <div className="flex justify-between"><span>2. Tolerância ao fracasso e a rejeição</span><span>88</span></div>
                  <div className="flex justify-between"><span>3. O processo de mentoria e a modelagem para o sucesso</span><span>94</span></div>
                  <div className="flex justify-between"><span>4. Conhecimento Especializado e aprendizagem constante</span><span>101</span></div>
                  <div className="flex justify-between"><span>5. Relação com pessoas, liderança e a comunicação eficaz</span><span>108</span></div>
                </div>
              </div>
            </div>
            <div className="h-2 bg-cyan-500" />
          </div>

          {/* 33 Actions Page */}
          <div className="bg-white rounded-lg overflow-hidden shadow-xl">
            <div className="p-4 md:p-6 text-gray-700">
              <h3 className="text-cyan-500 text-sm md:text-base font-bold text-center mb-6">
                33 AÇÕES PRÁTICAS PARA VOCÊ AUMENTAR O SEU<br />
                PODER DE PERSUASÃO E GANHAR VENDAS E NEGOCIAÇÕES
              </h3>

              <div className="space-y-6 text-xs md:text-sm">
                <div>
                  <div className="text-cyan-500 text-3xl md:text-4xl font-bold text-center mb-2">31</div>
                  <p className="text-gray-600 leading-relaxed">
                    Use o consenso sempre que possível. Costumamos construir nossas ideias a partir
                    das ideias dos outros e dificilmente iremos contra o que a grande maioria julga ser
                    o correto, quando não temos muita afinidade com o tema. Desta forma, mostre
                    que o consenso popular ou pessoas com inteligência em seu ramo possuem a
                    mesma opinião, de que a sua proposta ou produto trará grandes benefícios a esta
                    pessoa.
                  </p>
                </div>

                <div>
                  <div className="text-cyan-500 text-3xl md:text-4xl font-bold text-center mb-2">32</div>
                  <p className="text-gray-600 leading-relaxed">
                    Quando tudo falhar, apele para a reciprocidade. Estudos comprovaram que
                    garçons aumentavam em 3% suas gorjetas quando levavam uma bala aos clientes,
                    e os mesmos aumentavam em 14% quando levavam duas balas. Uma das chaves
                    da reciprocidade é ser o primeiro a oferecer o favor.
                  </p>
                </div>

                <div>
                  <div className="text-cyan-500 text-3xl md:text-4xl font-bold text-center mb-2">33</div>
                  <p className="text-gray-600 leading-relaxed">
                    As crenças mais proeminentes e marcantes dos homens são aquelas impostas ou
                    absorvidas por vontade própria sob condições altamente emocionais, quando a
                    mente está receptiva. Ative sempre o lado emocional da outra pessoa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
