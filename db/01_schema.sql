-- =============================================================================
-- FAMESA SUITE · ERP & PANEL DE ADMINISTRACIÓN INDUSTRIAL
-- Base de datos: Turso (libSQL / SQLite) -> famesa
-- Moneda base: USD (REAL) + columnas espejo *_ves y exchange_rate congelada
-- =============================================================================

PRAGMA foreign_keys = ON;

-- -----------------------------------------------------------------------------
-- 4.1 NÚCLEO (5 tablas + rate_limits)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT 'FAMESA C.A.',
  tax_id TEXT NOT NULL DEFAULT 'J-31352388-7',
  registry TEXT NOT NULL DEFAULT 'Registro Mercantil Primero del Estado Carabobo, N° 71, Tomo 44-A',
  capital_ves TEXT DEFAULT 'Bs. 500.000,00',
  address TEXT NOT NULL DEFAULT 'Zona Industrial Santa Rosa, Galpón Famesa (600 m²), Valencia, Edo. Carabobo, Venezuela',
  phone TEXT NOT NULL DEFAULT '+58 412-4090802',
  email TEXT NOT NULL DEFAULT 'ventas@famesa.com.ve',
  logo_url TEXT DEFAULT '/images/logo-famesa.png',
  currency_base TEXT NOT NULL DEFAULT 'USD' CHECK (currency_base IN ('USD', 'VES')),
  timezone TEXT NOT NULL DEFAULT 'America/Caracas',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'gerente', 'ventas', 'taller', 'almacen', 'contabilidad')),
  phone TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  rate_usd_ves REAL NOT NULL CHECK (rate_usd_ves > 0),
  source TEXT NOT NULL DEFAULT 'Paralelo / BCV Editable',
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  user_email TEXT,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'status_change', 'login', 'export')),
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rate_limits (
  k TEXT PRIMARY KEY,
  ws INTEGER NOT NULL,
  hits INTEGER NOT NULL
);

-- -----------------------------------------------------------------------------
-- 4.2 CRM Y COMERCIAL (5 tablas)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  tax_id TEXT NOT NULL UNIQUE,
  sector TEXT NOT NULL DEFAULT 'Alimentos y Bebidas',
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'bloqueado', 'prospecto')),
  credit_limit_usd REAL NOT NULL DEFAULT 0,
  credit_days INTEGER NOT NULL DEFAULT 30,
  is_key_account INTEGER NOT NULL DEFAULT 0 CHECK (is_key_account IN (0, 1)),
  notes TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS client_interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('llamada', 'visita', 'whatsapp', 'correo', 'reunion_planta')),
  subject TEXT NOT NULL,
  notes TEXT,
  happened_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rfq_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  tax_id TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'Planificado' CHECK (urgency IN ('Estándar', 'Planificado', 'Prioritario', 'Urgente - Parada de Planta')),
  specifications TEXT NOT NULL,
  consent_accepted INTEGER NOT NULL DEFAULT 1 CHECK (consent_accepted IN (0, 1)),
  consent_accepted_at TEXT NOT NULL DEFAULT (datetime('now')),
  source TEXT NOT NULL DEFAULT 'web_rfq',
  status TEXT NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'contactado', 'cotizado', 'ganado', 'perdido')),
  client_id INTEGER REFERENCES clients(id),
  quote_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  lead_id INTEGER REFERENCES leads(id),
  status TEXT NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador', 'enviada', 'aprobada', 'convertida', 'rechazada', 'expirada')),
  subtotal_usd REAL NOT NULL DEFAULT 0,
  tax_rate REAL NOT NULL DEFAULT 0.16,
  tax_usd REAL NOT NULL DEFAULT 0,
  total_usd REAL NOT NULL DEFAULT 0,
  cost_estimated_usd REAL NOT NULL DEFAULT 0,
  margin_usd REAL NOT NULL DEFAULT 0,
  margin_pct REAL NOT NULL DEFAULT 0,
  subtotal_ves REAL NOT NULL DEFAULT 0,
  total_ves REAL NOT NULL DEFAULT 0,
  exchange_rate REAL NOT NULL DEFAULT 54.80,
  valid_until TEXT NOT NULL,
  payment_terms TEXT NOT NULL DEFAULT '50% anticipo, 50% contra entrega',
  delivery_days INTEGER NOT NULL DEFAULT 7,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -----------------------------------------------------------------------------
-- 4.4 INVENTARIO Y COMPRAS (Materials va antes de quote_items por FK)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('acero_carbono', 'acero_aleado', 'acero_inoxidable', 'bronce_laton', 'aluminio', 'polimero_ingenieria', 'fundicion', 'herramienta_inserto', 'soldadura_gases', 'consumible')),
  unit TEXT NOT NULL DEFAULT 'barra' CHECK (unit IN ('kg', 'm', 'barra', 'placa', 'pz', 'litro', 'cilindro', 'caja')),
  stock_quantity REAL NOT NULL DEFAULT 0,
  min_stock REAL NOT NULL DEFAULT 5,
  location TEXT NOT NULL DEFAULT 'Almacén Principal',
  last_cost_usd REAL NOT NULL DEFAULT 0,
  avg_cost_usd REAL NOT NULL DEFAULT 0,
  notes TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  service_category TEXT NOT NULL DEFAULT 'Mecanizado CNC',
  material_id INTEGER REFERENCES materials(id),
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pz',
  unit_price_usd REAL NOT NULL DEFAULT 0,
  cost_material_usd REAL NOT NULL DEFAULT 0,
  cost_hours REAL NOT NULL DEFAULT 0,
  cost_machine_hours REAL NOT NULL DEFAULT 0,
  cost_labor_usd REAL NOT NULL DEFAULT 0,
  cost_total_usd REAL NOT NULL DEFAULT 0,
  line_total_usd REAL NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 1
);

-- -----------------------------------------------------------------------------
-- 4.3 PRODUCCIÓN Y TALLER (7 tablas)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS machines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('torno_cnc', 'torno_paralelo', 'fresa_bancada', 'fresa_puente', 'rectificadora', 'soldadora_tig_mig', 'prensa_hidraulica')),
  capacity TEXT NOT NULL,
  hourly_rate_usd REAL NOT NULL DEFAULT 35.0,
  status TEXT NOT NULL DEFAULT 'operativa' CHECK (status IN ('operativa', 'ocupada', 'mantenimiento', 'parada')),
  hours_used REAL NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT 'Nave Principal 600m²',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS operators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Operario Especialista',
  specialty TEXT NOT NULL CHECK (specialty IN ('tornero_cnc', 'tornero_convencional', 'fresador', 'rectificador', 'soldador_asme', 'armador_hidraulico', 'inspector_calidad')),
  hourly_cost_usd REAL NOT NULL DEFAULT 12.0,
  phone TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  quote_id INTEGER REFERENCES quotes(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  title TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'Mecanizado CNC',
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'control_calidad', 'terminada', 'entregada', 'facturada', 'cancelada')),
  priority TEXT NOT NULL DEFAULT 'estandar' CHECK (priority IN ('estandar', 'prioritaria', 'emergencia_24_48h')),
  due_date TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  estimated_revenue_usd REAL NOT NULL DEFAULT 0,
  estimated_cost_usd REAL NOT NULL DEFAULT 0,
  actual_cost_usd REAL NOT NULL DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  notes TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  quote_item_id INTEGER REFERENCES quote_items(id),
  description TEXT NOT NULL,
  material_id INTEGER REFERENCES materials(id),
  material_reserved_qty REAL NOT NULL DEFAULT 0,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pz',
  unit_price_usd REAL NOT NULL DEFAULT 0,
  cost_total_usd REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'mecanizando', 'soldando', 'rectificando', 'verificado', 'completado')),
  sort INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS work_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  machine_id INTEGER NOT NULL REFERENCES machines(id),
  operator_id INTEGER NOT NULL REFERENCES operators(id),
  started_at TEXT NOT NULL,
  ended_at TEXT,
  hours REAL NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quality_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  inspector_name TEXT NOT NULL DEFAULT 'Ing. Control de Calidad',
  tolerance_spec TEXT DEFAULT '±0.01 mm DIN/ISO',
  measured_value TEXT,
  result TEXT NOT NULL CHECK (result IN ('aprobado', 'observacion', 'rechazado_reproceso')),
  notes TEXT,
  checked_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS machine_maintenances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('preventivo', 'correctivo', 'calibracion')),
  status TEXT NOT NULL DEFAULT 'programado' CHECK (status IN ('programado', 'en_ejecucion', 'completado', 'vencido')),
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  next_due TEXT,
  cost_usd REAL NOT NULL DEFAULT 0,
  performed_by TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -----------------------------------------------------------------------------
-- 4.4 INVENTARIO Y COMPRAS (continuación: 4 tablas)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS material_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'salida_ot', 'ajuste', 'merma', 'reserva')),
  quantity REAL NOT NULL,
  unit_cost_usd REAL NOT NULL DEFAULT 0,
  reference_type TEXT CHECK (reference_type IN ('order', 'purchase', 'manual', 'initial')),
  reference_id TEXT,
  date TEXT NOT NULL DEFAULT (datetime('now')),
  user_id INTEGER REFERENCES users(id),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  tax_id TEXT NOT NULL UNIQUE,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT NOT NULL DEFAULT 'Aceros y Metales',
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  status TEXT NOT NULL DEFAULT 'emitida' CHECK (status IN ('borrador', 'emitida', 'parcial', 'recibida', 'cancelada')),
  date TEXT NOT NULL,
  expected_date TEXT,
  budgeted_usd REAL NOT NULL DEFAULT 0,
  subtotal_usd REAL NOT NULL DEFAULT 0,
  tax_usd REAL NOT NULL DEFAULT 0,
  total_usd REAL NOT NULL DEFAULT 0,
  exchange_rate REAL NOT NULL DEFAULT 54.80,
  subtotal_ves REAL NOT NULL DEFAULT 0,
  total_ves REAL NOT NULL DEFAULT 0,
  notes TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES materials(id),
  description TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'barra',
  budgeted_unit_cost_usd REAL NOT NULL DEFAULT 0,
  unit_cost_usd REAL NOT NULL DEFAULT 0,
  received_quantity REAL NOT NULL DEFAULT 0,
  total_usd REAL NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- 4.5 FINANZAS SENIAT Y TESORERÍA (5 tablas: invoices, invoice_items, credit_notes, payments, expenses)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  control_number TEXT NOT NULL UNIQUE,
  order_id INTEGER REFERENCES orders(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  buyer_tax_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('borrador', 'pendiente', 'parcial', 'pagada', 'vencida', 'anulada')),
  date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  exempt_usd REAL NOT NULL DEFAULT 0,
  subtotal_usd REAL NOT NULL DEFAULT 0,
  tax_rate REAL NOT NULL DEFAULT 0.16,
  tax_usd REAL NOT NULL DEFAULT 0,
  igtf_rate REAL NOT NULL DEFAULT 0.03,
  igtf_base_usd REAL NOT NULL DEFAULT 0,
  igtf_usd REAL NOT NULL DEFAULT 0,
  total_usd REAL NOT NULL DEFAULT 0,
  paid_amount_usd REAL NOT NULL DEFAULT 0,
  exchange_rate REAL NOT NULL DEFAULT 54.80,
  subtotal_ves REAL NOT NULL DEFAULT 0,
  tax_ves REAL NOT NULL DEFAULT 0,
  igtf_ves REAL NOT NULL DEFAULT 0,
  total_ves REAL NOT NULL DEFAULT 0,
  notes TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pz',
  unit_price_usd REAL NOT NULL DEFAULT 0,
  is_exempt INTEGER NOT NULL DEFAULT 0 CHECK (is_exempt IN (0, 1)),
  total_usd REAL NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS credit_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  control_number TEXT NOT NULL UNIQUE,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  date TEXT NOT NULL,
  reason TEXT NOT NULL,
  amount_usd REAL NOT NULL DEFAULT 0,
  tax_usd REAL NOT NULL DEFAULT 0,
  total_usd REAL NOT NULL DEFAULT 0,
  exchange_rate REAL NOT NULL DEFAULT 54.80,
  total_ves REAL NOT NULL DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  amount_usd REAL NOT NULL CHECK (amount_usd > 0),
  igtf_applied_usd REAL NOT NULL DEFAULT 0,
  amount_ves REAL NOT NULL DEFAULT 0,
  exchange_rate REAL NOT NULL DEFAULT 54.80,
  method TEXT NOT NULL CHECK (method IN ('transferencia_ves', 'pago_movil', 'efectivo_usd', 'zelle_usd', 'transferencia_usd')),
  reference TEXT NOT NULL,
  receipt_url TEXT,
  paid_at TEXT NOT NULL DEFAULT (datetime('now')),
  received_by INTEGER REFERENCES users(id),
  notes TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('materia_prima', 'nomina', 'servicios', 'alquiler', 'herramientas', 'mantenimiento', 'fletes', 'impuestos', 'seguros', 'marketing', 'otros')),
  description TEXT NOT NULL,
  budgeted_usd REAL NOT NULL DEFAULT 0,
  amount_usd REAL NOT NULL CHECK (amount_usd >= 0),
  amount_ves REAL NOT NULL DEFAULT 0,
  exchange_rate REAL NOT NULL DEFAULT 54.80,
  supplier_id INTEGER REFERENCES suppliers(id),
  order_id INTEGER REFERENCES orders(id),
  payment_method TEXT NOT NULL DEFAULT 'transferencia_ves' CHECK (payment_method IN ('transferencia_ves', 'pago_movil', 'efectivo_usd', 'zelle_usd', 'caja_chica')),
  document_ref TEXT,
  receipt_url TEXT,
  recurring INTEGER NOT NULL DEFAULT 0 CHECK (recurring IN (0, 1)),
  created_by INTEGER REFERENCES users(id),
  notes TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'quote', 'order', 'invoice', 'payment', 'expense', 'machine')),
  entity_id INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'application/pdf',
  file_url TEXT NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -----------------------------------------------------------------------------
-- ÍNDICES DE ALTO RENDIMIENTO
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_client_interactions_client ON client_interactions(client_id, happened_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_client_status ON quotes(client_id, status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_status ON orders(client_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_order ON work_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_machine ON work_logs(machine_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_operator ON work_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_material_movements_material ON material_movements(material_id, date);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_status ON purchases(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_status ON invoices(client_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id, paid_at);
CREATE INDEX IF NOT EXISTS idx_expenses_date_category ON expenses(date, category);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity, entity_id, created_at);
