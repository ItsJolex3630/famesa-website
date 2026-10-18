// =============================================================================
// POST /api/auth/logout · Bloqueo / cierre de sesión del panel FAMESA SUITE.
//
// Invalida y expira de inmediato la cookie de sesión JWT (Max-Age=0), de modo
// que el panel vuelve al estado bloqueado (AdminAuthGate) al instante.
// =============================================================================
export const runtime = "edge";

import { assertMethod, errorResponse, json } from "@/lib/admin/server";

export async function POST(request: Request) {
  try {
    assertMethod(request, "POST");
    return json({ ok: true }, 200, {
      "Set-Cookie": "famesa_admin_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict",
      "Cache-Control": "no-store",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
