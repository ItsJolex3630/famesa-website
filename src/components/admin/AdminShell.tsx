"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { FamesaProvider } from "@/lib/famesa/provider";
import { FamesaShell } from "@/components/famesa/shell";
import { registerFamesaDialog } from "@/components/famesa/dialog";
import type { DialogState } from "@/components/famesa/modules";

/**
 * Raíz cliente del panel: provee el estado de FAMESA SUITE, monta el shell
 * (sidebar + topbar) y expone el bus global de diálogos a las rutas hijas.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  useEffect(() => {
    registerFamesaDialog(setDialog);
    return () => registerFamesaDialog(null);
  }, []);

  return (
    <FamesaProvider>
      <FamesaShell dialog={dialog} onDialog={setDialog}>
        {children}
      </FamesaShell>
      <Toaster position="top-right" richColors />
    </FamesaProvider>
  );
}
