// =============================================================================
// FAMESA SUITE · Bitácora de auditoría (audit_log).
// =============================================================================
import { getDb, type Env } from "./turso";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "login"
  | "export";

/**
 * Registra una entrada en `audit_log`. Nunca lanza: un fallo de auditoría no
 * debe interrumpir la operación de negocio.
 */
export async function logAudit(
  env: Env,
  entity: string,
  entityId: string,
  action: AuditAction,
  details: string,
  userEmail = "sistema",
): Promise<void> {
  try {
    const db = getDb(env);
    await db.execute({
      sql: "INSERT INTO audit_log (user_email, entity, entity_id, action, details) VALUES (?, ?, ?, ?, ?)",
      args: [userEmail, entity, entityId, action, details],
    });
  } catch (error) {
    console.error("audit_log error:", error);
  }
}
