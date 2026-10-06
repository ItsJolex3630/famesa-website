interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipCache = new Map<string, RateLimitRecord>();

const MAX_CACHE_SIZE = 10_000;

/**
 * Elimina registros expirados cuando la caché crece por encima del limite.
 */
function purgeExpired(now: number): void {
  if (ipCache.size <= MAX_CACHE_SIZE) return;
  for (const [key, value] of ipCache.entries()) {
    if (value.resetAt < now) ipCache.delete(key);
  }
}

/**
 * Valida si una IP ha excedido el limite de solicitudes en la ventana actual.
 *
 * @param ip Direccion IP del cliente
 * @param maxRequests Limite de solicitudes permitidas en la ventana (default: 5)
 * @param windowMs Tamano de la ventana en milisegundos (default: 60000 = 1 min)
 */
export function checkRateLimit(
  ip: string,
  maxRequests = 5,
  windowMs = 60_000,
): { success: boolean; remaining: number } {
  const now = Date.now();
  purgeExpired(now);

  const record = ipCache.get(ip);

  if (!record || record.resetAt < now) {
    ipCache.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: Math.max(0, maxRequests - record.count) };
}

/**
 * Tiempo restante (en segundos) hasta que la ventana de la IP se reinicie.
 */
export function getRetryAfterSeconds(ip: string): number {
  const record = ipCache.get(ip);
  if (!record) return 0;
  return Math.max(0, Math.ceil((record.resetAt - Date.now()) / 1000));
}

/**
 * Limpia por completo el registro de una IP (util para pruebas).
 */
export function resetRateLimit(ip?: string): void {
  if (ip) {
    ipCache.delete(ip);
    return;
  }
  ipCache.clear();
}
