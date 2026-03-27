"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Comprei o ebook por boleto, quanto tempo demora para reconhecer a compra?",
      answer:
        "Após o pagamento do boleto, a compensação pode levar até 3 dias úteis para ser reconhecida. Assim que o pagamento for identificado, você receberá automaticamente o acesso ao ebook no e-mail cadastrado.",
    },
    {
      question: "Imprimi o ebook e ele ficou menor do que a folha. E agora?",
      answer:
        "Ao imprimir, certifique-se de selecionar a opção 'Ajustar à página' ou 'Tamanho real' nas configurações da impressora. Isso garantirá que o conteúdo seja impresso no tamanho correto da folha.",
    },
    {
      question: "Não estou conseguindo abrir o ebook, o que eu faço?",
      answer:
        "O ebook está em formato PDF. Certifique-se de ter um leitor de PDF instalado, como Adobe Acrobat Reader (gratuito). Se o problema persistir, entre em contato com nosso suporte.",
    },
    {
      question: "Não estou achando o email com os dados de acesso ao ebook, o que eu faço?",
      answer:
        "Verifique sua caixa de spam ou lixo eletrônico. Se ainda assim não encontrar, entre em contato conosco informando o e-mail utilizado na compra que reenviaremos os dados de acesso.",
    },
  ]

  return (
    <section className="bg-[#1a1a1a] py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-center mb-12">
          <span className="text-cyan-500 text-2xl md:text-3xl font-bold">FAQ</span>
          <span className="text-white text-2xl md:text-3xl font-bold"> - PERGUNTAS FREQUENTES</span>
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-[#2a2a2a] rounded-lg px-6 border-none"
            >
              <AccordionTrigger className="text-white text-left font-medium hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
