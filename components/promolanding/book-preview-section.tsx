export function BookPreviewSection() {
  return (
    <section className="bg-[#1a1a1a] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">

          {/* Index Page */}
          <div className="bg-white rounded-lg overflow-hidden shadow-xl">
            <div className="bg-cyan-500 py-4 px-6">
              <h3 className="text-white text-xl md:text-2xl font-bold text-center">
                O QUE VOCÊ VAI APRENDER
              </h3>
            </div>

            <div className="p-4 md:p-6 text-xs md:text-sm text-gray-700 max-h-96 overflow-auto">
              <div className="space-y-1">

                <div className="flex justify-between"><span>Introdução: O caminho mais rápido para ganhar dinheiro online</span><span>4</span></div>

                <div className="font-bold mt-3">Parte I – Começando do Zero</div>
                <div className="pl-4 space-y-1">
                  <div className="flex justify-between"><span>1. Como sair do absoluto zero</span><span>6</span></div>
                  <div className="flex justify-between"><span>2. Erros que fazem iniciantes desistirem</span><span>12</span></div>
                  <div className="flex justify-between"><span>3. Como escolher a melhor forma de ganhar dinheiro</span><span>18</span></div>
                  <div className="flex justify-between"><span>4. Mentalidade prática para agir rápido</span><span>24</span></div>
                </div>

                <div className="font-bold mt-3">Parte II – Formas de Ganhar Dinheiro Online</div>
                <div className="pl-4 space-y-1">
                  <div className="flex justify-between"><span>1. Marketing de afiliados</span><span>30</span></div>
                  <div className="flex justify-between"><span>2. Venda de produtos digitais</span><span>36</span></div>
                  <div className="flex justify-between"><span>3. Dropshipping e e-commerce simples</span><span>42</span></div>
                  <div className="flex justify-between"><span>4. Criando renda com redes sociais</span><span>49</span></div>
                  <div className="flex justify-between"><span>5. Como usar IA para ganhar dinheiro</span><span>57</span></div>
                </div>

                <div className="font-bold mt-3">Parte III – Colocando em Prática</div>
                <div className="pl-4 space-y-1">
                  <div className="flex justify-between"><span>1. Como fazer sua primeira venda</span><span>63</span></div>
                  <div className="flex justify-between"><span>2. Estratégias simples que funcionam hoje</span><span>69</span></div>
                  <div className="flex justify-between"><span>3. Como gerar tráfego sem gastar dinheiro</span><span>75</span></div>
                  <div className="flex justify-between"><span>4. Como escalar sua renda</span><span>82</span></div>
                </div>

              </div>
            </div>

            <div className="h-2 bg-cyan-500" />
          </div>

          {/* Practical Actions Page */}
          <div className="bg-white rounded-lg overflow-hidden shadow-xl">
            <div className="p-4 md:p-6 text-gray-700">

              <h3 className="text-cyan-500 text-sm md:text-base font-bold text-center mb-6">
                EXEMPLOS PRÁTICOS QUE VOCÊ VAI USAR PARA<br />
                GANHAR DINHEIRO NA INTERNET
              </h3>

              <div className="space-y-6 text-xs md:text-sm">

                <div>
                  <div className="text-cyan-500 text-3xl md:text-4xl font-bold text-center mb-2">01</div>
                  <p className="text-gray-600 leading-relaxed">
                    Como escolher um produto certo para vender mesmo sem experiência.
                    Você vai aprender a identificar oportunidades simples que já estão funcionando
                    e começar sem precisar criar nada do zero.
                  </p>
                </div>

                <div>
                  <div className="text-cyan-500 text-3xl md:text-4xl font-bold text-center mb-2">02</div>
                  <p className="text-gray-600 leading-relaxed">
                    Como gerar tráfego usando redes sociais sem gastar dinheiro.
                    Estratégias práticas que você pode aplicar hoje para atrair pessoas e transformar
                    visualizações em vendas.
                  </p>
                </div>

                <div>
                  <div className="text-cyan-500 text-3xl md:text-4xl font-bold text-center mb-2">03</div>
                  <p className="text-gray-600 leading-relaxed">
                    Como fazer sua primeira venda online.
                    Um passo a passo simples para sair do zero e finalmente ganhar dinheiro na internet,
                    mesmo sem audiência ou seguidores.
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