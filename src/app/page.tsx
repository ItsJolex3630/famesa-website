"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { CONTACT, CONTACT_ADDRESS_LINE } from "@/lib/contact-data";
import {
  Phone,
  Clock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Flame,
  Wrench,
  Cog,
  Layers,
  ArrowUp,
  MessageCircle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
  Menu,
  Maximize2,
  Mail,
} from "lucide-react";

const WA_BASE = "https://wa.me/584143410187";

const COPYRIGHT_YEAR = new Date().getFullYear();

// 1. DATA: Servicios
const services = [
  {
    id: "imp",
    title: "Fabricación y maquinado de impulsores de bronce",
    category: "metalmecanica",
    desc: "Impulsores cerrados y abiertos para bombas centrífugas, turbinas y sistemas de bombeo en bronce fosforado y aleaciones especiales.",
    tags: ["Fundición y Torneado CNC", "Bronce SAE 64/660", "Balanceo dinámico"],
    img: "/images/service-impulsores.jpg",
    detailImg: "/images/service-impulsores.jpg",
    detailTitle: "Control Dimensional & Balanceo Dinámico de Impulsores",
    detailDesc:
      "Fabricación integral y maquinado de precisión con control micrométrico (±0.005 mm) en aleaciones de bronce fosforado SAE 64/660 para bombas centrífugas y turbinas industriales.",
    tolerance: "±0.005 mm",
  },
  {
    id: "rod",
    title: "Fabricación y rectificado de rodillos",
    category: "metalmecanica",
    desc: "Rodillos motrices, de retorno, engomados y ranurados para bandas transportadoras, papeleras, siderúrgicas e industrias de procesos.",
    tags: ["Torno pesado", "Ranurado helicoidal", "Balanceo dinámico"],
    img: "/images/service-rod.jpg",
    detailImg: "/images/service-rod-detail.jpg",
    detailTitle: "Control Dimensional & Tolerancia en Torno Pesado",
    detailDesc: "Verificación de concentricidad y tolerancia micrométrica (±0.015 mm) con comparador de carátula en rectificado de rodillo cilíndrico.",
    tolerance: "±0.015 mm",
  },
  {
    id: "pla",
    title: "Mecanizado en plásticos de ingeniería",
    category: "plasticos",
    desc: "Piezas en nylon, poliacetal (Delrin), teflón (PTFE), UHMW y polímeros industriales de alto desempeño.",
    tags: ["Torneado y fresado CNC", "Resistencia al desgaste"],
    img: "/images/service-pla.jpg",
    detailImg: "/images/service-pla-detail.jpg",
    detailTitle: "Mecanizado CNC con Fresa de Carburo en Poliacetal",
    detailDesc: "Proceso de fresado y ranurado de alta precisión sobre bloque de Delrin virgen con refrigeración y control de viruta.",
    tolerance: "±0.02 mm",
  },
  {
    id: "est",
    title: "Estrellas de transporte y guías de embotellado",
    category: "plasticos",
    desc: "Para líneas de llenado, envasado y tapado, en UHMW-PE, nylon, Delrin y teflón de grado alimenticio.",
    tags: ["CNC y ruteado", "Bajo coeficiente de fricción"],
    img: "/images/service-est.jpg",
    detailImg: "/images/service-est-detail.jpg",
    detailTitle: "Inspección Dimensional de Bolsillo para Botellas",
    detailDesc: "Medición de radio y perfil curvo con calibrador vernier digital directamente sobre el plano de ingeniería para línea de envasado.",
    tolerance: "±0.05 mm",
  },
  {
    id: "red",
    title: "Mantenimiento de reductores industriales",
    category: "recuperacion",
    desc: "Ingeniería y diagnóstico de precisión. Servicio técnico especializado y atención a emergencias 24/7.",
    tags: ["Preventivo y correctivo", "Emergencias 24/7"],
    img: "/images/service-red.jpg",
    detailImg: "/images/service-red-detail.jpg",
    detailTitle: "Alineación y Holgura de Dientes (Backlash)",
    detailDesc: "Inspección de contacto de flancos, rodamientos cónicos y ajuste micrométrico de piñón y corona en reductor industrial.",
    tolerance: "Alineación micrométrica",
  },
  {
    id: "sol",
    title: "Soldadura y estructuras metálicas",
    category: "soldadura",
    desc: "Soldaduras eléctricas autógenas, soldadura TIG (argón), estructuras metálicas, fabricación de tanques y metalizados.",
    tags: ["TIG (argón)", "Tanques", "Estructuras"],
    img: "/images/service-sol.jpg",
    detailImg: "/images/service-sol-detail.jpg",
    detailTitle: "Cordón TIG Especializado con Halo Térmico Controlado",
    detailDesc: "Acabado tipo escama de pescado (stack of dimes) sobre tubería y brida de acero inoxidable bajo norma ASME Sec. IX.",
    tolerance: "ASME / AWS D1.1",
  },
];

// Mapa de servicios del formulario -> enum validado por RFQFormSchema en el servidor.
const SERVICE_TYPE_BY_CATEGORY: Record<string, string> = {
  metalmecanica: "fabricacion_engranajes",
  plasticos: "plasticos_ingenieria",
  recuperacion: "reparacion_reductores",
  soldadura: "soldadura_especial",
};

const SERVICE_TYPE_BY_TITLE: Record<string, string> = {
  "Piezas fabricadas desde cero": "mecanizado_cnc",
  "Reparación urgente de reductor": "reparacion_reductores",
  "Emergencia / Asistencia Técnica": "reparacion_reductores",
  "Otro requerimiento": "otro",
};

function resolveServiceType(serviceTitle: string): string {
  const byTitle = SERVICE_TYPE_BY_TITLE[serviceTitle];
  if (byTitle) return byTitle;
  const byCategory = services.find((s) => s.title === serviceTitle);
  if (byCategory) return SERVICE_TYPE_BY_CATEGORY[byCategory.category] ?? "otro";
  // "Pieza catálogo: <nombre>" y valores libres equivalentes.
  return serviceTitle.startsWith("Pieza catálogo:") ? "mecanizado_cnc" : "otro";
}

// Servicios extras que no viven en el catálogo `services` pero sí son seleccionables.
const EXTRA_SERVICE_OPTIONS = [
  "Piezas fabricadas desde cero",
  "Reparación urgente de reductor",
  "Emergencia / Asistencia Técnica",
  "Otro requerimiento",
];

const isSelectableService = (title: string) =>
  services.some((s) => s.title === title) || EXTRA_SERVICE_OPTIONS.includes(title);


// 2. DATA: Catálogo técnico de piezas
const partsCatalog = [
  {
    code: "EJES",
    name: "Ejes y pasadores rectificados",
    spec: "Ø 8 — 450 mm",
    material: "Acero 1045 / 4140 Tratado",
    desc: "Ejes motrices, de transmisión y pasadores cementados.",
  },
  {
    code: "BRIDAS",
    name: "Bridas y acoples especiales",
    spec: "ANSI / DIN / Serie pesada",
    material: "Acero Inox 304/316 y Acero al Carbono",
    desc: "Mecanizado de ranuras para juntas, orificios de fijación.",
  },
  {
    code: "BOCINAS",
    name: "Bocinas técnicas de fricción",
    spec: "A medida según alojamiento",
    material: "Bronce SAE 64/65 / Nylon 6 / Teflón",
    desc: "Autolubricadas, con ranuras de engrase en espiral para trabajo continuo.",
  },
  {
    code: "PIÑONES",
    name: "Piñonería y engranajes",
    spec: "Módulo a medida",
    material: "Acero tratado térmicamente",
    desc: "Dientes rectos, helicoidales y coronas de sinfín.",
  },
  {
    code: "RODILLOS",
    name: "Rodillos industriales terminados",
    spec: "Hasta 1500 mm volteo",
    material: "Tubo mecánico + Eje de tracción",
    desc: "Mecanizado, recubrimiento de goma y rectificado final.",
  },
  {
    code: "ESTRELLAS",
    name: "Guías y estrellas de embotellado",
    spec: "Perfiles CNC complejos",
    material: "UHMW-PE / Poliacetal Delrin",
    desc: "Cero ralladuras de envases y bajo ruido operativo.",
  },
];

// 3. DATA: Materiales técnicos con propiedades interactivas
const materialsData = [
  {
    name: "Teflón (PTFE)",
    category: "plasticos",
    temp: "-200°C a +260°C",
    hardness: "D50 a D55 Shore",
    application: "Sellos químicos, empaquetaduras, asientos de válvulas y aislantes eléctricos.",
    highlight: "Químicamente inerte y auto-lubricado",
  },
  {
    name: "Nylon 6 (Poliamida)",
    category: "plasticos",
    temp: "-40°C a +100°C",
    hardness: "M85 Rockwell",
    application: "Ruedas dentadas silenciosas, poleas, rodillos de carga y piezas de desgaste.",
    highlight: "Excelente absorción de vibraciones",
  },
  {
    name: "Poliacetal (Delrin / POM)",
    category: "plasticos",
    temp: "-50°C a +105°C",
    hardness: "M88 Rockwell",
    application: "Piezas de altísima precisión dimensional, levas, engranajes y bujes finos.",
    highlight: "Baja absorción de humedad y rigidez",
  },
  {
    name: "Ultraleno (UHMW-PE)",
    category: "plasticos",
    temp: "-150°C a +80°C",
    hardness: "D65 Shore",
    application: "Guías de cadenas, estrellas de embotellado, tolvas y perfiles de deslizamiento.",
    highlight: "Máxima resistencia al impacto y abrasión",
  },
  {
    name: "Poliuretano",
    category: "plasticos",
    temp: "-30°C a +80°C",
    hardness: "70A a 95A Shore",
    application: "Topes amortiguadores, raspadores de bandas, sellos hidráulicos y recubrimientos.",
    highlight: "Alta elasticidad y tenacidad al corte",
  },
  {
    name: "Acero 4140 Tratado",
    category: "aceros",
    temp: "Hasta 400°C",
    hardness: "28 a 34 HRC",
    application: "Ejes de alta fatiga, cigüeñales, pernos de potencia y piñones de alto torque.",
    highlight: "Templado y revenido para máxima torsión",
  },
  {
    name: "Acero Inoxidable 304 / 316",
    category: "aceros",
    temp: "Hasta 800°C",
    hardness: "B80 a B90 Rockwell",
    application: "Componentes para embotelladoras, industria láctea, cervecera y farmacéutica.",
    highlight: "Resistencia absoluta a la corrosión",
  },
  {
    name: "Aceros especiales con Tratamiento Térmico",
    category: "aceros",
    temp: "Ajustable",
    hardness: "Hasta 58-62 HRC (Cementado)",
    application: "Piezas sometidas a fricción severa, matrices y cuchillas de corte industrial.",
    highlight: "Superficie endurecida con núcleo tenaz",
  },
  {
    name: "Hierro Fundido Nodular / Gris",
    category: "aceros",
    temp: "Hasta 350°C",
    hardness: "180 a 240 HB",
    application: "Carcasas de reductores, poleas pesadas, bancadas y volantes de inercia.",
    highlight: "Excelente maquinabilidad y absorción de choques",
  },
  {
    name: "Bronce Fosfórico SAE 64 / 65",
    category: "bronces",
    temp: "Hasta 250°C",
    hardness: "75 a 90 HB",
    application: "Bujes para cargas severas, coronas para reductores sinfín y tuercas de prensas.",
    highlight: "Aleación antifricción de alta resistencia",
  },
  {
    name: "Fibra Fenólica & Baquelita",
    category: "bronces",
    temp: "-40°C a +120°C",
    hardness: "M100 Rockwell",
    application: "Aislantes termo-eléctricos, paletas de bombas de vacío y juntas dieléctricas.",
    highlight: "Alta rigidez dieléctrica y resistencia mecánica",
  },
];

const checklist = [
  "Piezas y partes para la industria metalmecánica",
  "Soldaduras eléctricas autógenas",
  "Soldadura especial TIG (argón)",
  "Piezas en acero inoxidable",
  "Piezas de fundición",
  "Piezas de bronce",
  "Estructuras metálicas",
  "Fabricación de tanques",
  "Metalizados",
  "Mantenimiento preventivo y correctivo",
];

const industries = [
  { name: "Embotellado: líneas de llenado, envasado y tapado", badge: "Estrellas & Guías" },
  { name: "Bandas transportadoras y logística pesada", badge: "Rodillos & Poleas" },
  { name: "Industria papelera y celulosa", badge: "Rodillos Rectificados" },
  { name: "Siderúrgicas y metalurgia primaria", badge: "Ejes & Bocinas" },
  { name: "Industrias de procesos químicos y alimentos", badge: "Inoxidable & PTFE" },
  { name: "Metalmecánica general y manufactura", badge: "Mecanizado CNC" },
];

// FASE 3 · Sección "Quiénes somos": texto de la carta corporativa + instalaciones.
const aboutParagraphs = [
  "FAMESA C.A. es una industria venezolana especializada en el área metalmecánica, soldaduras especiales y mantenimiento general. A lo largo de su trayectoria se ha destacado por la alta calidad de sus trabajos y el cumplimiento de las especificaciones requeridas por sus clientes.",
  "Desde su inicio ha sido preocupación de la empresa desarrollar técnicas avanzadas para obtener productos de altísima calidad, contando con equipo y maquinaria de primera línea y personal técnicamente capacitado y especializado. Nuestra principal actividad comprende la fabricación, reparación y asistencia técnica.",
  "Nos orientamos hacia la satisfacción total de nuestros clientes, impulsando nuestras operaciones para generar recursos que contribuyan al desarrollo del país y a la sustitución de importaciones. Contamos con personal y equipo calificado para respaldar cada trabajo.",
];

const facilities = [
  { area: "600", unit: "m²", label: "Instalaciones totales" },
  { area: "300", unit: "m²", label: "Área de mecanizado" },
  { area: "25", unit: "m²", label: "Control de calidad" },
  { area: "25", unit: "m²", label: "Almacén y servicios" },
];

// FASE 3 · Clientes. Se publican por NOMBRE, sin logotipos, para no usar marcas
// de terceros sin autorización escrita. PENDIENTE CLIENTE: aportar autorización
// si se desean mostrar los logotipos.
const clientes = [
  { nombre: "Grupo Sindoni", sector: "Alimentos y embotellado" },
  { nombre: "Mondelez Venezuela", sector: "Alimentos y confitería" },
  { nombre: "Grupo Corimon", sector: "Industrial y construcción" },
  { nombre: "Ajeven", sector: "Bebidas" },
  { nombre: "Coca Cola Fensa", sector: "Bebidas y embotellado" },
];

const processSteps = [
  { num: "01", title: "Cuéntanos qué necesitas", text: "Pieza, medidas aproximadas, material y cantidad requerida." },
  { num: "02", title: "Te respondemos con cotización", text: "Propuesta técnica, tiempo estimado de entrega y opciones de material." },
  { num: "03", title: "Fabricamos o reparamos", text: "Mecanizado con control dimensional micrométrico en taller Famesa." },
  { num: "04", title: "Entrega o despacho nacional", text: "Retiro en planta Santa Rosa o envío coordinado a todo el país." },
];

const qualityPoints = [
  { num: "01", title: "Satisfacción al cliente", text: "Ajuste dimensional exacto a planos y muestras físicas entregadas." },
  { num: "02", title: "Mejora continua", text: "Optimización constante de tolerancias, herramientas de corte e insertos." },
  { num: "03", title: "Desarrollo del personal", text: "Torneros y soldadores especializados con décadas de oficio en planta." },
  { num: "04", title: "Gestión ambiental", text: "Reciclaje de viruta metálica y manejo responsable de aceites de corte." },
];

const faqs = [
  {
    q: "¿Qué materiales trabajan?",
    a: "Fibra fenólica, baquelita, poliuretano, nylon, teflón (PTFE), ultraleno (UHMW), hierro nodular/gris, aceros especiales 1045 y 4140, bronce fosfórico SAE 64/65, acero inoxidable 304/316 y aceros con tratamientos térmicos.",
  },
  {
    q: "¿Hacen despacho a nivel nacional?",
    a: "Sí, coordinamos fletes y envíos asegurados a toda Venezuela (Caracas, Maracay, Barquisimeto, Puerto Cabello, Maracaibo, Oriente, etc.).",
  },
  {
    q: "¿Atienden emergencias de paradas de planta?",
    a: "Sí, contamos con régimen de emergencia 24/7 para reparación urgente de reductores, rodillos y ejes que detienen líneas de producción críticas.",
  },
  {
    q: "¿Qué necesito para solicitar una cotización?",
    a: "Indica la pieza o servicio, medidas clave, material y cantidad. Si tienes plano técnico en PDF/DWG o foto de la muestra dañada, puedes adjuntarla directo por WhatsApp.",
  },
  {
    q: "¿Cuánto tardan en entregar un trabajo?",
    a: "Los tiempos varían según la complejidad del mecanizado y disponibilidad del material. Para emergencias operativas procesamos fabricaciones prioritarias en 24 a 48 horas.",
  },
];

const tallerPhotos = [
  {
    id: "equipo-planta",
    src: "/images/equipo/famesa-equipo-planta.jpg",
    tag: "Maestranza y Planta",
    title: "Equipo Técnico Famesa C.A.",
    desc: "Personal multidisciplinario con más de 20 años de experiencia técnica en torneado pesado, fresado universal, matricería y soldaduras especiales.",
    caption:
      "Maestros torneros, fresadores y ajustadores del equipo técnico de Famesa C.A. en la nave central del taller, Santa Rosa, Valencia.",
    aspect: "landscape",
    width: 1024,
    height: 768,
  },
  {
    id: "fresado-correa",
    src: "/images/equipo/famesa-fresado-correa.jpg",
    tag: "Fresado Universal",
    title: "Mecanizado en Fresadora Correa F.",
    desc: "Ajuste milimétrico y planeado de componentes mecánicos con control riguroso de tolerancias y acabados superficiales.",
    caption:
      "Operador especialista realizando ajustes finos en la fresadora universal Correa F. con control micrométrico de tolerancias.",
    aspect: "portrait",
    width: 1400,
    height: 1875,
  },
  {
    id: "torno-bancada",
    src: "/images/equipo/famesa-torno-bancada.jpg",
    tag: "Tornería Pesada",
    title: "Torneado de Gran Bancada",
    desc: "Mecanizado longitudinal de ejes, rodillos y cilindros de gran capacidad para la industria papelera, química y de manufactura.",
    caption:
      "Tornero mecánico operando un torno paralelo de gran bancada para el mecanizado longitudinal de ejes y cilindros industriales.",
    aspect: "landscape",
    width: 1900,
    height: 1425,
  },
  {
    id: "torno-ajuste",
    src: "/images/equipo/famesa-torno-ajuste.jpg",
    tag: "Ajuste y Verificación",
    title: "Montaje y Centrado Dimensional",
    desc: "Preparación de piezas sobre mandril con verificación mediante reloj comparador e iluminación focalizada previa a desbaste.",
    caption:
      "Mecánico preparando y ajustando el mandril del torno paralelo con verificación dimensional bajo lámpara de inspección focalizada.",
    aspect: "portrait",
    width: 1400,
    height: 1867,
  },
];


// Catálogo de trabajos del dossier corporativo, agrupado por línea de trabajo.
const catalogoTrabajos = [
  {
    slug: "beneficiadora",
    title: "Piezas para beneficiadora",
    images: ["beneficiadora-1.jpg", "beneficiadora-2.jpg", "beneficiadora-3.jpg"],
  },
  {
    slug: "torno-fresadora",
    title: "Piezas en torno y fresadora",
    images: [
      "torno-fresadora-1.jpg",
      "torno-fresadora-2.jpg",
      "torno-fresadora-3.jpg",
      "torno-fresadora-4.jpg",
      "torno-fresadora-5.jpg",
      "torno-fresadora-6.jpg",
      "torno-fresadora-7.jpg",
      "torno-fresadora-8.jpg",
      "torno-fresadora-9.jpg",
    ],
  },
  {
    slug: "nylon-ultraleno",
    title: "Piezas en nylon y ultraleno",
    images: [
      "nylon-ultraleno-1.jpg",
      "nylon-ultraleno-2.jpg",
      "nylon-ultraleno-3.jpg",
      "nylon-ultraleno-4.jpg",
    ],
  },
  {
    slug: "reductores",
    title: "Reparación de reductores y coronas",
    images: [
      "reductores-1.jpg",
      "reductores-2.jpg",
      "reductores-3.jpg",
      "reductores-4.jpg",
      "reductores-5.jpg",
    ],
  },
  {
    slug: "tanques-inox",
    title: "Fabricación de tanques de inoxidable",
    images: ["tanques-inox-1.jpg", "tanques-inox-2.jpg", "tanques-inox-3.jpg"],
  },
  {
    slug: "estructuras",
    title: "Estructuras y tuberías",
    images: [
      "estructuras-1.jpg",
      "estructuras-2.jpg",
      "estructuras-3.jpg",
      "estructuras-4.jpg",
      "estructuras-5.jpg",
    ],
  },
  {
    slug: "metalmecanica",
    title: "Piezas metalmecánicas",
    images: [
      "metalmecanica-1.jpg",
      "metalmecanica-2.jpg",
      "metalmecanica-3.jpg",
      "metalmecanica-4.jpg",
    ],
  },
  {
    slug: "rodillos-vulc",
    title: "Rodillos vulcanizados",
    images: ["rodillos-vulc-1.jpg", "rodillos-vulc-2.jpg", "rodillos-vulc-3.jpg"],
  },
  {
    slug: "gatos-hidraulicos",
    title: "Reparación de gatos hidráulicos y neumáticos",
    images: [
      "gatos-hidraulicos-1.jpg",
      "gatos-hidraulicos-2.jpg",
      "gatos-hidraulicos-3.jpg",
    ],
  },
];

// Índice acumulado para que cada miniatura del catálogo abra el visor en la
// posición correcta dentro de `galleryPhotos`.
const catalogoConIndice = (() => {
  let running = tallerPhotos.length;
  return catalogoTrabajos.map((cat) => {
    const start = running;
    running += cat.images.length;
    return { ...cat, start };
  });
})();

type GalleryPhoto = {
  src: string;
  title: string;
  caption: string;
  width?: number;
  height?: number;
};

const galleryPhotos: GalleryPhoto[] = [
  ...tallerPhotos.map((p) => ({
    src: p.src,
    title: p.title,
    caption: p.caption,
    width: p.width,
    height: p.height,
  })),
  ...catalogoTrabajos.flatMap((cat) =>
    cat.images.map((file, i) => ({
      src: `/images/catalogo/${file}`,
      title: `${cat.title} · ${i + 1}`,
      caption: `Trabajo realizado por FAMESA C.A. — ${cat.title.toLowerCase()}.`,
    })),
  ),
];


const sparks = [
  { x: "58%", t: "3.2s", d: "0.4s", dx: "75px" },
  { x: "65%", t: "4.1s", d: "1.2s", dx: "110px" },
  { x: "72%", t: "2.8s", d: "2.1s", dx: "50px" },
  { x: "80%", t: "3.6s", d: "0.8s", dx: "95px" },
  { x: "88%", t: "4.4s", d: "1.9s", dx: "120px" },
  { x: "61%", t: "3.0s", d: "2.5s", dx: "60px" },
  { x: "70%", t: "4.2s", d: "3.1s", dx: "105px" },
  { x: "78%", t: "2.7s", d: "0.2s", dx: "80px" },
  { x: "84%", t: "3.9s", d: "1.5s", dx: "115px" },
  { x: "92%", t: "3.5s", d: "2.8s", dx: "70px" },
];

const gearPath =
  "M356.0 200.0L386.8 221.0L383.3 241.8L347.2 251.5L340.6 267.7L359.2 300.0L347.0 317.2L310.3 310.3L297.3 322.0L300.0 359.2L281.6 369.4L251.5 347.2L234.7 352.1L221.0 386.8L200.0 388.0L182.5 355.0L165.3 352.1L137.9 377.5L118.4 369.4L117.0 332.1L102.7 322.0L67.1 332.9L53.0 317.2L67.9 283.0L59.4 267.7L22.5 262.1L16.7 241.8L45.0 217.5L44.0 200.0L13.2 179.0L16.7 158.2L52.8 148.5L59.4 132.3L40.8 100.0L53.0 82.8L89.7 89.7L102.7 78.0L100.0 40.8L118.4 30.6L148.5 52.8L165.3 47.9L179.0 13.2L200.0 12.0L217.5 45.0L234.7 47.9L262.1 22.5L281.6 30.6L283.0 67.9L297.3 78.0L332.9 67.1L347.0 82.8L332.1 117.0L340.6 132.3L377.5 137.9L383.3 158.2L355.0 182.5Z M120 200a80 80 0 1 0 160 0a80 80 0 1 0-160 0Z";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Lightbox Modal state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Material Inspector Modal state
  const [selectedMaterial, setSelectedMaterial] = useState<(typeof materialsData)[0] | null>(null);
  const [materialFilter, setMaterialFilter] = useState<"todos" | "plasticos" | "aceros" | "bronces">("todos");

  // Services Filter state
  const [serviceFilter, setServiceFilter] = useState<"todos" | "metalmecanica" | "plasticos" | "soldadura" | "recuperacion">("todos");

  // Modal de Inspección Técnica de Servicio
  const [activeServiceModal, setActiveServiceModal] = useState<typeof services[0] | null>(null);
  const [modalImageView, setModalImageView] = useState<"detail" | "card">("detail");

  // RFQ Builder Form states
  const [formName, setFormName] = useState("");
  const [formService, setFormService] = useState("Fabricación y rectificado de rodillos");
  const [formUrgency, setFormUrgency] = useState<
    "estandar" | "prioridad" | "emergencia_parada"
  >("estandar");
  const [formQuantity, setFormQuantity] = useState(1);
  const [formMaterial, setFormMaterial] = useState("Acero 1045");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formConsent, setFormConsent] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rfqTrackingId, setRfqTrackingId] = useState("");

  // Google OAuth & Persistent Auth State
  const [homeUser, setHomeUser] = useState<{
    email: string;
    name?: string;
    picture?: string;
    isAdmin?: boolean;
  } | null>(null);
  const homeGoogleBtnRef = useRef<HTMLDivElement>(null);
  const homeGoogleInitRef = useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  // Bloquear scroll cuando el drawer móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Generate unique ticket ID on mount
  useEffect(() => {
    setRfqTrackingId(`RFQ-FAMESA-${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  // Verificar sesión persistente al cargar la página
  useEffect(() => {
    try {
      const u = JSON.parse(
        localStorage.getItem("famesa_admin_user") ||
          localStorage.getItem("kt_admin_user") ||
          localStorage.getItem("famesa_user") ||
          localStorage.getItem("kt_user") ||
          "null",
      );
      if (u && u.email) {
        setHomeUser(u);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleHomeGoogleLogin = async (res: { credential?: string }) => {
    const credential = res?.credential;
    if (!credential) return;
    try {
      const r = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await r.json().catch(() => null);
      if (r.ok && data?.ok && data.user) {
        localStorage.setItem("famesa_user", JSON.stringify(data.user));
        localStorage.setItem("kt_user", JSON.stringify(data.user));
        if (data.user.isAdmin) {
          if (data.token) {
            sessionStorage.setItem("famesa_admin_token", data.token);
            localStorage.setItem("famesa_admin_token", data.token);
          }
          if (data.user.adminKey) {
            localStorage.setItem("famesa_admin_key", data.user.adminKey);
            localStorage.setItem("kt_admin_key", data.user.adminKey);
          }
          localStorage.setItem("famesa_admin_user", JSON.stringify(data.user));
          localStorage.setItem("kt_admin_user", JSON.stringify(data.user));
        }
        setHomeUser(data.user);
        toast.success(`Sesión iniciada: ${data.user.name || data.user.email}`);
      } else {
        toast.error(data?.error || "Error al iniciar sesión con Google");
      }
    } catch (err) {
      console.error("Error al conectar con Google OAuth:", err);
      toast.error("No se pudo conectar con el servidor.");
    }
  };

  const logoutHomeUser = () => {
    localStorage.removeItem("famesa_user");
    localStorage.removeItem("kt_user");
    localStorage.removeItem("famesa_admin_key");
    localStorage.removeItem("kt_admin_key");
    localStorage.removeItem("famesa_admin_user");
    localStorage.removeItem("kt_admin_user");
    localStorage.removeItem("famesa_admin_token");
    sessionStorage.removeItem("famesa_admin_token");
    const g = (window as unknown as {
      google?: { accounts?: { id?: { disableAutoSelect?: () => void } } };
    })?.google;
    if (g?.accounts?.id?.disableAutoSelect) {
      g.accounts.id.disableAutoSelect();
    }
    setHomeUser(null);
    toast.info("Sesión cerrada.");
  };

  // Inicializar botón de Google con selección automática
  useEffect(() => {
    if (homeUser) return;
    let timer: NodeJS.Timeout;
    const DEFAULT_GOOGLE_CLIENT_ID =
      "368451259646-lvkp7q372m712rsj2adbidam4d72g4m0.apps.googleusercontent.com";
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || DEFAULT_GOOGLE_CLIENT_ID;

    const initBtn = () => {
      if (homeGoogleInitRef.current) return;

      const g = (window as unknown as {
        google?: {
          accounts?: {
            id?: {
              initialize: (opts: Record<string, unknown>) => void;
              renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
            };
          };
        };
      })?.google;

      if (g?.accounts?.id && homeGoogleBtnRef.current) {
        homeGoogleInitRef.current = true;
        g.accounts.id.initialize({
          client_id: clientId,
          callback: handleHomeGoogleLogin,
          auto_select: true,
        });
        homeGoogleBtnRef.current.innerHTML = "";
        g.accounts.id.renderButton(homeGoogleBtnRef.current, {
          type: "standard",
          shape: "pill",
          theme: "outline",
          size: "medium",
          text: "signin_with",
          locale: "es",
        });
      } else {
        timer = setTimeout(initBtn, 400);
      }
    };

    initBtn();
    return () => clearTimeout(timer);
  }, [homeUser]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // IntersectionObserver for staggered reveals
    const rvElements = document.querySelectorAll(".rv");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    rvElements.forEach((el) => observer.observe(el));

    // Nav active section spy
    const sectionIds = ["servicios", "catalogo", "piezas", "industrias", "empresa", "materiales", "taller", "proceso", "calidad", "clientes", "faq", "cotiza"];
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
          }
        });
      },
      { rootMargin: "-35% 0px -50% 0px" }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    // Keyboard navigation for lightbox & service modals
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAllModals();
        return;
      }
      if (lightboxIndex !== null) {
        if (e.key === "ArrowRight") {
          setLightboxIndex((curr) => (curr !== null ? (curr + 1) % galleryPhotos.length : null));
        }
        if (e.key === "ArrowLeft") {
          setLightboxIndex((curr) => (curr !== null ? (curr - 1 + galleryPhotos.length) % galleryPhotos.length : null));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, [lightboxIndex]);

  // Copy helper with Sonner toast
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`¡${label} copiado al portapapeles!`);
  };

  // Helper para etiqueta técnica contextual por servicio
  const getServiceTabLabel = (service: typeof services[0]) => {
    switch (service.id) {
      case "rod":
        return "Inspección Micrométrica & Runout";
      case "pla":
        return "Fresado CNC & Acabado Poliacetal";
      case "est":
        return "Inspección Vernier & Plano";
      case "red":
        return "Alineación & Holgura (Backlash)";
      case "sol":
        return "Inspección Macroscópica & Norma ASME";
      default:
        return "Detalle Técnico Macro & Tolerancia";
    }
  };

  // Lightbox handlers sincronizados
  const openLightboxByIndex = (index: number) => {
    setActiveServiceModal(null);
    setLightboxIndex(index);
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  };

  const closeLightbox = () => {
    closeAllModals();
  };

  const nextLightbox = () => {
    setLightboxIndex((curr) => (curr !== null ? (curr + 1) % galleryPhotos.length : null));
  };

  const prevLightbox = () => {
    setLightboxIndex((curr) => (curr !== null ? (curr - 1 + galleryPhotos.length) % galleryPhotos.length : null));
  };

  // Modal de Inspección Técnica de Servicio sincronizado
  const openServiceModal = (service: typeof services[0]) => {
    setLightboxIndex(null);
    setActiveServiceModal(service);
    setModalImageView("detail");
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  };

  const closeAllModals = () => {
    if (dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
    setLightboxIndex(null);
    setActiveServiceModal(null);
  };

  // Scroll to section helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Preselect service and scroll to form
  const selectServiceForQuote = (serviceTitle: string) => {
    setFormService(serviceTitle);
    scrollTo("cotiza");
    toast.info(`Servicio seleccionado: "${serviceTitle}"`);
  };

  // Preselect material and scroll to form
  const selectMaterialForQuote = (materialName: string) => {
    setFormMaterial(materialName);
    setSelectedMaterial(null);
    scrollTo("cotiza");
    toast.info(`Material seleccionado: "${materialName}"`);
  };

  // WhatsApp formatted message generator
  const urgencyLabel = {
    estandar: "Estándar (Planificado)",
    prioridad: "Prioritario (3-5 días)",
    emergencia_parada: "PARADA DE EMERGENCIA 24/7 (Inmediata)",
  }[formUrgency];

  const getWhatsAppMessageText = () => {
    const contact = [formEmail.trim(), formPhone.trim()].filter(Boolean).join(" · ");
    return `*SOLICITUD DE COTIZACIÓN [${rfqTrackingId}]*
----------------------------------------
*Cliente / Empresa:* ${formName.trim() || "[Por indicar]"}
*Contacto:* ${contact || "[Indicar en el chat]"}
*Servicio requerido:* ${formService}
*Nivel de Urgencia:* ${urgencyLabel}
*Cantidad estimada:* ${formQuantity} unidad(es)
*Material preferido:* ${formMaterial}
*Detalles técnicos:* ${formMessage.trim() || "Por definir en conversación"}
----------------------------------------
Solicitado desde famesa.com.ve · Valencia, Carabobo`;
  };

  const submitRFQ = async (channel: "whatsapp" | "email") => {
    if (!formName.trim()) {
      setFormError("Por favor indica tu nombre o empresa.");
      return;
    }
    const email = formEmail.trim();
    const phone = formPhone.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Indica un correo electrónico válido para poder responderte.");
      return;
    }
    if (!phone || (phone.match(/\d/g)?.length ?? 0) < 8) {
      setFormError("Indica un teléfono de contacto con al menos 8 dígitos.");
      return;
    }
    if (!formMessage.trim()) {
      setFormError("Por favor descríbenos brevemente la pieza o falla que necesitas solucionar.");
      return;
    }
    if (!formConsent) {
      setFormError("Debes aceptar la Política de Privacidad para poder enviar tu solicitud.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    // Registro en el endpoint serverless (log de seguimiento RFQ, no bloquea el envío).
    try {
      fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formName.trim(),
          companyName: formName.trim(),
          email,
          phone,
          serviceType: resolveServiceType(formService),
          urgency: formUrgency,
          specifications: formMessage.trim(),
          consentPrivacy: true,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          console.warn(`[/api/quote] ${res.status} ${await res.text()}`);
        }
      }).catch((err) => {
        console.warn("[/api/quote] sin respuesta:", err);
      });
    } catch {}

    if (channel === "whatsapp") {
      const waText = getWhatsAppMessageText();
      const targetUrl = `${WA_BASE}?text=${encodeURIComponent(waText)}`;
      toast.success("Abriendo WhatsApp con tu requerimiento técnico estructurado...");
      setTimeout(() => {
        window.location.href = targetUrl;
        setTimeout(() => {
          setIsSubmitting(false);
        }, 3000);
      }, 500);
    } else {
      const subject = `[RFQ-FAMESA] Solicitud de Cotización Técnica - ${formName.trim()}`;
      const body = `Estimado equipo técnico de FAMESA C.A.,

Solicito formalmente la cotización del siguiente requerimiento industrial:

• Cliente / Empresa: ${formName.trim()}
• Teléfono de contacto: ${phone}
• Correo de respuesta: ${email}
• Servicio requerido: ${formService}
• Nivel de Urgencia: ${urgencyLabel}
• Cantidad estimada: ${formQuantity} unidad(es)
• Material preferido: ${formMaterial}
• Detalles técnicos / Medidas:
${formMessage.trim()}

----------------------------------------
Código de seguimiento web: ${rfqTrackingId}
Enviado desde el portal oficial famesa.com.ve · Valencia, Carabobo`;

      const mailtoUrl = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast.success("Abriendo tu correo / Gmail con el requerimiento estructurado...");
      setTimeout(() => {
        window.location.href = mailtoUrl;
        setTimeout(() => {
          setIsSubmitting(false);
        }, 3000);
      }, 500);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitRFQ("whatsapp");
  };

  // Filtered lists
  const filteredServices = services.filter((s) =>
    serviceFilter === "todos" ? true : s.category === serviceFilter
  );

  const filteredMaterials = materialsData.filter((m) =>
    materialFilter === "todos" ? true : m.category === materialFilter
  );

  return (
    <>
      <header>
      {/* 1. TOP ANNOUNCEMENT & STATUS RIBBON */}
      <div className="top-ribbon">
        <div className="w">
          {/* Vista Desktop (>= 1024px) */}
          <div className="top-ribbon-desktop">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#e2e8f0", fontWeight: 600 }}>
                <span className="pulse-led" />
                PLANTA OPERATIVA 100% · SANTA ROSA, VALENCIA
              </span>
              <span style={{ opacity: 0.35, display: "inline-block" }}>|</span>
              <span style={{ color: "var(--or)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <Clock size={12} />
                Atención 24/7 para Paradas de Planta
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Líneas de Taller:</span>
              <button
                onClick={() => copyToClipboard("+584143410187", "0414 341 0187")}
                className="chip-copy"
                title="Clic para copiar número"
              >
                <Phone size={11} style={{ color: "var(--or)" }} />
                0414 341 0187
                <Copy size={10} style={{ opacity: 0.7 }} />
              </button>
              <button
                onClick={() => copyToClipboard("+584121435069", "0412 143 5069")}
                className="chip-copy"
                title="Clic para copiar número"
              >
                <Phone size={11} style={{ color: "var(--or)" }} />
                0412 143 5069
                <Copy size={10} style={{ opacity: 0.7 }} />
              </button>
              <a
                href={`mailto:${CONTACT.email}?subject=Consulta%20T%C3%A9cnica%20Famesa`}
                className="chip-copy"
                title="Enviar correo directo a FAMESA C.A."
              >
                <Mail size={11} style={{ color: "var(--or)" }} />
                {CONTACT.email}
              </a>
            </div>
          </div>

          {/* Vista Mobile / Tablet (< 1024px): Ultra-compacta en una sola línea */}
          <div className="top-ribbon-mobile">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#e2e8f0", fontWeight: 600, fontSize: "11px" }}>
              <span className="pulse-led" />
              PLANTA 100% OPERATIVA · VALENCIA
            </span>
            <a
              href="https://wa.me/584143410187?text=Emergencia%20de%20Planta"
              target="_blank"
              rel="noopener noreferrer"
              className="chip-copy"
              style={{ color: "var(--or)", fontWeight: 600 }}
            >
              <Clock size={11} />
              24/7 Emergencias
            </a>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE NAVEGACIÓN VIDRIADA PRINCIPAL */}
      <nav className={scrolled ? "sc" : ""}>
        <div className="w">
          {/* Logo y Enlace Home */}
          <a href="#top" className="brand-link">
            <Image 
              src="/images/logo.png" 
              alt="FAMESA C.A. - Fabricaciones Metalmecánica, Soldaduras y Afines" 
              width={180} 
              height={44} 
              priority 
              className="logo-img"
            />
          </a>

          {/* Enlaces de Navegación de Escritorio */}
          <div className="nl">
            <a
              className="l"
              href="#servicios"
              aria-current={activeSection === "servicios" ? "true" : undefined}
            >
              Servicios
            </a>
            <a
              className="l"
              href="#catalogo"
              aria-current={activeSection === "catalogo" ? "true" : undefined}
            >
              Catálogo
            </a>
            <a
              className="l"
              href="#piezas"
              aria-current={activeSection === "piezas" ? "true" : undefined}
            >
              Piezas a medida
            </a>
            <a
              className="l"
              href="#empresa"
              aria-current={activeSection === "empresa" ? "true" : undefined}
            >
              Empresa
            </a>
            <a
              className="l"
              href="#materiales"
              aria-current={activeSection === "materiales" ? "true" : undefined}
            >
              Materiales
            </a>
            <a
              className="l"
              href="#taller"
              aria-current={activeSection === "taller" ? "true" : undefined}
            >
              Taller
            </a>
            <a
              className="l"
              href="#calidad"
              aria-current={activeSection === "calidad" ? "true" : undefined}
            >
              Calidad
            </a>
            <a
              className="l"
              href="#clientes"
              aria-current={activeSection === "clientes" ? "true" : undefined}
            >
              Clientes
            </a>
            <a
              className="l"
              href="#cotiza"
              aria-current={activeSection === "cotiza" ? "true" : undefined}
            >
              Cotizar
            </a>
          </div>

          {/* Acciones de la Barra Superior */}
          <div className="nav-actions">
            {/* Si es administrador, acceso directo elegante al panel admin */}
            {homeUser?.isAdmin ? (
              <Link
                href="/admin"
                className="btn-admin-pill"
                title="Acceder al Panel de Administración FAMESA SUITE"
              >
                <Cog size={13} />
                <span>Panel Admin</span>
              </Link>
            ) : null}

            {/* Menú de usuario autenticado o botón Google */}
            {homeUser ? (
              <div className="nav-user-pill">
                {homeUser.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={homeUser.picture}
                    alt={homeUser.name || "Usuario"}
                    style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "var(--navy)",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {(homeUser.name || homeUser.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    maxWidth: "75px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "var(--ink)",
                  }}
                  title={homeUser.name || homeUser.email}
                >
                  {homeUser.name?.split(" ")[0] || homeUser.email.split("@")[0]}
                </span>
                <button
                  type="button"
                  onClick={logoutHomeUser}
                  title="Cerrar sesión"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "10px",
                    color: "#dc2626",
                    padding: "2px 4px",
                    fontWeight: 700,
                  }}
                >
                  Salir
                </button>
              </div>
            ) : (
              <>
                {/* Botón de Google en Desktop */}
                <div 
                  ref={homeGoogleBtnRef} 
                  id="g_home_signin" 
                  className="hidden min-[1180px]:block"
                  style={{ minHeight: "36px" }} 
                />

                {/* Botón Acceder Compacto en Tablet/Móvil */}
                <button
                  type="button"
                  onClick={() => {
                    const g = (window as unknown as { google?: { accounts?: { id?: { prompt: () => void } } } })?.google;
                    if (g?.accounts?.id?.prompt) {
                      g.accounts.id.prompt();
                    } else {
                      setMobileMenuOpen(true);
                    }
                  }}
                  className="nav-user-pill min-[1180px]:hidden"
                  style={{ padding: "6px 10px", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}
                  title="Iniciar sesión con Google"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="hidden sm:inline">Acceder</span>
                </button>
              </>
            )}

            {/* Botón WhatsApp de Escritorio */}
            <a
              className="btn-cta-nav"
              href="https://wa.me/584143410187?text=Hola%20Famesa%2C%20quiero%20una%20cotizaci%C3%B3n"
              target="_blank"
              rel="noopener noreferrer"
              title="Solicitar cotización por WhatsApp"
            >
              <MessageCircle size={15} />
              <span>Cotizar</span>
            </a>

            {/* Botón WhatsApp Icono en Móvil */}
            <a
              className="btn-cta-nav-mobile"
              href="https://wa.me/584143410187?text=Hola%20Famesa%2C%20quiero%20una%20cotizaci%C3%B3n"
              target="_blank"
              rel="noopener noreferrer"
              title="Cotizar por WhatsApp"
            >
              <MessageCircle size={18} />
            </a>

            {/* Botón Hamburguesa Móvil (< 1180px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="btn-hamburger"
              aria-label="Abrir menú de navegación"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* 3. DRAWER DE NAVEGACIÓN MÓVIL (Off-canvas) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm min-[1180px]:hidden"
          onClick={() => setMobileMenuOpen(false)}
          style={{ animation: "drawerFadeIn 200ms ease forwards" }}
        >
          <div
            className="fixed inset-y-0 right-0 w-[min(88vw,360px)] bg-white shadow-2xl flex flex-col z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "drawerSlideLeft 250ms cubic-bezier(0.32, 0.72, 0, 1) forwards" }}
          >
            {/* Header del Drawer */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <Image
                src="/images/logo.png"
                alt="FAMESA C.A."
                width={140}
                height={34}
                style={{ height: "32px", width: "auto", objectFit: "contain" }}
              />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido del Drawer */}
            <div className="p-5 flex-1 flex flex-col gap-4">
              {/* Tarjeta de Sesión Usuario / Admin */}
              {homeUser ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    {homeUser.picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={homeUser.picture}
                        alt={homeUser.name || "Usuario"}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center">
                        {(homeUser.name || homeUser.email || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-slate-900 truncate">
                        {homeUser.name || "Usuario"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{homeUser.email}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {homeUser.isAdmin ? "Administrador" : "Cliente"}
                      </span>
                    </div>
                  </div>

                  {homeUser.isAdmin ? (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mt-1 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-slate-800 transition-colors"
                    >
                      <Cog size={15} />
                      Panel Admin FAMESA SUITE
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      logoutHomeUser();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-red-600 font-semibold hover:underline self-end pt-1"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : null}

              {/* Lista de Enlaces */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                  Navegación del Taller
                </span>
                {[
                  { href: "#servicios", label: "Servicios Especializados" },
                  { href: "#catalogo", label: "Catálogo Técnico de Piezas" },
                  { href: "#piezas", label: "Piezas a Medida" },
                  { href: "#empresa", label: "Nuestra Empresa" },
                  { href: "#materiales", label: "Materiales y Aleaciones" },
                  { href: "#taller", label: "Taller y Maquinaria" },
                  { href: "#calidad", label: "Control de Calidad" },
                  { href: "#clientes", label: "Casos de Éxito & Clientes" },
                  { href: "#cotiza", label: "Solicitar Cotización" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={15} className="text-slate-400" />
                  </a>
                ))}
              </div>

              {/* Contacto Directo */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                <a
                  href="https://wa.me/584143410187?text=Hola%20Famesa%2C%20quiero%20una%20cotizaci%C3%B3n"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                >
                  <MessageCircle size={17} />
                  Cotizar por WhatsApp
                </a>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <a
                    href="tel:+584143410187"
                    className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center justify-center gap-1.5"
                  >
                    <Phone size={12} /> 0414 341 0187
                  </a>
                  <a
                    href="tel:+584121435069"
                    className="py-2 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center justify-center gap-1.5"
                  >
                    <Phone size={12} /> 0412 143 5069
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </header>

      <main>

      {/* 3. HERO MONUMENTAL CON ENGRANAJE INTERACTIVO Y CHISPAS */}
      <header
        className="hero"
        id="top"
        style={{ ["--bg" as string]: "url(/images/hero-bg.jpg)" }}
      >
        <div className="w">
          <span className="tag" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={14} />
            Fabricaciones metalmecánica, soldaduras y afines
          </span>
          <h1>Fabricamos las piezas que tu industria necesita</h1>
          <p className="lead">
            Mecanizado CNC, plásticos de ingeniería, rodillos industriales, soldadura y
            mantenimiento de reductores. Taller especializado en Santa Rosa, Valencia, Carabobo.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            <a
              className="btn"
              href="https://wa.me/584143410187?text=Hola%20Famesa%2C%20quiero%20una%20cotizaci%C3%B3n"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <MessageCircle size={18} />
              Cotizar por WhatsApp
            </a>

            <button
              onClick={() => scrollTo("cotiza")}
              className="btn d"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(10,26,58,0.85)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <FileText size={16} />
              Configurar Ficha RFQ
            </button>

            <a className="btn g" href="#servicios" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Ver servicios
              <ArrowRight size={15} />
            </a>
          </div>

          <div className="chips">
            <span>Despacho a nivel nacional</span>
            <span>Servicio técnico y emergencias 24/7</span>
            <span>Santa Rosa, Valencia · Carabobo</span>
            <span style={{ borderColor: "rgba(255,138,31,0.4)", color: "#ffc17a" }}>
              Tolerancias de mecanizado controladas
            </span>
          </div>
        </div>

        {/* Animated Interactive SVG Gear (hover increases speed) */}
        <svg
          className="gear gear-interactive"
          viewBox="0 0 400 400"
          aria-hidden="true"
        >
          <title>Engranaje mecánico interactivo Famesa</title>
          <path fillRule="evenodd" d={gearPath} />
        </svg>

        {/* Sparks Particles */}
        {sparks.map((sp, idx) => (
          <span
            key={idx}
            className="sp"
            style={{
              ["--x" as string]: sp.x,
              ["--t" as string]: sp.t,
              ["--d" as string]: sp.d,
              ["--dx" as string]: sp.dx,
            }}
          />
        ))}
      </header>

      {/* 4. STRIP BANNER DE MÉTRICAS */}
      <div className="strip">
        <div className="w">
          <div style={{ transition: "background 150ms ease" }}>
            <b>
              24<i>/</i>7
            </b>
            Emergencias y servicio técnico
          </div>
          <div style={{ transition: "background 150ms ease" }}>
            <b>TIG</b>
            Soldadura en argón
          </div>
          <div style={{ transition: "background 150ms ease" }}>
            <b>CNC</b>
            Torneado y fresado de precisión
          </div>
          <div style={{ transition: "background 150ms ease" }}>
            <b>Nacional</b>
            Despacho a todo el país
          </div>
        </div>
      </div>

      {/* 5. SECCIÓN SERVICIOS CON FILTRO INTERACTIVO */}
      <section id="servicios">
        <div className="w">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span className="tag" style={{ color: "var(--bl)" }}>
                Servicios Especializados
              </span>
              <h2>Lo que hacemos</h2>
              <p className="sub" style={{ marginBottom: "20px" }}>
                De la pieza individual a la reparación de equipos completos, para la industria
                metalmecánica, de procesos y de embotellado.
              </p>
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "30px" }}>
              {[
                { id: "todos", label: "Todos los servicios" },
                { id: "metalmecanica", label: "Torno y Fresadora" },
                { id: "plasticos", label: "Plásticos de Ingeniería" },
                { id: "soldadura", label: "Soldaduras Especiales" },
                { id: "recuperacion", label: "Reductores 24/7" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setServiceFilter(tab.id as any)}
                  style={{
                    background: serviceFilter === tab.id ? "var(--bl)" : "#fff",
                    color: serviceFilter === tab.id ? "#fff" : "var(--ink)",
                    border: `1px solid ${serviceFilter === tab.id ? "var(--bl)" : "var(--st2)"}`,
                    borderRadius: "99px",
                    padding: "7px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid" id="sv">
            {filteredServices.map((s, i) => (
              <article
                key={s.id}
                className="card card-service"
                style={{ ["--i" as string]: (i % 3).toString() }}
              >
                <div className="im" style={{ position: "relative", cursor: "pointer" }} onClick={() => openServiceModal(s)}>
                  <span className="lab">Inspección Disponible</span>
                  <Image
                    src={s.img}
                    alt={s.title}
                    width={1264}
                    height={848}
                    sizes="(min-width: 860px) 33vw, 100vw"
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "10px",
                      background: "rgba(10, 26, 58, 0.85)",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: "6px",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Maximize2 size={12} />
                    Ver inspección
                  </div>
                </div>

                <div className="bd">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <div className="tg">
                    {s.tags.map((t, idx) => (
                      <span key={idx}>{t}</span>
                    ))}
                  </div>

                  <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--st)" }}>
                    <button
                      onClick={() => selectServiceForQuote(s.title)}
                      style={{
                        background: "none",
                        border: 0,
                        padding: 0,
                        color: "var(--bl)",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      Cotizar este servicio
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {/* Featured Blue Card */}
            <article className="card card-service" style={{ ["--i" as string]: "2" }}>
              <div
                className="bd"
                style={{
                  background: "var(--bl)",
                  color: "#fff",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--or-on-blue)" }}>
                  Asistencia Inmediata
                </span>
                <h3 style={{ fontSize: "28px" }}>Fabricación, reparación y asistencia técnica</h3>
                <p style={{ color: "#dbe6ff" }}>
                  Si un equipo presenta fallas o dejó de funcionar, contáctanos y te ayudamos a
                  solucionar con prioridad de planta.
                </p>
                <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <a className="btn" href={WA_BASE} style={{ padding: "12px 20px" }}>
                    Contactar Taller
                  </a>
                  <button
                    onClick={() => selectServiceForQuote("Emergencia / Asistencia Técnica")}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.4)",
                      color: "#fff",
                      borderRadius: "12px",
                      padding: "12px 18px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Formulario RFQ
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 6. CATÁLOGO TÉCNICO DE PIEZAS (FUNCIÓN ESTILO LOVABLE/STITCH) */}
      <section className="st" id="catalogo">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Catálogo de Fabricación
          </span>
          <h2>Piezas listas para la exigencia real</h2>
          <p className="sub">
            Fabricación según plano, muestra física o levantamiento en campo para toda la industria nacional.
          </p>

          <div className="catalog-grid">
            {partsCatalog.map((part) => (
              <div key={part.code} className="catalog-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ background: "var(--navy)", color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }}>
                    {part.code}
                  </span>
                  <span style={{ color: "var(--bl)", fontSize: "12px", fontWeight: 700 }}>
                    {part.spec}
                  </span>
                </div>

                <h3 style={{ font: "700 22px var(--h)", margin: "0 0 6px", textTransform: "uppercase" }}>
                  {part.name}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--mu)", margin: "0 0 12px", flex: 1 }}>
                  {part.desc}
                </p>

                <div style={{ fontSize: "12px", background: "var(--st)", padding: "6px 10px", borderRadius: "8px", color: "var(--ink)", fontWeight: 500, marginBottom: "14px" }}>
                  <strong>Material:</strong> {part.material}
                </div>

                <button
                  onClick={() => selectServiceForQuote(`Pieza catálogo: ${part.name}`)}
                  style={{
                    background: "none",
                    border: "1px solid var(--st2)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--navy)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--bl)";
                    e.currentTarget.style.color = "var(--bl)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--st2)";
                    e.currentTarget.style.color = "var(--navy)";
                  }}
                >
                  Solicitar este componente
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECCIÓN PIEZAS DESDE CERO */}
      <section id="piezas">
        <div className="w two">
          <div className="rv">
            <span className="tag" style={{ color: "var(--bl)" }}>
              Piezas desde cero
            </span>
            <h2>Fabricamos piezas desde cero</h2>
            <p style={{ color: "var(--mu)", margin: "0 0 20px" }}>
              Partiendo de barras vírgenes, tochos de fundición o placas poliméricas, elaboramos elementos mecánicos con trazabilidad completa.
            </p>
            <ul className="ck" id="ck">
              {checklist.map((item, idx) => (
                <li key={idx} style={{ transition: "color 150ms ease" }}>
                  {item}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "28px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a
                className="btn d"
                href="https://wa.me/584143410187?text=Hola%20Famesa%2C%20quiero%20pedir%20una%20pieza%20desde%20cero"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <Wrench size={16} />
                Pedir una pieza a medida
              </a>
              <button
                onClick={() => scrollTo("materiales")}
                style={{
                  background: "none",
                  border: "1px solid var(--st2)",
                  borderRadius: "12px",
                  padding: "12px 18px",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                Ver tabla de materiales
              </button>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <Image
              alt="Piezas metálicas y engranajes fabricados por Famesa"
              className="pic rv"
              src="/images/piezas-cero.jpg"
              width={1264}
              height={848}
              sizes="(min-width: 860px) 50vw, 100vw"
              style={{ ["--i" as string]: "2" }}
              onClick={() => openLightboxByIndex(2)}
              title="Clic para ampliar foto de piezas"
            />
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                background: "rgba(10,26,58,0.85)",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Maximize2 size={13} />
              Engranajes y bocinas mecanizadas en Famesa
            </div>
          </div>
        </div>
      </section>

      {/* 8. INDUSTRIAS QUE ATENDEMOS */}
      <section className="st" id="industrias">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Sectores Productivos
          </span>
          <h2>Industrias que atendemos</h2>
          <p className="sub">
            Fabricación y servicio técnico para la industria metalmecánica, química y de procesos en Carabobo y a nivel nacional.
          </p>
          <div className="ind3">
            {industries.map((ind, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <span>{ind.name}</span>
                <span style={{ fontSize: "11px", background: "var(--st)", color: "var(--bl)", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                  {ind.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8b. QUIÉNES SOMOS + INSTALACIONES */}
      <section id="empresa">
        <div className="w two">
          <div className="rv">
            <span className="tag" style={{ color: "var(--bl)" }}>
              Quiénes somos
            </span>
            <h2>Industria venezolana al servicio de la industria</h2>
            {aboutParagraphs.map((p, idx) => (
              <p key={idx} style={{ color: "var(--mu)", margin: "0 0 14px" }}>
                {p}
              </p>
            ))}
            <div style={{ marginTop: "18px", display: "flex", flexWrap: "wrap", gap: "8px 22px", fontSize: "13px", color: "var(--ink)", fontWeight: 600 }}>
              <span>RIF {CONTACT.rif}</span>
              <span>{CONTACT.registry}</span>
            </div>
          </div>

          <div className="rv" style={{ ["--i" as string]: "1" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              {facilities.map((f, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--st)",
                    border: "1px solid var(--st2)",
                    borderRadius: "16px",
                    padding: "22px 18px",
                  }}
                >
                  <div style={{ font: "700 42px/1 var(--h)", color: "var(--bl)" }}>
                    {f.area}
                    <span style={{ fontSize: "20px", marginLeft: "4px" }}>{f.unit}</span>
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "13px", fontWeight: 600, color: "var(--mu)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {f.label}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ margin: "14px 0 0", fontSize: "13px", color: "var(--mu)" }}>
              Instalaciones adecuadas a la organización y al servicio que prestamos, en {CONTACT.address.sector}, {CONTACT.address.city}, {CONTACT.address.state}.
            </p>
          </div>
        </div>
      </section>

      {/* 9. MATERIALES: EXPLORADOR INTERACTIVO CON FICHA TÉCNICA */}
      <section id="materiales">
        <div className="w">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
            <div>
              <span className="tag" style={{ color: "var(--bl)" }}>
                Stock y Especificaciones
              </span>
              <h2>Trabajamos con</h2>
              <p className="sub" style={{ marginBottom: "16px" }}>
                Plásticos técnicos y metales, con tratamientos térmicos cuando la pieza lo requiere. Haz clic en cualquier material para ver su ficha técnica.
              </p>
            </div>

            {/* Category tabs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
              {[
                { id: "todos", label: "Todos los materiales" },
                { id: "plasticos", label: "Plásticos de Ingeniería" },
                { id: "aceros", label: "Aceros & Tratamientos" },
                { id: "bronces", label: "Bronces & Aislantes" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMaterialFilter(tab.id as any)}
                  style={{
                    background: materialFilter === tab.id ? "var(--navy)" : "#fff",
                    color: materialFilter === tab.id ? "#fff" : "var(--ink)",
                    border: `1px solid ${materialFilter === tab.id ? "var(--navy)" : "var(--st2)"}`,
                    borderRadius: "99px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Badges list */}
          <div className="mat" id="mt">
            {filteredMaterials.map((m, idx) => (
              <span
                key={idx}
                onClick={() => setSelectedMaterial(m)}
                style={{
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderColor: selectedMaterial?.name === m.name ? "var(--bl)" : undefined,
                  boxShadow: selectedMaterial?.name === m.name ? "0 0 0 3px rgba(29, 79, 184, 0.2)" : undefined,
                }}
                title="Haz clic para ver especificaciones técnicas"
              >
                {m.name}
                <ExternalLink size={12} style={{ opacity: 0.6 }} />
              </span>
            ))}
          </div>

          {/* Interactive Material Drawer / Details Box */}
          {selectedMaterial && (
            <div
              style={{
                marginTop: "24px",
                background: "#f0f4f9",
                border: "2px solid var(--bl)",
                borderRadius: "16px",
                padding: "24px",
                animation: "hi 300ms cubic-bezier(.23,1,.32,1)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--bl)", letterSpacing: "0.08em" }}>
                    Ficha Técnica de Material
                  </span>
                  <h3 style={{ font: "700 28px var(--h)", margin: "4px 0 8px", textTransform: "uppercase" }}>
                    {selectedMaterial.name}
                  </h3>
                  <p style={{ margin: "0 0 14px", color: "var(--ink)", fontWeight: 500, fontSize: "15px" }}>
                    {selectedMaterial.application}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  style={{ background: "none", border: 0, cursor: "pointer", padding: "6px", color: "var(--mu)" }}
                  aria-label="Cerrar ficha"
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid var(--st2)" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--mu)", fontWeight: 700, textTransform: "uppercase" }}>Rango Térmico</span>
                  <p style={{ margin: "4px 0 0", fontWeight: 700, color: "var(--ink)" }}>{selectedMaterial.temp}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--mu)", fontWeight: 700, textTransform: "uppercase" }}>Dureza / Resistencia</span>
                  <p style={{ margin: "4px 0 0", fontWeight: 700, color: "var(--ink)" }}>{selectedMaterial.hardness}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--mu)", fontWeight: 700, textTransform: "uppercase" }}>Propiedad Clave</span>
                  <p style={{ margin: "4px 0 0", fontWeight: 700, color: "var(--bl)" }}>{selectedMaterial.highlight}</p>
                </div>
              </div>

              <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  className="btn"
                  onClick={() => selectMaterialForQuote(selectedMaterial.name)}
                  style={{ padding: "10px 18px", fontSize: "14px" }}
                >
                  Cotizar pieza en {selectedMaterial.name}
                </button>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  style={{ background: "none", border: 0, color: "var(--mu)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  Cerrar especificación
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 10. NUESTRO TALLER CON LIGHTBOX COMPLETO */}
      <section className="st" id="taller">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Nuestro Taller
          </span>
          <h2>Así se trabaja en Famesa</h2>
          <p className="sub">
            Maestranza técnica, rectificado y mecanizado de precisión en nuestra nave industrial en Santa Rosa, Valencia. Haz clic en cualquier imagen para visualizarla en pantalla completa.
          </p>

          <div className="equipo-bento-grid" style={{ marginBottom: "48px" }}>
            {tallerPhotos.map((photo, idx) => (
              <button
                key={photo.id}
                type="button"
                className={`equipo-card rv${photo.aspect === "landscape" ? " equipo-card--wide" : ""}`}
                style={{ ["--i" as string]: idx.toString() }}
                onClick={() => openLightboxByIndex(idx)}
                aria-label={`Ampliar fotografía: ${photo.title}`}
                title={`Ampliar: ${photo.title}`}
              >
                <Image
                  className="equipo-card-img"
                  src={photo.src}
                  alt={`${photo.title} — ${photo.tag} de Famesa C.A.`}
                  fill
                  sizes="(min-width: 1024px) 50vw, (min-width: 680px) 50vw, 100vw"
                  quality={85}
                />
                <span className="equipo-card-zoom" aria-hidden="true">
                  <Maximize2 size={16} />
                </span>
                <div className="equipo-card-overlay">
                  <span className="equipo-card-tag">{photo.tag}</span>
                  <span className="equipo-card-title">{photo.title}</span>
                  <span className="equipo-card-desc">{photo.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Catálogo de trabajos realizados (dossier corporativo) */}
          <div style={{ marginTop: "48px" }}>
            <span className="tag" style={{ color: "var(--bl)" }}>
              Catálogo de trabajos
            </span>
            <h3 style={{ font: "700 clamp(24px,3vw,34px)/1.05 var(--h)", textTransform: "uppercase", margin: "0 0 8px" }}>
              Trabajos fabricados y reparados
            </h3>
            <p className="sub" style={{ marginBottom: "28px" }}>
              Una muestra de las piezas y equipos que fabricamos y reparamos para la industria. Haz clic en cualquier imagen para ampliarla.
            </p>

            {catalogoConIndice.map((cat) => (
              <div key={cat.slug} style={{ marginBottom: "30px" }}>
                <h4
                  style={{
                    font: "700 15px var(--h)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--navy)",
                    margin: "0 0 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ width: "22px", height: "2px", background: "var(--bl)", display: "inline-block" }} />
                  {cat.title}
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px" }}>
                  {cat.images.map((file, i) => (
                    <button
                      key={file}
                      type="button"
                      onClick={() => openLightboxByIndex(cat.start + i)}
                      title={`Ampliar: ${cat.title}`}
                      style={{
                        position: "relative",
                        aspectRatio: "4 / 3",
                        border: "1px solid var(--st2)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        background: "var(--st)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <Image
                        alt={`${cat.title} — trabajo ${i + 1} de Famesa C.A.`}
                        src={`/images/catalogo/${file}`}
                        fill
                        sizes="(min-width: 860px) 220px, 45vw"
                        style={{ objectFit: "cover" }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. PROCESO DE COTIZACIÓN */}
      <section id="proceso">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Cómo cotizamos
          </span>
          <h2>Del mensaje a la pieza</h2>
          <p className="sub">
            Protocolo rápido para atender paradas de planta y compras industriales programadas.
          </p>
          <div className="stp">
            {processSteps.map((step, idx) => (
              <div key={idx} style={{ transition: "transform 200ms ease" }}>
                <b>{step.num}</b>
                <h3 style={{ font: "700 18px var(--h)", margin: "8px 0 4px", textTransform: "uppercase" }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--mu)" }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. CALIDAD Y NORMAS */}
      <section className="st" id="calidad">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Aseguramiento
          </span>
          <h2>Objetivos de calidad</h2>
          <p className="sub">Para cumplir con la política de alta calidad total y trazabilidad técnica en Carabobo.</p>
          <div className="q4" id="q4">
            {qualityPoints.map((q, idx) => (
              <div key={idx} className="rv" style={{ ["--i" as string]: idx.toString() }}>
                <b>{q.num}</b>
                <h3 style={{ font: "700 20px var(--h)", margin: "4px 0 6px", textTransform: "uppercase" }}>{q.title}</h3>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--mu)" }}>{q.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12b. CLIENTES */}
      <section id="clientes">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Confianza industrial
          </span>
          <h2>Empresas que confían en nosotros</h2>
          <p className="sub">
            Atendemos requerimientos de fabricación, reparación y mantenimiento para empresas líderes de distintos sectores productivos.
          </p>
          <div className="grid">
            {clientes.map((c, idx) => (
              <div
                key={idx}
                className="rv"
                style={{
                  ["--i" as string]: idx.toString(),
                  background: "#fff",
                  border: "1px solid var(--st2)",
                  borderRadius: "16px",
                  padding: "22px 20px",
                }}
              >
                <strong style={{ display: "block", font: "700 22px var(--h)", textTransform: "uppercase", color: "var(--navy)" }}>
                  {c.nombre}
                </strong>
                <span style={{ fontSize: "13px", color: "var(--mu)" }}>{c.sector}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "16px", fontSize: "12px", color: "var(--mu)" }}>
            Las denominaciones de terceros se citan únicamente con fines descriptivos de la experiencia comercial y pertenecen a sus respectivos titulares.
          </p>
        </div>
      </section>

      {/* 13. PREGUNTAS FRECUENTES INTERACTIVAS */}
      <section id="faq">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Preguntas Frecuentes
          </span>
          <h2>Respuestas inmediatas</h2>
          <div className="faq">
            {faqs.map((f, idx) => (
              <details key={idx}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>

          <div className="slot" style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <strong style={{ display: "block", color: "var(--navy)" }}>¿Tienes un plano técnico o requerimiento fuera de catálogo?</strong>
              <span style={{ fontSize: "13px", color: "var(--mu)" }}>Envíanos tus planos en PDF, DXF o fotos de piezas rotas directamente a nuestro equipo técnico.</span>
            </div>
            <a
              className="btn"
              href={`${WA_BASE}?text=Hola%20Famesa%2C%20tengo%20un%20plano%20para%20cotizar`}
              style={{ padding: "10px 18px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <MessageCircle size={15} />
              Enviar plano por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 14. COTIZACIONES / CONFIGURADOR RFQ AVANZADO */}
      <section className="dark" id="cotiza">
        <div className="w two">
          {/* Left contact info */}
          <div className="ct rv">
            <span className="tag">Cotizaciones Directas</span>
            <h2>Cuéntanos qué necesitas</h2>
            <p style={{ fontSize: "18px", lineHeight: "1.5" }}>
              Cuando un equipo falla o necesitas una pieza con urgencia, te ayudamos a solucionarlo de inmediato.
            </p>

            <b>WhatsApp / Cotizaciones</b>
            <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <a className="tel" href="tel:+584143410187" style={{ fontSize: "17px", fontWeight: 700 }}>
                  0414 341 0187
                </a>
                <button
                  onClick={() => copyToClipboard("+584143410187", "0414 341 0187")}
                  style={{ background: "rgba(255,255,255,0.15)", border: 0, color: "#fff", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <a className="tel" href="tel:+584121435069" style={{ fontSize: "17px", fontWeight: 700 }}>
                  0412 143 5069
                </a>
                <button
                  onClick={() => copyToClipboard("+584121435069", "0412 143 5069")}
                  style={{ background: "rgba(255,255,255,0.15)", border: 0, color: "#fff", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <a className="tel" href={`tel:${CONTACT.phones.landline.replace(/\s/g, "")}`} style={{ fontSize: "17px", fontWeight: 700 }}>
                  {CONTACT.phones.landline}
                </a>
                <button
                  onClick={() => copyToClipboard(CONTACT.phones.landline.replace(/\s/g, ""), CONTACT.phones.landline)}
                  style={{ background: "rgba(255,255,255,0.15)", border: 0, color: "#fff", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>
            </div>

            <b>Dirección de Taller</b>
            <p>{CONTACT_ADDRESS_LINE}.</p>
            <p style={{ marginTop: "6px" }}>
              <a
                className="tel"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.google.com/maps/search/?api=1&query=Famesa+C.A.+Santa+Rosa+Valencia+Carabobo"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                Ver ubicación en Google Maps
                <ExternalLink size={14} />
              </a>
            </p>

            <div style={{ marginTop: "14px", marginBottom: "14px", background: "rgba(0,58,215,0.18)", border: "1px solid rgba(0,58,215,0.4)", borderRadius: "8px", padding: "12px" }}>
              <span style={{ color: "#93c5fd", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={13} style={{ color: "var(--or)" }} /> Correo Electrónico Oficial
              </span>
              <a
                href={`mailto:${CONTACT.email}?subject=Requerimiento%20Industrial%20Famesa`}
                style={{ display: "block", color: "#fff", font: "700 15px/1.3 var(--h)", margin: "4px 0", textDecoration: "none" }}
              >
                {CONTACT.email}
              </a>
              <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                <a
                  href={`mailto:${CONTACT.email}?subject=Requerimiento%20Industrial%20Famesa`}
                  style={{ background: "var(--bl)", color: "#fff", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <Mail size={11} /> Redactar Correo
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(CONTACT.email, "Correo Famesa")}
                  style={{ background: "rgba(255,255,255,0.15)", border: 0, color: "#fff", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <Copy size={11} /> Copiar
                </button>
              </div>
            </div>

            <b>Redes y Catálogo</b>
            <p>
              <a
                className="tel"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.instagram.com/famesa.ca"
              >
                @famesa.ca
              </a>
            </p>

            <div style={{ marginTop: "24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "16px" }}>
              <span style={{ color: "var(--or)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={16} />
                Seguridad de Envío Garantizada
              </span>
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#a0aec0" }}>
                Tu información se procesa de forma segura con codificación directa a canal WhatsApp oficial y registro blindado de tickets.
              </p>
            </div>
          </div>

          {/* Right form: Interactive RFQ Builder */}
          <form className="rv" id="fm" style={{ ["--i" as string]: "2" }} onSubmit={handleFormSubmit}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--st2)", paddingBottom: "10px", marginBottom: "4px" }}>
              <strong style={{ fontSize: "16px", textTransform: "uppercase", font: "700 18px var(--h)" }}>
                Configurador de Requerimiento (RFQ)
              </strong>
              <span style={{ fontSize: "12px", background: "var(--st)", color: "var(--bl)", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                {rfqTrackingId}
              </span>
            </div>

            <label htmlFor="n">Nombre y Apellido / Razón Social *</label>
            <input
              autoComplete="name"
              id="n"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ej: Molinos del Centro C.A. / Ing. Roberto Pérez"
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label htmlFor="em">Correo electrónico *</label>
                <input
                  autoComplete="email"
                  id="em"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="compras@empresa.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="tel">Teléfono de contacto *</label>
                <input
                  autoComplete="tel"
                  id="tel"
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+58 414 1234567"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label htmlFor="s">Servicio *</label>
                <select
                  id="s"
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title}
                    </option>
                  ))}
                  {EXTRA_SERVICE_OPTIONS.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                  {/* Valores preseleccionados desde fuera (ej. "Pieza catálogo: …") */}
                  {!isSelectableService(formService) && (
                    <option value={formService}>{formService}</option>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="matSelect">Material Estimado</label>
                <select
                  id="matSelect"
                  value={formMaterial}
                  onChange={(e) => setFormMaterial(e.target.value)}
                >
                  {materialsData.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                  <option value="A definir por Famesa">A definir por Famesa</option>
                </select>
              </div>
            </div>

            {/* Urgency selector buttons */}
            <div>
              <label style={{ marginBottom: "6px", display: "block" }}>Prioridad de Planta *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {([
                  { id: "estandar", label: "Estándar", desc: "Planificado" },
                  { id: "prioridad", label: "Prioritario", desc: "3-5 días" },
                  { id: "emergencia_parada", label: "Parada 24/7", desc: "Inmediata" },
                ] as const).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setFormUrgency(u.id)}
                    style={{
                      background: formUrgency === u.id ? (u.id === "emergencia_parada" ? "#dc2626" : "var(--bl)") : "#fff",
                      color: formUrgency === u.id ? "#fff" : "var(--ink)",
                      border: `1px solid ${formUrgency === u.id ? (u.id === "emergencia_parada" ? "#dc2626" : "var(--bl)") : "var(--st2)"}`,
                      borderRadius: "10px",
                      padding: "8px 6px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 150ms ease",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "12px" }}>{u.label}</div>
                    <div style={{ fontSize: "10px", opacity: 0.8 }}>{u.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity adjustment */}
            <div>
              <label htmlFor="qty">Cantidad Requerida</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setFormQuantity(Math.max(1, formQuantity - 1))}
                  style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid var(--st2)", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "16px" }}
                >
                  -
                </button>
                <span style={{ minWidth: "40px", textAlign: "center", fontWeight: 700, fontSize: "16px" }}>
                  {formQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setFormQuantity(formQuantity + 1)}
                  style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid var(--st2)", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "16px" }}
                >
                  +
                </button>
                <span style={{ fontSize: "12px", color: "var(--mu)" }}>pieza(s) / lote</span>
              </div>
            </div>

            <label htmlFor="m">¿Qué necesitas? (Detalles técnicos, medidas, muestra) *</label>
            <textarea
              id="m"
              placeholder="Indica medidas clave, si tienes muestra dañada o plano técnico..."
              rows={3}
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              required
            />

            {/* Live Technical RFQ Preview Box */}
            <div className="rfq-preview-box">
              <div className="rfq-preview-header">
                <span style={{ color: "var(--or)", fontWeight: 700, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Vista previa de Ficha WhatsApp
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(getWhatsAppMessageText(), "Ficha RFQ")}
                  style={{ background: "none", border: 0, color: "#fff", cursor: "pointer", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <Copy size={11} /> Copiar texto
                </button>
              </div>
              <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "11px", color: "#cbd5e1" }}>
                {getWhatsAppMessageText()}
              </div>
            </div>

            {/* Consentimiento de privacidad (Ley Orgánica de Protección de Datos Personales) */}
            <label
              htmlFor="consent"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                fontSize: "12.5px",
                lineHeight: 1.5,
                color: "var(--mu)",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <input
                id="consent"
                type="checkbox"
                checked={formConsent}
                onChange={(e) => setFormConsent(e.target.checked)}
                required
                style={{ width: "16px", height: "16px", marginTop: "2px", flexShrink: 0, accentColor: "var(--bl)" }}
              />
              <span>
                He leído y acepto la{" "}
                <a
                  href="/politica-privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--bl)", textDecoration: "underline", fontWeight: 700 }}
                >
                  Política de Privacidad
                </a>{" "}
                y autorizo el tratamiento de mis datos para gestionar esta solicitud de cotización.
              </span>
            </label>

            {formError && (
              <small
                aria-live="polite"
                style={{ color: "#b42318", minHeight: "1.2em", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}
              >
                <AlertTriangle size={14} />
                {formError}
              </small>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <button
                className="btn"
                type="button"
                onClick={() => submitRFQ("whatsapp")}
                disabled={isSubmitting}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px 14px", fontSize: "14px" }}
              >
                <MessageCircle size={17} />
                {isSubmitting ? "Procesando…" : "Solicitar por WhatsApp"}
              </button>

              <button
                className="btn d"
                type="button"
                onClick={() => submitRFQ("email")}
                disabled={isSubmitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "12px 14px",
                  fontSize: "14px",
                  background: "var(--navy)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <Mail size={17} style={{ color: "var(--or)" }} />
                <span style={{ color: "#ffffff" }}>{isSubmitting ? "Procesando…" : "Enviar por Gmail"}</span>
              </button>
            </div>
          </form>
        </div>
      </section>
      </main>

      {/* 15. FOOTER INDUSTRIAL · placa de datos técnica */}
      <footer className="ftr">
        <div className="w">
          <div className="ftr-grid">
            <div className="ftr-brand">
              <Image 
                src="/images/logo.png" 
                alt="FAMESA C.A." 
                width={200} 
                height={77} 
                style={{ height: "48px", width: "auto", objectFit: "contain" }}
              />
              <strong>{CONTACT.company}</strong>
              <p>
                {CONTACT.tagline}. Planta industrial en {CONTACT.address.sector},{" "}
                {CONTACT.address.city}, {CONTACT.address.state}.
              </p>
            </div>

            <div className="ftr-col">
              <h4>Datos de la empresa</h4>
              <ul>
                <li>
                  <span className="k">RIF</span>
                  {CONTACT.rif}
                </li>
                <li>
                  <span className="k">Registro mercantil</span>
                  {CONTACT.registry}
                </li>
                <li>
                  <span className="k">Capital social</span>
                  {CONTACT.capital}
                </li>
              </ul>
            </div>

            <div className="ftr-col">
              <h4>Contacto</h4>
              <ul>
                <li>{CONTACT_ADDRESS_LINE}</li>
                <li>
                  <a href={`tel:${CONTACT.phones.landline.replace(/\s/g, "")}`}>
                    {CONTACT.phones.landline}
                  </a>
                </li>
                <li>
                  <a href={`tel:${CONTACT.phones.mobile1.replace(/\s/g, "")}`}>
                    {CONTACT.phones.mobile1}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                </li>
              </ul>
            </div>

            <div className="ftr-col">
              <h4>Documentos legales</h4>
              <ul>
                <li>
                  <Link href="/aviso-legal">Aviso legal</Link>
                </li>
                <li>
                  <Link href="/politica-privacidad">Política de privacidad</Link>
                </li>
                <li>
                  <Link href="/politica-cookies">Política de cookies</Link>
                </li>
                <li>
                  <Link href="/terminos-condiciones">Términos y condiciones</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="ftr-bottom">
            <span>
              © {COPYRIGHT_YEAR} {CONTACT.company}. Todos los derechos reservados.
            </span>
            <span>
              Página creada por{" "}
              <a
                href="https://www.instagram.com/somosvendo.ve/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vendo
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* 16. BOTÓN FLOTANTE WHATSAPP */}
      <aside aria-label="Acciones rápidas">
      <a
        className="wf"
        href="https://wa.me/584143410187?text=Hola%20Famesa%2C%20quiero%20una%20cotizaci%C3%B3n"
        aria-label="Contactar directamente por WhatsApp"
        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
      >
        <MessageCircle size={18} />
        WhatsApp
      </a>

      {/* 17. BOTÓN FLOTANTE BACK TO TOP */}
      <button
        onClick={() => scrollTo("top")}
        className={`back-to-top ${showBackToTop ? "visible" : ""}`}
        aria-label="Volver al inicio"
        title="Volver arriba"
      >
        <ArrowUp size={20} />
      </button>
      </aside>

      {/* 16. MODAL INTERACTIVO UNIFICADO: INSPECCIÓN TÉCNICA Y GALERÍA */}
      <dialog
        id="lb"
        ref={dialogRef}
        aria-label={
          activeServiceModal
            ? `Inspección técnica detallada: ${activeServiceModal.title}`
            : lightboxIndex !== null && galleryPhotos[lightboxIndex]
            ? `Galería fotográfica de taller: ${galleryPhotos[lightboxIndex].title}`
            : "Inspección técnica y visor fotográfico Famesa C.A."
        }
        onCancel={(e) => {
          e.preventDefault();
          closeAllModals();
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            closeAllModals();
          }
        }}
      >
        {activeServiceModal ? (
          /* ========================================================= */
          /* VISTA A: INSPECCIÓN TÉCNICA DETALLADA DE SERVICIO         */
          /* ========================================================= */
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              margin: "0 auto",
              background: "#06112a",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 28px 70px rgba(0,0,0,0.8)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header del Modal */}
            <div
              style={{
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(10,26,58,0.85)",
              }}
            >
              <div style={{ paddingRight: "12px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--or)",
                    fontWeight: 700,
                    display: "block",
                  }}
                >
                  Inspección Técnica de Servicio
                </span>
                <h3
                  style={{
                    font: "700 clamp(16px, 3.5vw, 22px) var(--h)",
                    margin: "2px 0 0",
                    color: "#fff",
                    textTransform: "uppercase",
                    lineHeight: "1.2",
                  }}
                >
                  {activeServiceModal.title}
                </h3>
              </div>
              <button
                onClick={closeAllModals}
                aria-label="Cerrar modal"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 150ms ease",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Barra de Alternancia de Vistas (DESACOPLADA - NO TAPA LA IMAGEN) */}
            <div
              role="tablist"
              aria-label="Modos de inspección técnica"
              style={{
                padding: "10px 20px",
                background: "rgba(6, 17, 42, 0.95)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginRight: "4px",
                }}
              >
                Modo de vista:
              </span>
              <button
                type="button"
                role="tab"
                aria-selected={modalImageView === "detail"}
                onClick={() => setModalImageView("detail")}
                style={{
                  background: modalImageView === "detail" ? "var(--or)" : "rgba(255,255,255,0.06)",
                  color: modalImageView === "detail" ? "#0a1a3a" : "#fff",
                  border: modalImageView === "detail" ? "1px solid var(--or)" : "1px solid rgba(255,255,255,0.18)",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: modalImageView === "detail" ? "#0a1a3a" : "var(--or)",
                  }}
                />
                {getServiceTabLabel(activeServiceModal)}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={modalImageView === "card"}
                onClick={() => setModalImageView("card")}
                style={{
                  background: modalImageView === "card" ? "var(--or)" : "rgba(255,255,255,0.06)",
                  color: modalImageView === "card" ? "#0a1a3a" : "#fff",
                  border: modalImageView === "card" ? "1px solid var(--or)" : "1px solid rgba(255,255,255,0.18)",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: modalImageView === "card" ? "#0a1a3a" : "#a5c2f7",
                  }}
                />
                Vista General de Fabricación
              </button>
            </div>

            {/* Imagen Principal (Limpia y Centrada) */}
            <div
              style={{
                position: "relative",
                background: "#020714",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "220px",
                overflow: "hidden",
              }}
            >
              <Image
                src={modalImageView === "detail" ? activeServiceModal.detailImg : activeServiceModal.img}
                alt={activeServiceModal.title}
                width={1264}
                height={848}
                sizes="(min-width: 860px) 80vw, 100vw"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "50vh",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            {/* Footer con especificaciones técnicas y CTA (100% visible con scroll seguro) */}
            <div
              style={{
                padding: "16px 20px",
                background: "rgba(10,26,58,0.95)",
                borderTop: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div style={{ flex: "1 1 320px", minWidth: "260px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    {modalImageView === "detail" ? (
                      <span
                        style={{
                          fontSize: "11px",
                          background: "rgba(29, 79, 184, 0.4)",
                          color: "#a5c2f7",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontWeight: 700,
                          border: "1px solid rgba(29, 79, 184, 0.6)",
                        }}
                      >
                        Tolerancia: {activeServiceModal.tolerance}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "11px",
                          background: "rgba(255, 138, 31, 0.2)",
                          color: "#ff8a1f",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontWeight: 700,
                          border: "1px solid rgba(255, 138, 31, 0.4)",
                        }}
                      >
                        Proceso de Planta Famesa
                      </span>
                    )}
                    <strong style={{ fontSize: "14px", color: "#fff", letterSpacing: "0.01em" }}>
                      {modalImageView === "detail" ? activeServiceModal.detailTitle : "Fabricación & Montaje en Planta"}
                    </strong>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.8)",
                      lineHeight: "1.45",
                    }}
                  >
                    {modalImageView === "detail" ? activeServiceModal.detailDesc : activeServiceModal.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeAllModals();
                    selectServiceForQuote(activeServiceModal.title);
                  }}
                  className="btn bp"
                  style={{
                    borderRadius: "8px",
                    padding: "10px 22px",
                    fontSize: "13px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  Cotizar este servicio ahora
                </button>
              </div>
            </div>
          </div>
        ) : lightboxIndex !== null && galleryPhotos[lightboxIndex] ? (
          /* ========================================================= */
          /* VISTA B: VISOR DE FOTOGRAFÍAS REALES DEL TALLER Y PIEZAS  */
          /* ========================================================= */
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              margin: "0 auto",
              background: "#06112a",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 28px 70px rgba(0,0,0,0.8)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Cabecera / Barra superior de la Galería */}
            <div
              style={{
                padding: "12px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(10,26,58,0.85)",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--or)",
                    fontWeight: 700,
                  }}
                >
                  {lightboxIndex < tallerPhotos.length ? "Fotografía Real · Taller y Maestranza Famesa" : "Dossier Corporativo · Famesa C.A."}
                </span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginLeft: "10px" }}>
                  ({lightboxIndex + 1} de {galleryPhotos.length})
                </span>
              </div>
              <button
                onClick={closeAllModals}
                aria-label="Cerrar visor"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Imagen de Galería con flechas de navegación */}
            <div
              style={{
                position: "relative",
                background: "#020714",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "240px",
              }}
            >
              <Image
                src={galleryPhotos[lightboxIndex].src}
                alt={galleryPhotos[lightboxIndex].title}
                width={galleryPhotos[lightboxIndex].width ?? 1264}
                height={galleryPhotos[lightboxIndex].height ?? 848}
                sizes="90vw"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "58vh",
                  objectFit: "contain",
                  display: "block",
                }}
              />

              {/* Botón Anterior */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightbox();
                }}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(10,26,58,0.8)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
                aria-label="Foto anterior"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Botón Siguiente */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightbox();
                }}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(10,26,58,0.8)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
                aria-label="Foto siguiente"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Pie de Foto con Título y Descripción */}
            <div
              style={{
                padding: "14px 20px",
                background: "rgba(10,26,58,0.95)",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3
                style={{
                  font: "700 18px var(--h)",
                  margin: "0 0 4px",
                  color: "#fff",
                  textTransform: "uppercase",
                }}
              >
                {galleryPhotos[lightboxIndex].title}
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: "1.4" }}>
                {galleryPhotos[lightboxIndex].caption}
              </p>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
