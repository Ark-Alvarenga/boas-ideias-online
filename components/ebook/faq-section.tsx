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
      question: "Preciso ter experiência para começar?",
      answer:
        "Não. O guia foi feito exatamente para iniciantes. Você vai aprender passo a passo desde o zero, mesmo que nunca tenha ganhado dinheiro na internet antes.",
    },
    {
      question: "Preciso aparecer ou gravar vídeos?",
      answer:
        "Não necessariamente. Você vai aprender estratégias que funcionam mesmo sem aparecer, sem precisar mostrar o rosto ou ter seguidores.",
    },
    {
      question: "Funciona mesmo para quem está começando agora?",
      answer:
        "Sim. As estratégias são simples e atuais, pensadas para quem está começando. O mais importante é aplicar — e é isso que o guia te ensina.",
    },
    {
      question: "Quanto tempo leva para ver resultados?",
      answer:
        "Depende da sua aplicação. Algumas pessoas conseguem os primeiros resultados em poucos dias, outras levam um pouco mais. O importante é que você terá um caminho claro para começar imediatamente.",
    },
    {
      question: "Como recebo o acesso ao conteúdo?",
      answer:
        "O acesso é liberado automaticamente após a confirmação do pagamento. Você recebe tudo direto no seu e-mail e já pode começar na hora.",
    },
    {
      question: "E se eu não gostar?",
      answer:
        "Você tem 7 dias de garantia. Se não ficar satisfeito por qualquer motivo, basta solicitar o reembolso e devolvemos 100% do seu dinheiro.",
    },
  ]

  return (
    <section className="bg-gray-100 py-6 md:py-10">
      <div className="max-w-3xl mx-auto px-4">

        <h2 className="text-center mb-12">
          <span className="text-cyan-500 text-2xl md:text-3xl font-bold">
            DÚVIDAS FREQUENTES
          </span>
          <span className="text-gray-700 text-2xl md:text-3xl font-bold">
            {" "}ANTES DE COMEÇAR
          </span>
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white rounded-lg px-6 border border-gray-200 shadow-sm"
            >
              <AccordionTrigger className="text-gray-800 text-left font-medium hover:no-underline py-6">
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