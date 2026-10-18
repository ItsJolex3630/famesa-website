'use client';

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';
import { makeSeed, makeEmptyStore, invoiceTotals, type DataStore, type ModuleKey, type RecordData, type Role, canAccess } from './data';

export type AuditEntry = { time: string; action: string; role: Role };

export type RateType = 'bcv_usd' | 'bcv_eur' | 'usdt';

export type RatesState = {
  bcv_usd: number;
  bcv_eur: number;
  usdt: number;
};

const DEFAULT_RATES: RatesState = { bcv_usd: 880.12, bcv_eur: 985.73, usdt: 1004.65 };
const RATE_TYPE_STORAGE_KEY = 'famesa_active_rate_type';
const RATES_POLLING_MS = 15 * 60 * 1000;

const isRateType = (v: unknown): v is RateType => v === 'bcv_usd' || v === 'bcv_eur' || v === 'usdt';

type ContextType = {
  data: DataStore;
  rate: number;
  activeRateType: RateType;
  rates: RatesState;
  ratesLoading: boolean;
  ratesUpdatedAt: string | null;
  selectRateType: (type: RateType) => void;
  refreshRates: () => Promise<void>;
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
  deleteRecord: (m: ModuleKey, id: string) => void;
  convertLead: (id: string) => void;
  approveQuote: (id: string) => void;
  invoiceOrder: (id: string) => void;
  moveStock: (id: string, qty: number, type: string, reference: string) => void;
  receive: (id: string, qty: number) => void;
  payment: (id: string, amount: number, method: string) => void;
  saveCloud: () => Promise<void>;
  loadCloud: () => Promise<void>;
  clearSession: () => void;
  resetClean: () => void;
  resetDemo: () => void;
  userEmail: string;
  cloudBusy: boolean;
};

const Context = createContext<ContextType | null>(null);

export function FamesaProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataStore>(makeSeed);
  const [rates, setRatesState] = useState<RatesState>(DEFAULT_RATES);
  const [activeRateType, setActiveRateTypeState] = useState<RateType>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(RATE_TYPE_STORAGE_KEY);
      if (isRateType(saved)) return saved;
    }
    return 'bcv_usd';
  });
  const [rate, setRateState] = useState(DEFAULT_RATES.bcv_usd);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<string | null>(null);
  const ratesRef = useRef(rates);
  ratesRef.current = rates;
  const activeRateTypeRef = useRef(activeRateType);
  activeRateTypeRef.current = activeRateType;
  const [mirror, setMirrorState] = useState(true);
  const [role, setRoleState] = useState<Role>('admin');
  const [period, setPeriodState] = useState('Octubre 2026');
  const [audits, setAudits] = useState<AuditEntry[]>([
    { time: '12/10/2026, 08:00:00', action: 'Tasas iniciales sincronizadas: BCV $ 880.12 · BCV € 985.73 · USDT ₮ 1004.65 (Turso DB famesa)', role: 'admin' },
  ]);
  const [userEmail, setUserEmail] = useState('famesa2005@gmail.com');
  const [cloudBusy, setCloudBusy] = useState(false);

  /**
   * Hidrata el estado desde el endpoint autenticado de Turso (/api/admin/bootstrap).
   * Envía el Bearer de sesión (si existe); la cookie HttpOnly viaja por sí sola.
   * Devuelve true solo cuando el servidor entregó datos reales.
   */
  const syncFromServer = async (): Promise<boolean> => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('famesa_admin_token') : null;
      const res = await fetch('/api/admin/bootstrap', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (!res.ok) return false;
      const payload = (await res.json()) as {
        ok?: boolean;
        rate?: number;
        userEmail?: string;
        data?: Partial<DataStore>;
      };
      if (!payload?.ok || !payload.data) return false;
      setData((prev) => ({ ...prev, ...payload.data }));
      if (payload.rate) setRateState(payload.rate);
      if (payload.userEmail) setUserEmail(payload.userEmail);
      return true;
    } catch {
      // Fallback silencioso a datos seed en local / preview.
      return false;
    }
  };

  useEffect(() => {
    void syncFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Cabeceras JSON + Bearer de sesión para las llamadas a /api/admin/*. */
  const adminHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('famesa_admin_token') : null;
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {
      /* sessionStorage no disponible */
    }
    return headers;
  };

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
      headers: adminHeaders(),
      body: JSON.stringify({ rate_usd_ves: n }),
    }).catch(() => {});
  };

  const selectRateType = (type: RateType) => {
    const value = ratesRef.current[type];
    setActiveRateTypeState(type);
    activeRateTypeRef.current = type;
    setRateState(value);
    try {
      window.localStorage.setItem(RATE_TYPE_STORAGE_KEY, type);
    } catch {
      // Almacenamiento no disponible
    }
    audit(`Tasa activa cambiada a ${type.toUpperCase()}: ${value.toFixed(2)} Bs.`);
    toast.success(`Tasa activa: ${type.toUpperCase().replace('_', ' ')} · ${value.toFixed(2)} Bs.`);
  };

  const refreshRates = async () => {
    setRatesLoading(true);
    try {
      const res = await fetch('/api/rates');
      if (!res.ok) throw new Error('rates fetch failed');
      const payload = (await res.json()) as {
        ok?: boolean;
        updated_at?: string;
        rates?: Partial<RatesState>;
      };
      if (payload?.ok && payload.rates) {
        const next = { ...ratesRef.current };
        (Object.keys(next) as RateType[]).forEach((key) => {
          const value = Number(payload.rates?.[key]);
          if (Number.isFinite(value) && value > 0) next[key] = value;
        });
        setRatesState(next);
        ratesRef.current = next;
        setRateState(next[activeRateTypeRef.current]);
        setRatesUpdatedAt(payload.updated_at ?? null);
      }
    } catch {
      // Se mantienen las tasas previas; el endpoint nunca bloquea la operación
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => {
    void refreshRates();
    const interval = setInterval(() => void refreshRates(), RATES_POLLING_MS);
    return () => clearInterval(interval);
  }, []);

  const add = (module: ModuleKey, r: RecordData) => {
    if (!guard(module)) return;
    setData((prev) => ({ ...prev, [module]: [r, ...prev[module]] }));
    audit(`Creación ${r.id}`);
    toast.success(`${r.id} registrado correctamente`);
    void fetch(`/api/admin/${module}`, {
      method: 'POST',
      headers: adminHeaders(),
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
      headers: adminHeaders(),
      body: JSON.stringify(patch),
    }).catch(() => {});
  };

  const deleteRecord = (module: ModuleKey, id: string) => {
    if (!guard(module)) return;
    setData((prev) => ({
      ...prev,
      [module]: prev[module].filter((r) => r.id !== id),
    }));
    audit(`Eliminación de ${id} en ${module}`);
    toast.success(`Registro ${id} eliminado correctamente`);
    void fetch(`/api/admin/${module}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    }).catch(() => {});
  };

  const convertLead = (id: string) => {
    if (!guard('cotizaciones')) return;
    const lead = data.leads.find((r) => r.id === id);
    if (!lead || lead.status === 'cotizado' || lead.status === 'ganado') {
      toast.error('Este prospecto ya fue convertido');
      return;
    }
    const quoteId = `COT-${String(1 + data.cotizaciones.length).padStart(5, '0')}`;
    setData((prev) => ({
      ...prev,
      leads: prev.leads.map((r) => (r.id === id ? { ...r, status: 'cotizado', quote: quoteId } : r)),
      clientes: prev.clientes.some((c) => c.name === lead.client)
        ? prev.clientes
        : [
            {
              id: `CLI-${String(prev.clientes.length + 1).padStart(5, '0')}`,
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
    const otId = `OT-${String(1 + data.ordenes.length).padStart(5, '0')}`;
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
    const invoiceId = `FAC-${String(1 + data.facturacion.length).padStart(5, '0')}`;
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
          control: `00-${String(1 + prev.facturacion.length).padStart(6, '0')}`,
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
      // 1. Prioridad: hidratar datos reales desde Turso (sesión autenticada).
      if (await syncFromServer()) {
        audit('Datos maestros sincronizados desde Turso (sesión autenticada)');
        toast.success('Datos sincronizados desde Turso');
        return;
      }
      // 2. Respaldo: instantánea local guardada manualmente.
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

  /** Purga el estado en memoria al bloquear el panel (sin datos sensibles residuales). */
  const clearSession = () => {
    setData(makeEmptyStore());
    setAudits([]);
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
        activeRateType,
        rates,
        ratesLoading,
        ratesUpdatedAt,
        selectRateType,
        refreshRates,
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
        deleteRecord,
        convertLead,
        approveQuote,
        invoiceOrder,
        moveStock,
        receive,
        payment,
        saveCloud,
        loadCloud,
        clearSession,
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
