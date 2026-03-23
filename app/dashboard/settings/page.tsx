"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { toast } from "@/hooks/use-toast";

interface UserData {
  id: string;
  name: string;
  email: string;
  bio: string;
}

type VerificationTarget = "name" | "password" | null;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  // User data
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalBio, setOriginalBio] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Code verification modal
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [verificationTarget, setVerificationTarget] =
    useState<VerificationTarget>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [confirmingCode, setConfirmingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Saving states
  const [savingBio, setSavingBio] = useState(false);

  const tabs = [
    { id: "profile", name: "Perfil", icon: User },
    { id: "password", name: "Senha", icon: Lock },
  ];

  // Fetch user data
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        setName(data.user.name);
        setBio(data.user.bio || "");
        setOriginalName(data.user.name);
        setOriginalBio(data.user.bio || "");
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Save bio directly
  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const res = await fetch("/api/settings/update-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }
      setOriginalBio(bio);
      toast({ title: "Biografia atualizada com sucesso!" });
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao salvar biografia",
        variant: "destructive",
      });
    } finally {
      setSavingBio(false);
    }
  };

  // Request verification code
  const requestCode = async (
    type: "name" | "password",
    payload: Record<string, string>
  ) => {
    setSendingCode(true);
    try {
      const res = await fetch("/api/settings/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar código");

      setVerificationTarget(type);
      setShowCodeModal(true);
      setCode("");
      setCodeError("");
      setCountdown(60);

      toast({
        title: "Código enviado!",
        description: `Verifique seu e-mail ${user?.email ?? ""}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao enviar código de verificação",
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
    }
  };

  // Confirm code
  const confirmCode = async () => {
    if (code.length !== 6) {
      setCodeError("O código deve ter 6 dígitos");
      return;
    }

    setConfirmingCode(true);
    setCodeError("");
    try {
      const res = await fetch("/api/settings/confirm-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Código inválido");

      setShowCodeModal(false);
      setVerificationTarget(null);
      setCode("");

      if (data.type === "name") {
        setOriginalName(name);
        toast({ title: "Nome atualizado com sucesso!" });
      } else if (data.type === "password") {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast({ title: "Senha atualizada com sucesso!" });
      }

      // Refresh the user data
      await fetchUser();
    } catch (error) {
      setCodeError(
        error instanceof Error ? error.message : "Código inválido ou expirado"
      );
    } finally {
      setConfirmingCode(false);
    }
  };

  // Handle profile save (name change triggers code, bio saves directly)
  const handleProfileSave = async () => {
    const nameChanged = name.trim() !== originalName;
    const bioChanged = bio.trim() !== originalBio;

    if (bioChanged) {
      await handleSaveBio();
    }

    if (nameChanged) {
      if (name.trim().length < 2) {
        toast({
          title: "Erro",
          description: "O nome deve ter pelo menos 2 caracteres.",
          variant: "destructive",
        });
        return;
      }
      await requestCode("name", { newName: name.trim() });
    } else if (!bioChanged) {
      toast({ title: "Nenhuma alteração detectada." });
    }
  };

  // Handle password save
  const handlePasswordSave = async () => {
    if (!currentPassword) {
      toast({
        title: "Erro",
        description: "Insira sua senha atual.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    await requestCode("password", { currentPassword, newPassword });
  };

  // Resend code
  const handleResend = async () => {
    if (countdown > 0 || !verificationTarget) return;

    if (verificationTarget === "name") {
      await requestCode("name", { newName: name.trim() });
    } else {
      await requestCode("password", { currentPassword, newPassword });
    }
  };

  const inputClasses =
    "flex h-12 w-full rounded-xl border-2 border-foreground bg-background px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-primary dark:shadow-[2px_2px_0px_#fff]";

  if (loading) {
    return (
      <div className="flex-1 bg-background">
        <DashboardHeader title="Configurações" />
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background">
      <DashboardHeader title="Configurações" />
      <div className="space-y-8 p-8 pt-6">
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
                  {/* Name */}
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClasses}
                    />
                    {name.trim() !== originalName && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Mail className="h-3.5 w-3.5" />
                        Alterar o nome requer confirmação por e-mail.
                      </p>
                    )}
                  </div>

                  {/* Email (read-only) */}
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
                      value={user?.email || ""}
                      readOnly
                      className={`${inputClasses} cursor-not-allowed opacity-60`}
                    />
                    <p className="text-xs text-muted-foreground">
                      O e-mail não pode ser alterado.
                    </p>
                  </div>

                  {/* Bio */}
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
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                      className="flex min-h-[120px] w-full rounded-xl border-2 border-foreground bg-background px-4 py-2 text-sm font-bold shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-primary dark:shadow-[2px_2px_0px_#fff]"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        A biografia é salva diretamente, sem confirmação.
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {bio.length}/500
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleProfileSave}
                    disabled={savingBio || sendingCode}
                    className="flex items-center gap-2 rounded-xl border-2 border-foreground bg-primary px-8 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] disabled:pointer-events-none disabled:opacity-50 dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[6px_6px_0px_#fff]"
                  >
                    {(savingBio || sendingCode) && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
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
                    Certifique-se de usar uma senha forte e única. Você receberá
                    um código de confirmação por e-mail.
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
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={inputClasses}
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
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className={inputClasses}
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClasses}
                    />
                    {confirmPassword &&
                      newPassword !== confirmPassword && (
                        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          As senhas não coincidem.
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border-2 border-amber-400/50 bg-amber-50 p-4 dark:bg-amber-950/20">
                  <Mail className="h-5 w-5 flex-shrink-0 text-amber-600" />
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Um código de verificação será enviado para{" "}
                    <span className="font-bold">{user?.email}</span> para
                    confirmar a alteração.
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handlePasswordSave}
                    disabled={sendingCode}
                    className="flex items-center gap-2 rounded-xl border-2 border-foreground bg-primary px-8 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] disabled:pointer-events-none disabled:opacity-50 dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[6px_6px_0px_#fff]"
                  >
                    {sendingCode && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Atualizar Senha
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border-2 border-foreground bg-card p-8 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#fff]">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Código de Verificação</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Insira o código de 6 dígitos enviado para{" "}
                <span className="font-bold text-foreground">
                  {user?.email}
                </span>
              </p>
            </div>

            {/* Code input */}
            <div className="mb-6">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(val);
                  setCodeError("");
                }}
                placeholder="000000"
                className="w-full rounded-xl border-2 border-foreground bg-background px-4 py-4 text-center text-2xl font-black tracking-[0.5em] shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-primary dark:shadow-[2px_2px_0px_#fff]"
                autoFocus
              />
              {codeError && (
                <p className="mt-2 flex items-center justify-center gap-1.5 text-sm font-medium text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {codeError}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmCode}
                disabled={code.length !== 6 || confirmingCode}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-primary px-6 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] disabled:pointer-events-none disabled:opacity-50 dark:shadow-[4px_4px_0px_#fff] dark:hover:shadow-[6px_6px_0px_#fff]"
              >
                {confirmingCode ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Confirmar
              </button>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleResend}
                  disabled={countdown > 0 || sendingCode}
                  className="text-sm font-bold text-primary underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                  {countdown > 0
                    ? `Reenviar em ${countdown}s`
                    : "Reenviar código"}
                </button>

                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    setVerificationTarget(null);
                    setCode("");
                    setCodeError("");
                  }}
                  className="text-sm font-bold text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
