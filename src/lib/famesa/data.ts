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

const clientNames = [
  'Coca-Cola FEMSA de Venezuela',
  'Mondelēz Venezuela',
  'Empresas Sindoni',
  'Corimon Pinturas',
  'Ajeven Big Cola',
  'Cervecería Polar Planta San Joaquín',
];

export function makeSeed(): DataStore {
  const rifs = ['J-00012345-6', 'J-00045891-2', 'J-07501928-3', 'J-00029384-1', 'J-30819201-4', 'J-00006372-9'];
  const contacts = [
    'Ing. Rafael Hernández',
    'Ing. Andrea Salcedo',
    'Ing. Pedro Castillo',
    'Ing. Luis Romero',
    'Ing. Víctor Gómez',
    'Ing. Daniel Pérez',
  ];
  const clients: RecordData[] = clientNames.map((name, i) => ({
    id: `CLI-00${i + 1}`,
    name,
    status: 'activo',
    rif: rifs[i] ?? 'J-00000000-0',
    sector: i === 3 ? 'Pinturas y químicos' : 'Alimentos y bebidas',
    credit: i === 0 ? 25000 : 15000,
    days: 30,
    segment: i < 2 ? 'Cuenta clave' : 'Industrial',
    address: 'Zona Industrial, Valencia, Carabobo',
    contact: contacts[i] ?? 'Ing. de Planta',
    phone: '+584144201100',
    interaction: 'Visita técnica · 08 oct 2026 · Levantamiento dimensional y revisión de alcance',
  }));
  const inventoryNames = [
    'Acero SAE 1045',
    'Acero SAE 1020',
    'Acero Bonificado AISI 4140',
    'Acero Inox AISI 304',
    'Acero Inox AISI 316L',
    'Bronce Fosforado SAE 64/65',
    'Aluminio 6061-T6',
    'Teflón PTFE Virgen',
    'Nylon 6 / 66',
    'POM Acetal',
    'UHMW-PE',
    'Fibra Fenólica Celerón',
    'Insertos Carburo CNMG',
    'Gas Argón Pureza 99.99%',
  ];
  const stock = [340, 510, 42, 130, 18, 65, 120, 22, 36, 48, 8, 12, 16, 3];
  const mins = [80, 100, 60, 40, 30, 40, 50, 15, 20, 20, 15, 10, 25, 4];
  const costs = [3.8, 2.6, 6.5, 7.2, 9.8, 12.5, 6.8, 28, 14, 18, 12, 16, 8.5, 85];
  const inventario: RecordData[] = inventoryNames.map((name, i) => {
    const st = stock[i] ?? 10;
    const mn = mins[i] ?? 10;
    const cs = costs[i] ?? 10;
    return {
      id: `MAT-${String(i + 1).padStart(3, '0')}`,
      name,
      status: st < mn ? 'crítico' : 'disponible',
      stock: st,
      min: mn,
      unit: i === 12 ? 'und' : i === 13 ? 'cil' : 'kg',
      cost: cs,
      location: i < 7 ? 'Patio Barras / Estante A-1' : i < 12 ? 'Almacén Polímeros' : 'Estante C-2',
      kardex: 'Entrada · 01 oct 2026 · Inventario inicial',
    };
  });
  const titles = [
    'Rectificado de eje motriz AISI 4140',
    '40 bocinas bronce SAE 64 + raspadores UHMW',
    'Reparación de reductor Falk',
    'Fabricación de engranajes helicoidales',
    'Mecanizado de rodillos inox 316L',
    'Reparación de gato hidráulico 50 t',
  ];
  const amounts = [4850, 3200, 6750, 2480, 5100, 1850];
  const quoteStatuses = ['aprobada', 'enviada', 'enviada', 'borrador', 'aprobada', 'enviada'];
  const quoteFactors = [0.55, 0.64, 0.58, 0.83, 0.61, 0.62];
  const cotizaciones: RecordData[] = titles.map((description, i) => {
    const amt = amounts[i] ?? 1000;
    const factor = quoteFactors[i] ?? 0.6;
    return {
      id: `COT-0${108 + i}`,
      client: clientNames[i] ?? 'Cliente Industrial',
      description,
      status: quoteStatuses[i] ?? 'borrador',
      amount: amt,
      cost: amt * factor,
      date: '2026-10-08',
      exchange_rate: 54.8,
      amount_ves: amt * 54.8,
      material: inventario[i]?.id ?? 'MAT-001',
      quantity: i === 1 ? 40 : 1,
      machineHours: 12,
      laborHours: 14,
    };
  });
  const orderStatuses = ['en_proceso', 'control_calidad', 'en_proceso', 'pendiente', 'terminada', 'en_proceso'];
  const orderFactors = [0.58, 0.64, 0.6, 0.83, 0.59, 0.62];
  const orderProgress = [65, 90, 45, 0, 100, 35];
  const orderMachines = ['CNC-01', 'REC-01', 'TOR-02', 'FRE-01', 'CNC-01', 'TOR-01'];
  const orderOperators = [
    'Carlos Méndez',
    'Luis Padrón',
    'Miguel Bolívar',
    'Miguel Bolívar',
    'Carlos Méndez',
    'Jesús Alvarado',
  ];
  const orderDues = ['2026-10-14', '2026-10-16', '2026-10-19', '2026-10-22', '2026-10-10', '2026-10-23'];
  const orderHours = [18, 24, 32, 0, 20, 8];
  const ordenes: RecordData[] = titles.map((description, i) => {
    const amt = amounts[i] ?? 1000;
    return {
      id: `OT-00${89 + i}`,
      client: clientNames[i] ?? 'Cliente Industrial',
      description,
      status: orderStatuses[i] ?? 'pendiente',
      priority: i === 0 ? 'Emergencia 24-48h' : i < 3 ? 'Prioritaria' : 'Estándar',
      amount: amt,
      cost: amt * (orderFactors[i] ?? 0.6),
      estimated: amt * 0.62,
      progress: orderProgress[i] ?? 0,
      machine: orderMachines[i] ?? 'CNC-01',
      operator: orderOperators[i] ?? 'Carlos Méndez',
      due: orderDues[i] ?? '2026-10-25',
      hours: orderHours[i] ?? 0,
      exchange_rate: 54.8,
      amount_ves: amt * 54.8,
      reserved: true,
      material: inventario[i]?.id ?? 'MAT-001',
      materialQty: 5,
      quality: i === 4 ? 'Conforme · ±0,02 mm · Luis Padrón' : '',
    };
  });
  const machines = [
    'Torno CNC Haas ST-30',
    'Torno Paralelo Pinacho 2 m',
    'Torno Paralelo Pesado 4 m',
    'Fresadora Universal Bancada',
    'Fresadora Puente CNC',
    'Rectificadora Cilíndrica / Plana',
    'Estación Soldadura TIG/MIG',
  ];
  const machineIds = ['CNC-01', 'TOR-01', 'TOR-02', 'FRE-01', 'FRE-02', 'REC-01', 'SOL-01'];
  const machineStatuses = ['ocupada', 'operativa', 'ocupada', 'operativa', 'mantenimiento', 'ocupada', 'operativa'];
  const machineHoursList = [142, 98, 120, 86, 65, 112, 78];
  const machineOts = ['OT-0089', '—', 'OT-0091', '—', '—', 'OT-0090', '—'];
  const machineCosts = [28, 18, 24, 20, 32, 22, 16];
  const taller: RecordData[] = machines.map((name, i) => ({
    id: machineIds[i] ?? `MAQ-0${i + 1}`,
    name,
    status: machineStatuses[i] ?? 'operativa',
    hours: machineHoursList[i] ?? 100,
    capacity: 176,
    ot: machineOts[i] ?? '—',
    maintenance: i === 4 ? '2026-10-12' : '2026-10-28',
    cost: machineCosts[i] ?? 20,
    standard: i === 6 ? 'ASME Sec. IX / AWS D1.1' : 'Mecanizado de precisión',
  }));
  const invStatuses = ['pendiente', 'vencida', 'pagada', 'vencida', 'pendiente', 'pagada'];
  const invDates = ['2026-10-08', '2026-08-28', '2026-10-03', '2026-07-10', '2026-09-30', '2026-10-06'];
  const invDues = ['2026-11-07', '2026-09-27', '2026-11-02', '2026-08-09', '2026-10-30', '2026-11-05'];
  const facturacion: RecordData[] = clientNames.map((client, i) => {
    const amt = amounts[i] ?? 1000;
    const paidList = [0, 800, amt * 1.16, 0, 1200, amt * 1.16];
    const exRate = i === 1 ? 52.2 : 54.8;
    return {
      id: `FAC-00${412 + i}`,
      client,
      description: titles[i] ?? 'Servicio industrial',
      status: invStatuses[i] ?? 'pendiente',
      amount: amt * 1.16,
      base: amt,
      iva: amt * 0.16,
      igtf: 0,
      paid: paidList[i] ?? 0,
      control: `00-00${4120 + i}`,
      exchange_rate: exRate,
      amount_ves: amt * 1.16 * exRate,
      date: invDates[i] ?? '2026-10-08',
      due: invDues[i] ?? '2026-11-07',
      rif: clients[i]?.rif ?? 'J-00000000-0',
      address: clients[i]?.address ?? 'Valencia, Carabobo',
    };
  });
  const expDescriptions = [
    'Barras AISI 4140 · Ferrum Aceros',
    'Nómina técnica · 1ra quincena',
    'Electricidad y servicios de planta',
    'Galpón Santa Rosa',
    'Insertos CNMG · Sumindu',
    'Servicio husillo FRE-02',
    'Transporte de materiales',
    'Declaración IVA septiembre',
    'Póliza multirriesgo industrial',
    'Gestión comercial digital',
  ];
  const expAmounts = [3200, 4800, 720, 1800, 420, 680, 180, 950, 320, 240];
  const expBudgets = [4000, 5000, 850, 1800, 500, 600, 250, 1100, 350, 300];
  const expRecurring = [false, true, true, true, false, false, false, true, true, true];
  const persRoles = [
    'Tornero CNC',
    'Soldador TIG/MIG ASME',
    'Rectificador',
    'Fresador',
    'Tornero paralelo',
    'Control de calidad',
  ];
  const persCosts = [8.5, 9, 8, 8, 7.5, 9.5];
  const persHours = [142, 98, 112, 126, 108, 96];

  return {
    clientes: clients,
    inventario,
    cotizaciones,
    ordenes,
    taller,
    facturacion,
    cobros: [],
    leads: [
      {
        id: 'RFQ-2026-089',
        client: clientNames[0] ?? 'Coca-Cola FEMSA',
        description: titles[0] ?? 'Rectificado',
        status: 'nuevo',
        priority: 'Urgente · Parada de planta',
        date: '2026-10-12',
        consent: '2026-10-12 08:42 · Ley 17.1-2023',
        amount: 4850,
      },
      {
        id: 'RFQ-2026-090',
        client: clientNames[1] ?? 'Mondelēz',
        description: titles[1] ?? 'Bocinas SAE 64',
        status: 'contactado',
        priority: 'Prioritaria',
        date: '2026-10-11',
        consent: '2026-10-11 14:15 · Ley 17.1-2023',
        amount: 3200,
      },
      {
        id: 'RFQ-2026-091',
        client: clientNames[3] ?? 'Corimon',
        description: 'Reparación reductor Falk y sello mecánico inox 316',
        status: 'nuevo',
        priority: 'Estándar',
        date: '2026-10-10',
        consent: '2026-10-10 11:36 · Ley 17.1-2023',
        amount: 6750,
      },
    ],
    compras: ['Sumindu', 'Ferrum Aceros', 'Inoxtotalven', 'Hierrocor', 'Filotor', 'Suministros JL', 'Industrial Supply'].map(
      (name, i) => {
        const invCost = Number(inventario[i]?.cost ?? 10);
        return {
          id: `COM-00${41 + i}`,
          name,
          description: inventoryNames[i] ?? 'Material industrial',
          material: inventario[i]?.id ?? 'MAT-001',
          status: i === 0 ? 'parcial' : i === 3 ? 'recibida' : 'pendiente',
          quantity: 100,
          received: i === 0 ? 40 : i === 3 ? 100 : 0,
          amount: 100 * invCost,
          cost: 100 * invCost,
          date: '2026-10-09',
          exchange_rate: 54.8,
          amount_ves: 100 * invCost * 54.8,
        };
      },
    ),
    gastos: [
      'Materia Prima',
      'Nómina',
      'Servicios',
      'Alquiler',
      'Herramientas e Insertos',
      'Mantenimiento',
      'Fletes',
      'Impuestos SENIAT/Alcaldía',
      'Seguros',
      'Marketing',
    ].map((name, i) => {
      const expAmt = expAmounts[i] ?? 500;
      return {
        id: `GAS-${String(i + 1).padStart(4, '0')}`,
        name,
        description: expDescriptions[i] ?? 'Gasto operativo',
        status: 'registrado',
        amount: expAmt,
        budget: expBudgets[i] ?? 600,
        recurring: expRecurring[i] ?? false,
        voucher: `COMP-2026-${101 + i}`,
        date: '2026-10-10',
        exchange_rate: 54.8,
        amount_ves: expAmt * 54.8,
      };
    }),
    personal: [
      'Carlos Méndez',
      'José Gregorio Rivas',
      'Luis Padrón',
      'Miguel Bolívar',
      'Jesús Alvarado',
      'María Alejandra Torres',
    ].map((name, i) => ({
      id: `PER-00${i + 1}`,
      name,
      description: persRoles[i] ?? 'Operario técnico',
      status: 'activo',
      cost: persCosts[i] ?? 8.5,
      hours: persHours[i] ?? 100,
      certification: i === 1 ? 'ASME Sec. IX' : 'Técnico industrial',
    })),
    reportes: [],
    ajustes: [],
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
