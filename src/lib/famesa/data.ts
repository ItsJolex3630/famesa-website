export type RecordData = {
  id: string;
  name?: string | undefined;
  client?: string | undefined;
  description?: string | undefined;
  status: string;
  amount?: number | undefined;
  cost?: number | undefined;
  exchange_rate?: number | undefined;
  amount_ves?: number | undefined;
  rif?: string | undefined;
  sector?: string | undefined;
  credit?: number | undefined;
  days?: number | undefined;
  segment?: string | undefined;
  address?: string | undefined;
  contact?: string | undefined;
  phone?: string | undefined;
  interaction?: string | undefined;
  stock?: number | undefined;
  min?: number | undefined;
  unit?: string | undefined;
  location?: string | undefined;
  kardex?: string | undefined;
  date?: string | undefined;
  material?: string | undefined;
  quantity?: number | undefined;
  machineHours?: number | undefined;
  laborHours?: number | undefined;
  priority?: string | undefined;
  estimated?: number | undefined;
  progress?: number | undefined;
  machine?: string | undefined;
  operator?: string | undefined;
  due?: string | undefined;
  hours?: number | undefined;
  reserved?: boolean | undefined;
  materialQty?: number | undefined;
  quality?: string | undefined;
  capacity?: number | undefined;
  ot?: string | undefined;
  maintenance?: string | undefined;
  maintenance_type?: string | undefined;
  standard?: string | undefined;
  base?: number | undefined;
  iva?: number | undefined;
  igtf?: number | undefined;
  igtf_collected?: number | undefined;
  paid?: number | undefined;
  control?: string | undefined;
  consent?: string | undefined;
  received?: number | undefined;
  budget?: number | undefined;
  recurring?: boolean | undefined;
  voucher?: string | undefined;
  certification?: string | undefined;
  quote?: string | undefined;
  invoice?: string | undefined;
  method?: string | undefined;
  work_logs?: string | undefined;
  credit_note?: string | undefined;
  credit_amount?: number | undefined;
  [key: string]: string | number | boolean | undefined;
};

export type ModuleKey =
  | 'leads'
  | 'cotizaciones'
  | 'ordenes'
  | 'taller'
  | 'clientes'
  | 'inventario'
  | 'compras'
  | 'facturacion'
  | 'cobros'
  | 'gastos'
  | 'reportes'
  | 'personal'
  | 'ajustes';

export type DataStore = Record<ModuleKey, RecordData[]>;

export const moduleInfo: Record<ModuleKey, { title: string; subtitle: string; action: string }> = {
  leads: {
    title: 'Prospectos web',
    subtitle: 'Solicitudes técnicas, oportunidades y seguimiento comercial',
    action: 'REGISTRAR PROSPECTO',
  },
  cotizaciones: {
    title: 'Cotizaciones & márgenes',
    subtitle: 'Ingeniería de costos y propuestas comerciales',
    action: 'NUEVA COTIZACIÓN',
  },
  ordenes: {
    title: 'Órdenes de trabajo',
    subtitle: 'Trazabilidad de producción · Material, máquina y operario',
    action: 'NUEVA ORDEN',
  },
  taller: {
    title: 'Taller y máquinas',
    subtitle: 'Planta Santa Rosa · 600 m² de capacidad industrial',
    action: 'REGISTRAR MANTENIMIENTO',
  },
  clientes: {
    title: 'CRM clientes 360°',
    subtitle: 'Relaciones industriales y cuentas estratégicas',
    action: 'REGISTRAR CLIENTE',
  },
  inventario: {
    title: 'Inventario de materiales',
    subtitle: 'Metales, polímeros y consumibles · Control de almacén',
    action: 'ENTRADA DE MATERIAL',
  },
  compras: {
    title: 'Compras y proveedores',
    subtitle: 'Abastecimiento, órdenes de compra y recepción',
    action: 'NUEVA COMPRA',
  },
  facturacion: {
    title: 'Facturación fiscal',
    subtitle: 'Documentos fiscales · IVA 16% · IGTF 3%',
    action: 'EMITIR FACTURA',
  },
  cobros: {
    title: 'Cobranzas y pagos',
    subtitle: 'Cartera por cobrar, antigüedad de saldos y conciliación',
    action: 'REGISTRAR PAGO',
  },
  gastos: {
    title: 'Gastos y comprobantes',
    subtitle: 'Control presupuestario y egresos operativos',
    action: 'REGISTRAR GASTO',
  },
  reportes: {
    title: 'Rentabilidad y reportes',
    subtitle: 'Estado de resultados, márgenes y flujo de caja',
    action: 'EXPORTAR REPORTE',
  },
  personal: {
    title: 'Personal y operarios',
    subtitle: 'Equipo técnico · Horas y costos de producción',
    action: 'REGISTRAR PERSONAL',
  },
  ajustes: {
    title: 'Ajustes del sistema',
    subtitle: 'Datos fiscales, tasas, permisos y bitácora de auditoría',
    action: 'GUARDAR AJUSTES',
  },
};

export const roles = {
  admin: 'Dueño / Administrador',
  gerente: 'Gerente general',
  ventas: 'Ventas',
  taller: 'Taller',
  almacen: 'Almacén',
  contabilidad: 'Contabilidad',
};

export type Role = keyof typeof roles;

export function canAccess(role: Role, module: string) {
  if (role === 'admin' || role === 'gerente') return true;
  const allowed: Record<string, string[]> = {
    ventas: ['', 'leads', 'cotizaciones', 'ordenes', 'clientes', 'inventario', 'cobros'],
    taller: ['', 'ordenes', 'taller', 'inventario'],
    almacen: ['', 'inventario', 'compras', 'ordenes'],
    contabilidad: ['', 'clientes', 'compras', 'facturacion', 'cobros', 'gastos', 'reportes'],
  };
  return allowed[role]?.includes(module) ?? false;
}

export function makeSeed(): DataStore {
  return {
    leads: [],
    cotizaciones: [],
    ordenes: [],
    taller: [
      { id: 'CNC-01', name: 'Torno CNC Haas ST-30', status: 'operativa', hours: 0, capacity: 176, ot: '—', maintenance: '2026-11-30', cost: 28, standard: 'Mecanizado CNC de precisión' },
      { id: 'TOR-01', name: 'Torno Paralelo Pinacho 2 m', status: 'operativa', hours: 0, capacity: 176, ot: '—', maintenance: '2026-11-30', cost: 18, standard: 'Tornería pesada convencional' },
      { id: 'TOR-02', name: 'Torno Paralelo Pesado 4 m', status: 'operativa', hours: 0, capacity: 176, ot: '—', maintenance: '2026-11-30', cost: 24, standard: 'Mecanizado de gran porte' },
      { id: 'FRE-01', name: 'Fresadora Universal Bancada', status: 'operativa', hours: 0, capacity: 176, ot: '—', maintenance: '2026-11-30', cost: 20, standard: 'Fresado y ranurado' },
      { id: 'FRE-02', name: 'Fresadora Puente CNC', status: 'operativa', hours: 0, capacity: 176, ot: '—', maintenance: '2026-11-30', cost: 32, standard: 'Fresado pesado y matrices' },
      { id: 'REC-01', name: 'Rectificadora Cilíndrica / Plana', status: 'operativa', hours: 0, capacity: 176, ot: '—', maintenance: '2026-11-30', cost: 22, standard: 'Acabado y rectificado' },
      { id: 'SOL-01', name: 'Estación Soldadura TIG/MIG', status: 'operativa', hours: 0, capacity: 176, ot: '—', maintenance: '2026-11-30', cost: 16, standard: 'ASME Sec. IX / AWS D1.1' },
    ],
    clientes: [],
    inventario: [
      { id: 'MAT-001', name: 'Acero SAE 1045 Barra Redonda', status: 'disponible', stock: 0, min: 100, unit: 'kg', cost: 3.2, location: 'Patio Barras', kardex: 'Inventario inicial 0 kg' },
      { id: 'MAT-002', name: 'Acero SAE 1020 Barra Redonda', status: 'disponible', stock: 0, min: 100, unit: 'kg', cost: 2.8, location: 'Patio Barras', kardex: 'Inventario inicial 0 kg' },
      { id: 'MAT-003', name: 'Acero Bonificado AISI 4140', status: 'disponible', stock: 0, min: 80, unit: 'kg', cost: 5.5, location: 'Patio Barras', kardex: 'Inventario inicial 0 kg' },
      { id: 'MAT-004', name: 'Acero Inox AISI 304 Barra', status: 'disponible', stock: 0, min: 50, unit: 'kg', cost: 8.5, location: 'Patio Barras', kardex: 'Inventario inicial 0 kg' },
      { id: 'MAT-005', name: 'Acero Inox AISI 316L Calidad Sanitaria', status: 'disponible', stock: 0, min: 30, unit: 'kg', cost: 11.0, location: 'Patio Barras', kardex: 'Inventario inicial 0 kg' },
      { id: 'MAT-006', name: 'Bronce Fosfórico SAE 64 Barra Hueca (Bocinas)', status: 'disponible', stock: 0, min: 40, unit: 'kg', cost: 16.5, location: 'Almacén Bronces', kardex: 'Inventario inicial 0 kg' },
      { id: 'MAT-007', name: 'Bronce Fosfórico SAE 65 (Coronas Reductor)', status: 'disponible', stock: 0, min: 30, unit: 'kg', cost: 18.0, location: 'Almacén Bronces', kardex: 'Inventario inicial 0 kg' },
      { id: 'MAT-008', name: 'Teflón PTFE Virgen Barra', status: 'disponible', stock: 0, min: 20, unit: 'kg', cost: 24.0, location: 'Almacén Polímeros', kardex: 'Inventario inicial 0 kg' },
      { id: 'MAT-009', name: 'Nylon 6 Poliamida Barra Maciza', status: 'disponible', stock: 0, min: 30, unit: 'kg', cost: 9.8, location: 'Almacén Polímeros', kardex: 'Inventario inicial 0 kg' },
      { id: 'MAT-010', name: 'POM Acetal Delrin Barra', status: 'disponible', stock: 0, min: 25, unit: 'kg', cost: 13.5, location: 'Almacén Polímeros', kardex: 'Inventario inicial 0 kg' },
      { id: 'MAT-011', name: 'UHMW-PE Ultraleno Plancha / Barra', status: 'disponible', stock: 0, min: 30, unit: 'kg', cost: 15.0, location: 'Almacén Polímeros', kardex: 'Inventario inicial 0 kg' },
      { id: 'MAT-012', name: 'Poliuretano Industrial 90A', status: 'disponible', stock: 0, min: 15, unit: 'kg', cost: 17.0, location: 'Almacén Polímeros', kardex: 'Inventario inicial 0 kg' },
    ],
    compras: [],
    facturacion: [],
    cobros: [],
    gastos: [],
    reportes: [],
    personal: [
      { id: 'PER-001', name: 'Dirección General FAMESA C.A.', description: 'Dueño / Director General', status: 'activo', cost: 0, hours: 0, certification: 'Administrador Maestro' },
      { id: 'PER-002', name: 'Jefatura de Taller', description: 'Gerente Técnico de Planta', status: 'activo', cost: 15, hours: 0, certification: 'Técnico Mecánico CNC' },
    ],
    ajustes: [
      { id: 'SET-001', name: 'Empresa', value: 'FAMESA C.A.', rif: 'J-31352388-7', address: 'Carmen Norte, Av. 98 Boyacá, Galpón 80-29, Santa Rosa, Valencia, Edo. Carabobo', status: 'activo' },
      { id: 'SET-002', name: 'Correo oficial', value: 'famesa2005@gmail.com', status: 'activo' },
      { id: 'SET-003', name: 'Teléfonos', value: '0241-897-83-02 / 0414-341-01-87 / 0412-143-50-69', status: 'activo' },
    ],
  };
}

export function makeEmptyStore(): DataStore {
  return {
    leads: [],
    cotizaciones: [],
    ordenes: [],
    taller: [
      { id: 'CNC-01', name: 'Torno CNC Haas ST-30', status: 'operativa', hours: 0, capacity: 176, ot: '—', maintenance: '2026-11-15', cost: 28, standard: 'Mecanizado CNC alta precisión' },
      { id: 'TOR-01', name: 'Torno Paralelo Pinacho 2 m', status: 'operativa', hours: 0, capacity: 176, ot: '—', maintenance: '2026-11-15', cost: 18, standard: 'Tornería pesada convencional' },
      { id: 'FRE-01', name: 'Fresadora Universal Bancada', status: 'operativa', hours: 0, capacity: 176, ot: '—', maintenance: '2026-11-15', cost: 20, standard: 'Fresado y ranurado' },
      { id: 'SOL-01', name: 'Estación Soldadura TIG/MIG', status: 'operativa', hours: 0, capacity: 176, ot: '—', maintenance: '2026-11-15', cost: 16, standard: 'ASME Sec. IX / AWS D1.1' },
    ],
    clientes: [],
    inventario: [
      { id: 'MAT-001', name: 'Acero SAE 1045 Barra Redonda', status: 'disponible', stock: 0, min: 100, unit: 'kg', cost: 3.2, location: 'Patio Barras', kardex: 'Inventario inicial' },
      { id: 'MAT-002', name: 'Acero SAE 1020 Barra Redonda', status: 'disponible', stock: 0, min: 100, unit: 'kg', cost: 2.8, location: 'Patio Barras', kardex: 'Inventario inicial' },
      { id: 'MAT-003', name: 'Acero Bonificado AISI 4140', status: 'disponible', stock: 0, min: 80, unit: 'kg', cost: 5.5, location: 'Patio Barras', kardex: 'Inventario inicial' },
      { id: 'MAT-004', name: 'Acero Inox AISI 304', status: 'disponible', stock: 0, min: 50, unit: 'kg', cost: 8.5, location: 'Patio Barras', kardex: 'Inventario inicial' },
      { id: 'MAT-005', name: 'Bronce Fosforado SAE 64/65 (Bocinas)', status: 'disponible', stock: 0, min: 40, unit: 'kg', cost: 16.5, location: 'Almacén Bronces', kardex: 'Inventario inicial' },
      { id: 'MAT-006', name: 'Teflón PTFE Virgen Barra', status: 'disponible', stock: 0, min: 20, unit: 'kg', cost: 24.0, location: 'Almacén Polímeros', kardex: 'Inventario inicial' },
      { id: 'MAT-007', name: 'Nylon 6 Poliamida Barra Maciza', status: 'disponible', stock: 0, min: 30, unit: 'kg', cost: 9.8, location: 'Almacén Polímeros', kardex: 'Inventario inicial' },
      { id: 'MAT-008', name: 'POM Acetal Delrin', status: 'disponible', stock: 0, min: 25, unit: 'kg', cost: 13.5, location: 'Almacén Polímeros', kardex: 'Inventario inicial' },
      { id: 'MAT-009', name: 'UHMW-PE Ultraleno', status: 'disponible', stock: 0, min: 30, unit: 'kg', cost: 15.0, location: 'Almacén Polímeros', kardex: 'Inventario inicial' },
    ],
    compras: [],
    facturacion: [],
    cobros: [],
    gastos: [],
    reportes: [],
    personal: [
      { id: 'PER-001', name: 'Joel Medina', role: 'Director / Dueño', status: 'activo', phone: '+58 414 341 01 87', cost: 0 },
      { id: 'PER-002', name: 'Dirección Técnica', role: 'Gerente de Planta', status: 'activo', phone: '+58 412 143 50 69', cost: 15 },
    ],
    ajustes: [
      { id: 'SET-001', name: 'Empresa', value: 'FAMESA C.A.', rif: 'J-31352388-7', address: 'Santa Rosa, Valencia, Carabobo', status: 'activo' },
      { id: 'SET-002', name: 'Correo oficial', value: 'famesa2005@gmail.com', status: 'activo' },
    ],
  };
}

export const usd = (n: number) =>
  new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
export const ves = (n: number) =>
  new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' Bs.';
export const labelStatus = (s: string) => s.replaceAll('_', ' ');

export function quoteTotals(
  quantity: number,
  materialCost: number,
  machineHours: number,
  machineCost: number,
  laborHours: number,
  laborCost: number,
  unitPrice: number,
) {
  const cost = quantity * materialCost + machineHours * machineCost + laborHours * laborCost;
  const total = quantity * unitPrice;
  return { cost, total, profit: total - cost, margin: total > 0 ? ((total - cost) / total) * 100 : 0 };
}

export function invoiceTotals(base: number, rate: number, foreign: number = 0) {
  const iva = base * 0.16;
  const igtf = foreign * 0.03;
  return {
    base,
    iva,
    igtf,
    total: base + iva + igtf,
    base_ves: base * rate,
    iva_ves: iva * rate,
    igtf_ves: igtf * rate,
    amount_ves: (base + iva + igtf) * rate,
    exchange_rate: rate,
  };
}
