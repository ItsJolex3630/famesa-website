"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useFamesa } from "@/lib/famesa/provider";

interface AdminAuthGateProps {
  onUnlocked: () => void;
}

/**
 * Pantalla de bloqueo industrial del panel FAMESA SUITE.
 * Exige la Clave API maestra antes de montar cualquier dato operativo.
 * Estética técnica Navy/Naranja con tipografía monoespaciada.
 */
export function AdminAuthGate({ onUnlocked }: AdminAuthGateProps) {
  const f = useFamesa();
  const [apiKey, setApiKey] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);
  const [googleReady, setGoogleReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Inicializar Google Sign-In SDK
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const DEFAULT_GOOGLE_CLIENT_ID =
      "368451259646-lvkp7q372m712rsj2adbidam4d72g4m0.apps.googleusercontent.com";
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || DEFAULT_GOOGLE_CLIENT_ID;

    const setupGoogle = () => {
      const g = (window as unknown as {
        google?: {
          accounts?: {
            id?: {
              initialize: (config: Record<string, unknown>) => void;
              renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
              prompt: () => void;
            };
          };
        };
      })?.google;

      if (g?.accounts?.id && googleBtnRef.current) {
        g.accounts.id.initialize({
          client_id: clientId,
          callback: async (res: { credential?: string }) => {
            if (!res.credential) return;
            setBusy(true);
            setError("");
            try {
              const r = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: res.credential }),
              });
              const data = await r.json().catch(() => null);
              if (r.ok && data?.ok && data.user?.isAdmin) {
                if (data.token) {
                  sessionStorage.setItem("famesa_admin_token", data.token);
                  localStorage.setItem("famesa_admin_token", data.token);
                }
                if (data.user.adminKey) {
                  localStorage.setItem("famesa_admin_key", data.user.adminKey);
                  localStorage.setItem("kt_admin_key", data.user.adminKey);
                }
                localStorage.setItem("famesa_admin_user", JSON.stringify(data.user));
                localStorage.setItem("kt_admin_user", JSON.stringify(data.user));
                localStorage.setItem("kt_user", JSON.stringify(data.user));
                await f.loadCloud();
                onUnlocked();
              } else {
                setError(
                  data?.error ||
                    "Acceso denegado: Tu cuenta de Google no tiene rol de Administrador.",
                );
              }
            } catch {
              setError("Error al autenticar con Google. Reintenta.");
            } finally {
              setBusy(false);
            }
          },
          auto_select: true,
          auto_prompt: false,
        });

        googleBtnRef.current.innerHTML = "";
        g.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          shape: "pill",
          theme: "filled_blue",
          size: "large",
          text: "signin_with",
          locale: "es",
          width: 340,
        });
        setGoogleReady(true);
      } else {
        timer = setTimeout(setupGoogle, 300);
      }
    };

    setupGoogle();
    return () => clearTimeout(timer);
  }, [f, onUnlocked]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cuenta regresiva cuando el rate-limiter bloquea por fuerza bruta (429).
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockSeconds]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || lockSeconds > 0) return;

    const key = apiKey.trim();
    if (!key) {
      setError("Introduce la Clave API de administrador.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
        cache: "no-store",
      });
      const payload = (await res.json().catch(() => null)) as
        | { ok?: boolean; token?: string; error?: string; retryAfterSeconds?: number }
        | null;

      if (res.status === 429) {
        const secs = payload?.retryAfterSeconds ?? 900;
        setLockSeconds(secs);
        setError(payload?.error ?? "Demasiados intentos fallidos. Bloqueado temporalmente.");
        return;
      }
      if (!res.ok || !payload?.ok || !payload.token) {
        setError(payload?.error ?? "Clave API de Administrador incorrecta.");
        return;
      }

      try {
        sessionStorage.setItem("famesa_admin_token", payload.token);
        localStorage.setItem("famesa_admin_token", payload.token);
        localStorage.setItem("famesa_admin_key", key);
        localStorage.setItem("kt_admin_key", key);
      } catch {
        /* storage no disponible */
      }
      setApiKey("");
      await f.loadCloud();
      onUnlocked();
    } catch {
      setError("No se pudo conectar con el servidor de seguridad. Reintenta.");
    } finally {
      setBusy(false);
    }
  };

  const blocked = lockSeconds > 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 0%, #10224a 0%, var(--navy) 55%, #050d20 100%)",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        color: "#fff",
      }}
    >
      <div style={{ width: "100%", maxWidth: "470px" }}>
        {/* Insignia / marca */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
          <span
            style={{
              width: "38px",
              height: "44px",
              background: "var(--orange)",
              color: "var(--navy)",
              fontFamily: "var(--font-display)",
              fontSize: "34px",
              fontWeight: 800,
              display: "grid",
              placeItems: "center",
              lineHeight: 1,
            }}
          >
            F
          </span>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "30px",
                fontWeight: 800,
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              FAMESA C.A.
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: ".12em",
                color: "#91A2BE",
                marginTop: "6px",
              }}
            >
              FAMESA SUITE · CERRADURA CRIPTOGRÁFICA
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--silver-dark)",
            borderTop: "3px solid var(--orange)",
            padding: "26px 24px",
            color: "var(--ink)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Lock size={16} style={{ color: "var(--orange)" }} aria-hidden="true" />
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "24px",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Panel bloqueado
            </h1>
          </div>
          <p style={{ fontSize: "11px", color: "var(--muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
            Accede mediante Google OAuth verificado (administradores autorizados) o con tu Clave
            API Maestra de Administrador. Todas las peticiones quedan auditadas.
          </p>

          {/* Botón de acceso automático con Google OAuth */}
          <div style={{ marginBottom: "22px" }}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--muted)",
                letterSpacing: ".06em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Acceso Directo con Google
            </div>
            <div
              ref={googleBtnRef}
              style={{
                display: "flex",
                justifyContent: "center",
                minHeight: "44px",
                width: "100%",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "20px 0 16px",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "var(--silver-dark)" }} />
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "var(--muted)",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                O CON CLAVE MANUAL
              </span>
              <div style={{ flex: 1, height: "1px", background: "var(--silver-dark)" }} />
            </div>
          </div>

          <label
            className="eyebrow"
            htmlFor="admin-api-key"
            style={{ display: "block", marginBottom: "7px", color: "var(--muted)" }}
          >
            Clave API de Administrador
          </label>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <KeyRound
              size={14}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "11px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
              }}
            />
            <input
              id="admin-api-key"
              ref={inputRef}
              type={show ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="ADMIN_API_KEY"
              autoComplete="off"
              spellCheck={false}
              disabled={busy || blocked}
              style={{
                paddingLeft: "34px",
                paddingRight: "40px",
                fontFamily: "var(--font-mono)",
                letterSpacing: ".04em",
              }}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Ocultar clave" : "Mostrar clave"}
              title={show ? "Ocultar clave" : "Mostrar clave"}
              style={{
                position: "absolute",
                right: "6px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                padding: "6px",
                display: "grid",
                placeItems: "center",
              }}
            >
              {show ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
            </button>
          </div>

          {error ? (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                background: "var(--danger-tint)",
                borderLeft: "3px solid var(--danger)",
                padding: "10px 12px",
                fontSize: "11px",
                color: "var(--danger)",
                marginBottom: "14px",
                lineHeight: 1.5,
              }}
            >
              <AlertTriangle size={14} aria-hidden="true" style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>
                {error}
                {blocked ? (
                  <strong style={{ display: "block", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    Reintento disponible en {lockSeconds}s
                  </strong>
                ) : null}
              </span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy || blocked}
            style={{
              width: "100%",
              minHeight: "44px",
              background: blocked ? "var(--silver-dark)" : "var(--orange)",
              color: "var(--navy)",
              border: "none",
              fontFamily: "var(--font-display)",
              fontSize: "17px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: ".03em",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              opacity: busy ? 0.75 : 1,
            }}
          >
            {busy ? (
              <Loader2 size={17} className="animate-spin" aria-hidden="true" />
            ) : (
              <Lock size={16} aria-hidden="true" />
            )}
            {busy ? "Validando…" : "Desbloquear Panel Industrial"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              marginTop: "16px",
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--muted)",
              letterSpacing: ".05em",
            }}
          >
            <ShieldCheck size={12} aria-hidden="true" style={{ color: "var(--success)" }} />
            SESIÓN JWT · COOKIE HTTPONLY · COMPARACIÓN EN TIEMPO CONSTANTE
          </div>
        </form>

        <p
          style={{
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: "#5b6a85",
            marginTop: "16px",
            letterSpacing: ".08em",
          }}
        >
          FAMESA C.A. · RIF J-31352388-7 · SANTA ROSA, VALENCIA
        </p>
      </div>
    </div>
  );
}
