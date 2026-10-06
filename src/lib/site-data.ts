import type {
  GalleryItem,
  MaterialRow,
  QualityPillar,
  ServiceItem,
} from "@/types";

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  mecanizado_cnc: "Mecanizado CNC de precisión",
  torneria_convencional: "Tornería y fresa pesada",
  soldadura_especial: "Soldaduras especiales ASME/AWS",
  plasticos_ingenieria: "Plásticos de ingeniería",
  reparacion_reductores: "Reparación de reductores",
  fabricacion_engranajes: "Fabricación de rodillos y engranajes",
  otro: "Otro requerimiento técnico",
};

export const URGENCY_LABELS: Record<string, string> = {
  estandar: "Estándar (Planificado)",
  prioridad: "Prioritario (5-7 días)",
  emergencia_parada: "Parada de Emergencia (24-48 hrs)",
};

export const SERVICES: ServiceItem[] = [
  {
    code: "LÍNEA 01 // MECANIZADO",
    title: "Mecanizado CNC y Tornería Pesada",
    icon: "lathe",
    capabilityLabel: "Capacidad de taller",
    capability:
      "Volteo hasta 1.500 mm sobre bancada y longitud entre puntos hasta 4.000 mm, con control de concentricidad para mecanizados deViraje pesado.",
    processes: [
      "Torno CNC 2 ejes",
      "Torno paralelo convencional",
      "Fresa de bancada y puente",
      "Rectificado de superficie y espinales",
    ],
    applications: [
      "Ejes motrices y semiejes",
      "Bujes y camisas de deslizamiento",
      "Bridas de alta presión",
      "Rodillos de transporte y tracción",
    ],
    footerNote: "Tolerancia dimensional de proceso: ±0.01 mm",
  },
  {
    code: "LÍNEA 02 // SOLDADURA",
    title: "Soldaduras Especiales & Recuperación de Piezas",
    icon: "flame",
    capabilityLabel: "Procesos calificados",
    capability:
      "Procedimientos calificados bajo ASME Sección IX y AWS D1.1, con control de interpas y registro de cada cordón de unión.",
    processes: [
      "GTAW (TIG)",
      "GMAW (MIG/MAG)",
      "SMAW (Arco Revestido)",
      "Recubrimiento duro antidesgaste",
    ],
    applications: [
      "Aceros al carbono",
      "Inoxidables serie 300 / 400",
      "Fundición gris y nodular",
      "Recuperación de ejes y carcasa",
    ],
    footerNote: "Ensayo por líquidos penetrantes (PT) en cada unión",
  },
  {
    code: "LÍNEA 03 // POLÍMEROS",
    title: "Plásticos de Ingeniería de Alto Desempeño",
    icon: "shapes",
    capabilityLabel: "Polímeros mecanizables",
    capability:
      "Torneado y fresado CNC de termoplécnicos técnicos con control de holgura dimensional y acabado limpio sin rebabas.",
    processes: [
      "Teflón PTFE (virgen, grafito y bronce)",
      "Nylon 6 fundido (poliamida)",
      "POM / Poliacetal (Delrin)",
      "UHMW (polietileno de ultra alto peso molecular)",
    ],
    applications: [
      "Sellos mecánicos y empaquetaduras",
      "Guías, ruedas y rodillos silenciosos",
      "Asientos de válvulas y aislantes",
      "Industria química, alimentaria y eléctrica",
    ],
    footerNote: "Alta resistencia química y bajo coeficiente de fricción",
  },
  {
    code: "LÍNEA 04 // REDUCTORES",
    title: "Mantenimiento y Reconstrucción de Reductores",
    icon: "settings",
    capabilityLabel: "Alcance de intervención",
    capability:
      "Diagnóstico y reconstrucción de cajas de engranajes en planta y taller, con alineación verificada y rectificado de asientos.",
    processes: [
      "Cajas planetarias y helicoidales",
      "Corona y sinfín",
      "Cambio de rodamientos y sellos",
      "Rectificado de asientos de cajas",
    ],
    applications: [
      "Comparador de carátula milesimal",
      "Ajuste de holgura de flanco",
      "Reconstrucción de carcasa",
      "Servicio de emergencia 24/7",
    ],
    footerNote: "Alineación final con comparador certificado",
  },
  {
    code: "LÍNEA 05 // RODILLOS",
    title: "Fabricación de Rodillos Industriales",
    icon: "circle-dashed",
    capabilityLabel: "Tipos de rodillo",
    capability:
      "Construcción y rectificado de rodillos de gran porte con balanceo estático y dinámico antes de la entrega.",
    processes: [
      "Rodillos transportadores",
      "Rodillos de tracción",
      "Rodillos de prensado y laminación",
      "Ranurado y rectificado de superficie",
    ],
    applications: [
      "Bandas transportadoras",
      "Papeleras e industria siderúrgica",
      "Industrias de proceso",
      "Molienda y molinos de bolas",
    ],
    footerNote: "Balanceo estático y dinámico certificado",
  },
  {
    code: "LÍNEA 06 // PIÑONERÍA",
    title: "Piñonería y Engranajes",
    icon: "cog",
    capabilityLabel: "Geometrías disponibles",
    capability:
      "Fabricación y mecanizado de engranajes por corte y rectificado, con control del perfil de diente medido sobre la pieza terminada.",
    processes: [
      "Engranajes rectos",
      "Engranajes helicoidales",
      "Engranajes cónicos",
      "Piñones de cadena",
    ],
    applications: [
      "Coronas de bronce SAE 64 / 65",
      "Transmisiones de alta torsión",
      "Reductores de velocidad",
      "Repuestos bajo plano del fabricante",
    ],
    footerNote: "Perfil controlado por medición sobre pieza terminada",
  },
];

export const MATERIALS: MaterialRow[] = [
  {
    material: "Acero SAE 1020 / 1045",
    standard: "ASTM A29 / AISI 1045 · DIN EN 10083",
    properties: "σmax 400-600 MPa · HB 170-220",
    tolerance: "IT7 - IT9 DIN ISO",
    applications: "Estructuras, transmisiones estándar, bujes y camisas mecanizadas.",
  },
  {
    material: "Acero aleado SAE 4140 (templado)",
    standard: "DIN EN 10042 · quenched & tempered 28-32 HRC",
    properties: "σmax 900 MPa · Temple y revenido",
    tolerance: "IT6 - IT8 DIN ISO",
    applications: "Ejes de alta torsión, piñonería pesada y bujes de impacto.",
  },
  {
    material: "Acero inoxidable AISI 304 / 316",
    standard: "ASTM A240 / A276 · DIN 1.4301 / 1.4404",
    properties: "Resistencia a corrosión · 18/8 y Mo",
    tolerance: "IT7 - IT9 DIN ISO",
    applications: "Industria química, alimenticia y farmacéutica.",
  },
  {
    material: "Bronce fosfórico SAE 64 / 65",
    standard: "UNS C93200 · SAE 660 · Copper Alloy 836",
    properties: "Desgaste por deslizamiento · Cobre-estaño",
    tolerance: "IT8 - IT10 DIN ISO",
    applications: "Bujes de alta carga y coronas de sinfín.",
  },
  {
    material: "Teflón PTFE",
    standard: "ASTM D1718 · Virgin / grafito / bronce",
    properties: "−260 °C a +260 °C · Inerte · Bajo coeficiente de fricción",
    tolerance: "±0.05 mm mecanizado CNC",
    applications: "Sellos mecánicos, empaquetaduras y asientos de válvulas.",
  },
  {
    material: "Nylon 6 / Ertalon · POM · UHMW",
    standard: "ISO 15512 · Poliamida / Poliacetal / UHMW",
    properties: "Alta abrasión · Baja fricción · food grade",
    tolerance: "±0.10 mm mecanizado CNC",
    applications: "Ruedas dentadas silenciosas, guías y rodillos de desgaste.",
  },
];

export const QUALITY_PILLARS: QualityPillar[] = [
  {
    code: "QA-01",
    title: "Control dimensional",
    norm: "ISO 9001:2015",
    description:
      "Verificación de cada cota crítica antes del desmonte, con instrumentos calibrados y trazabilidad de medición.",
    checks: [
      "Micrómetros de exteriores e interiores Mitutoyo",
      "Comparadores de carátula milesimales",
      "Calibradores pie de rey certificados",
      "Registro de la carta de inspección por orden de trabajo",
    ],
  },
  {
    code: "QA-02",
    title: "Calificación de procedimientos",
    norm: "ASME Sección IX / AWS D1.1",
    description:
      "Procedimientos de soldadura calificados y welders evaluados con cupones vigentes para el material y la posición.",
    checks: [
      "WPS homologados por material y espesor",
      "PQR con ensayos mecánicos y de doblado",
      "Cupones de qualification de soldadores",
      "Control de precalentamiento e interpas",
    ],
  },
  {
    code: "QA-03",
    title: "Ensayos no destructivos",
    norm: "ASNT SNT-TC-1A · MT / PT",
    description:
      "Inspección de discontinuidades superficiales y subsuperficiales en uniones soldadas y piezas mecanizadas.",
    checks: [
      "Líquidos penetrantes (PT) en soldaduras",
      "Partículas magnéticas (MT) en aceros ferromagnéticos",
      "Inspección visual (VT) previa y posterior",
      "Informe firmado por inspector de planta",
    ],
  },
  {
    code: "QA-04",
    title: "Trazabilidad de materiales",
    norm: "EN 10204 3.1 / 3.2",
    description:
      "Correlación entre la orden de compra del material y la pieza entregada, con certificados de composición química.",
    checks: [
      "Certificados de colada y composición química",
      "MTR de aceros, bronces y polímeros",
      "Registro de Treatment térmico aplicado",
      "Traza pieza → material → operador → lote",
    ],
  },
];

export const GALLERY: GalleryItem[] = [
  {
    src: "/images/rodillo-rectificado.jpg",
    alt: "Técnico especialista de Famesa C.A. rectificando la superficie de un rodillo industrial de gran porte",
    caption:
      "Técnico especialista rectificando superficie de rodillo industrial de gran porte.",
    stamp: "FIG. 01 · RECTIFICADO DE RODILLO",
    span: "sm:col-span-2",
  },
  {
    src: "/images/engranajes-piezas.jpg",
    alt: "Lote de piñones, engranajes y ejes mecanizados por Famesa C.A. con tolerancias estrictas",
    caption:
      "Lote de piñones, engranajes y ejes mecanizados con tolerancias estrictas.",
    stamp: "FIG. 02 · PIÑONERÍA Y EJES",
    span: "sm:col-span-1",
  },
  {
    src: "/images/rodillo-eje.jpg",
    alt: "Rodillo industrial terminado con ensamblaje de muñones y eje de apoyo acoplado",
    caption:
      "Rodillo industrial terminado con ensamblaje de muñones y ejes de apoyo.",
    stamp: "FIG. 03 · RODILLO TERMINADO",
    span: "sm:col-span-1",
  },
  {
    src: "/images/famesa-fachada.jpg",
    alt: "Sede e infraestructura operativa de Famesa C.A. en Valencia, Estado Carabobo",
    caption: "Sede e infraestructura operativa en Valencia, Carabobo.",
    stamp: "FIG. 04 · PLANTA SANTA ROSA",
    span: "sm:col-span-2",
  },
];
