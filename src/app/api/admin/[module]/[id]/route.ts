// PUT & DELETE /api/admin/[module]/[id] · Actualiza o elimina un registro por ID/código.
export const runtime = "edge";

import {
  errorResponse,
  json,
  readBody,
  requireUser,
  str,
} from "@/lib/admin/server";
import { deleteModuleRecord, updateModuleRecord } from "@/lib/admin/crud";

export async function PUT(
  request: Request,
  context: { params: { module: string; id: string } },
) {
  try {
    const user = await requireUser(request);
    const params = await Promise.resolve(context.params);
    const moduleName = str(params?.module, 40);
    const id = decodeURIComponent(str(params?.id, 80));
    const patch = await readBody<Record<string, unknown>>(request);
    const result = await updateModuleRecord(moduleName, id, patch, user.email);
    return json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: { module: string; id: string } },
) {
  try {
    const user = await requireUser(request);
    const params = await Promise.resolve(context.params);
    const moduleName = str(params?.module, 40);
    const id = decodeURIComponent(str(params?.id, 80));
    const result = await deleteModuleRecord(moduleName, id, user.email);
    return json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
