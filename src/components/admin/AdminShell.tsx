"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { FamesaProvider, useFamesa } from "@/lib/famesa/provider";
import { FamesaShell } from "@/components/famesa/shell";
import { registerFamesaDialog } from "@/components/famesa/dialog";
import { AdminAuthGate } from "./AdminAuthGate";
import type { DialogState } from "@/components/famesa/modules";

const SESSION_TOKEN_KEY = "famesa_admin_token";

type AuthState = "checking" | "locked" | "unlocked";

/**
 * Guardián del panel: no monta el shell ni ningún dato operativo hasta que la
 * sesión esté desbloqueada. Escucha `famesa:admin-lock` para bloquear al instante.
 */
function AdminGate({ children }: { children: ReactNode }) {
  const f = useFamesa();
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [auth, setAuth] = useState<AuthState>("checking");

  useEffect(() => {
    registerFamesaDialog(setDialog);
    return () => registerFamesaDialog(null);
  }, []);

  // Estado inicial: valida token permanente en localStorage o sessionStorage
  useEffect(() => {
    let isCancelled = false;

    async function checkAuth() {
      try {
        const storedToken =
          sessionStorage.getItem(SESSION_TOKEN_KEY) ||
          localStorage.getItem(SESSION_TOKEN_KEY);
        if (storedToken) {
          if (!isCancelled) {
            setAuth("unlocked");
            void f.loadCloud();
          }
          return;
        }

        const storedKey =
          localStorage.getItem("famesa_admin_key") ||
          localStorage.getItem("kt_admin_key");
        if (storedKey) {
          const res = await fetch("/api/auth/verify-key", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey: storedKey }),
            cache: "no-store",
          });
          const payload = await res.json().catch(() => null);
          if (res.ok && payload?.ok && payload.token) {
            sessionStorage.setItem(SESSION_TOKEN_KEY, payload.token);
            localStorage.setItem(SESSION_TOKEN_KEY, payload.token);
            if (!isCancelled) {
              setAuth("unlocked");
              void f.loadCloud();
            }
            return;
          }
        }
      } catch {
        /* error leyendo almacenamiento */
      }

      if (!isCancelled) {
        setAuth("locked");
      }
    }

    void checkAuth();
    return () => {
      isCancelled = true;
    };
  }, [f]);

  const handleLock = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
    } catch {
      /* ignorar: el bloqueo local procede igualmente */
    }
    try {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem("famesa_admin_key");
      localStorage.removeItem("famesa_admin_user");
      localStorage.removeItem("kt_admin_key");
      localStorage.removeItem("kt_admin_user");
      localStorage.removeItem("kt_user");
      localStorage.removeItem("famesa_user");
      const g = (window as unknown as { google?: { accounts?: { id?: { disableAutoSelect?: () => void } } } })?.google;
      if (g?.accounts?.id?.disableAutoSelect) {
        g.accounts.id.disableAutoSelect();
      }
    } catch {
      /* ignorar */
    }
    f.clearSession();
    setAuth("locked");
  }, [f]);

  useEffect(() => {
    const onLock = () => {
      void handleLock();
    };
    window.addEventListener("famesa:admin-lock", onLock as EventListener);
    return () => window.removeEventListener("famesa:admin-lock", onLock as EventListener);
  }, [handleLock]);

  if (auth === "checking") {
    return <div style={{ minHeight: "100vh", background: "var(--navy)" }} aria-hidden="true" />;
  }

  if (auth === "locked") {
    return <AdminAuthGate onUnlocked={() => setAuth("unlocked")} />;
  }

  return (
    <FamesaShell dialog={dialog} onDialog={setDialog}>
      {children}
    </FamesaShell>
  );
}

/**
 * Raíz cliente del panel: provee el estado de FAMESA SUITE (necesario para
 * hidratar tras el desbloqueo) y aplica el candado criptográfico antes de
 * exponer cualquier información confidencial.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <FamesaProvider>
      <AdminGate>{children}</AdminGate>
      <Toaster position="top-right" richColors />
    </FamesaProvider>
  );
}
