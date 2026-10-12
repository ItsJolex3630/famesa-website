'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Link } from './link';
import {
  LayoutDashboard,
  Inbox,
  FileSpreadsheet,
  Wrench,
  Factory,
  Users,
  Boxes,
  ShoppingCart,
  Receipt,
  Wallet,
  CreditCard,
  BarChart3,
  UserCheck,
  Settings as SettingsIcon,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFamesa } from '@/lib/famesa/provider';
import {
  moduleInfo,
  roles,
  canAccess,
  usd,
  type ModuleKey,
  type Role,
  type RecordData,
} from '@/lib/famesa/data';
import { Modal, Field } from './shared';
import { RecordDialog, type DialogState } from './modules';

const navGroups: Array<{
  label: string;
  items: Array<{ path: string; key: string; title: string; icon: ReactNode; countKey?: ModuleKey | undefined }>;
}> = [
  {
    label: 'OPERACIONES',
    items: [
      { path: '/', key: '', title: 'Dashboard Ejecutivo', icon: <LayoutDashboard /> },
      { path: '/leads', key: 'leads', title: 'Prospectos Web (RFQ)', icon: <Inbox />, countKey: 'leads' },
      { path: '/cotizaciones', key: 'cotizaciones', title: 'Cotizaciones & Márgenes', icon: <FileSpreadsheet />, countKey: 'cotizaciones' },
      { path: '/ordenes', key: 'ordenes', title: 'Órdenes de Trabajo', icon: <Wrench />, countKey: 'ordenes' },
      { path: '/taller', key: 'taller', title: 'Taller y Máquinas', icon: <Factory />, countKey: 'taller' },
    ],
  },
  {
    label: 'COMERCIAL & INVENTARIO',
    items: [
      { path: '/clientes', key: 'clientes', title: 'CRM Clientes 360°', icon: <Users />, countKey: 'clientes' },
      { path: '/inventario', key: 'inventario', title: 'Inventario de Materiales', icon: <Boxes />, countKey: 'inventario' },
      { path: '/compras', key: 'compras', title: 'Compras y Proveedores', icon: <ShoppingCart />, countKey: 'compras' },
    ],
  },
  {
    label: 'FINANZAS SENIAT',
    items: [
      { path: '/facturacion', key: 'facturacion', title: 'Facturación Fiscal', icon: <Receipt />, countKey: 'facturacion' },
      { path: '/cobros', key: 'cobros', title: 'Cobranzas y Aging', icon: <Wallet />, countKey: 'cobros' },
      { path: '/gastos', key: 'gastos', title: 'Gastos y Comprobantes', icon: <CreditCard />, countKey: 'gastos' },
      { path: '/reportes', key: 'reportes', title: 'Rentabilidad y P&L', icon: <BarChart3 /> },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { path: '/personal', key: 'personal', title: 'Personal y Operarios', icon: <UserCheck />, countKey: 'personal' },
      { path: '/ajustes', key: 'ajustes', title: 'Ajustes y Auditoría', icon: <SettingsIcon /> },
    ],
  },
];

export function FamesaShell({
  children,
  dialog,
  onDialog,
}: {
  children: ReactNode;
  dialog: DialogState | null;
  onDialog: (s: DialogState | null) => void;
}) {
  const f = useFamesa();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [rateOpen, setRateOpen] = useState(false);
  const [rateInput, setRateInput] = useState(String(f.rate));
  const [quickOpen, setQuickOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  useEffect(() => {
    setRateInput(String(f.rate));
  }, [f.rate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const currentSeg = pathname.replace(/^\/admin/, '').replace(/^\//, '').split('/')[0] ?? '';
  const currentTitle =
    currentSeg && currentSeg in moduleInfo
      ? moduleInfo[currentSeg as ModuleKey].title
      : 'Dashboard Ejecutivo';

  const criticalStock = f.data.inventario.filter((r) => r.status === 'crítico').length;
  const overdueInvoices = f.data.facturacion.filter((r) => r.status === 'vencida').length;
  const alertTotal = criticalStock + overdueInvoices + 1;

  const allRecords: Array<{ module: ModuleKey; row: RecordData }> = (
    ['clientes', 'ordenes', 'cotizaciones', 'facturacion', 'inventario', 'leads'] as ModuleKey[]
  ).flatMap((m) => f.data[m].map((row) => ({ module: m, row })));

  const matchedRecords = cmdQuery.trim()
    ? allRecords
        .filter(({ row }) =>
          Object.values(row).some((v) => String(v).toLowerCase().includes(cmdQuery.toLowerCase())),
        )
        .slice(0, 8)
    : allRecords.slice(0, 6);

  return (
    <div className="erp-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-row">
            <div className="brand-mark">F</div>
            <div>
              <div className="brand-name">FAMESA C.A.</div>
            </div>
          </div>
          <div className="brand-sub">SUITE ERP INDUSTRIAL · RIF J-31352388-7</div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => canAccess(f.role, item.key));
            if (!visibleItems.length) return null;
            return (
              <div key={group.label}>
                <div className="nav-group">{group.label}</div>
                {visibleItems.map((item) => {
                  const isActive =
                    item.path === '/' ? currentSeg === '' : currentSeg === item.key;
                  const count =
                    item.countKey === 'leads'
                      ? f.data.leads.filter((r) => r.status === 'nuevo').length
                      : item.countKey === 'inventario'
                        ? criticalStock
                        : item.countKey === 'cobros'
                          ? overdueInvoices
                          : 0;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      {count > 0 && <span className="nav-count">{count}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="plant-label">
            <span className="status-dot" />
            <span>PLANTA 600 m² · SANTA ROSA, VALENCIA</span>
          </div>
          <div className="user-line">
            <div className="user-avatar">{f.role.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{f.userEmail || 'Joel Medina · FAMESA'}</strong>
              <div>
                <select
                  aria-label="Cambiar rol activo"
                  className="role-select"
                  value={f.role}
                  onChange={(e) => f.setRole(e.target.value as Role)}
                >
                  {Object.entries(roles).map(([k, label]) => (
                    <option key={k} value={k}>
                      Rol: {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <Button
              variant="outline"
              size="icon"
              className="mobile-trigger"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Menú"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </Button>
            <div>
              <div className="topbar-title">{currentTitle}</div>
              <div className="topbar-sub">
                CONTROL DE OPERACIONES METALMECÁNICAS · MONEDA BASE USD + Bs. ESPEJO
              </div>
            </div>
          </div>

          <div className="topbar-tools">
            <button
              type="button"
              className="rate-button"
              onClick={() => setRateOpen(true)}
              title="Editar tasa de cambio Bs./USD"
            >
              <RefreshCw size={12} className="text-primary" />
              <span>TASA HOY:</span>
              <strong>{f.rate.toFixed(2)} Bs./USD</strong>
            </button>

            <label className="mirror-toggle">
              <input
                type="checkbox"
                checked={f.mirror}
                onChange={(e) => f.setMirror(e.target.checked)}
              />
              <span>VER Bs.</span>
            </label>

            <Button variant="outline" size="sm" onClick={() => setCmdOpen(true)}>
              <Search size={13} />
              <span>BUSCAR (⌘K)</span>
            </Button>

            <select
              aria-label="Período de consulta"
              className="period-select"
              value={f.period}
              onChange={(e) => f.setPeriod(e.target.value)}
            >
              <option value="Octubre 2026">Octubre 2026</option>
              <option value="Q4 2026">Q4 2026</option>
              <option value="Año 2026">Año 2026</option>
            </select>

            <div className="topbar-menu">
              <Button
                variant="outline"
                size="icon"
                className="notification"
                onClick={() => {
                  setAlertsOpen((v) => !v);
                  setQuickOpen(false);
                }}
                aria-label="Alertas"
              >
                <Bell size={15} />
                <span className="notification-count">{alertTotal}</span>
              </Button>
              {alertsOpen && (
                <div className="floating-menu">
                  <div className="eyebrow muted p-2">ALERTAS OPERATIVAS ({alertTotal})</div>
                  <Button
                    variant="ghost"
                    className="menu-item"
                    onClick={() => {
                      setAlertsOpen(false);
                      router.push('/admin/inventario');
                    }}
                  >
                    {criticalStock} materiales en stock crítico
                  </Button>
                  <Button
                    variant="ghost"
                    className="menu-item"
                    onClick={() => {
                      setAlertsOpen(false);
                      router.push('/admin/cobros');
                    }}
                  >
                    {overdueInvoices} facturas vencidas por cobrar
                  </Button>
                  <Button
                    variant="ghost"
                    className="menu-item"
                    onClick={() => {
                      setAlertsOpen(false);
                      router.push('/admin/taller');
                    }}
                  >
                    1 máquina en mantenimiento (FRE-02)
                  </Button>
                </div>
              )}
            </div>

            <div className="topbar-menu">
              <Button
                variant="industrial"
                className="quick-action"
                onClick={() => {
                  setQuickOpen((v) => !v);
                  setAlertsOpen(false);
                }}
              >
                <Plus size={14} />
                <span className="quick-action-label">REGISTRAR</span>
              </Button>
              {quickOpen && (
                <div className="floating-menu">
                  {(
                    [
                      ['cotizaciones', 'create', '+ Nueva Cotización'],
                      ['ordenes', 'create', '+ Nueva Orden de Trabajo'],
                      ['cobros', 'payment', '+ Registrar Cobro / Pago'],
                      ['gastos', 'create', '+ Registrar Gasto'],
                      ['inventario', 'stock', '+ Movimiento de Material'],
                      ['clientes', 'create', '+ Nuevo Cliente B2B'],
                    ] as Array<[ModuleKey, DialogState['mode'], string]>
                  ).map(([mod, mode, label]) => (
                    <Button
                      key={label}
                      variant="ghost"
                      className="menu-item"
                      onClick={() => {
                        setQuickOpen(false);
                        onDialog({ module: mod, mode });
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="workspace">
          {children}
          <footer className="app-footer">
            <span>
              <strong>FAMESA C.A.</strong> · RIF J-31352388-7 · ZONA INDUSTRIAL SANTA ROSA, VALENCIA,
              EDO. CARABOBO
            </span>
            <span>TURSO LIBSQL + CLOUDFLARE PAGES · MONEDA BASE USD / TASA {f.rate} Bs.</span>
          </footer>
        </main>
      </div>

      {dialog && (
        <RecordDialog
          state={dialog}
          onClose={() => onDialog(null)}
          onChange={(next) => onDialog(next)}
        />
      )}

      {rateOpen && (
        <Modal
          title="Actualizar Tasa de Cambio (Bs./USD)"
          subtitle="Afecta equivalencias en vivo; facturas emitidas conservan su tasa histórica congelada"
          onClose={() => setRateOpen(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setRateOpen(false)}>
                CANCELAR
              </Button>
              <Button
                variant="industrial"
                onClick={() => {
                  f.setRate(Number(rateInput));
                  setRateOpen(false);
                }}
              >
                GUARDAR TASA
              </Button>
            </>
          }
        >
          <div className="form-grid">
            <Field label="Tasa del día (Bs. por 1 USD)" full>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
              />
            </Field>
          </div>
        </Modal>
      )}

      {cmdOpen && (
        <Modal
          title="Búsqueda Global Rápida (⌘K)"
          subtitle="Filtra clientes, órdenes de trabajo, cotizaciones, facturas o materiales"
          onClose={() => setCmdOpen(false)}
        >
          <input
            className="command-input"
            placeholder="Escribe código (OT-0089, FAC-00412, Coca-Cola, AISI 4140)..."
            value={cmdQuery}
            onChange={(e) => setCmdQuery(e.target.value)}
            autoFocus
          />
          <div className="mt-4">
            {matchedRecords.map(({ module, row }) => (
              <button
                key={`${module}-${row.id}`}
                type="button"
                className="command-result"
                onClick={() => {
                  setCmdOpen(false);
                  onDialog({ module, row, mode: 'detail' });
                }}
              >
                <div>
                  <small>{row.id}</small>
                  <div>
                    <strong>{row.name ?? row.client}</strong> · {row.description ?? row.sector}
                  </div>
                </div>
                <span>{row.amount ? usd(Number(row.amount)) : row.status}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
