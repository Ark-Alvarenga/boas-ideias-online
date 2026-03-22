"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.success) {
          toast({
            title: "Não foi possível sair",
            description: json.error || "Tente novamente.",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }

        toast({
          title: "Sessão encerrada",
          description: "Você saiu com sucesso.",
          variant: "success",
        });

        // Use window.location.href for a full refresh to clear any state
        window.location.href = "/";
      } catch (error) {
        toast({
          title: "Erro ao sair",
          description: "Tente novamente.",
          variant: "destructive",
        });
        router.push("/dashboard");
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-lg font-bold">Saindo...</p>
    </div>
  );
}
