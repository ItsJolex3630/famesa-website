// =============================================================================
// FAMESA SUITE · Capa de acceso a Turso (SOLO servidor) + utilidades HTTP.
// El token de Turso nunca se expone al navegador: este módulo corre en
// Cloudflare Pages Functions y usa @libsql/client/web (runtime de Workers).
// =============================================================================
import { createClient, type Client } from "@libsql/client/web";

export interface Env {
  TURSO_URL: string;
  TURSO_AUTH_TOKEN: string;
  ADMIN_JWT_SECRET?: string;
  ADMIN_DEV_PASSWORD?: string;
  GOOGLE_CLIENT_ID?: string;
  /** Clave opcional del asistente virtual. Si falta, se usa el motor local. */
  GEMINI_API_KEY?: string;
}

/** Contexto de Cloudflare Pages Function (subconjunto que consumimos). */
export interface Ctx {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
  waitUntil: (promise: Promise<unknown>) => void;
}

export type Handler = (ctx: Ctx) => Response | Promise<Response>;

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let client: Client | null = null;
let clientUrl = "";

/** Devuelve un cliente libSQL reutilizable para la base `famesa` en Turso. */
export function getDb(env: Env): Client {
  if (!env.TURSO_URL || !env.TURSO_AUTH_TOKEN) {
    throw new HttpError(500, "Base de datos no configurada en el servidor");
  }
  if (!client || clientUrl !== env.TURSO_URL) {
    client = createClient({ url: env.TURSO_URL, authToken: env.TURSO_AUTH_TOKEN });
    clientUrl = env.TURSO_URL;
  }
  return client;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function readBody<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "Cuerpo de la petición inválido");
  }
}

export function str(value: unknown, max = 500): string {
  return String(value ?? "").slice(0, max).trim();
}

export function num(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function bool(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

/** Convierte cualquier excepción en una respuesta JSON coherente. */
export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return json({ ok: false, error: error.message }, error.status);
  }
  console.error("FAMESA SUITE API error:", error);
  return json({ ok: false, error: "Error interno del servidor" }, 500);
}

/** Envuelve un handler con manejo de errores y control de método. */
export function route(
  method: string | string[],
  handler: (ctx: Ctx) => Promise<Response> | Response,
): Handler {
  const allowed = Array.isArray(method) ? method : [method];
  return async (ctx: Ctx) => {
    try {
      if (!allowed.includes(ctx.request.method.toUpperCase())) {
        return json({ ok: false, error: "Método no permitido" }, 405);
      }
      return await handler(ctx);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
