import { createClient, type Client } from "@libsql/client/web";

let dbInstance: Client | null = null;

/**
 * Cliente libSQL (Turso) para uso EXCLUSIVO en el servidor.
 * El token nunca se expone al cliente: no lleva prefijo NEXT_PUBLIC_.
 */
export function getDb(): Client {
  if (!dbInstance) {
    const url = process.env.TURSO_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || !authToken) {
      throw new Error("TURSO_URL o TURSO_AUTH_TOKEN no están configurados en el servidor");
    }
    dbInstance = createClient({ url, authToken });
  }
  return dbInstance;
}

/** True cuando la base de datos está disponible en el entorno actual. */
export function isDbConfigured(): boolean {
  return Boolean(process.env.TURSO_URL && process.env.TURSO_AUTH_TOKEN);
}

export async function logAudit(
  entity: string,
  entityId: string,
  action: "create" | "update" | "delete" | "status_change" | "login" | "export",
  details: string,
  userEmail = "web_rfq",
): Promise<void> {
  try {
    const db = getDb();
    await db.execute({
      sql: "INSERT INTO audit_log (user_email, entity, entity_id, action, details) VALUES (?, ?, ?, ?, ?)",
      args: [userEmail, entity, entityId, action, details],
    });
  } catch (error) {
    console.error("Error registrando audit_log:", error);
  }
}
