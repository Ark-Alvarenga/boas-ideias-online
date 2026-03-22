"use client";

import { Search, HelpCircle, Mail, MessageSquare, Book, FileText } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function AjudaPage() {
  const faqs = [
    {
      q: "Como recebo o dinheiro das minhas vendas?",
      a: "Todos os pagamentos são processados via Stripe. O valor líquido (após taxas) é transferido automaticamente para sua conta bancária conectada seguindo o ciclo de repasses da Stripe.",
    },
    {
      q: "Quais tipos de arquivos posso vender?",
      a: "Atualmente focamos em PDFs, mas você também pode vender arquivos de texto, planilhas e templates, desde que empacotados de forma clara.",
    },
    {
      q: "Como funciona a taxa da plataforma?",
      a: "A Boas Ideias cobra uma pequena porcentagem sobre cada venda. Não há taxas de manutenção ou custos fixos mensais.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Central de Ajuda" />
      <div className="mx-auto max-w-7xl space-y-8 p-8 pt-6">
        <div className="space-y-4">
        <h2 className="font-serif text-3xl font-black tracking-tight">Central de Ajuda</h2>
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar ajuda..."
            className="flex h-14 w-full rounded-2xl border-2 border-foreground bg-background pl-12 pr-4 text-lg font-bold shadow-[4px_4px_0px_#000] focus:outline-none dark:shadow-[4px_4px_0px_#fff]"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-blue-100 dark:bg-blue-900/30">
            <Book className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Documentação</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Aprenda a configurar seus produtos e otimizar suas vendas.
          </p>
          <button className="mt-auto text-sm font-black uppercase tracking-wider text-primary hover:underline">
            Ver guias
          </button>
        </div>

        <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-emerald-100 dark:bg-emerald-900/30">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Comunidade</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Troque experiências com outros criadores no nosso Discord.
          </p>
          <button className="mt-auto text-sm font-black uppercase tracking-wider text-primary hover:underline">
            Entrar no Discord
          </button>
        </div>

        <div className="group relative flex flex-col rounded-2xl border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[8px_8px_0px_#fff]">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-foreground bg-amber-100 dark:bg-amber-900/30">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Suporte Direto</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Envie uma mensagem e nossa equipe responderá em breve.
          </p>
          <button className="mt-auto text-sm font-black uppercase tracking-wider text-primary hover:underline">
            Abrir Chamado
          </button>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-foreground bg-secondary/30 p-8 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
        <h3 className="mb-8 font-serif text-2xl font-black">Perguntas Frequentes</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((faq, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-start gap-3">
                <HelpCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <h4 className="text-lg font-bold leading-tight">{faq.q}</h4>
              </div>
              <p className="pl-8 text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-foreground p-6">
        <div className="flex items-center gap-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <div>
            <h4 className="font-bold">Termos e Políticas</h4>
            <p className="text-sm text-muted-foreground">Leia sobre seus direitos e deveres.</p>
          </div>
        </div>
        <button className="rounded-xl border-2 border-foreground bg-background px-6 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] dark:shadow-[2px_2px_0px_#fff] dark:hover:shadow-[4px_4px_0px_#fff]">
          Acessar
        </button>
      </div>
      </div>
    </div>
  );
}
