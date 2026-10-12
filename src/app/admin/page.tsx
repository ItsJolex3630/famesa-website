"use client";

import { Dashboard } from "@/components/famesa/dashboard";
import { openFamesaDialog } from "@/components/famesa/dialog";
import type { ModuleKey, RecordData } from "@/lib/famesa/data";

export default function AdminDashboardPage() {
  return (
    <Dashboard
      onCreate={() => openFamesaDialog({ module: "cotizaciones", mode: "create" })}
      onDetail={(module: string, row: RecordData) =>
        openFamesaDialog({ module: module as ModuleKey, row, mode: "detail" })
      }
    />
  );
}
