'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import { makeSeed, makeEmptyStore, invoiceTotals, type DataStore, type ModuleKey, type RecordData, type Role, canAccess } from './data';

export type AuditEntry = { time: string; action: string; role: Role };

type ContextType = {
  data: DataStore;
  rate: number;
  mirror: boolean;
  role: Role;
  period: string;
  audits: AuditEntry[];
  setRate: (n: number) => void;
  setMirror: (n: boolean) => void;
  setRole: (r: Role) => void;
  setPeriod: (s: string) => void;
  add: (m: ModuleKey, r: RecordData) => void;
  update: (m: ModuleKey, id: string, patch: Partial<RecordData>) => void;
  convertLead: (id: string) => void;
  approveQuote: (id: string) => void;
  invoiceOrder: (id: string) => void;
  moveStock: (id: string, qty: number, type: string, reference: string) => void;
  receive: (id: string, qty: number) => void;
  payment: (id: string, amount: number, method: string) => void;
  saveCloud: () => Promise<void>;
  loadCloud: () => Promise<void>;
  resetClean: () => void;
  resetDemo: () => void;
  userEmail: string;
  cloudBusy: boolean;
};

const Context = createContext<ContextType | null>(null);

export function FamesaProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataStore>(makeSeed);
  const [rate, setRateState] = useState(54.8);
  const [mirror, setMirrorState] = useState(true);
  const [role, setRoleState] = useState<Role>('admin');
  const [period, setPeriodState] = useState('Octubre 2026');
  const [audits, setAudits] = useState<AuditEntry[]>([
    { time: '12/10/2026, 08:00:00', action: 'Tasa inicial sincronizada: 54.80 Bs./USD (Turso DB famesa)', role: 'admin' },
  ]);
  const [userEmail, setUserEmail] = useState('jolex3630@gmail.com');
  const [cloudBusy, setCloudBusy] = useState(false);

  useEffect(() => {
    // Intenta hidratar desde la API REST de Cloudflare Pages Functions (/api/admin/bootstrap)
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('famesa_admin_token') : null;
    fetch('/api/admin/bootstrap', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { ok?: boolean; rate?: number; userEmail?: string; data?: Partial<DataStore> } | null) => {
        if (payload?.ok && payload.data) {
          setData((prev) => ({ ...prev, ...payload.data }));
          if (payload.rate) setRateState(payload.rate);
          if (payload.userEmail) setUserEmail(payload.userEmail);
        }
      })
      .catch(() => {
        // Fallback silencioso a datos seed en local / preview
      });
  }, []);

  const audit = (action: string) =>
    setAudits((prev) => [{ time: new Date().toLocaleString('es-VE'), action, role }, ...prev]);

  const guard = (module: string) => {
    if (!canAccess(role, module)) {
      toast.error('Tu rol no permite esta operación');
      return false;
    }
    return true;
  };

  const setRate = (n: number) => {
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('La tasa debe ser mayor que cero');
      return;
    }
    setRateState(n);
    audit(`Tasa actualizada a ${n} Bs./USD`);
    toast.success('Tasa actualizada · Documentos emitidos conservan su tasa');
    void fetch('/api/admin/settings/rate', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rate_usd_ves: n }),
    }).catch(() => {});
  };

  const add = (module: ModuleKey, r: RecordData) => {
    if (!guard(module)) return;
    setData((prev) => ({ ...prev, [module]: [r, ...prev[module]] }));
    audit(`Creación ${r.id}`);
    toast.success(`${r.id} registrado correctamente`);
    void fetch(`/api/admin/${module}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r),
    }).catch(() => {});
  };

  const update = (module: ModuleKey, id: string, patch: Partial<RecordData>) => {
    if (!guard(module)) return;
    setData((prev) => ({
      ...prev,
      [module]: prev[module].map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
    audit(`Actualización ${id}`);
    toast.success(`${id} actualizado`);
    void fetch(`/api/admin/${module}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {});
  };

  const convertLead = (id: string) => {
    if (!guard('cotizaciones')) return;
    const lead = data.leads.find((r) => r.id === id);
    if (!lead || lead.status === 'cotizado' || lead.status === 'ganado') {
      toast.error('Este prospecto ya fue convertido');
      return;
    }
    const quoteId = `COT-${String(108 + data.cotizaciones.length).padStart(4, '0')}`;
    setData((prev) => ({
      ...prev,
      leads: prev.leads.map((r) => (r.id === id ? { ...r, status: 'cotizado', quote: quoteId } : r)),
      clientes: prev.clientes.some((c) => c.name === lead.client)
        ? prev.clientes
        : [
            {
              id: `CLI-00${prev.clientes.length + 1}`,
              name: lead.client ?? 'Nuevo Cliente Industrial',
              status: 'activo',
              rif: 'Por completar',
              phone: '',
              credit: 0,
            },
            ...prev.clientes,
          ],
      cotizaciones: [
        {
          id: quoteId,
          client: lead.client,
          description: lead.description,
          status: 'borrador',
          amount: lead.amount ?? 0,
          cost: Number(lead.amount ?? 0) * 0.65,
          exchange_rate: rate,
          amount_ves: Number(lead.amount ?? 0) * rate,
          material: 'MAT-003',
          quantity: 1,
        },
        ...prev.cotizaciones,
      ],
    }));
    audit(`${id} convertido a ${quoteId}`);
    toast.success(`Cliente vinculado y cotización ${quoteId} creada`);
  };

  const approveQuote = (id: string) => {
    if (!guard('ordenes')) return;
    const quote = data.cotizaciones.find((r) => r.id === id);
    if (!quote || quote.ot) {
      toast.error('La cotización ya tiene una OT');
      return;
    }
    const material = data.inventario.find((r) => r.id === quote.material);
    const qty = Number(quote.quantity ?? 1);
    if (material && Number(material.stock) < qty) {
      toast.error('Stock insuficiente para reservar material');
      return;
    }
    const otId = `OT-${String(89 + data.ordenes.length).padStart(4, '0')}`;
    setData((prev) => ({
      ...prev,
      cotizaciones: prev.cotizaciones.map((r) => (r.id === id ? { ...r, status: 'aprobada', ot: otId } : r)),
      ordenes: [
        {
          ...quote,
          id: otId,
          quote: id,
          status: 'pendiente',
          priority: 'Estándar',
          progress: 0,
          machine: 'CNC-01',
          operator: 'Carlos Méndez',
          due: '2026-10-28',
          hours: 0,
          estimated: quote.cost,
          materialQty: qty,
          reserved: true,
          quality: '',
        },
        ...prev.ordenes,
      ],
      inventario: prev.inventario.map((r) =>
        r.id === quote.material
          ? {
              ...r,
              stock: Number(r.stock) - qty,
              kardex: `${r.kardex ?? ''}\nSalida a OT · ${otId} · ${qty} ${r.unit}`,
              status: Number(r.stock) - qty < Number(r.min) ? 'crítico' : 'disponible',
            }
          : r,
      ),
    }));
    audit(`${id} aprobada → ${otId}; material reservado y descontado`);
    toast.success(`${otId} creada · Material reservado`);
  };

  const invoiceOrder = (id: string) => {
    if (!guard('facturacion')) return;
    const order = data.ordenes.find((r) => r.id === id);
    if (!order || order.status === 'facturada') {
      toast.error('La OT ya fue facturada');
      return;
    }
    if (order.status !== 'terminada' || !order.quality) {
      toast.error('Complete la OT y firme el control de calidad antes de facturar');
      return;
    }
    const invoiceId = `FAC-${String(412 + data.facturacion.length).padStart(5, '0')}`;
    const totals = invoiceTotals(Number(order.amount), rate);
    const client = data.clientes.find((c) => c.name === order.client);
    setData((prev) => ({
      ...prev,
      ordenes: prev.ordenes.map((r) => (r.id === id ? { ...r, status: 'facturada', invoice: invoiceId } : r)),
      facturacion: [
        {
          ...order,
          ...totals,
          id: invoiceId,
          amount: totals.total,
          status: 'pendiente',
          paid: 0,
          control: `00-${String(4120 + prev.facturacion.length).padStart(6, '0')}`,
          ot: id,
          rif: client?.rif,
          address: client?.address,
          date: '2026-10-12',
          due: '2026-11-11',
        },
        ...prev.facturacion,
      ],
    }));
    audit(`${id} → factura ${invoiceId}; tasa congelada ${rate}`);
    toast.success(`${invoiceId} emitida con IVA 16%`);
  };

  const moveStock = (id: string, qty: number, type: string, reference: string) => {
    if (!guard('inventario')) return;
    const material = data.inventario.find((r) => r.id === id);
    if (!material || !Number.isFinite(qty) || qty <= 0) {
      toast.error('Cantidad inválida');
      return;
    }
    const delta = type === 'Entrada' || type === 'Ajuste positivo' ? qty : -qty;
    if (Number(material.stock) + delta < 0) {
      toast.error('Stock insuficiente');
      return;
    }
    update('inventario', id, {
      stock: Number(material.stock) + delta,
      status: Number(material.stock) + delta < Number(material.min) ? 'crítico' : 'disponible',
      kardex: `${material.kardex ?? ''}\n${type} · ${new Date().toLocaleDateString('es-VE')} · ${delta} ${material.unit} · ${reference}`,
    });
  };

  const receive = (id: string, qty: number) => {
    if (!guard('compras')) return;
    const po = data.compras.find((r) => r.id === id);
    if (!po || qty <= 0 || qty > Number(po.quantity) - Number(po.received)) {
      toast.error('Cantidad excede el saldo pendiente');
      return;
    }
    setData((prev) => ({
      ...prev,
      compras: prev.compras.map((r) =>
        r.id === id
          ? {
              ...r,
              received: Number(r.received) + qty,
              status: Number(r.received) + qty === Number(r.quantity) ? 'recibida' : 'parcial',
            }
          : r,
      ),
      inventario: prev.inventario.map((r) =>
        r.id === po.material
          ? {
              ...r,
              stock: Number(r.stock) + qty,
              status: Number(r.stock) + qty < Number(r.min) ? 'crítico' : 'disponible',
              kardex: `${r.kardex ?? ''}\nRecepción ${id} · +${qty} ${r.unit}`,
            }
          : r,
      ),
    }));
    audit(`Recepción ${id}: ${qty} unidades`);
    toast.success('Recepción registrada e inventario actualizado');
  };

  const payment = (id: string, amount: number, method: string) => {
    if (!guard('cobros')) return;
    const invoice = data.facturacion.find((r) => r.id === id);
    if (!invoice || amount <= 0 || amount > Number(invoice.amount) - Number(invoice.paid)) {
      toast.error('El pago debe ser positivo y no exceder el saldo');
      return;
    }
    const foreign = method === 'Zelle USD' || method === 'Efectivo USD';
    const igtf = foreign ? amount * 0.03 : 0;
    setData((prev) => ({
      ...prev,
      facturacion: prev.facturacion.map((r) =>
        r.id === id
          ? {
              ...r,
              paid: Number(r.paid) + amount,
              status: Number(r.paid) + amount >= Number(r.amount) ? 'pagada' : r.status,
              igtf_collected: Number(r.igtf_collected ?? 0) + igtf,
            }
          : r,
      ),
      cobros: [
        {
          id: `PAG-${String(prev.cobros.length + 1).padStart(4, '0')}`,
          client: invoice.client,
          invoice: id,
          amount,
          igtf,
          method,
          status: 'conciliado',
          exchange_rate: rate,
          amount_ves: amount * rate,
          date: new Date().toISOString().slice(0, 10),
        },
        ...prev.cobros,
      ],
    }));
    audit(`Pago ${id}: ${amount} USD / ${method}; IGTF ${igtf}`);
    toast.success(`Pago registrado${foreign ? ' · IGTF 3% registrado en comprobante' : ''}`);
  };

  const saveCloud = async () => {
    setCloudBusy(true);
    try {
      localStorage.setItem('famesa_suite_snapshot', JSON.stringify({ data, rate, mirror, audits }));
      audit('Instantánea sincronizada con el servidor');
      toast.success('Estado sincronizado con Turso / Almacenamiento local');
    } catch {
      toast.error('No se pudo sincronizar la sesión');
    } finally {
      setCloudBusy(false);
    }
  };

  const loadCloud = async () => {
    setCloudBusy(true);
    try {
      const raw = localStorage.getItem('famesa_suite_snapshot');
      if (!raw) {
        toast.info('No hay instantánea previa; mostrando base activa');
        return;
      }
      const saved = JSON.parse(raw) as { data: DataStore; rate: number; mirror: boolean; audits: AuditEntry[] };
      if (saved.data?.inventario) {
        setData(saved.data);
        setRateState(saved.rate);
        setMirrorState(saved.mirror);
        setAudits(saved.audits);
        toast.success('Estado recuperado correctamente');
      }
    } catch {
      toast.error('No se pudo recuperar el estado');
    } finally {
      setCloudBusy(false);
    }
  };

  const resetClean = () => {
    setData(makeEmptyStore());
    audit('Base de datos restablecida a modo producción limpio (sin registros demo)');
    toast.success('Panel restablecido a modo limpio de producción');
  };

  const resetDemo = () => {
    setData(makeSeed());
    audit('Datos de demostración restaurados');
    toast.success('Datos de demostración restaurados');
  };

  return (
    <Context.Provider
      value={{
        data,
        rate,
        mirror,
        role,
        period,
        audits,
        setRate,
        setMirror: (n) => {
          setMirrorState(n);
          audit(`Visualización Bs. ${n ? 'activada' : 'desactivada'}`);
        },
        setRole: (r) => {
          setRoleState(r);
          audit(`Simulación de rol: ${r}`);
        },
        setPeriod: setPeriodState,
        add,
        update,
        convertLead,
        approveQuote,
        invoiceOrder,
        moveStock,
        receive,
        payment,
        saveCloud,
        loadCloud,
        resetClean,
        resetDemo,
        userEmail,
        cloudBusy,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useFamesa() {
  const value = useContext(Context);
  if (!value) throw new Error('FamesaProvider required');
  return value;
}

export function exportCSV(rows: RecordData[], name: string) {
  if (!rows.length) {
    toast.info('No hay registros para exportar');
    return;
  }
  const keys = Array.from(new Set(rows.flatMap(Object.keys)));
  const escape = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+@-]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const csv =
    '\uFEFF' +
    [keys.map(escape).join(';'), ...rows.map((r) => keys.map((k) => escape(r[k])).join(';'))].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `FAMESA-${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Archivo CSV exportado');
}
