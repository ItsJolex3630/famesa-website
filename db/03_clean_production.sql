-- =============================================================================
-- FAMESA SUITE · ESQUEMA LIMPIO DE PRODUCCIÓN (CLEAN PRODUCTION DB)
-- Directorio: Website/db/03_clean_production.sql
-- Propósito: Purgar datos de prueba y dejar la base de datos lista para
--            operación real de FAMESA C.A. (Santa Rosa, Valencia, Carabobo)
-- =============================================================================

-- Desactivar llaves foráneas temporalmente para limpieza segura
PRAGMA foreign_keys = OFF;

-- 1. Limpieza de tablas transaccionales (eliminar todos los registros de prueba)
DELETE FROM audit_log;
DELETE FROM work_logs;
DELETE FROM quality_checks;
DELETE FROM stock_movements;
DELETE FROM payments;
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM orders;
DELETE FROM quote_items;
DELETE FROM quotes;
DELETE FROM client_interactions;
DELETE FROM leads;
DELETE FROM expenses;

-- 2. Limpieza de clientes demo (mantener tabla vacía para clientes reales)
DELETE FROM clients;

-- 3. Resetear secuencias autoincrementables
DELETE FROM sqlite_sequence WHERE name IN (
  'leads', 'quotes', 'quote_items', 'orders', 'invoices',
  'invoice_items', 'payments', 'expenses', 'work_logs',
  'stock_movements', 'quality_checks', 'client_interactions',
  'audit_log', 'clients'
);

-- Reactivar llaves foráneas
PRAGMA foreign_keys = ON;

-- 4. Datos Maestros Corporativos FAMESA C.A. (Verificados del Dossier Oficial)
INSERT OR REPLACE INTO companies (
  id, name, tax_id, registry, capital_ves, address, phone, email, currency_base, timezone
) VALUES (
  1,
  'FAMESA C.A.',
  'J-31352388-7',
  'Registro Mercantil Nº 71, Tomo 44A',
  'Bs. 250.000.000,00',
  'Carmen Norte, Av. 98 Boyacá, Galpón 80-29, Santa Rosa, Valencia, Edo. Carabobo, Venezuela',
  '+58 241 897 83 02 / +58 414 341 01 87 / +58 412 143 50 69',
  'famesa2005@gmail.com',
  'USD',
  'America/Caracas'
);

-- 5. Usuario Administrador Oficial
INSERT OR REPLACE INTO users (id, email, name, role, phone, active)
VALUES (
  1,
  'famesa2005@gmail.com',
  'Dirección General FAMESA C.A.',
  'admin',
  '+58 414 341 01 87',
  1
);

-- 6. Configuración de Tasas y Correlativos de Producción
INSERT OR REPLACE INTO settings (key, value) VALUES
  ('rate_usd_ves', '54.80'),
  ('rate_source', 'BCV Oficial'),
  ('tax_rate_iva', '0.16'),
  ('tax_rate_igtf', '0.03'),
  ('monthly_revenue_goal_usd', '35000'),
  ('seq_quote', '1'),
  ('seq_order', '1'),
  ('seq_invoice', '1'),
  ('seq_control', '1001'),
  ('seq_purchase', '1'),
  ('whatsapp_official_phone', '584143410187'),
  ('official_email', 'famesa2005@gmail.com'),
  ('whatsapp_collection_template', 'Estimados {cliente}, le escribimos de FAMESA C.A. (RIF J-31352388-7) para recordar el vencimiento de la Factura {factura} por USD {monto_usd} (Bs. {monto_ves}). Agradecemos remitir comprobante de pago.');

-- 7. Catálogo Base de Materiales e Insumos FAMESA (Inventario Inicial)
INSERT OR REPLACE INTO inventory (id, name, category, stock, unit, min_stock, unit_cost_usd) VALUES
  (1, 'Acero SAE 1045 Barra Redonda', 'Acero', 0.0, 'kg', 200.0, 3.20),
  (2, 'Acero SAE 1020 Barra Redonda', 'Acero', 0.0, 'kg', 150.0, 2.80),
  (3, 'Acero Aleado 4140 Tratado Térmicamente', 'Acero', 0.0, 'kg', 100.0, 5.50),
  (4, 'Acero Inoxidable AISI 304 Barra / Tubo', 'Inoxidable', 0.0, 'kg', 80.0, 8.50),
  (5, 'Acero Inoxidable AISI 316L Calidad Sanitaria', 'Inoxidable', 0.0, 'kg', 50.0, 11.00),
  (6, 'Bronce Fosfórico SAE 64 Barra Hueca (Bocinas)', 'Bronce', 0.0, 'kg', 60.0, 16.50),
  (7, 'Bronce Fosfórico SAE 65 (Coronas de Reductor)', 'Bronce', 0.0, 'kg', 50.0, 18.00),
  (8, 'Teflón PTFE Virgen Barra', 'Plásticos', 0.0, 'kg', 30.0, 24.00),
  (9, 'Nylon 6 Poliamida Barra Maciza', 'Plásticos', 0.0, 'kg', 40.0, 9.80),
  (10, 'POM Poliacetal Delrin Barra', 'Plásticos', 0.0, 'kg', 35.0, 13.50),
  (11, 'UHMW-PE Ultraleno Plancha / Barra', 'Plásticos', 0.0, 'kg', 50.0, 15.00),
  (12, 'Poliuretano Industrial 90A Barra', 'Plásticos', 0.0, 'kg', 25.0, 17.00);

-- Fin del script limpio de producción
