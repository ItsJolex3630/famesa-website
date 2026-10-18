// POST /api/admin/[module] · Crea un nuevo registro en cualquier módulo de FAMESA SUITE.
export const runtime = "edge";

import {
  assertMethod,
  errorResponse,
  json,
  readBody,
  requireUser,
  str,
} from "@/lib/admin/server";
import { createModuleRecord } from "@/lib/admin/crud";

export async function POST(
  request: Request,
  context: { params: { module: string } },
) {
  try {
    assertMethod(request, "POST");
    const user = await requireUser(request);
    const params = await Promise.resolve(context.params);
    const moduleName = str(params?.module, 40);
    const body = await readBody<Record<string, unknown>>(request);
    const result = await createModuleRecord(moduleName, body, user.email);
    return json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
