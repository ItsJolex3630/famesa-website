"use client";

import { useEffect, useState, useRef, FormEvent } from "react";

const WA = "https://wa.me/584143410187";

const services = [
  {
    id: "rod",
    title: "Fabricación y rectificado de rodillos",
    desc: "Rodillos motrices, de retorno, engomados y ranurados para bandas transportadoras, papeleras, siderúrgicas e industrias de procesos.",
    tags: ["Torno pesado", "Ranurado helicoidal", "Balanceo dinámico"],
    img: "/images/service-rod.jpg",
  },
  {
    id: "pla",
    title: "Mecanizado en plásticos de ingeniería",
    desc: "Piezas en nylon, poliacetal (Delrin), teflón (PTFE), UHMW y polímeros industriales.",
    tags: ["Torneado y fresado CNC", "Resistencia al desgaste"],
    img: "/images/service-pla.jpg",
  },
  {
    id: "est",
    title: "Estrellas de transporte y guías de embotellado",
    desc: "Para líneas de llenado, envasado y tapado, en UHMW-PE, nylon, Delrin y teflón.",
    tags: ["CNC y ruteado", "Bajo coeficiente de fricción"],
    img: "/images/service-est.jpg",
  },
  {
    id: "red",
    title: "Mantenimiento de reductores industriales",
    desc: "Ingeniería y diagnóstico de precisión. Servicio técnico especializado y emergencias 24/7.",
    tags: ["Preventivo y correctivo", "Emergencias 24/7"],
    img: "/images/service-red.jpg",
  },
  {
    id: "sol",
    title: "Soldadura y estructuras metálicas",
    desc: "Soldaduras eléctricas autógenas, soldadura TIG (argón), estructuras metálicas, fabricación de tanques y metalizados.",
    tags: ["TIG (argón)", "Tanques", "Estructuras"],
    img: "/images/service-sol.jpg",
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
  "Embotellado: líneas de llenado, envasado y tapado",
  "Bandas transportadoras",
  "Industria papelera",
  "Siderúrgicas",
  "Industrias de procesos",
  "Metalmecánica en general",
];

const materials = [
  "Fibra fenólica",
  "Baquelita",
  "Poliuretano",
  "Nylon",
  "Teflón",
  "Ultraleno",
  "Hierro",
  "Aceros especiales",
  "Bronce",
  "Acero inoxidable",
  "Aceros con tratamiento térmico",
];

const processSteps = [
  { num: "01", text: "Cuéntanos qué necesitas: pieza, medidas, material y cantidad." },
  { num: "02", text: "Te respondemos con la cotización." },
  { num: "03", text: "Fabricamos o reparamos tu pieza o equipo." },
  { num: "04", text: "Entrega o despacho a nivel nacional." },
];

const qualityPoints = [
  { num: "01", text: "Planes de satisfacción al cliente" },
  { num: "02", text: "Planes de mejora continua" },
  { num: "03", text: "Planes de desarrollo personal" },
  { num: "04", text: "Planes de gestión ambiental" },
];

const faqs = [
  {
    q: "¿Qué materiales trabajan?",
    a: "Fibra fenólica, baquelita, poliuretano, nylon, teflón, ultraleno, hierro, aceros especiales, bronce, acero inoxidable y aceros con tratamientos térmicos.",
  },
  {
    q: "¿Hacen despacho a nivel nacional?",
    a: "Sí, según nuestros requerimientos de planta. Coordinamos envíos seguros y fletes a toda Venezuela.",
  },
  {
    q: "¿Atienden emergencias?",
    a: "El servicio técnico de reductores y paradas de planta cuenta con guardia técnica 24/7.",
  },
  {
    q: "¿Qué necesito para cotizar?",
    a: "Indica la pieza o servicio, medidas, material y cantidad. Si tienes foto, muestra física o plano, compártelo por WhatsApp.",
  },
  {
    q: "¿Cuánto tardan en entregar?",
    a: "Los tiempos varían según la complejidad del mecanizado y disponibilidad del material, con prioridad alta para paradas operativas.",
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
  const [lightboxImg, setLightboxImg] = useState<{ src: string; alt: string } | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formService, setFormService] = useState("Fabricación y rectificado de rodillos");
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // Scroll handling for nav shadow
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Reveal animation observer
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
    const sectionIds = ["servicios", "piezas", "taller", "calidad", "cotiza"];
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveSection(e.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  // Handle lightbox open/close
  const openLightbox = (src: string, alt: string) => {
    setLightboxImg({ src, alt });
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const closeLightbox = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    setLightboxImg(null);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Escribe tu nombre o empresa.");
      return;
    }
    if (!formMessage.trim()) {
      setFormError("Cuéntanos qué necesitas.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    const waText = `Hola Famesa, soy ${formName.trim()}. Necesito: ${formService}. ${formMessage.trim()}`;
    const targetUrl = `${WA}?text=${encodeURIComponent(waText)}`;

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
          urgency: "estandar",
          specifications: formMessage.trim(),
        }),
      }).catch(() => {});
    } catch {}

    setTimeout(() => {
      window.location.href = targetUrl;
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000);
    }, 400);
  };

  return (
    <>
      {/* 1. NAVEGACIÓN */}
      <nav className={scrolled ? "sc" : ""}>
        <div className="w">
          <a href="#top">
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
              href="#piezas"
              aria-current={activeSection === "piezas" ? "true" : undefined}
            >
              Piezas a medida
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
              Cotiza
            </a>
          </div>
          <a
            className="btn nb"
            href="https://wa.me/584143410187?text=Hola%20Famesa%2C%20quiero%20una%20cotizaci%C3%B3n"
            style={{ padding: "10px 18px" }}
          >
            Cotizar
          </a>
        </div>
      </nav>

      {/* 2. HERO */}
      <header
        className="hero"
        id="top"
        style={{ ["--bg" as string]: "url(/images/hero-bg.jpg)" }}
      >
        <div className="w">
          <span className="tag">Fabricaciones metalmecánica, soldaduras y afines</span>
          <h1>Fabricamos las piezas que tu industria necesita</h1>
          <p className="lead">
            Mecanizado CNC, plásticos de ingeniería, rodillos industriales, soldadura y
            mantenimiento de reductores. Taller especializado en Santa Rosa, Valencia.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <a
              className="btn"
              href="https://wa.me/584143410187?text=Hola%20Famesa%2C%20quiero%20una%20cotizaci%C3%B3n"
            >
              Cotizar por WhatsApp
            </a>
            <a className="btn g" href="#servicios">
              Ver servicios
            </a>
          </div>
          <div className="chips">
            <span>Despacho a nivel nacional</span>
            <span>Servicio técnico y emergencias 24/7</span>
            <span>Santa Rosa, Valencia · Carabobo</span>
          </div>
        </div>

        {/* Animated SVG Gear */}
        <svg className="gear" viewBox="0 0 400 400" aria-hidden="true">
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

      {/* 3. STRIP BANNER DE MÉTRICAS */}
      <div className="strip">
        <div className="w">
          <div>
            <b>
              24<i>/</i>7
            </b>
            Emergencias y servicio técnico
          </div>
          <div>
            <b>TIG</b>
            Soldadura en argón
          </div>
          <div>
            <b>CNC</b>
            Torneado y fresado
          </div>
          <div>
            <b>Nacional</b>
            Despacho a todo el país
          </div>
        </div>
      </div>

      {/* 4. SECCIÓN SERVICIOS */}
      <section id="servicios">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Servicios
          </span>
          <h2>Lo que hacemos</h2>
          <p className="sub">
            De la pieza individual a la reparación de equipos completos, para la industria
            metalmecánica, de procesos y de embotellado.
          </p>
          <div className="grid" id="sv">
            {services.map((s, i) => (
              <article
                key={s.id}
                className="card rv"
                style={{ ["--i" as string]: (i % 3).toString() }}
              >
                <div className="im">
                  <span className="lab">Ilustración</span>
                  <img
                    loading="lazy"
                    src={s.img}
                    alt={s.title}
                    onClick={() => openLightbox(s.img, s.title)}
                  />
                </div>
                <div className="bd">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <div className="tg">
                    {s.tags.map((t, idx) => (
                      <span key={idx}>{t}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}

            {/* Featured Blue Card */}
            <article className="card rv" style={{ ["--i" as string]: "2" }}>
              <div
                className="bd"
                style={{
                  background: "var(--bl)",
                  color: "#fff",
                  justifyContent: "center",
                }}
              >
                <h3>Fabricación, reparación y asistencia técnica</h3>
                <p style={{ color: "#dbe6ff" }}>
                  Si un equipo presenta fallas o dejó de funcionar, contáctanos y te ayudamos a
                  solucionar.
                </p>
                <div style={{ marginTop: "12px" }}>
                  <a className="btn" href={WA}>
                    Contactar
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN PIEZAS DESDE CERO */}
      <section className="st" id="piezas">
        <div className="w two">
          <div className="rv">
            <span className="tag" style={{ color: "var(--bl)" }}>
              Piezas desde cero
            </span>
            <h2>Fabricamos piezas desde cero</h2>
            <ul className="ck" id="ck">
              {checklist.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div style={{ marginTop: "26px" }}>
              <a
                className="btn d"
                href="https://wa.me/584143410187?text=Hola%20Famesa%2C%20quiero%20una%20cotizaci%C3%B3n"
              >
                Pedir una pieza
              </a>
            </div>
          </div>
          <img
            alt="Piezas metálicas y engranajes fabricados por Famesa"
            className="pic rv"
            src="/images/piezas-cero.jpg"
            style={{ ["--i" as string]: "2" }}
            onClick={() =>
              openLightbox(
                "/images/piezas-cero.jpg",
                "Piezas metálicas y engranajes fabricados por Famesa"
              )
            }
          />
        </div>
      </section>

      {/* 6. INDUSTRIAS QUE ATENDEMOS */}
      <section id="industrias">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Industrias
          </span>
          <h2>Industrias que atendemos</h2>
          <p className="sub">
            Fabricación y servicio técnico para la industria metalmecánica y de procesos.
          </p>
          <div className="ind3">
            {industries.map((ind, idx) => (
              <div key={idx}>{ind}</div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. MATERIALES */}
      <section className="st">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Materiales
          </span>
          <h2>Trabajamos con</h2>
          <p className="sub">
            Plásticos técnicos y metales, con tratamientos térmicos cuando la pieza lo requiere.
          </p>
          <div className="mat" id="mt">
            {materials.map((m, idx) => (
              <span key={idx}>{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 8. NUESTRO TALLER */}
      <section className="st" id="taller">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Nuestro taller
          </span>
          <h2>Así se trabaja en Famesa</h2>
          <p className="sub">Rectificado y fabricación de rodillos en nuestro taller.</p>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
            <figure className="fg">
              <img
                alt="Técnico de Famesa rectificando un rodillo industrial"
                className="pic rv"
                src="/images/taller-rectificado.jpg"
                onClick={() =>
                  openLightbox(
                    "/images/taller-rectificado.jpg",
                    "Técnico de Famesa rectificando un rodillo industrial"
                  )
                }
              />
              <figcaption>Foto real · Taller Famesa</figcaption>
            </figure>
            <figure className="fg">
              <img
                alt="Rodillo industrial terminado con eje"
                className="pic rv"
                src="/images/taller-rodillo.jpg"
                style={{ ["--i" as string]: "2" }}
                onClick={() =>
                  openLightbox(
                    "/images/taller-rodillo.jpg",
                    "Rodillo industrial terminado con eje"
                  )
                }
              />
              <figcaption>Foto real · Taller Famesa</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 9. PROCESO DE COTIZACIÓN */}
      <section id="proceso">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Cómo cotizamos
          </span>
          <h2>Del mensaje a la pieza</h2>
          <p className="sub">
            Proceso a confirmar con Famesa. <span className="tag2">A CONFIRMAR</span>
          </p>
          <div className="stp">
            {processSteps.map((step, idx) => (
              <div key={idx}>
                <b>{step.num}</b>
                {step.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CALIDAD */}
      <section className="st" id="calidad">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Calidad
          </span>
          <h2>Objetivos de calidad</h2>
          <p className="sub">Para cumplir con la política de alta calidad total.</p>
          <div className="q4" id="q4">
            {qualityPoints.map((q, idx) => (
              <div key={idx} className="rv" style={{ ["--i" as string]: idx.toString() }}>
                <b>{q.num}</b>
                {q.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section id="faq">
        <div className="w">
          <span className="tag" style={{ color: "var(--bl)" }}>
            Preguntas
          </span>
          <h2>Preguntas frecuentes</h2>
          <div className="faq">
            {faqs.map((f, idx) => (
              <details key={idx}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <div className="slot" style={{ marginTop: "22px" }}>
            <mark className="ph">[TESTIMONIO REAL / LOGOS DE CLIENTES AUTORIZADOS]</mark>
          </div>
        </div>
      </section>

      {/* 12. COTIZACIÓN / CONTACTO */}
      <section className="dark" id="cotiza">
        <div className="w two">
          <div className="ct rv">
            <span className="tag">Cotizaciones</span>
            <h2>Cuéntanos qué necesitas</h2>
            <p style={{ fontSize: "18px" }}>
              Cuando un equipo falla o necesitas una pieza, te ayudamos a solucionarlo.
            </p>
            <b>WhatsApp / Cotizaciones</b>
            <p>
              <a className="tel" href="tel:+584143410187">
                0414 341 0187
              </a>
            </p>
            <p>
              <a className="tel" href="tel:+584121435069">
                0412 143 5069
              </a>
            </p>
            <b>Dirección</b>
            <p>Santa Rosa, Valencia, Edo. Carabobo</p>
            <p>
              <a
                className="tel"
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.google.com/maps/search/?api=1&query=Famesa+C.A.+Santa+Rosa+Valencia+Carabobo"
              >
                Cómo llegar
              </a>{" "}
              · <mark className="ph">[GOOGLE MAPS EMBED]</mark>
            </p>
            <p>
              <mark className="ph">[HORARIO]</mark>
            </p>
            <b>Instagram</b>
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
          </div>

          <form className="rv" id="fm" style={{ ["--i" as string]: "2" }} onSubmit={handleFormSubmit}>
            <label htmlFor="n">Nombre / Empresa</label>
            <input
              autoComplete="name"
              id="n"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ej: Agroindustria Carabobo / Ing. Juan Pérez"
              required
            />

            <label htmlFor="s">Servicio</label>
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
              <option value="Otro">Otro requerimiento</option>
            </select>

            <label htmlFor="m">¿Qué necesitas?</label>
            <textarea
              id="m"
              placeholder="Pieza, medidas, material, cantidad..."
              rows={4}
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              required
            />

            {formError && (
              <small
                aria-live="polite"
                style={{ color: "#b42318", minHeight: "1.2em", fontWeight: 600 }}
              >
                {formError}
              </small>
            )}

            <button className="btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Abriendo WhatsApp…" : "Enviar por WhatsApp"}
            </button>
          </form>
        </div>
      </section>

      {/* 13. FOOTER */}
      <footer>
        <div className="w">
          <img src="/images/logo.jpg" alt="Famesa C.A." />
          <span>RIF J-31352388-7 · Santa Rosa, Valencia, Carabobo</span>
          <span>
            Página de ejemplo creada por{" "}
            <a
              href="https://www.instagram.com/somosvendo.ve/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vendo
            </a>
          </span>
        </div>
      </footer>

      {/* 14. BOTÓN FLOTANTE WHATSAPP */}
      <a
        className="wf"
        href="https://wa.me/584143410187?text=Hola%20Famesa%2C%20quiero%20una%20cotizaci%C3%B3n"
        aria-label="Contactar por WhatsApp"
      >
        WhatsApp
      </a>

      {/* 15. LIGHTBOX MODAL */}
      <dialog
        ref={dialogRef}
        id="lb"
        aria-label="Imagen ampliada"
        onClick={closeLightbox}
      >
        {lightboxImg && (
          <img
            src={lightboxImg.src}
            alt={lightboxImg.alt}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </dialog>
    </>
  );
}
