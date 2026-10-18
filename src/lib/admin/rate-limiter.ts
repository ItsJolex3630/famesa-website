// =============================================================================
// FAMESA SUITE · Rate Limiter en memoria para Edge Runtime / Serverless.
// Previene ataques de fuerza bruta y credential stuffing en los endpoints
// sensibles de autenticación (p. ej. /api/auth/verify-key).
//
// Nota: el estado vive en el isolate de ejecución. Es suficiente como primera
// barrera; un despliegue multi-región puede complementarse con un almacén
// distribuido (KV / Turso), pero nunca debe relajarse el límite.
// =============================================================================

interface AttemptRecord {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_TRACKED_IDENTIFIERS = 10_000;

/** Purga registros expirados cuando el mapa crece demasiado (anti memory-leak). */
function purgeExpired(now: number): void {
  if (attempts.size <= MAX_TRACKED_IDENTIFIERS) return;
  for (const [key, record] of attempts.entries()) {
    if (record.resetAt < now) attempts.delete(key);
  }
}

/**
 * Registra un intento para el identificador (IP) y decide si está permitido.
 * Máximo 5 intentos por ventana de 15 minutos.
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  const now = Date.now();
  purgeExpired(now);
  const key = identifier || "unknown";
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetInSeconds: Math.ceil(WINDOW_MS / 1000),
    };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  record.count += 1;
  const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count, resetInSeconds };
}

/** Limpia el registro de un identificador (p. ej. tras un desbloqueo exitoso). */
export function resetRateLimit(identifier: string): void {
  attempts.delete(identifier || "unknown");
}
