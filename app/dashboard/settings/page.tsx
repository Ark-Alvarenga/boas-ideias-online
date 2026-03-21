"use client";

import { useState } from "react";
import { User, Lock, Bell, Shield, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", name: "Perfil", icon: User },
    { id: "password", name: "Senha", icon: Lock },
    { id: "notifications", name: "Notificações", icon: Bell },
    { id: "privacy", name: "Privacidade", icon: Shield },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="font-serif text-3xl font-black tracking-tight">
            Configurações
          </h2>
          <p className="text-muted-foreground">
            Gerencie sua conta e preferências de aplicativos.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Sidebar Tabs */}
        <aside className="w-full lg:w-64">
          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "border-foreground bg-primary text-white shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff]"
                    : "border-transparent hover:bg-muted"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 rounded-2xl border-2 border-foreground bg-card p-8 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">Informações do Perfil</h3>
                <p className="text-sm text-muted-foreground">
                  Como os outros criadores verão você na plataforma.
                </p>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-bold uppercase tracking-wider"
                  >
                    Nome Completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    defaultValue="Criador Exemplo"
                    className="flex h-12 w-full rounded-xl border-2 border-foreground bg-background px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] focus:outline-none dark:shadow-[2px_2px_0px_#fff]"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-bold uppercase tracking-wider"
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    defaultValue="criador@exemplo.com"
                    className="flex h-12 w-full rounded-xl border-2 border-foreground bg-background px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] focus:outline-none dark:shadow-[2px_2px_0px_#fff]"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="bio"
                    className="text-sm font-bold uppercase tracking-wider"
                  >
                    Biografia
                  </label>
                  <textarea
                    id="bio"
                    placeholder="Conte um pouco sobre você..."
                    className="flex min-h-[120px] w-full rounded-xl border-2 border-foreground bg-background px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] focus:outline-none dark:shadow-[2px_2px_0px_#fff]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="rounded-xl border-2 border-foreground text-white bg-primary px-8 py-3 text-sm font-bold text-foreground shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[6px_6px_0px_#fff]">
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">Alterar Senha</h3>
                <p className="text-sm text-muted-foreground">
                  Certifique-se de usar uma senha forte e única.
                </p>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label
                    htmlFor="current"
                    className="text-sm font-bold uppercase tracking-wider"
                  >
                    Senha Atual
                  </label>
                  <input
                    id="current"
                    type="password"
                    className="flex h-12 w-full rounded-xl border-2 border-foreground bg-background px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] focus:outline-none dark:shadow-[2px_2px_0px_#fff]"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="new"
                    className="text-sm font-bold uppercase tracking-wider"
                  >
                    Nova Senha
                  </label>
                  <input
                    id="new"
                    type="password"
                    className="flex h-12 w-full rounded-xl border-2 border-foreground bg-background px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] focus:outline-none dark:shadow-[2px_2px_0px_#fff]"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="confirm"
                    className="text-sm font-bold uppercase tracking-wider"
                  >
                    Confirmar Nova Senha
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    className="flex h-12 w-full rounded-xl border-2 border-foreground bg-background px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] focus:outline-none dark:shadow-[2px_2px_0px_#fff]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="rounded-xl border-2 border-foreground bg-primary text-white px-8 py-3 text-sm font-bold text-foreground shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[6px_6px_0px_#fff]">
                  Atualizar Senha
                </button>
              </div>
            </div>
          )}

          {activeTab !== "profile" && activeTab !== "password" && (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <ChevronRight className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold">Funcionalidade em breve</h3>
              <p className="text-sm text-muted-foreground">
                Esta seção de configurações está em desenvolvimento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
