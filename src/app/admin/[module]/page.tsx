"use client";

import { useParams } from "next/navigation";
import { ModulePage } from "@/components/famesa/modules";
import { openFamesaDialog } from "@/components/famesa/dialog";
import type { ModuleKey } from "@/lib/famesa/data";

const MODULES: ModuleKey[] = [
  "leads",
  "cotizaciones",
  "ordenes",
  "taller",
  "clientes",
  "inventario",
  "compras",
  "facturacion",
  "cobros",
  "gastos",
  "reportes",
  "personal",
  "ajustes",
];

export default function AdminModulePage() {
  const params = useParams<{ module: string }>();
  const raw = params?.module;
  const moduleKey = (Array.isArray(raw) ? raw[0] : raw) as ModuleKey | undefined;

  if (!moduleKey || !MODULES.includes(moduleKey)) {
    return (
      <div className="empty-state">
        <h1>404</h1>
        <h2>Módulo no encontrado</h2>
        <p>El módulo solicitado no existe en FAMESA SUITE.</p>
      </div>
    );
  }

  return <ModulePage module={moduleKey} onDialog={openFamesaDialog} />;
}
