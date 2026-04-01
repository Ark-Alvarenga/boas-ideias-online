"use client";

import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBaseUrl } from "@/lib/utils";

interface ReferralCardProps {
  referralCode: string;
  totalEarningsCents: number;
  referredUsersCount: number;
}

export function ReferralCard({
  referralCode,
  totalEarningsCents,
  referredUsersCount,
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const getReferralUrl = () => {
    return `${getBaseUrl()}/register?ref=${referralCode}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getReferralUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group flex flex-col gap-6 rounded-3xl border-2 border-foreground bg-primary/10 p-8 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff] mb-12">
      <div className="flex flex-col gap-2">
        <h3 className="font-serif text-3xl font-black text-foreground uppercase tracking-tight">
          Indique e Ganhe 💸
        </h3>
        <p className="text-base font-bold text-muted-foreground leading-relaxed">
          Convide outros criadores e ganhe 30% da nossa taxa de plataforma sobre
          TODAS as vendas que eles fizerem, para sempre.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 rounded-xl border-2 border-foreground bg-background p-4 text-sm font-black font-mono shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)] w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {getReferralUrl()}
        </div>
        <Button
          size="lg"
          onClick={handleCopy}
          className="w-full sm:w-auto h-14 rounded-xl border-2 border-foreground bg-foreground text-background font-black uppercase tracking-widest shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] dark:shadow-[4px_4px_0px_#fff]"
        >
          {copied ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" /> COPIADO!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-5 w-5" /> COPIAR LINK
            </>
          )}
        </Button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border-2 border-foreground bg-background p-6 shadow-[4px_4px_0px_#000]">
          <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            CRIADORES INDICADOS
          </div>
          <div className="mt-1 text-3xl font-black">{referredUsersCount}</div>
        </div>
        <div className="rounded-2xl border-2 border-foreground bg-background p-6 shadow-[4px_4px_0px_#000]">
          <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            SEU LUCRO
          </div>
          <div className="mt-1 text-3xl font-black text-emerald-600">
            R$ {(totalEarningsCents / 100).toFixed(2).replace(".", ",")}
          </div>
        </div>
      </div>
    </div>
  );
}
