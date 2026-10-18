// =============================================================================
// FAMESA · Base de conocimiento técnica del Asistente Virtual Industrial.
//
// Módulo PURO y sin dependencias de runtime (no usa APIs del navegador ni de
// Node). Lo consumen por igual:
//   - El widget cliente (`@/config/famesa-assistant-kb`) como fallback local.
//   - El endpoint serverless `functions/api/assistant/chat.ts` (motor
//     determinista y contexto para el System Prompt de Gemini).
// =============================================================================
import { CONTACT, CONTACT_ADDRESS_LINE } from "../lib/contact-data";
import type {
  AssistantHistoryItem,
  AssistantMessage,
  CatalogItemCard,
  RfqPrefillData,
} from "../types/assistant";

/** Rubro técnico de FAMESA con su tarjeta, palabras clave y respuesta base. */
export interface AssistantKnowledgeEntry {
  id: string;
  /** Valor del enum `serviceType` aceptado por POST /api/rfq. */
  serviceType: string;
  /** Urgencia sugerida al pre-llenar el formulario de cotización. */
  rfqUrgency: NonNullable<RfqPrefillData["urgency"]>;
  keywords: string[];
  answer: string;
  card: CatalogItemCard;
}

/**
 * Los 7 rubros del taller con sus imágenes verificadas del proyecto.
 * El orden define la prioridad de las tarjetas de acceso rápido.
 */
export const FAMESA_ASSISTANT_KB: AssistantKnowledgeEntry[] = [
  {
    id: "mecanizado",
    serviceType: "mecanizado_cnc",
    rfqUrgency: "Normal",
    keywords: [
      "mecanizado",
      "mecanizar",
      "torno",
      "torneado",
      "tornea",
      "fresa",
      "fresado",
      "fresadora",
      "cnc",
      "rectificad",
      "mandrinad",
      "brochad",
      "pieza",
      "piezas",
      "eje",
      "ejes",
      "buje",
      "engranaje",
      "engranajes",
      "pion",
      "piñon",
      "corona",
      "brida",
    ],
    answer:
      "En mecanizado contamos con torno CNC de 2 ejes, torno paralelo convencional, fresa de bancada y puente, y rectificado de superficies y espinales. Trabajamos volteo hasta 1.500 mm y longitud entre puntos de 4.000 mm, con tolerancia de proceso de ±0.01 mm. Cuéntame la pieza que necesitas y te ayudo a preparar la cotización.",
    card: {
      id: "mecanizado",
      title: "Mecanizado, Torno y Fresadora",
      category: "Metalmecánica de precisión",
      description:
        "Torneado CNC y convencional, fresado, rectificado, brochado y mandrinado de piezas pesadas con control dimensional de ±0.01 mm.",
      image: "/images/equipo/famesa-torno-ajuste.jpg",
      gallery: [
        "/images/engranajes-piezas.jpg",
        "/images/piezas-cero.jpg",
        "/images/taller-rectificado.jpg",
      ],
      specs: [
        "Volteo hasta 1.500 mm sobre bancada",
        "Longitud entre puntos de 4.000 mm",
        "Tolerancia de proceso ±0.01 mm",
      ],
    },
  },
  {
    id: "rodillos",
    serviceType: "fabricacion_engranajes",
    rfqUrgency: "Normal",
    keywords: [
      "rodillo",
      "rodillos",
      "engomado",
      "vulcanizado",
      "goma",
      "caucho",
      "transportador",
      "transportadora",
      "banda",
      "rectificad",
      "balanceo",
      "ranurad",
    ],
    answer:
      "Fabricamos y rectificamos rodillos motrices, de retorno, engomados y ranurados para bandas transportadoras, papeleras y siderúrgicas. Entregamos con balanceo estático y dinámico verificado. Indícame diámetro, longitud y tipo de recubrimiento para cotizarlo.",
    card: {
      id: "rodillos",
      title: "Rodillos y Vulcanizado",
      category: "Transporte y proceso continuo",
      description:
        "Construcción, recubrimiento y rectificado de rodillos de gran porte con balanceo estático y dinámico certificado.",
      image: "/images/service-rod.jpg",
      gallery: [
        "/images/rodillo-eje.jpg",
        "/images/rodillo-rectificado.jpg",
        "/images/taller-rodillo.jpg",
      ],
      specs: [
        "Rodillos motrices, de retorno y prensado",
        "Recubrimiento engomado / vulcanizado",
        "Balanceo estático y dinámico",
      ],
    },
  },
  {
    id: "reductores",
    serviceType: "reparacion_reductores",
    rfqUrgency: "Prioritario",
    keywords: [
      "reductor",
      "reductores",
      "caja",
      "sinfin",
      "sinfín",
      "corona",
      "holgura",
      "backlash",
      "rodamiento",
      "sellos",
      "planetario",
      "helicoidal",
      "fuga",
      "ruido",
      "vibracion",
      "vibración",
    ],
    answer:
      "Diagnosticamos y reconstruimos reductores en planta y taller: cajas planetarias y helicoidales, corona y sinfín, cambio de rodamientos y sellos, y rectificado de asientos. Ajustamos la holgura de flanco con comparador milesimal y atención de emergencia 24/7. Describe el equipo y la falla y preparamos la cotización.",
    card: {
      id: "reductores",
      title: "Reductores de Velocidad",
      category: "Mantenimiento y reconstrucción",
      description:
        "Diagnóstico y reconstrucción de cajas de engranajes con alineación verificada y rectificado de asientos de caja.",
      image: "/images/service-red.jpg",
      gallery: ["/images/service-red-detail.jpg"],
      specs: [
        "Cajas planetarias y helicoidales",
        "Corona y sinfín, rodamientos y sellos",
        "Atención de emergencia 24/7",
      ],
    },
  },
  {
    id: "estructuras",
    serviceType: "soldadura_especial",
    rfqUrgency: "Normal",
    keywords: [
      "estructura",
      "estructuras",
      "caldereria",
      "calderería",
      "galpon",
      "galpón",
      "soporte",
      "bastidor",
      "perfil",
      "viga",
      "metalico",
      "metálico",
      "fabricacion",
      "fabricación",
    ],
    answer:
      "Fabricamos estructuras metálicas y calderería: bastidores, soportes, plataformas y refuerzos bajo plano o medición en sitio. Trabajamos con procedimientos alineados a ASME Sec. IX y AWS D1.1. Envíame el plano o las medidas y lo cotizamos.",
    card: {
      id: "estructuras",
      title: "Estructuras Metálicas y Calderería",
      category: "Fabricación pesada",
      description:
        "Fabricación de estructuras, bastidores y calderería bajo plano o medición en sitio, con soldadura calificada.",
      image: "/images/service-est.jpg",
      gallery: ["/images/service-est-detail.jpg"],
      specs: [
        "Diseño bajo plano o medición en sitio",
        "Soldadura ASME Sec. IX / AWS D1.1",
        "Aceros al carbono e inoxidables",
      ],
    },
  },
  {
    id: "soldadura",
    serviceType: "soldadura_especial",
    rfqUrgency: "Normal",
    keywords: [
      "soldadura",
      "soldar",
      "soldador",
      "tig",
      "mig",
      "mag",
      "smaw",
      "electrodo",
      "argón",
      "argon",
      "recuperacion",
      "recuperación",
      "antidesgaste",
      "cordon",
      "cordón",
      "asme",
      "aws",
      "calificad",
    ],
    answer:
      "Ejecutamos soldaduras GTAW (TIG), GMAW (MIG/MAG) y SMAW con recubrimiento duro antidesgaste, incluyendo fabricación de tanques y tubería inoxidable. Inspeccionamos con líquidos penetrantes en cada unión crítica. Indícame material, espesor y posición para orientarte.",
    card: {
      id: "soldadura",
      title: "Soldadura Especializada y Tanques Inoxidables",
      category: "Uniones calificadas",
      description:
        "Soldadura TIG/MIG/SMAW, fabricación de tanques y recuperación de piezas con ensayo por líquidos penetrantes.",
      image: "/images/service-sol.jpg",
      gallery: ["/images/service-sol-detail.jpg"],
      specs: [
        "GTAW (TIG), GMAW (MIG/MAG), SMAW",
        "Aceros inoxidables 300 / 400",
        "Recubrimiento duro antidesgaste",
      ],
    },
  },
  {
    id: "plasticos",
    serviceType: "plasticos_ingenieria",
    rfqUrgency: "Normal",
    keywords: [
      "plastico",
      "plástico",
      "plasticos",
      "plásticos",
      "teflon",
      "teflón",
      "ptfe",
      "nylon",
      "ultraleno",
      "ertalon",
      "poliacetal",
      "delrin",
      "pom",
      "uhmw",
      "polimero",
      "polímero",
      "aliment",
    ],
    answer:
      "Mecanizamos plásticos de ingeniería: teflón PTFE (virgen, grafito y bronce), nylon 6, POM / Delrin y UHMW. Sellos mecánicos, guías, ruedas silenciosas, asientos de válvulas y piezas food grade. Precisas el polímero y las medidas y te cotizamos.",
    card: {
      id: "plasticos",
      title: "Plásticos de Ingeniería",
      category: "Polímeros técnicos",
      description:
        "Torneado y fresado CNC de PTFE, Nylon, POM/Delrin y UHMW con acabado limpio sin rebabas y control dimensional.",
      image: "/images/service-pla.jpg",
      gallery: ["/images/service-pla-detail.jpg"],
      specs: [
        "Teflón PTFE, Nylon 6, POM y UHMW",
        "Sellos, guías y ruedas silenciosas",
        "Grado alimentario disponible",
      ],
    },
  },
  {
    id: "impulsores",
    serviceType: "fabricacion_engranajes",
    rfqUrgency: "Normal",
    keywords: [
      "impulsor",
      "impulsores",
      "bomba",
      "bombas",
      "bronce",
      "bocina",
      "bocinas",
      "siderurgica",
      "siderúrgica",
      "fundicion",
      "fundición",
      "sae64",
      "sae65",
      "centrifuga",
      "centrífuga",
      "turbina",
    ],
    answer:
      "Fabricamos impulsores cerrados y abiertos para bombas centrífugas y turbinas, así como bocinas de bronce, con control micrométrico (±0.005 mm) y balanceo dinámico. Trabajamos bronce fosforado SAE 64 / 660. Envíame el modelo o las dimensiones y lo cotizamos.",
    card: {
      id: "impulsores",
      title: "Impulsores de Bomba y Bocinas de Bronce",
      category: "Siderúrgica y bombeo",
      description:
        "Fabricación y maquinado de impulsores centrífugos y bocinas en bronce fosforado SAE 64 / 660, con balanceo dinámico.",
      image: "/images/service-impulsores.jpg",
      specs: [
        "Impulsores cerrados y abiertos",
        "Bronce fosforado SAE 64 / 660",
        "Control micrométrico ±0.005 mm",
      ],
    },
  },
  {
    id: "hidraulicos",
    serviceType: "cilindros_hidraulicos",
    rfqUrgency: "Prioritario",
    keywords: [
      "cilindro",
      "cilindros",
      "hidraulico",
      "hidraulicos",
      "hidráulico",
      "hidráulicos",
      "neumatico",
      "neumaticos",
      "neumático",
      "gato",
      "gatos",
      "prensa",
      "bruñido",
      "brunido",
      "camisa",
      "camisas",
      "vastago",
      "vástago",
      "vastagos",
      "chevron",
      "rascador",
      "o-ring",
      "oring",
      "hidrostatica",
      "hidrostática",
      "volqueta",
      "camion",
      "camión",
    ],
    answer:
      "Sí, reparamos cilindros y gatos hidráulicos/neumáticos de simple y doble efecto de gran porte: bruñido de camisas, cromado duro y rectificado de vástagos rayados, cambio de sellos chevron, rascadores y o-rings en poliuretano o vitón, con pruebas hidrostáticas de presión antes de entregar. Envíanos fotos o el equipo y te cotizamos.",
    card: {
      id: "hidraulicos",
      title: "Cilindros y Gatos Hidráulicos",
      category: "Hidráulica y neumática",
      description:
        "Reparación de cilindros de simple y doble efecto: bruñido de camisas, cromado de vástagos, sellos chevron y pruebas hidrostáticas.",
      image: "/images/equipo/famesa-torno-bancada.jpg",
      gallery: [
        "/images/equipo/famesa-torno-ajuste.jpg",
        "/images/piezas-cero.jpg",
        "/images/taller-rectificado.jpg",
      ],
      specs: [
        "Bruñido de camisas y cromado duro de vástagos",
        "Sellos chevron, rascadores y o-rings (poliuretano / vitón)",
        "Pruebas hidrostáticas antes de la entrega",
      ],
    },
  },
  {
    id: "beneficiadoras",
    serviceType: "beneficiadoras_aves",
    rfqUrgency: "Normal",
    keywords: [
      "avicola",
      "avícola",
      "aves",
      "ave",
      "pollo",
      "pollos",
      "beneficiadora",
      "beneficiadoras",
      "beneficio",
      "desangrado",
      "escaldado",
      "escalfado",
      "grillete",
      "grilletes",
      "gancho",
      "ganchos",
      "carnico",
      "cárnico",
      "carnicos",
      "matadero",
      "sacrificio",
      "planta de beneficio",
    ],
    answer:
      "Fabricamos equipos y repuestos inoxidables para beneficiadoras de aves y cárnicos: canales de desangrado y escaldado en acero inoxidable 304, tolvas sanitarias y grilletes o ganchos aéreos de transporte en varilla maciza inoxidable. Cuéntanos la pieza o el equipo y te orientamos con la cotización.",
    card: {
      id: "beneficiadoras",
      title: "Línea para Beneficiadoras de Aves",
      category: "Alimentos y cárnicos",
      description:
        "Equipos y repuestos inoxidables para beneficiadoras: canales de desangrado y escaldado, tolvas sanitarias y grilletes/ganchos de transporte.",
      image: "/images/service-sol.jpg",
      gallery: [
        "/images/service-sol-detail.jpg",
        "/images/service-est.jpg",
        "/images/taller-rodillo.jpg",
      ],
      specs: [
        "Canales de desangrado y escaldado en inox 304",
        "Grilletes y ganchos aéreos en varilla maciza",
        "Tolvas y accesorios de grado sanitario",
      ],
    },
  },
  {
    id: "tanques",
    serviceType: "tanques_inoxidables",
    rfqUrgency: "Normal",
    keywords: [
      "tanque",
      "tanques",
      "inoxidable",
      "inox",
      "sanitario",
      "sanitarias",
      "caldereria",
      "calderería",
      "tuberia",
      "tubería",
      "tolva",
      "tolvas",
      "conico",
      "cónico",
      "clamp",
      "mezclador",
      "mezcladora",
      "mezclado",
      "vapor",
      "recipiente",
    ],
    answer:
      "Fabricamos tanques y calderería sanitaria en acero inoxidable: tanques verticales con fondo cónico sobre patas tubulares, tanques horizontales de proceso, tolvas mezcladoras y redes de tuberías para vapor, aire o químicos, con soldaduras TIG (argón) sanitarias purgadas. Envíanos el plano o la capacidad que necesitas y lo cotizamos.",
    card: {
      id: "tanques",
      title: "Tanques Inoxidables y Calderería",
      category: "Calderería sanitaria",
      description:
        "Tanques verticales con fondo cónico, tanques horizontales, tolvas y tuberías de proceso en acero inoxidable con soldadura TIG sanitaria.",
      image: "/images/service-est.jpg",
      gallery: [
        "/images/service-est-detail.jpg",
        "/images/service-sol-detail.jpg",
      ],
      specs: [
        "Tanques verticales con fondo cónico y patas tubulares",
        "Conexiones sanitarias clamp y tolvas mezcladoras",
        "Soldadura TIG (argón) sanitaria purgada",
      ],
    },
  },
];

/** Frases del globo de bienvenida proactivo (se elige una al azar). */
export const WELCOME_GREETINGS: string[] = [
  "¡Hola! ¿En qué te puedo ayudar hoy con tus piezas o mecanizado?",
  "¿Tienes alguna duda sobre nuestros servicios industriales?",
  "¿Necesitas cotizar fabricación o reparación de piezas?",
  "¡Bienvenido! Pregúntame sobre repuestos o fabricación a medida.",
];

/** Chips de acceso rápido bajo la cabecera del widget. */
export const QUICK_CHIPS: { label: string; prompt: string }[] = [
  { label: "Torno y Fresado", prompt: "Necesito mecanizado de piezas en torno y fresadora." },
  { label: "Rodillos", prompt: "Quiero cotizar fabricación o rectificado de rodillos." },
  { label: "Reductores", prompt: "Tengo una falla en un reductor, necesito diagnóstico." },
  { label: "Bronce/Impulsores", prompt: "Necesito impulsores o bocinas de bronce." },
  { label: "Soldadura", prompt: "Requiero soldadura especializada o tanques inoxidables." },
  { label: "Cotizar RFQ", prompt: "Quiero solicitar una cotización formal." },
];

/** Datos de contacto oficiales de FAMESA (única fuente: contact-data). */
export const ASSISTANT_CONTACT = {
  phones: [CONTACT.phones.landline, CONTACT.phones.mobile1, CONTACT.phones.mobile2],
  whatsapp: CONTACT.whatsapp,
  email: CONTACT.email,
  addressLine: CONTACT_ADDRESS_LINE,
  schedule: "Lunes a viernes, 7:30 AM – 5:00 PM",
  emergency: "Guardia activa para paradas de planta 24/7",
} as const;

/** Ficha fiscal e infraestructura de planta (extraída del dossier oficial). */
export const FAMESA_CORPORATE = {
  rif: "J-31352388-7",
  registry: "Registro Mercantil Nro. 71 tomo-44A",
  legalName: "FAMESA C.A. (Fabricaciones Metalmecánica, Soldaduras y Afines)",
  facilities:
    "Galpón industrial de 600 m² en Santa Rosa, Valencia: 300 m² de mecanizado y tornos, 25 m² de control de calidad y metrología, 25 m² de almacén y servicios y 25 m² de oficinas técnicas.",
  capacity:
    "Torno CNC CK6140x750, tornos paralelos de gran bancada (hasta 4 metros entre puntos y 1.500 mm de volteo) y fresadoras universales Correa F, con tolerancias centesimales (±0.05 mm) y micrométricas (±0.01 mm / ±0.005 mm).",
  clients: [
    "Grupo Sindoni",
    "Mondelēz Venezuela C.A.",
    "Grupo Corimon",
    "Ajeven C.A.",
    "Coca-Cola FEMSA C.A.",
    "Papeles Venezolanos C.A.",
  ],
  providers: [
    "Sumindu C.A.",
    "Ferrum Aceros",
    "Inoxtotalven",
    "Industrial Supply",
    "Hierrocor C.A.",
    "Filotor C.A.",
    "Suministros JL",
  ],
} as const;

/** System Prompt del motor Gemini: Ingeniero Asesor Técnico de FAMESA (entrenado con el dossier de 17 páginas). */
export const ASSISTANT_SYSTEM_PROMPT = `Eres el "Ing. Asesor Técnico FAMESA", un ingeniero mecánico senior y asesor industrial de planta con más de 20 años de experiencia técnica en FAMESA C.A. (Fabricaciones Metalmecánica Soldaduras y Afines), ubicada en Av. 98 Boyacá galpón 80-29 Carmen Norte, Santa Rosa, Valencia, Estado Carabobo, Venezuela.

Tu objetivo es atender a jefes de mantenimiento, ingenieros de planta, directores de operaciones y personal de compras industriales, respondiendo cualquier duda técnica con calidez humana, precisión milimétrica y agilidad venezolana profesional.

INFORMACIÓN CORPORATIVA Y DE PLANTA (MEMORIZADA DEL CATÁLOGO OFICIAL):
• Razón Social: FAMESA C.A. | RIF: J-31352388-7 | Registro Mercantil: Nro. 71 tomo-44A.
• Instalaciones: Galpón industrial de 600 m² (300 m² área de mecanizado y tornos, 25 m² control de calidad y metrología, 25 m² almacén y servicios, 25 m² oficinas técnicas).
• Contacto Oficial: Teléfonos 0241-897-83-02 / 0414-341-01-87 / 0412-143-50-69 | Correo: famesa2005@gmail.com | WhatsApp: +58 414-3410187.
• Filosofía: Satisfacción total del cliente, mejora continua, sustitución de importaciones mediante fabricación nacional de alta gama y atención de emergencias / paradas de planta 24/7.
• Clientes que confían en FAMESA: Grupo SINDONI, Mondelēz Venezuela C.A., Grupo Corimon, Ajeven C.A., Coca-Cola FEMSA C.A.
• Proveedores de materia prima certificada: Sumindu C.A., Ferrum Aceros, Inoxtotalven, Industrial Supply, Hierrocor C.A., Filotor C.A., Suministros JL.

CAPACIDADES TÉCNICAS Y LÍNEAS DE FABRICACIÓN:
1. Mecanizado y Tornería Pesada / CNC: Torno CNC CK6140x750, tornos paralelos de gran bancada (hasta 4 metros de longitud entre puntos y 1.500 mm de volteo), fresadoras universales Correa F. Tolerancias centesimales (±0.05 mm) y micrométricas (±0.01 mm / ±0.005 mm). Fabricación sobre planos técnicos (PDF, DWG, DXF) o replicación exacta desde muestra física desgastada/rota.
2. Rodillos Industriales y Vulcanizado: Fabricación y rectificado con muñones y ejes. Recubrimientos en goma negra, roja, caucho nitrilo, neopreno y poliuretano. Acabados lisos, ranurado helicoidal y espina de pescado (chevron para auto-centrado de bandas transportadoras). Balanceo estático y dinámico certificado.
3. Reductores Industriales y Coronas: Diagnóstico y reconstrucción de motorreductores industriales (cajas azules SEW, Falk, Flender, Bonfiglioli). Tallado de coronas en bronce fosfórico (SAE 64/65), sinfines templados, engranajes helicoidales y ajuste de holguras con reloj comparador.
4. Plásticos de Ingeniería: Mecanizado en Nylon 6, Poliacetal (Delrin/POM), Ultraleno (UHMW-PE), Teflón (PTFE virgen o grafitado), Poliuretano, Fibra Fenólica y Baquelita. Repuestos para embotellado y alimentos: estrellas de transporte (star wheels), sinfines dosificadores y guías perimetrales de baja fricción.
5. Cilindros y Gatos Hidráulicos / Neumáticos: Reparación de cilindros de simple y doble efecto de gran porte. Bruñido de camisas, cromado duro y rectificado de vástagos rayados, cambio de sellos chevron, rascadores y o-rings en poliuretano/vitón, y pruebas hidrostáticas de presión antes de entrega.
6. Línea para Beneficiadoras de Aves y Cárnicos: Canales de desangrado y escaldado en acero inoxidable 304, tolvas sanitarias, grilletes y ganchos aéreos para transporte de aves en varilla maciza inoxidable.
7. Tanques y Tuberías de Inoxidable: Fabricación de tanques verticales con fondo cónico sobre patas tubulares, tanques horizontales de proceso, tolvas mezcladoras sanitarias y redes de tuberías para vapor/aire/químicos. Soldaduras TIG (Argón) sanitarias purgadas.
8. Impulsores y Bocinas de Bronce: Fundición y maquinado de impulsores para bombas centrífugas y turbinas con balanceo dinámico, y bocinas concéntricas con ranuras de lubricación interna.

REGLA DE DATOS FÍSICOS Y TÉCNICOS: usa exclusivamente los datos aquí suministrados (RIF, galpón, clientes, proveedores, tolerancias, equipos). No inventes cifras ni capacidades que no estén en esta ficha.

REGLAS DE CONVERSACIÓN NATURAL (HUMANO A HUMANO):
- Habla como una persona real en el taller, no como un asistente robótico ni una IA genérica.
- Sé empático, respetuoso y cordial ("¡Hola! Un gusto saludarte...", "Con todo gusto te oriento...", "Aquí en planta nos encargamos de eso...").
- Orientar siempre al cliente: invítalo a enviar su plano (PDF, DWG, DXF) o a traer la muestra física dañada al galpón de Santa Rosa en Valencia para replicarla o rectificarla.
- No inventes precios cerrados ni cotizaciones ficticias: para costos solicita las dimensiones, plano o muestra y ofrece abrir la solicitud de cotización formal (RFQ) o coordinar por WhatsApp.
- Si el cliente menciona urgencia o parada de planta, dale prioridad máxima e indícale que el taller atiende guardias 24/7.
- Respuestas directas, sustanciosas y fáciles de leer en pantalla de teléfono (1 a 3 párrafos concisos, sin rodeos innecesarios).`;

/** Normaliza texto: minúsculas y sin acentos, para el emparejamiento por palabras clave. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function makeId(prefix = "msg"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const GREETING_KEYWORDS = ["hola", "buenas", "buenos dias", "buenas tardes", "saludos", "hey", "que tal"];
const URGENCY_KEYWORDS = ["urgencia", "urgente", "parada de planta", "parada", "emergencia", "24/7", "inmediato"];
const QUOTE_KEYWORDS = ["precio", "precios", "costo", "costos", "cuanto", "cuánto", "cotizar", "cotizacion", "cotización", "presupuesto", "rfq", "valor"];
const CONTACT_KEYWORDS = ["contacto", "telefono", "teléfono", "whatsapp", "correo", "email", "ubicacion", "ubicación", "direccion", "dirección", "horario", "donde", "dónde", "llegar"];
const CLIENT_KEYWORDS = ["cliente", "clientes", "confian", "confían", "mondelez", "mondelēz", "coca", "femsa", "sindoni", "corimon", "ajeven", "paveca", "papeles venezolanos", "empresas grandes", "a quien le venden", "quienes son sus clientes", "quiénes son sus clientes"];
const FISCAL_KEYWORDS = ["rif", "registro mercantil", "razon social", "razón social", "datos fiscales", "datos de la empresa", "j-31352388-7"];
const FACILITY_KEYWORDS = ["instalaciones", "galpon", "galpón", "600 m2", "600 m²", "metros cuadrados", "m2", "m²"];
const CAPACITY_KEYWORDS = ["capacidad", "volteo", "entre puntos", "torno mas grande", "torno más grande", "medidas maximas", "medidas máximas", "hasta cuanto", "hasta cuánto", "ck6140", "que equipos"];
const SAMPLE_KEYWORDS = ["muestra", "traer", "plano", "planos", "pdf", "dwg", "dxf", "replicar", "no tengo plano", "pieza rota", "pieza dañada", "pieza desgastada"];
const PROVIDER_KEYWORDS = ["proveedor", "proveedores", "materia prima", "acero certificado"];

/** Puntúa cada rubro según coincidencias de palabras clave en el mensaje. */
function scoreEntries(message: string): { entry: AssistantKnowledgeEntry; score: number }[] {
  const text = normalize(message);
  return FAMESA_ASSISTANT_KB.map((entry) => {
    let score = 0;
    for (const keyword of entry.keywords) {
      const needle = normalize(keyword);
      if (needle.length >= 3 && text.includes(needle)) {
        // Las palabras largas son más específicas: se ponderan más.
        score += needle.length >= 6 ? 2 : 1;
      }
    }
    return { entry, score };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Motor determinista local: responde con la base de conocimiento de FAMESA sin
 * depender de Gemini ni de la red. Se usa como fallback del endpoint y en el
 * cliente cuando `/api/assistant/chat` no está disponible (p. ej. `next dev`).
 */
export function answerLocally(
  message: string,
  history: AssistantHistoryItem[] = [],
): AssistantMessage {
  const text = normalize(message);
  const has = (list: string[]) => list.some((k) => text.includes(normalize(k)));

  const base: Pick<AssistantMessage, "role" | "timestamp"> = {
    role: "assistant",
    timestamp: Date.now(),
  };
  const id = makeId;
  const ranked = scoreEntries(message);
  const best = ranked[0];

  // 1. Urgencia / parada de planta (máxima prioridad).
  if (has(URGENCY_KEYWORDS)) {
    const match = best && best.score > 0 ? best.entry : undefined;
    return {
      ...base,
      id: id("urgent"),
      content:
        "Entiendo la urgencia. Aquí en planta atendemos emergencias y paradas de planta 24/7 con guardia activa. Completemos una solicitud prioritaria para que el equipo técnico te contacte de inmediato.",
      cards: match ? [match.card] : undefined,
      action: "open_rfq",
      rfqPrefill: {
        serviceType: match?.serviceType,
        specifications: message.slice(0, 2500),
        urgency: "Urgente - Parada de Planta",
      },
    };
  }

  // 2. Clientes de referencia.
  if (has(CLIENT_KEYWORDS)) {
    return {
      ...base,
      id: id("clients"),
      content: `Con orgullo, entre los clientes que confían en FAMESA están ${FAMESA_CORPORATE.clients.join(", ")}. Atendemos a jefes de mantenimiento y compras industriales de todo el país con fabricación nacional de alta gama. ¿Te oriento con una pieza o equipo en específico?`,
      action: "view_catalog",
    };
  }

  // 3. Datos fiscales / RIF.
  if (has(FISCAL_KEYWORDS)) {
    return {
      ...base,
      id: id("fiscal"),
      content: `Con gusto: ${FAMESA_CORPORATE.legalName} · RIF ${FAMESA_CORPORATE.rif} · ${FAMESA_CORPORATE.registry}. Estamos en ${ASSISTANT_CONTACT.addressLine}. ${FAMESA_CORPORATE.facilities} Teléfonos: ${ASSISTANT_CONTACT.phones.join(" / ")}.`,
      action: "contact_whatsapp",
    };
  }

  // 4. Instalaciones y galpón.
  if (has(FACILITY_KEYWORDS)) {
    return {
      ...base,
      id: id("facilities"),
      content: `Contamos con ${FAMESA_CORPORATE.facilities} Estamos en ${ASSISTANT_CONTACT.addressLine}, con atención 24/7 para paradas de planta. ¿Necesitas coordinar una visita o enviar un plano?`,
      action: "contact_whatsapp",
    };
  }

  // 5. Proveedores homologados.
  if (has(PROVIDER_KEYWORDS)) {
    return {
      ...base,
      id: id("providers"),
      content: `Trabajamos con materia prima certificada de proveedores homologados como ${FAMESA_CORPORATE.providers.join(", ")}, lo que nos permite garantizar trazabilidad de colada y calidad en cada pieza que fabricamos.`,
      action: "view_catalog",
    };
  }

  // 6. Capacidad de taller y equipos.
  if (has(CAPACITY_KEYWORDS)) {
    const match = best && best.score > 0 ? best.entry : undefined;
    return {
      ...base,
      id: id("capacity"),
      content: `${FAMESA_CORPORATE.capacity} Además replicamos piezas desde una muestra física dañada o desde tu plano (PDF, DWG, DXF). ¿Te preparo una cotización?`,
      cards: match ? [match.card] : undefined,
      action: "open_rfq",
      rfqPrefill: {
        serviceType: match?.serviceType,
        specifications: message.slice(0, 2500),
        urgency: "Normal",
      },
    };
  }

  // 7. Envío de plano o muestra física dañada.
  if (has(SAMPLE_KEYWORDS)) {
    const match = best && best.score > 0 ? best.entry : undefined;
    return {
      ...base,
      id: id("sample"),
      content:
        "¡Perfecto, así es lo ideal! Puedes enviarnos tu plano en PDF, DWG o DXF, o traer la muestra física dañada a nuestro galpón en Santa Rosa, Valencia, y la replicamos o rectificamos con tolerancias micrométricas. Completa la solicitud y coordinamos.",
      cards: match ? [match.card] : undefined,
      action: "open_rfq",
      rfqPrefill: {
        serviceType: match?.serviceType,
        specifications: message.slice(0, 2500),
        urgency: "Normal",
      },
    };
  }

  // 8. Precio / cotización.
  if (has(QUOTE_KEYWORDS)) {
    const match = best && best.score > 0 ? best.entry : undefined;
    return {
      ...base,
      id: id("quote"),
      content: match
        ? `Con gusto te cotizamos ${match.card.title}. Completa los datos de contacto y las especificaciones de la pieza para que el equipo técnico prepare tu propuesta.`
        : "Con gusto preparamos tu cotización. Déjame los datos de tu empresa y las especificaciones de la pieza o servicio y lo gestionamos.",
      cards: match ? [match.card] : undefined,
      action: "open_rfq",
      rfqPrefill: {
        serviceType: match?.serviceType,
        specifications: message.slice(0, 2500),
        urgency: match?.rfqUrgency,
      },
    };
  }

  // 9. Contacto / ubicación / horario.
  if (has(CONTACT_KEYWORDS)) {
    return {
      ...base,
      id: id("contact"),
      content: `Estamos en ${ASSISTANT_CONTACT.addressLine}. RIF ${FAMESA_CORPORATE.rif}. ${FAMESA_CORPORATE.facilities} Teléfonos: ${ASSISTANT_CONTACT.phones.join(" / ")} · WhatsApp ${ASSISTANT_CONTACT.whatsapp} · ${ASSISTANT_CONTACT.email}. Horario: ${ASSISTANT_CONTACT.schedule}; ${ASSISTANT_CONTACT.emergency}.`,
      action: "contact_whatsapp",
    };
  }

  // 10. Saludo puro (sin intención técnica clara).
  if (has(GREETING_KEYWORDS) && (!best || best.score === 0)) {
    return {
      ...base,
      id: id("greet"),
      content:
        "¡Hola! Un gusto saludarte. Soy el Ing. Asesor Técnico de FAMESA. Cuéntame qué pieza, equipo o servicio necesitas y te oriento con el área del taller adecuada.",
      action: "view_catalog",
    };
  }

  // 11. Mejor coincidencia por rubro.
  if (best && best.score > 0) {
    return {
      ...base,
      id: id("kb"),
      content: best.entry.answer,
      cards: [best.entry.card],
      action: "view_catalog",
      rfqPrefill: {
        serviceType: best.entry.serviceType,
        specifications: message.slice(0, 2500),
        urgency: best.entry.rfqUrgency,
      },
    };
  }

  // 12. Fallback genérico: ofrece el catálogo de rubros.
  return {
    ...base,
    id: id("fallback"),
    content:
      "Puedo orientarte sobre mecanizado y tornería, rodillos vulcanizados, reductores, cilindros hidráulicos, beneficiadoras avícolas, tanques inoxidables, plásticos de ingeniería e impulsores de bronce. ¿Sobre cuál de nuestros servicios necesitas información?",
    cards: FAMESA_ASSISTANT_KB.slice(0, 4).map((e) => e.card),
    action: "view_catalog",
  };
}
