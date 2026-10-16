-- =============================================================================
-- FAMESA SUITE · SEED INICIAL (Datos reales de operación FAMESA C.A. Valencia)
-- Tasa inicial de referencia: 54.80 Bs./USD
-- =============================================================================

-- 1. Empresa FAMESA C.A.
INSERT OR IGNORE INTO companies (id, name, tax_id, registry, capital_ves, address, phone, email, currency_base, timezone)
VALUES (
  1,
  'FAMESA C.A.',
  'J-31352388-7',
  'Registro Mercantil Primero del Estado Carabobo, N° 71, Tomo 44-A',
  'Bs. 500.000,00',
  'Zona Industrial Santa Rosa, Galpón Famesa (600 m²), Valencia, Edo. Carabobo, Venezuela',
  '+58 412-4090802',
  'ventas@famesa.com.ve',
  'USD',
  'America/Caracas'
);

-- 2. Usuarios y Roles (6 perfiles de prueba + dueño)
INSERT OR IGNORE INTO users (id, email, name, role, phone, active) VALUES
  (1, 'famesa2005@gmail.com', 'Joel Medina (Dueño / Director)', 'admin', '+58 412-4090802', 1),
  (2, 'gerencia@famesa.com.ve', 'Ing. Roberto Salazar (Gerente de Planta)', 'gerente', '+58 414-4112233', 1),
  (3, 'ventas@famesa.com.ve', 'Lic. Mariana Gómez (Comercial B2B)', 'ventas', '+58 412-4556677', 1),
  (4, 'taller@famesa.com.ve', 'T.S.U. Carlos Méndez (Jefe de Taller)', 'taller', '+58 424-4889900', 1),
  (5, 'almacen@famesa.com.ve', 'Pedro Castillo (Control de Materiales)', 'almacen', '+58 416-4334455', 1),
  (6, 'administracion@famesa.com.ve', 'Lcda. Elena Vargas (Contabilidad SENIAT)', 'contabilidad', '+58 414-4998877', 1);

-- 3. Ajustes y correlativos
INSERT OR REPLACE INTO settings (key, value) VALUES
  ('rate_usd_ves', '54.80'),
  ('rate_source', 'Paralelo / BCV Editable'),
  ('tax_rate_iva', '0.16'),
  ('tax_rate_igtf', '0.03'),
  ('monthly_revenue_goal_usd', '45000'),
  ('seq_quote', '109'),
  ('seq_order', '92'),
  ('seq_invoice', '415'),
  ('seq_control', '4150'),
  ('seq_purchase', '44'),
  ('whatsapp_collection_template', 'Estimados {cliente}, le escribimos de FAMESA C.A. (RIF J-31352388-7) para recordar el vencimiento de la Factura {factura} por USD {monto_usd} (Bs. {monto_ves}). Agradecemos remitir comprobante de pago.');

-- 4. Histórico de Tasas de Cambio
INSERT INTO exchange_rates (date, rate_usd_ves, source, created_by) VALUES
  ('2026-09-15', 52.10, 'BCV / Referencia', 1),
  ('2026-10-01', 53.40, 'BCV / Referencia', 1),
  ('2026-10-12', 54.80, 'Paralelo / BCV Editable', 1);

-- 5. Clientes B2B (Cuentas Clave en Carabobo y Aragua)
INSERT OR IGNORE INTO clients (id, name, tax_id, sector, contact_name, email, phone, address, status, credit_limit_usd, credit_days, is_key_account, notes) VALUES
  (1, 'Coca-Cola FEMSA de Venezuela S.A.', 'J-00012345-6', 'Alimentos y Bebidas', 'Ing. Alejandro Vegas (Gte. Mantenimiento)', 'avegas@kof.com.mx', '+58 414-4201100', 'Zona Industrial Municipal Norte, Valencia, Edo. Carabobo', 'activo', 35000, 30, 1, 'Cuenta clave. Exige certificado de calidad dimensional en ejes y rodillos.'),
  (2, 'Mondelēz Venezuela C.A.', 'J-00045891-2', 'Alimentos y Confitería', 'Ing. Patricia Luján (Compras Técnicas)', 'patricia.lujan@mdlz.com', '+58 412-4302211', 'Av. Henry Ford, Zona Industrial Sur, Valencia, Edo. Carabobo', 'activo', 25000, 30, 1, 'Alta rotación en polímeros grado alimenticio (UHMW, POM, Teflón PTFE) y acero inox 316L.'),
  (3, 'Empresas Sindoni (Nucita / Pasta Sindoni)', 'J-07501928-3', 'Alimentos', 'Ing. Marco Tulio Pérez', 'mperez@sindoni.com.ve', '+58 424-3114455', 'Zona Industrial San Vicente, Maracay, Edo. Aragua', 'activo', 20000, 15, 1, 'Fabricación recurrente de tornillos sinfín, camisas y tanques mezcladores inox.'),
  (4, 'Corimon Pinturas C.A.', 'J-00029384-1', 'Químico y Pinturas', 'Ing. Ernesto Silva (Planta)', 'esilva@corimon.com', '+58 414-4809988', 'Calle Hans Neumann, Zona Industrial El Recreo, Valencia', 'activo', 18000, 15, 1, 'Reparación de reductores de agitadores, ejes dispersores y sellos mecánicos.'),
  (5, 'Ajeven C.A. (Big Cola)', 'J-30819201-4', 'Bebidas', 'Ing. Fernando Chacón', 'fchacon@ajegroup.com', '+58 412-8901122', 'Zona Industrial Castillito, San Diego, Edo. Carabobo', 'activo', 15000, 15, 1, 'Mecanizado CNC de estrellas de llenadora, guías de UHMW y piñonería.'),
  (6, 'Cervecería Polar C.A. - Planta San Joaquín', 'J-00006372-9', 'Alimentos y Bebidas', 'Ing. Gustavo Morales', 'gustavo.morales@empresas-polar.com', '+58 414-4005566', 'Carretera Nacional Mariara - San Joaquín, Edo. Carabobo', 'activo', 40000, 30, 1, 'Estructuras inox, recuperación de rodillos y cilindros hidráulicos.');

-- 6. Interacciones CRM
INSERT INTO client_interactions (client_id, user_id, type, subject, notes, happened_at) VALUES
  (1, 2, 'visita', 'Levantamiento en línea de embotellado #3', 'Se tomaron medidas con micrómetro para eje motriz en AISI 4140 y dos rodillos tensores.', '2026-10-08T10:30:00Z'),
  (2, 3, 'whatsapp', 'Confirmación de planos para raspadores UHMW', 'Ing. Luján aprobó plano rev. B de 40 bocinas SAE 64 y guías UHMW.', '2026-10-10T14:15:00Z'),
  (4, 1, 'llamada', 'Seguimiento de pago Factura FAC-00410', 'Administración de Corimon indica pago programado para el viernes por transferencia Bs.', '2026-10-11T16:00:00Z');

-- 7. Prospectos Web (Leads RFQ)
INSERT OR IGNORE INTO leads (id, rfq_code, name, company_name, tax_id, email, phone, service_type, urgency, specifications, consent_accepted, consent_accepted_at, source, status, client_id) VALUES
  (1, 'RFQ-2026-089', 'Ing. Alejandro Vegas', 'Coca-Cola FEMSA de Venezuela S.A.', 'J-00012345-6', 'avegas@kof.com.mx', '+58 414-4201100', 'Mecanizado CNC y Rectificado', 'Urgente - Parada de Planta', 'Fabricación urgente de eje motriz escalonado Ø85mm x 1250mm en Acero AISI 4140 bonificado con chavetero y rectificado de asientos de rodamiento H7.', 1, '2026-10-12T08:15:00Z', 'web_rfq', 'nuevo', 1),
  (2, 'RFQ-2026-090', 'Ing. Héctor Domínguez', 'Alimentos Heinz C.A.', 'J-00018899-0', 'hdominguez@kraftheinz.com', '+58 412-4447788', 'Soldadura Especial Inox TIG', 'Prioritario', 'Fabricación de tolva receptora cónica en acero inoxidable AISI 316L espesor 4mm, acabado sanitario grado alimenticio, soldadura TIG purgada bajo ASME Sec. IX.', 1, '2026-10-11T19:40:00Z', 'web_rfq', 'contactado', NULL),
  (3, 'RFQ-2026-091', 'Ing. Patricia Luján', 'Mondelēz Venezuela C.A.', 'J-00045891-2', 'patricia.lujan@mdlz.com', '+58 412-4302211', 'Plásticos de Ingeniería', 'Planificado', 'Lote de 40 bocinas autolubricadas en Bronce SAE 64 y 24 guías deslizantes en UHMW-PE virgen según muestra física.', 1, '2026-10-09T11:20:00Z', 'web_rfq', 'cotizado', 2),
  (4, 'RFQ-2026-092', 'Ing. Rubén Darío Ochoa', 'Pirelli de Venezuela / Neumáticos Valencia', 'J-00031122-4', 'rochoa@neumaticosvalencia.com', '+58 424-4012233', 'Hidráulica y Reductores', 'Urgente - Parada de Planta', 'Reparación general de gato hidráulico de prensa vulcanizadora Ø220mm (bruñido de camisa, vástago cromado duro y kit de sellos Viton).', 1, '2026-10-12T13:05:00Z', 'web_rfq', 'nuevo', NULL);

-- 8. Inventario de Materiales (14 renglones reales del catálogo Famesa)
INSERT OR IGNORE INTO materials (id, code, name, category, unit, stock_quantity, min_stock, location, last_cost_usd, avg_cost_usd, notes) VALUES
  (1, 'MAT-1045-50', 'Barra Redonda Acero SAE 1045 Ø 2" (50.8mm) x 6m', 'acero_carbono', 'barra', 40, 10, 'Patio Barras · Rack A-1', 142.00, 138.50, 'Acero medio carbono para ejes y pasadores'),
  (2, 'MAT-1020-38', 'Barra Redonda Acero SAE 1020 Ø 1.5" (38.1mm) x 6m', 'acero_carbono', 'barra', 28, 8, 'Patio Barras · Rack A-2', 96.00, 94.00, 'Uso estructural y bujes generales'),
  (3, 'MAT-4140-90', 'Barra Acero Bonificado AISI 4140 Ø 3.5" (88.9mm)', 'acero_aleado', 'm', 4.5, 6.0, 'Patio Barras · Rack B-1', 185.00, 180.00, 'ALERTA: Stock bajo para ejes de alta torsión'),
  (4, 'MAT-304-PL4', 'Lámina Acero Inoxidable AISI 304 Espesor 4mm (4x8 pies)', 'acero_inoxidable', 'placa', 12, 5, 'Nave Inox · Estante C-1', 310.00, 305.00, 'Acabado 2B industrial'),
  (5, 'MAT-316L-PL4', 'Lámina Acero Inoxidable AISI 316L Espesor 4mm Grado Alimenticio', 'acero_inoxidable', 'placa', 3, 5, 'Nave Inox · Estante C-2', 445.00, 440.00, 'ALERTA: Requerido para tolvas Mondelēz y Heinz'),
  (6, 'MAT-SAE64-75', 'Barra Bronce Fosforado SAE 64 Ø 3" Bocina', 'bronce_laton', 'm', 8.0, 4.0, 'Almacén Metales Nobles · M-1', 265.00, 260.00, 'Para chumaceras y bocinas de alto impacto'),
  (7, 'MAT-ALU-6061', 'Placa Aluminio Estructural 6061-T6 Espesor 25mm', 'aluminio', 'placa', 6, 3, 'Almacén Metales Nobles · M-2', 220.00, 215.00, 'Moldes y portaherramientas'),
  (8, 'MAT-PTFE-50', 'Barra Teflón PTFE Virgen Ø 2" Grado Alimenticio', 'polimero_ingenieria', 'm', 2.0, 5.0, 'Almacén Polímeros · P-1', 115.00, 112.00, 'CRÍTICO: Solo quedan 2 metros en estante'),
  (9, 'MAT-UHMW-25', 'Placa Polietileno UHMW-PE Virgen Blanca 25mm', 'polimero_ingenieria', 'placa', 2, 4, 'Almacén Polímeros · P-2', 240.00, 235.00, 'CRÍTICO: Solo quedan 2 placas para guías de embotellado'),
  (10, 'MAT-POM-60', 'Barra POM Acetal Copolímero Negro Ø 60mm', 'polimero_ingenieria', 'm', 9.5, 4.0, 'Almacén Polímeros · P-3', 88.00, 85.00, 'Engranajes silenciosos y estrellas'),
  (11, 'MAT-NYL6-80', 'Barra Nylon 6 con Bisulfuro de Molibdeno Ø 80mm', 'polimero_ingenieria', 'm', 7.0, 3.0, 'Almacén Polímeros · P-4', 95.00, 92.00, 'Poleas y ruedas de carga'),
  (12, 'MAT-CEL-20', 'Placa Fibra Fenólica (Celerón) Mecanizable 20mm', 'polimero_ingenieria', 'placa', 5, 2, 'Almacén Polímeros · P-5', 165.00, 160.00, 'Aislantes y piñones de impacto'),
  (13, 'MAT-INS-CNMG', 'Caja Insertos Carburo Tugsteno CNMG 120408 Sandvik (10 pz)', 'herramienta_inserto', 'caja', 3, 6, 'Pañol de Herramientas · H-1', 98.00, 95.00, 'ALERTA: Reponer insertos de desbaste para Torno CNC'),
  (14, 'MAT-GAS-ARG', 'Cilindro Gas Argón Ultra Puro 99.99% (6 m³)', 'soldadura_gases', 'cilindro', 2, 4, 'Jaula de Gases · G-1', 68.00, 65.00, 'ALERTA: Quedan 2 cilindros para estación TIG');

-- 9. Proveedores Industriales Reales
INSERT OR IGNORE INTO suppliers (id, name, tax_id, contact_name, email, phone, address, category, status) VALUES
  (1, 'Sumindu C.A. (Suministros Industriales)', 'J-30112233-4', 'Lic. Carlos Quintero', 'ventas@sumindu.com.ve', '+58 414-4109090', 'Av. Michelena, Valencia, Edo. Carabobo', 'Polímeros y Sellos', 'activo'),
  (2, 'Ferrum Aceros C.A.', 'J-00019283-7', 'Ing. Otto Hoffmann', 'ventas.valencia@ferrum.com.ve', '+58 241-8324455', 'Zona Industrial Municipal Norte, Valencia', 'Aceros Especiales 1045 / 4140', 'activo'),
  (3, 'Inoxtotalven C.A.', 'J-40129384-5', 'Sr. Gianni Russo', 'cotizaciones@inoxtotalven.com', '+58 412-4023344', 'Zona Industrial Los Guayos, Carabobo', 'Acero Inoxidable 304 / 316L', 'activo'),
  (4, 'Hierrocor C.A.', 'J-30495867-1', 'Sr. Miguel Ángel Torres', 'despacho@hierrocor.com', '+58 424-4556611', 'Autopista Regional del Centro, Guacara', 'Hierro Estructural y Barras 1020', 'activo'),
  (5, 'Filotor C.A.', 'J-31209876-2', 'T.S.U. José Luis Pineda', 'tecnico@filotor.com.ve', '+58 414-4338899', 'Urb. Industrial Carabobo, Valencia', 'Herramientas de Corte e Insertos CNC', 'activo'),
  (6, 'Suministros JL C.A.', 'J-40556677-8', 'Sr. Jorge Luis Blanco', 'suministrosjl@gmail.com', '+58 412-8807766', 'Santa Rosa, Valencia', 'Bronce SAE 64, Abrasivos y Gases', 'activo'),
  (7, 'Industrial Supply Valencia C.A.', 'J-40998811-0', 'Ing. Adriana Márquez', 'info@industrialsupply.com.ve', '+58 414-4901234', 'San Diego, Edo. Carabobo', 'Rodamientos, Sellos Hidráulicos y Electrodos', 'activo');

-- 10. Máquinas de la Planta (600 m² en Santa Rosa)
INSERT OR IGNORE INTO machines (id, code, name, type, capacity, hourly_rate_usd, status, hours_used, location, notes) VALUES
  (1, 'CNC-01', 'Torno CNC Haas ST-30', 'torno_cnc', 'Volteo Ø533mm × 660mm · Tolerancia ±0.005mm', 55.00, 'ocupada', 1420.5, 'Bahía CNC · Nave A', 'Mecanizando lote de bocinas SAE 64 para OT-0089 (Mondelēz)'),
  (2, 'TOR-01', 'Torno Paralelo Pinacho SP-250 (2 metros)', 'torno_paralelo', 'Volteo Ø500mm × 2000mm entre puntos', 32.00, 'ocupada', 2840.0, 'Bahía Tornería · Nave A', 'Torneando eje impulsor para OT-0090 (Sindoni)'),
  (3, 'TOR-02', 'Torno Paralelo Pesado Geminis (4 metros)', 'torno_paralelo', 'Volteo Ø1000mm × 4000mm · Camisa pesada', 45.00, 'operativa', 1950.0, 'Bahía Pesada · Nave B', 'Disponible para rodillos de gran envergadura'),
  (4, 'FRE-01', 'Fresadora Universal de Bancada Correa', 'fresa_bancada', 'Mesa 1400×400mm · Cabezal divisor para engranajes', 38.00, 'operativa', 1610.0, 'Bahía Fresado · Nave A', 'Lista para tallado de chaveteros y piñonería'),
  (5, 'FRE-02', 'Fresadora Puente CNC Gran Formato', 'fresa_puente', '2500×1200×900mm · Estructuras y placas base', 65.00, 'mantenimiento', 1180.0, 'Bahía Pesada · Nave B', 'Mantenimiento preventivo programado: calibración de husillo y lubricación de guías'),
  (6, 'REC-01', 'Rectificadora Cilíndrica y Plana Universal', 'rectificadora', 'Ø400mm × 2000mm · Acabado espejo Ra 0.2 µm', 48.00, 'ocupada', 1530.0, 'Sala de Metrología y Rectificado', 'Rectificando rodillo laminador OT-0088 (Coca-Cola FEMSA)'),
  (7, 'SOL-01', 'Estación Soldadura TIG/MIG Miller Dynasty ASME Sec. IX', 'soldadora_tig_mig', '350A AC/DC · Inox 304/316L, Aluminio y Aleaciones', 40.00, 'operativa', 980.0, 'Área de Calderería Inox · Nave C', 'Equipada con purga de argón y mesa rotativa');

-- 11. Mantenimientos de Máquinas
INSERT INTO machine_maintenances (machine_id, type, status, description, date, next_due, cost_usd, performed_by, notes) VALUES
  (5, 'preventivo', 'en_ejecucion', 'Cambio de aceite hidráulico ISO VG 68, limpieza de encoders y verificación de backlash en ejes X/Y', '2026-10-12', '2027-01-12', 420.00, 'Ing. Roberto Salazar + Técnico CNC', 'En ejecución hoy; máquina vuelve a estar operativa a las 17:00h.'),
  (1, 'preventivo', 'programado', 'Reemplazo de refrigerante soluble sintético, filtros de torreta y alineación de contrapunto', '2026-10-20', '2027-01-20', 280.00, 'T.S.U. Carlos Méndez', 'Alerta: vence en 8 días.'),
  (6, 'calibracion', 'completado', 'Balanceo dinámico de muela abrasiva y verificación con reloj comparador Mitutoyo 0.001mm', '2026-09-28', '2026-12-28', 190.00, 'Luis Padrón', 'Certificado interno de precisión OK.');

-- 12. Personal / Operarios de Planta
INSERT OR IGNORE INTO operators (id, code, name, role, specialty, hourly_cost_usd, phone, active) VALUES
  (1, 'OP-01', 'T.S.U. Carlos Méndez', 'Maestro Tornero CNC', 'tornero_cnc', 16.50, '+58 424-4889900', 1),
  (2, 'OP-02', 'José Gregorio Rivas', 'Soldador Especialista ASME Sec. IX', 'soldador_asme', 15.00, '+58 412-4661122', 1),
  (3, 'OP-03', 'Luis Padrón', 'Maestro Rectificador y Metrología', 'rectificador', 15.50, '+58 414-4773344', 1),
  (4, 'OP-04', 'Miguel Bolívar', 'Operador Fresadora y Piñonería', 'fresador', 13.50, '+58 416-4229988', 1),
  (5, 'OP-05', 'Ramón Arteaga', 'Tornero Paralelo Pesado', 'tornero_convencional', 13.00, '+58 424-4331100', 1),
  (6, 'OP-06', 'Wilmer Castellanos', 'Técnico Hidráulico y Reductores', 'armador_hidraulico', 14.00, '+58 412-4990011', 1);

-- 13. Cotizaciones (con cálculo de costos y márgenes por línea)
INSERT OR IGNORE INTO quotes (id, code, client_id, lead_id, status, subtotal_usd, tax_rate, tax_usd, total_usd, cost_estimated_usd, margin_usd, margin_pct, subtotal_ves, total_ves, exchange_rate, valid_until, payment_terms, delivery_days, notes, created_by, created_at) VALUES
  (1, 'COT-0105', 1, NULL, 'convertida', 8400.00, 0.16, 1344.00, 9744.00, 4620.00, 3780.00, 45.0, 448560.00, 520329.60, 53.40, '2026-10-15', '50% anticipo, 50% contra entrega', 6, 'Fabricación y rectificado de 2 rodillos tensores en SAE 1045 y eje inoxidable.', 1, '2026-10-01T10:00:00Z'),
  (2, 'COT-0106', 2, 3, 'convertida', 6200.00, 0.16, 992.00, 7192.00, 3596.00, 2604.00, 42.0, 331080.00, 384052.80, 53.40, '2026-10-20', 'Crédito 30 días OC Mondelēz', 8, 'Lote de 40 bocinas en Bronce SAE 64 y 24 guías UHMW-PE.', 3, '2026-10-04T14:20:00Z'),
  (3, 'COT-0107', 3, NULL, 'aprobada', 9500.00, 0.16, 1520.00, 11020.00, 5795.00, 3705.00, 39.0, 520600.00, 603896.00, 54.80, '2026-10-25', '50% anticipo, 50% despacho', 12, 'Tanque mezclador chaqueteado 800L en Acero Inoxidable AISI 304 soldadura TIG.', 1, '2026-10-09T09:30:00Z'),
  (4, 'COT-0108', 4, NULL, 'enviada', 3850.00, 0.16, 616.00, 4466.00, 2387.00, 1463.00, 38.0, 210980.00, 244736.80, 54.80, '2026-10-26', 'Contado contra entrega', 5, 'Overhaul de reductor Falk 75HP: rectificado de ejes, cambio de rodamientos y piñón de ataque en AISI 4140.', 3, '2026-10-11T11:00:00Z');

INSERT INTO quote_items (quote_id, description, service_category, material_id, quantity, unit, unit_price_usd, cost_material_usd, cost_hours, cost_machine_hours, cost_labor_usd, cost_total_usd, line_total_usd, sort) VALUES
  (1, 'Rectificado cilíndrico y encamisado de Rodillos Tensores Ø220x1400mm', 'Rectificado de Precisión', 1, 2, 'pz', 3200.00, 1100.00, 28, 1344.00, 434.00, 2878.00, 6400.00, 1),
  (1, 'Eje conducido en Acero Inox AISI 304 con asientos H7', 'Mecanizado CNC', 4, 2, 'pz', 1000.00, 620.00, 16, 880.00, 242.00, 1742.00, 2000.00, 2),
  (2, 'Mecanizado CNC de Bocinas Autolubricadas Bronce SAE 64 Ø75x90mm', 'Mecanizado CNC', 6, 40, 'pz', 95.00, 1040.00, 18, 990.00, 297.00, 2327.00, 3800.00, 1),
  (2, 'Fresado de Guías Deslizantes en UHMW-PE Virgen 25mm', 'Plásticos de Ingeniería', 9, 24, 'pz', 100.00, 705.00, 10, 380.00, 184.00, 1269.00, 2400.00, 2),
  (3, 'Fabricación de Tanque Mezclador Inox AISI 304 800L con chaqueta y agitador TIG', 'Soldadura Especial Inox', 4, 1, 'pz', 9500.00, 3050.00, 50, 2000.00, 745.00, 5795.00, 9500.00, 1),
  (4, 'Reconstrucción de Reductor Falk 75HP y fabricación de eje piñón en AISI 4140', 'Hidráulica y Reductores', 3, 1, 'pz', 3850.00, 980.00, 24, 1050.00, 357.00, 2387.00, 3850.00, 1);

-- 14. Órdenes de Trabajo (OTs: terminadas, en proceso, emergencia, incluyendo 1 con sobrecosto para análisis)
INSERT OR IGNORE INTO orders (id, code, quote_id, client_id, title, service_type, status, priority, due_date, started_at, finished_at, estimated_revenue_usd, estimated_cost_usd, actual_cost_usd, created_by, notes) VALUES
  (1, 'OT-0087', NULL, 6, 'Recuperación de 2 Cilindros Hidráulicos de Empacadora y Ejes SAE 1045', 'Hidráulica y Reductores', 'facturada', 'prioritaria', '2026-10-05', '2026-10-01T08:00:00Z', '2026-10-05T16:30:00Z', 7800.00, 4200.00, 4050.00, 1, 'Trabajo altamente rentable (+48.1% margen real). Entregado a tiempo en Planta San Joaquín.'),
  (2, 'OT-0088', 1, 1, 'Rectificado de 2 Rodillos Tensores Ø220x1400mm y Ejes Inox', 'Rectificado de Precisión', 'control_calidad', 'emergencia_24_48h', '2026-10-13', '2026-10-08T07:30:00Z', NULL, 8400.00, 4620.00, 4490.00, 1, 'En etapa final de inspección micrométrica en REC-01.'),
  (3, 'OT-0089', 2, 2, 'Lote 40 Bocinas Bronce SAE 64 + 24 Guías UHMW-PE', 'Mecanizado CNC', 'en_proceso', 'prioritaria', '2026-10-16', '2026-10-09T08:00:00Z', NULL, 6200.00, 3596.00, 2850.00, 2, '32 de 40 bocinas ya mecanizadas en CNC-01.'),
  (4, 'OT-0090', NULL, 3, 'Tornillo Sinfín Transportador Inox 304 L=3.2m (Reproceso por cambio de paso)', 'Soldadura Especial Inox', 'terminada', 'estandar', '2026-10-10', '2026-10-02T08:00:00Z', '2026-10-10T18:00:00Z', 4200.00, 2900.00, 4580.00, 2, 'ALERTA RENTABILIDAD: Dio pérdida (-$380 USD / -9.0%) por horas extra de soldadura TIG y merma de lámina inox.'),
  (5, 'OT-0091', 3, 3, 'Tanque Mezclador Inox AISI 304 de 800 Litros Chaqueteado', 'Soldadura Especial Inox', 'pendiente', 'prioritaria', '2026-10-24', NULL, NULL, 9500.00, 5795.00, 0.00, 1, 'Pendiente por iniciar corte de láminas y rolado en Nave C.');

INSERT INTO order_items (order_id, quote_item_id, description, material_id, material_reserved_qty, quantity, unit, unit_price_usd, cost_total_usd, status, sort) VALUES
  (1, NULL, 'Bruñido de camisa, vástago SAE 1045 cromado y sellos', 1, 2, 2, 'pz', 3900.00, 4050.00, 'completado', 1),
  (2, 1, 'Rectificado cilíndrico Rodillos Tensores Ø220x1400mm', 1, 2, 2, 'pz', 3200.00, 2810.00, 'verificado', 1),
  (2, 2, 'Eje conducido Acero Inox AISI 304 H7', 4, 1, 2, 'pz', 1000.00, 1680.00, 'completado', 2),
  (3, 3, 'Bocinas Autolubricadas Bronce SAE 64 Ø75x90mm', 6, 4, 40, 'pz', 95.00, 1950.00, 'mecanizando', 1),
  (3, 4, 'Guías Deslizantes UHMW-PE Virgen 25mm', 9, 2, 24, 'pz', 100.00, 900.00, 'pendiente', 2),
  (4, NULL, 'Tornillo Sinfín Inox 304 paso helicoidal 120mm', 4, 3, 1, 'pz', 4200.00, 4580.00, 'completado', 1);

-- 15. Registro de Horas Hombre / Máquina (work_logs)
INSERT INTO work_logs (order_id, machine_id, operator_id, started_at, ended_at, hours, cost_usd, description) VALUES
  (1, 3, 5, '2026-10-02T08:00:00Z', '2026-10-03T17:00:00Z', 16.0, 928.00, 'Torneado de vástagos y tapas de cilindros en torno pesado'),
  (2, 6, 3, '2026-10-09T08:00:00Z', '2026-10-12T12:00:00Z', 24.0, 1524.00, 'Rectificado cilíndrico de precisión a tolerancia ISO H7'),
  (3, 1, 1, '2026-10-10T08:00:00Z', '2026-10-12T16:00:00Z', 18.0, 1287.00, 'Ciclo CNC de desbaste y acabado interno/externo de bocinas SAE 64'),
  (4, 7, 2, '2026-10-04T08:00:00Z', '2026-10-09T18:00:00Z', 42.0, 2310.00, 'Soldadura continua TIG de álabes helicoidales y corrección de alabeo térmico');

-- 16. Controles de Calidad
INSERT INTO quality_checks (order_id, user_id, inspector_name, tolerance_spec, measured_value, result, notes, checked_at) VALUES
  (1, 2, 'Ing. Roberto Salazar', 'Prueba hidrostática 250 bar · Ø80.00 ±0.01mm', '250 bar sin caída · Ø80.004mm', 'aprobado', 'Cero fugas durante 60 min de presión sostenida.', '2026-10-05T15:00:00Z'),
  (2, 2, 'Luis Padrón', 'Concentricidad ≤ 0.008mm · Rugosidad Ra 0.2µm', '0.005mm · Ra 0.18µm', 'aprobado', 'Rodillo #1 aprobado. Rodillo #2 en pase final.', '2026-10-12T11:30:00Z'),
  (4, 2, 'Ing. Roberto Salazar', 'Flecha máxima axial ≤ 1.5mm en 3200mm', '3.8mm (1ra inspección) -> 1.1mm (tras enderezado)', 'observacion', 'Requirió enderezado en prensa y horas extra, impactando margen de la OT.', '2026-10-10T16:00:00Z');

-- 17. Movimientos de Inventario (Kardex)
INSERT INTO material_movements (material_id, type, quantity, unit_cost_usd, reference_type, reference_id, date, user_id, notes) VALUES
  (1, 'entrada', 50, 138.50, 'purchase', 'COM-0040', '2026-09-25T10:00:00Z', 5, 'Recepción lote barras SAE 1045 Ferrum Aceros'),
  (1, 'salida_ot', 10, 138.50, 'order', 'OT-0087', '2026-10-01T09:00:00Z', 5, 'Despacho a nave pesada para vástagos y ejes'),
  (6, 'salida_ot', 4, 260.00, 'order', 'OT-0089', '2026-10-09T08:30:00Z', 5, 'Corte de barras Bronce SAE 64 para lote Mondelēz'),
  (4, 'merma', 1, 305.00, 'order', 'OT-0090', '2026-10-06T15:00:00Z', 4, 'Recorte deformado en desarrollo de hélice de tornillo sinfín');

-- 18. Órdenes de Compra a Proveedores
INSERT OR IGNORE INTO purchases (id, code, supplier_id, status, date, expected_date, budgeted_usd, subtotal_usd, tax_usd, total_usd, exchange_rate, subtotal_ves, total_ves, notes) VALUES
  (1, 'COM-0041', 2, 'recibida', '2026-10-02', '2026-10-04', 2800.00, 2770.00, 443.20, 3213.20, 53.40, 147918.00, 171584.88, 'Compra de barras SAE 1045 y AISI 4140 dentro de presupuesto.'),
  (2, 'COM-0042', 3, 'parcial', '2026-10-08', '2026-10-14', 3100.00, 3320.00, 531.20, 3851.20, 54.80, 181936.00, 211045.76, 'Láminas Inox 304 y 316L para tanque Sindoni. Ligero incremento en flete.'),
  (3, 'COM-0043', 1, 'emitida', '2026-10-12', '2026-10-15', 1450.00, 1430.00, 228.80, 1658.80, 54.80, 78364.00, 90902.24, 'Reposición urgente de placas UHMW-PE y barras de Teflón PTFE.');

INSERT INTO purchase_items (purchase_id, material_id, description, quantity, unit, budgeted_unit_cost_usd, unit_cost_usd, received_quantity, total_usd) VALUES
  (1, 1, 'Barra Redonda Acero SAE 1045 Ø 2" x 6m', 20, 'barra', 140.00, 138.50, 20, 2770.00),
  (2, 4, 'Lámina Acero Inoxidable AISI 304 4mm', 6, 'placa', 300.00, 308.00, 4, 1848.00),
  (2, 5, 'Lámina Acero Inoxidable AISI 316L 4mm', 3, 'placa', 430.00, 490.67, 1, 1472.00),
  (3, 9, 'Placa UHMW-PE Virgen Blanca 25mm', 4, 'placa', 240.00, 235.00, 0, 940.00),
  (3, 8, 'Barra Teflón PTFE Virgen Ø 2"', 4, 'm', 125.00, 122.50, 0, 490.00);

-- 19. Facturas Fiscales SENIAT (Pagadas, Parciales, Por Vencer y Vencidas con Aging 0-30 / 31-60 / 61-90 / +90)
INSERT OR IGNORE INTO invoices (id, code, control_number, order_id, client_id, buyer_tax_id, buyer_name, buyer_address, status, date, due_date, exempt_usd, subtotal_usd, tax_rate, tax_usd, igtf_rate, igtf_base_usd, igtf_usd, total_usd, paid_amount_usd, exchange_rate, subtotal_ves, tax_ves, igtf_ves, total_ves, notes) VALUES
  (1, 'FAC-00409', '00-004090', NULL, 5, 'J-30819201-4', 'Ajeven C.A.', 'Zona Industrial Castillito, San Diego, Edo. Carabobo', 'vencida', '2026-07-05', '2026-07-20', 0, 4200.00, 0.16, 672.00, 0.03, 0, 0, 4872.00, 1500.00, 51.20, 215040.00, 34406.40, 0, 249446.40, 'Saldo pendiente $3,372.00 (+90 días de antigüedad). Reclamar cobro inmediato.'),
  (2, 'FAC-00410', '00-004100', NULL, 4, 'J-00029384-1', 'Corimon Pinturas C.A.', 'Calle Hans Neumann, Zona Industrial El Recreo, Valencia', 'vencida', '2026-08-18', '2026-09-02', 0, 5600.00, 0.16, 896.00, 0.03, 0, 0, 6496.00, 0.00, 52.10, 291760.00, 46681.60, 0, 338441.60, 'Vencida tramo 31-60 días. Promesa de pago esta semana.'),
  (3, 'FAC-00411', '00-004110', 1, 6, 'J-00006372-9', 'Cervecería Polar C.A.', 'Carretera Nacional Mariara - San Joaquín, Edo. Carabobo', 'pagada', '2026-10-05', '2026-11-04', 0, 7800.00, 0.16, 1248.00, 0.03, 5000.00, 150.00, 9198.00, 9198.00, 53.40, 416520.00, 66643.20, 8010.00, 491173.20, 'Pagada con Zelle USD ($5,000 + IGTF 3%) y Transferencia Bs. al BCV.'),
  (4, 'FAC-00412', '00-004120', 2, 1, 'J-00012345-6', 'Coca-Cola FEMSA de Venezuela S.A.', 'Zona Industrial Municipal Norte, Valencia, Edo. Carabobo', 'parcial', '2026-10-08', '2026-11-07', 0, 8400.00, 0.16, 1344.00, 0.03, 0, 0, 9744.00, 4872.00, 54.80, 460320.00, 73651.20, 0, 533971.20, 'Anticipo 50% recibido ($4,872.00). Restante 50% por cobrar contra entrega (0-30 días).'),
  (5, 'FAC-00413', '00-004130', 3, 2, 'J-00045891-2', 'Mondelēz Venezuela C.A.', 'Av. Henry Ford, Zona Industrial Sur, Valencia, Edo. Carabobo', 'pendiente', '2026-10-10', '2026-11-09', 0, 6200.00, 0.16, 992.00, 0.03, 0, 0, 7192.00, 0.00, 54.80, 339760.00, 54361.60, 0, 394121.60, 'Factura emitida bajo Orden de Compra Mondelēz (crédito 30 días, vigente 0-30 días).'),
  (6, 'FAC-00414', '00-004140', 4, 3, 'J-07501928-3', 'Empresas Sindoni', 'Zona Industrial San Vicente, Maracay, Edo. Aragua', 'vencida', '2026-09-20', '2026-10-05', 0, 4200.00, 0.16, 672.00, 0.03, 2000.00, 60.00, 4932.00, 2060.00, 53.40, 224280.00, 35884.80, 3204.00, 263368.80, 'Saldo pendiente $2,872.00 vencido hace 7 días (tramo 0-30 días).');

INSERT INTO invoice_items (invoice_id, description, quantity, unit, unit_price_usd, is_exempt, total_usd, sort) VALUES
  (1, 'Fabricación de estrellas de llenadora en POM Acetal y piñones en acero 1045', 1, 'lote', 4200.00, 0, 4200.00, 1),
  (2, 'Recuperación de eje dispersor inox 316 y alojamiento de rodamientos', 1, 'servicio', 5600.00, 0, 5600.00, 1),
  (3, 'Recuperación integral de 2 Cilindros Hidráulicos de Empacadora (OT-0087)', 2, 'pz', 3900.00, 0, 7800.00, 1),
  (4, 'Rectificado cilíndrico de 2 Rodillos Tensores Ø220x1400mm y Ejes Inox (OT-0088)', 1, 'lote', 8400.00, 0, 8400.00, 1),
  (5, 'Lote 40 Bocinas Bronce SAE 64 + 24 Guías UHMW-PE (OT-0089)', 1, 'lote', 6200.00, 0, 6200.00, 1),
  (6, 'Fabricación de Tornillo Sinfín Transportador Inox 304 L=3.2m (OT-0090)', 1, 'pz', 4200.00, 0, 4200.00, 1);

-- 20. Pagos Recibidos (con comprobantes y métodos venezolanos)
INSERT OR IGNORE INTO payments (id, code, invoice_id, client_id, amount_usd, igtf_applied_usd, amount_ves, exchange_rate, method, reference, paid_at, received_by, notes) VALUES
  (1, 'PAG-00301', 1, 5, 1500.00, 0, 76800.00, 51.20, 'transferencia_ves', 'Banesco #99812340', '2026-08-01T14:00:00Z', 6, 'Abono parcial recibido en cuenta corriente Banesco.'),
  (2, 'PAG-00302', 3, 6, 5150.00, 150.00, 275010.00, 53.40, 'zelle_usd', 'Zelle Conf #8829104A', '2026-10-06T11:20:00Z', 1, 'Pago en divisas Zelle ($5,000 base + $150 IGTF 3%).'),
  (3, 'PAG-00303', 3, 6, 4048.00, 0, 216163.20, 53.40, 'transferencia_ves', 'Mercantil #44510928', '2026-10-06T15:45:00Z', 6, 'Complemento en Bolívares para cancelar totalidad de FAC-00411.'),
  (4, 'PAG-00304', 4, 1, 4872.00, 0, 266985.60, 54.80, 'transferencia_ves', 'Provincial #77123901', '2026-10-08T16:10:00Z', 6, 'Anticipo 50% de Coca-Cola FEMSA según Orden de Servicio.'),
  (5, 'PAG-00305', 6, 3, 2060.00, 60.00, 110004.00, 53.40, 'efectivo_usd', 'Recibo Caja #0094', '2026-09-21T10:00:00Z', 1, 'Anticipo en efectivo USD ($2,000 + $60 IGTF 3%).');

-- 21. Notas de Crédito
INSERT OR IGNORE INTO credit_notes (id, code, control_number, invoice_id, client_id, date, reason, amount_usd, tax_usd, total_usd, exchange_rate, total_ves, created_by) VALUES
  (1, 'NC-00018', '00-004125', 1, 5, '2026-08-10', 'Descuento técnico acordado por ajuste en diámetro exterior de guía', 200.00, 32.00, 232.00, 51.20, 11878.40, 6);

-- 22. Gastos Operativos de Planta (con presupuesto vs real)
INSERT OR IGNORE INTO expenses (id, code, date, category, description, budgeted_usd, amount_usd, amount_ves, exchange_rate, supplier_id, order_id, payment_method, document_ref, recurring, created_by, notes) VALUES
  (1, 'GAS-00201', '2026-10-01', 'alquiler', 'Condominio Industrial y Vigilancia Galpón 600m² Santa Rosa', 650.00, 650.00, 34710.00, 53.40, NULL, NULL, 'transferencia_ves', 'REC-COND-1026', 1, 6, 'Gasto fijo mensual de planta'),
  (2, 'GAS-00202', '2026-10-03', 'materia_prima', 'Compra lote Barras SAE 1045 y AISI 4140 (Ferrum Aceros)', 3250.00, 3213.20, 171584.88, 53.40, 2, 2, 'transferencia_ves', 'FAC-FERRUM-8821', 0, 6, 'Asociado a COM-0041'),
  (3, 'GAS-00203', '2026-10-05', 'nomina', 'Nómina Quincenal Operarios de Planta (6 especialistas + bonos producción)', 4200.00, 4180.00, 223212.00, 53.40, NULL, NULL, 'pago_movil', 'NOM-2026-10-Q1', 1, 1, 'Incluye horas extra de soldadura y rectificado'),
  (4, 'GAS-00204', '2026-10-07', 'servicios', 'Corpoelec Tarifa Industrial Alta Demanda + Internet Fibra + Agua', 480.00, 510.00, 27948.00, 54.80, NULL, NULL, 'transferencia_ves', 'CORP-99102', 1, 6, 'Ligero incremento por uso continuo de hornos y soldadoras'),
  (5, 'GAS-00205', '2026-10-09', 'herramientas', 'Insertos Sandvik CNMG, fresas de carburo y piedras de rectificado (Filotor)', 850.00, 890.00, 48772.00, 54.80, 5, 3, 'zelle_usd', 'FAC-FIL-1104', 0, 4, 'Reposición para Torno CNC Haas y Rectificadora'),
  (6, 'GAS-00206', '2026-10-11', 'mantenimiento', 'Aceite hidráulico ISO VG 68 y repuestos Fresadora Puente FRE-02', 400.00, 420.00, 23016.00, 54.80, 7, NULL, 'efectivo_usd', 'FAC-ISV-0392', 0, 2, 'Mantenimiento preventivo trimestral'),
  (7, 'GAS-00207', '2026-10-12', 'impuestos', 'Declaración Quincenal IVA SENIAT + Patente Industria y Comercio Valencia', 1200.00, 1185.00, 64938.00, 54.80, NULL, NULL, 'transferencia_ves', 'SENIAT-9920184', 1, 6, 'Cumplimiento fiscal al día');

-- 23. Bitácora de Auditoría (audit_log)
INSERT INTO audit_log (user_id, user_email, entity, entity_id, action, details, created_at) VALUES
  (1, 'famesa2005@gmail.com', 'exchange_rates', '3', 'update', 'Actualizó tasa del día a 54.80 Bs./USD (Paralelo / BCV Editable)', '2026-10-12T08:00:00Z'),
  (3, 'ventas@famesa.com.ve', 'quotes', 'COT-0108', 'create', 'Creó cotización COT-0108 para Corimon Pinturas C.A. por USD 4,466.00 (Margen 38.0%)', '2026-10-11T11:00:00Z'),
  (6, 'administracion@famesa.com.ve', 'payments', 'PAG-00304', 'create', 'Registró anticipo 50% de Coca-Cola FEMSA en FAC-00412 por USD 4,872.00 (Bs. 266,985.60)', '2026-10-08T16:10:00Z'),
  (4, 'taller@famesa.com.ve', 'orders', 'OT-0088', 'status_change', 'Cambió estado de OT-0088 a control_calidad en Rectificadora REC-01', '2026-10-12T11:30:00Z');
