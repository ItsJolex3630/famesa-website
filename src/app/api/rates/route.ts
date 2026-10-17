// GET /api/rates · Tasas en vivo (BCV Dólar, BCV Euro, USDT) con estrategia SWR.
// TTL de caché: 10 minutos. Timeout por proveedor: 4 s. Fallback offline seguro.
export const runtime = "edge";

import { getDb, isDbConfigured, json, num, assertMethod } from "@/lib/admin/server";

type RatesState = {
  bcv_usd: number;
  bcv_eur: number;
  usdt: number;
};

const DEFAULT_RATES: RatesState = { bcv_usd: 880.12, bcv_eur: 985.73, usdt: 1004.65 };
const CACHE_TTL_MS = 10 * 60 * 1000;
const PROVIDER_TIMEOUT_MS = 4000;

// Caché en memoria de la instancia (SWR: responde stale al instante y
// revalida en segundo plano cuando el TTL expira).
let memoryCache: { rates: RatesState; updatedAt: string; fetchedAt: number } | null = null;

function withTimeout(promise: Promise<Response>): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), PROVIDER_TIMEOUT_MS);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

const valid = (v: unknown): v is number => Number.isFinite(v) && Number(v) > 0;

async function readDolarApi(url: string): Promise<number | null> {
  const res = await withTimeout(fetch(url, { cache: "no-store" }));
  if (!res.ok) return null;
  const payload = (await res.json()) as { promedio?: unknown; precio?: unknown };
  const value = num(payload.promedio ?? payload.precio, 0);
  return valid(value) ? value : null;
}

async function readUsdt(): Promise<number | null> {
  try {
    const res = await withTimeout(fetch("https://criptoya.com/api/binancep2p/USDT/VES/1", { cache: "no-store" }));
    if (res.ok) {
      const payload = (await res.json()) as { ask?: unknown; bid?: unknown; totalAsk?: unknown; totalBid?: unknown };
      const ask = num(payload.ask ?? payload.totalAsk, 0);
      const bid = num(payload.bid ?? payload.totalBid, 0);
      const value = ask > 0 && bid > 0 ? (ask + bid) / 2 : ask > 0 ? ask : bid;
      if (valid(value)) return value;
    }
  } catch {
    // Fallback a dolarapi paralelo
  }
  return readDolarApi("https://ve.dolarapi.com/v1/dolares/paralelo");
}

async function readSettingsRates(): Promise<{ rates: RatesState; updatedAt: string | null }> {
  const rates = { ...DEFAULT_RATES };
  let updatedAt: string | null = null;
  if (isDbConfigured()) {
    try {
      const db = getDb();
      const keys = ["rate_bcv_usd", "rate_bcv_eur", "rate_usdt", "rates_last_updated"];
      const rs = await db.execute({
        sql: `SELECT key, value FROM settings WHERE key IN (${keys.map(() => "?").join(",")})`,
        args: keys,
      });
      for (const row of rs.rows) {
        const key = String(row.key);
        if (key === "rates_last_updated") {
          updatedAt = String(row.value ?? "");
        } else {
          const value = num(row.value, 0);
          if (valid(value) && key in rates) rates[key as keyof RatesState] = value;
        }
      }
    } catch {
      // Turso no disponible: se usan valores por defecto
    }
  }
  return { rates, updatedAt };
}

async function persistRates(rates: RatesState): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    const db = getDb();
    const updatedAt = new Date().toISOString();
    const entries: Array<[string, string]> = [
      ["rate_bcv_usd", String(rates.bcv_usd)],
      ["rate_bcv_eur", String(rates.bcv_eur)],
      ["rate_usdt", String(rates.usdt)],
      ["rates_last_updated", updatedAt],
    ];
    for (const [key, value] of entries) {
      await db.execute({
        sql: "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))",
        args: [key, value],
      });
    }
  } catch {
    // Persistencia opcional: nunca bloquea la respuesta
  }
}

export async function GET(request: Request) {
  try {
    assertMethod(request, "GET");

    // SWR: caché en memoria fresca (< 10 min) responde al instante.
    if (memoryCache && Date.now() - memoryCache.fetchedAt < CACHE_TTL_MS) {
      return json({
        ok: true,
        updated_at: memoryCache.updatedAt,
        rates: memoryCache.rates,
        source: "cache",
      });
    }

    // Revalidación: consulta en paralelo a los 3 proveedores (4 s máx. c/u).
    const stored = await readSettingsRates();
    const [bcvUsd, bcvEur, usdt] = await Promise.all([
      readDolarApi("https://ve.dolarapi.com/v1/dolares/oficial").catch(() => null),
      readDolarApi("https://ve.dolarapi.com/v1/euros/oficial").catch(() => null),
      readUsdt().catch(() => null),
    ]);

    const rates: RatesState = {
      bcv_usd: valid(bcvUsd) ? (bcvUsd as number) : stored.rates.bcv_usd,
      bcv_eur: valid(bcvEur) ? (bcvEur as number) : stored.rates.bcv_eur,
      usdt: valid(usdt) ? (usdt as number) : stored.rates.usdt,
    };
    const anyLive = valid(bcvUsd) || valid(bcvEur) || valid(usdt);
    const updatedAt = anyLive ? new Date().toISOString() : (stored.updatedAt ?? new Date().toISOString());

    memoryCache = { rates, updatedAt, fetchedAt: Date.now() };
    if (anyLive) void persistRates(rates);

    return json({
      ok: true,
      updated_at: updatedAt,
      rates,
      source: anyLive ? "live" : "cache",
    });
  } catch {
    // Fallback offline de emergencia: nunca arrojar 500 por tasas.
    const stored = await readSettingsRates().catch(() => ({ rates: DEFAULT_RATES, updatedAt: null }));
    return json({
      ok: true,
      updated_at: stored.updatedAt ?? new Date().toISOString(),
      rates: stored.rates,
      source: "cache",
    });
  }
}
