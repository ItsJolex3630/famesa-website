-- =============================================================================
-- FAMESA SUITE · ESQUEMA LIMPIO DE PRODUCCIÓN PARA TURSO (famesa)
-- Archivo: Website/db/03_clean_production.sql
-- Ejecución: turso db shell famesa < Website/db/03_clean_production.sql
-- =============================================================================

PRAGMA foreign_keys = OFF;

-- 1. Vaciar todas las tablas transaccionales y de prueba
DELETE FROM attachments;
DELETE FROM audit_log;
DELETE FROM client_interactions;
DELETE FROM credit_notes;
DELETE FROM expenses;
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM leads;
DELETE FROM machine_maintenances;
DELETE FROM material_movements;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM payments;
DELETE FROM purchase_items;
DELETE FROM purchases;
DELETE FROM quality_checks;
DELETE FROM quote_items;
DELETE FROM quotes;
DELETE FROM work_logs;
DELETE FROM rate_limits;

-- 2. Vaciar clientes demo (Coca-Cola, Mondelez, Sindoni, etc.)
DELETE FROM clients;

-- 3. Resetear horas acumuladas en máquinas y dejarlas operativas
UPDATE machines SET hours_used = 0, status = 'operativa';

-- 4. Poner en 0 el stock físico de materiales (catálogo listo para recepción)
UPDATE materials SET stock_quantity = 0;

-- 5. Reiniciar correlativos de documentos en settings
UPDATE settings SET value = '1' WHERE key = 'seq_quote';
UPDATE settings SET value = '1' WHERE key = 'seq_order';
UPDATE settings SET value = '1' WHERE key = 'seq_invoice';
UPDATE settings SET value = '1001' WHERE key = 'seq_control';
UPDATE settings SET value = '1' WHERE key = 'seq_purchase';
INSERT OR REPLACE INTO settings (key, value) VALUES ('official_email', 'famesa2005@gmail.com');
INSERT OR REPLACE INTO settings (key, value) VALUES ('whatsapp_official_phone', '584143410187');

-- 6. Resetear secuencias autoincrementables
DELETE FROM sqlite_sequence WHERE name IN (
  'clients', 'leads', 'quotes', 'quote_items', 'orders',
  'order_items', 'invoices', 'invoice_items', 'payments',
  'credit_notes', 'expenses', 'purchases', 'purchase_items',
  'material_movements', 'quality_checks', 'work_logs',
  'machine_maintenances', 'client_interactions', 'audit_log'
);

PRAGMA foreign_keys = ON;

-- Fin de limpieza de base de datos
