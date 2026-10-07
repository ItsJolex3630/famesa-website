"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { toast } from "sonner";
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
  Maximize2,
} from "lucide-react";

const WA_BASE = "https://wa.me/584143410187";

// 1. DATA: Servicios
const services = [
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
    code: "BUJES",
    name: "Bujes técnicos de fricción",
    spec: "A medida según alojamiento",
    material: "Bronce SAE 64/65 / Nylon 6 / Teflón",
    desc: "Autolubricados, con ranuras de engrase en espiral.",
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
  { name: "Siderúrgicas y metalurgia primaria", badge: "Ejes & Bronces" },
  { name: "Industrias de procesos químicos y alimentos", badge: "Inoxidable & PTFE" },
  { name: "Metalmecánica general y manufactura", badge: "Mecanizado CNC" },
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

const galleryPhotos = [
  {
    src: "/images/taller-rectificado.jpg",
    title: "Mecanizado de precisión en torno industrial pesado",
    caption: "Torno paralelo de gran capacidad en desbaste y acabado superficial de piezas cilíndricas en taller Famesa.",
  },
  {
    src: "/images/taller-rodillo.jpg",
    title: "Inspección de calidad y concentricidad en bloque en V",
    caption: "Control de calidad dimensional con reloj comparador sobre rodillo pesado terminado con muñones y eje rectificado.",
  },
  {
    src: "/images/piezas-cero.jpg",
    title: "Lote de componentes especiales fabricados desde cero",
    caption: "Ejes estriados tratados, bujes en bronce fosfórico SAE 64, piñones y anillos Delrin sobre plano técnico.",
  },
  {
    src: "/images/service-rod.jpg",
    title: "Rectificado y acabado de rodillos industriales",
    caption: "Montaje sobre plato de torno con chispas de mecanizado de precisión en planta Santa Rosa, Valencia.",
  },
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
  const [formUrgency, setFormUrgency] = useState<"estandar" | "prioritario" | "emergencia">("estandar");
  const [formQuantity, setFormQuantity] = useState(1);
  const [formMaterial, setFormMaterial] = useState("Acero 1045");
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rfqTrackingId, setRfqTrackingId] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);

  // Generate unique ticket ID on mount
  useEffect(() => {
    setRfqTrackingId(`RFQ-FAMESA-${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

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
    const sectionIds = ["servicios", "catalogo", "piezas", "industrias", "materiales", "taller", "proceso", "calidad", "faq", "cotiza"];
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

    // Keyboard navigation for lightbox
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") {
          if (dialogRef.current) dialogRef.current.close();
          setLightboxIndex(null);
        }
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

  // Lightbox handlers
  const openLightboxByIndex = (index: number) => {
    setLightboxIndex(index);
    if (dialogRef.current) dialogRef.current.showModal();
  };

  const closeLightbox = () => {
    if (dialogRef.current) dialogRef.current.close();
    setLightboxIndex(null);
  };

  const nextLightbox = () => {
    setLightboxIndex((curr) => (curr !== null ? (curr + 1) % galleryPhotos.length : null));
  };

  const prevLightbox = () => {
    setLightboxIndex((curr) => (curr !== null ? (curr - 1 + galleryPhotos.length) % galleryPhotos.length : null));
  };

  // Modal de Inspección Técnica de Servicio
  const openServiceModal = (service: typeof services[0]) => {
    setActiveServiceModal(service);
    setModalImageView("detail");
    setLightboxIndex(null);
    if (dialogRef.current) dialogRef.current.showModal();
  };

  const closeAllModals = () => {
    if (dialogRef.current) dialogRef.current.close();
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
    prioritario: "Prioritario (3-5 días)",
    emergencia: "PARADA DE EMERGENCIA 24/7 (Inmediata)",
  }[formUrgency];

  const getWhatsAppMessageText = () => {
    return `*SOLICITUD DE COTIZACIÓN [${rfqTrackingId}]*
----------------------------------------
*Cliente / Empresa:* ${formName.trim() || "[Por indicar]"}
*Servicio requerido:* ${formService}
*Nivel de Urgencia:* ${urgencyLabel}
*Cantidad estimada:* ${formQuantity} unidad(es)
*Material preferido:* ${formMaterial}
*Detalles técnicos:* ${formMessage.trim() || "Por definir en conversación"}
----------------------------------------
Solicitado desde famesa.com.ve · Valencia, Carabobo`;
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Por favor indica tu nombre o empresa.");
      return;
    }
    if (!formMessage.trim()) {
      setFormError("Por favor descríbenos brevemente la pieza o falla que necesitas solucionar.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    const waText = getWhatsAppMessageText();
    const targetUrl = `${WA_BASE}?text=${encodeURIComponent(waText)}`;

    // Optional background log to serverless endpoint
    try {
      fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formName.trim(),
          companyName: formName.trim(),
          email: "contacto@famesa.com",
          phone: "+584143410187",
          serviceType: "mecanizado_cnc",
          urgency: formUrgency,
          specifications: formMessage.trim(),
        }),
      }).catch(() => {});
    } catch {}

    toast.success("Abriendo WhatsApp con tu requerimiento técnico estructurado...");

    setTimeout(() => {
      window.location.href = targetUrl;
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000);
    }, 500);
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
      {/* 1. TOP ANNOUNCEMENT & STATUS RIBBON */}
      <div className="top-ribbon">
        <div className="w">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#e2e8f0", fontWeight: 600 }}>
              <span className="pulse-led" />
              PLANTA OPERATIVA 100% · SANTA ROSA, VALENCIA
            </span>
            <span style={{ opacity: 0.5, display: "inline-block" }}>|</span>
            <span style={{ color: "var(--or)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Clock size={13} />
              Atención 24/7 para Paradas de Planta
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
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
          </div>
        </div>
      </div>

      {/* 2. BARRA DE NAVEGACIÓN VIDRIADA */}
      <nav className={scrolled ? "sc" : ""}>
        <div className="w">
          <a href="#top" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <img src="/images/logo.jpg" alt="Famesa C.A." />
          </a>

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
              href="#cotiza"
              aria-current={activeSection === "cotiza" ? "true" : undefined}
            >
              Cotizar
            </a>
          </div>

          <a
            className="btn nb"
            href="https://wa.me/584143410187?text=Hola%20Famesa%2C%20quiero%20una%20cotizaci%C3%B3n"
            style={{ padding: "10px 18px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <MessageCircle size={16} />
            Cotizar por WhatsApp
          </a>
        </div>
      </nav>

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
              Tolerancias DIN ISO 2768
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
                { id: "metalmecanica", label: "Torno & Rodillos" },
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
                  <img
                    loading="lazy"
                    src={s.img}
                    alt={s.title}
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
                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: "var(--or)" }}>
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
            <img
              alt="Piezas metálicas y engranajes fabricados por Famesa"
              className="pic rv"
              src="/images/piezas-cero.jpg"
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
              Engranajes y bujes mecanizados en Famesa
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
            Rectificado y fabricación de rodillos en nuestra nave industrial en Santa Rosa, Valencia. Haz clic en las fotos para visualizarlas en pantalla completa.
          </p>

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
            <figure className="fg">
              <img
                alt="Técnico de Famesa rectificando un rodillo industrial"
                className="pic rv"
                src="/images/taller-rectificado.jpg"
                onClick={() => openLightboxByIndex(0)}
              />
              <figcaption>Foto real · Taller Famesa</figcaption>
            </figure>

            <figure className="fg">
              <img
                alt="Rodillo industrial terminado con eje"
                className="pic rv"
                src="/images/taller-rodillo.jpg"
                style={{ ["--i" as string]: "2" }}
                onClick={() => openLightboxByIndex(1)}
              />
              <figcaption>Foto real · Taller Famesa</figcaption>
            </figure>
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
                <h4 style={{ font: "700 18px var(--h)", margin: "8px 0 4px", textTransform: "uppercase" }}>{step.title}</h4>
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
                <h4 style={{ font: "700 20px var(--h)", margin: "4px 0 6px", textTransform: "uppercase" }}>{q.title}</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--mu)" }}>{q.text}</p>
              </div>
            ))}
          </div>
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
            </div>

            <b>Dirección de Taller</b>
            <p>Zona Industrial Santa Rosa, Valencia, Estado Carabobo, Venezuela.</p>
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
                  <option value="Piezas fabricadas desde cero">Piezas fabricadas desde cero</option>
                  <option value="Reparación urgente de reductor">Reparación urgente de reductor</option>
                  <option value="Otro requerimiento">Otro requerimiento</option>
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
                {[
                  { id: "estandar", label: "Estándar", desc: "Planificado" },
                  { id: "prioritario", label: "Prioritario", desc: "3-5 días" },
                  { id: "emergencia", label: "Parada 24/7", desc: "Inmediata" },
                ].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setFormUrgency(u.id as any)}
                    style={{
                      background: formUrgency === u.id ? (u.id === "emergencia" ? "#dc2626" : "var(--bl)") : "#fff",
                      color: formUrgency === u.id ? "#fff" : "var(--ink)",
                      border: `1px solid ${formUrgency === u.id ? (u.id === "emergencia" ? "#dc2626" : "var(--bl)") : "var(--st2)"}`,
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

            {formError && (
              <small
                aria-live="polite"
                style={{ color: "#b42318", minHeight: "1.2em", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}
              >
                <AlertTriangle size={14} />
                {formError}
              </small>
            )}

            <button
              className="btn"
              type="submit"
              disabled={isSubmitting}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "6px" }}
            >
              <MessageCircle size={18} />
              {isSubmitting ? "Abriendo WhatsApp…" : "Enviar Ficha a WhatsApp"}
            </button>
          </form>
        </div>
      </section>

      {/* 15. FOOTER INDUSTRIAL */}
      <footer>
        <div className="w">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/images/logo.jpg" alt="Famesa C.A." />
            <span style={{ fontWeight: 600, color: "#fff" }}>Famesa C.A.</span>
          </div>

          <span>RIF J-31352388-7 · Zona Industrial Santa Rosa, Valencia, Carabobo, Venezuela</span>

          <span>
            Página creada por{" "}
            <a
              href="https://www.instagram.com/somosvendo.ve/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff", textDecoration: "underline" }}
            >
              Vendo
            </a>
          </span>
        </div>
      </footer>

      {/* 16. BOTÓN FLOTANTE WHATSAPP */}
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

      {/* 16. MODAL INTERACTIVO UNIFICADO: INSPECCIÓN TÉCNICA Y GALERÍA */}
      <dialog
        id="lb"
        ref={dialogRef}
        aria-label="Inspección técnica detallada Famesa"
        onClick={closeAllModals}
      >
        {activeServiceModal ? (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "min(94vw, 980px)",
              margin: "0 auto",
              background: "#06112a",
              borderRadius: "18px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
            }}
          >
            {/* Header del Modal */}
            <div style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(10,26,58,0.7)" }}>
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--or)", fontWeight: 700 }}>
                  Inspección Técnica de Servicio
                </span>
                <h3 style={{ font: "700 22px var(--h)", margin: "2px 0 0", color: "#fff", textTransform: "uppercase" }}>
                  {activeServiceModal.title}
                </h3>
              </div>
              <button
                onClick={closeAllModals}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Imagen Principal con Switcher */}
            <div style={{ position: "relative", background: "#020714" }}>
              <img
                src={modalImageView === "detail" ? activeServiceModal.detailImg : activeServiceModal.img}
                alt={activeServiceModal.title}
                style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", display: "block" }}
              />

              {/* Botones de alternancia de vista */}
              <div style={{ position: "absolute", top: "14px", left: "14px", display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setModalImageView("detail")}
                  style={{
                    background: modalImageView === "detail" ? "var(--or)" : "rgba(10,26,58,0.85)",
                    color: modalImageView === "detail" ? "#0a1a3a" : "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "99px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  Inspección Micrométrica (Macro)
                </button>
                <button
                  onClick={() => setModalImageView("card")}
                  style={{
                    background: modalImageView === "card" ? "var(--or)" : "rgba(10,26,58,0.85)",
                    color: modalImageView === "card" ? "#0a1a3a" : "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "99px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  Vista General de Fabricación
                </button>
              </div>
            </div>

            {/* Footer con especificaciones y CTA */}
            <div style={{ padding: "18px 24px", background: "rgba(10,26,58,0.9)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                <div style={{ maxWidth: "600px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", background: "rgba(29, 79, 184, 0.4)", color: "#a5c2f7", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                      Tolerancia: {activeServiceModal.tolerance}
                    </span>
                    <strong style={{ fontSize: "14px", color: "#fff" }}>
                      {modalImageView === "detail" ? activeServiceModal.detailTitle : "Fabricación & Montaje"}
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: "1.4" }}>
                    {modalImageView === "detail" ? activeServiceModal.detailDesc : activeServiceModal.desc}
                  </p>
                </div>

                <button
                  onClick={() => {
                    closeAllModals();
                    selectServiceForQuote(activeServiceModal.title);
                  }}
                  className="btn bp"
                  style={{ borderRadius: "8px", padding: "10px 20px", fontSize: "13px" }}
                >
                  Cotizar este servicio ahora
                </button>
              </div>
            </div>
          </div>
        ) : lightboxIndex !== null ? (
          /* Vista de Galería General */
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "min(92vw, 960px)",
              margin: "0 auto",
              background: "#06112a",
              borderRadius: "18px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={galleryPhotos[lightboxIndex].src}
                alt={galleryPhotos[lightboxIndex].title}
                style={{ width: "100%", maxHeight: "75vh", objectFit: "contain", display: "block" }}
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightbox();
                }}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(10,26,58,0.75)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "50%",
                  width: "42px",
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Foto anterior"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightbox();
                }}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(10,26,58,0.75)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "50%",
                  width: "42px",
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Foto siguiente"
              >
                <ChevronRight size={24} />
              </button>

              <button
                onClick={closeAllModals}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: "rgba(10,26,58,0.75)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Cerrar visor"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "16px 22px", background: "rgba(10,26,58,0.9)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <h3 style={{ font: "700 20px var(--h)", margin: 0, color: "#fff", textTransform: "uppercase" }}>
                  {galleryPhotos[lightboxIndex].title}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--or)", fontWeight: 600 }}>
                  {lightboxIndex + 1} de {galleryPhotos.length}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
                {galleryPhotos[lightboxIndex].caption}
              </p>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
