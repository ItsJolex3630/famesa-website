import type { DialogState } from '@/components/famesa/modules';

/**
 * Bus global para abrir el diálogo de registro/detalle del panel desde
 * cualquier ruta de `/admin/*` sin acoplar las páginas al árbol de providers.
 * Lo registra `AdminShell` al montar y lo consumen las páginas cliente.
 */
let handler: ((s: DialogState) => void) | null = null;

export function registerFamesaDialog(fn: ((s: DialogState) => void) | null) {
  handler = fn;
}

export function openFamesaDialog(s: DialogState) {
  handler?.(s);
}
