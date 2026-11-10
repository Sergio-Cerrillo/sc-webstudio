"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Plus, X } from "lucide-react"
import { COMPANY_PATH } from "@/lib/proposals/demo"
import { PrivateControls } from "./private-controls"
import { useDemo } from "./demo-provider"
import { MoyaOpening } from "./moya-opening"
import { MoyaWallOpening } from "./moya-wall-opening"
import { MoyaHeader } from "./moya-header"

const asset = (name: string) => `${COMPANY_PATH}/${name}.webp`
const kitchenAsset = (name: string) => `${COMPANY_PATH}/cocina-antes-despues-horizontal/cocina-${name}.webp`
const services = [
  {
    name: "Obra nueva",
    image: "casa",
    text: "De la primera línea al último detalle. Espacios pensados alrededor de tu forma de vivir.",
  },
  {
    name: "Reformas integrales",
    image: "interior",
    text: "Una nueva vida para lo que ya existe. Redistribución, instalaciones y materiales en una misma visión.",
  },
  {
    name: "Cocinas y baños",
    image: "cocina",
    text: "Los espacios cotidianos, extraordinariamente bien resueltos. Función, textura y luz natural.",
  },
  {
    name: "Interiorismo",
    image: "bano",
    text: "Proporción y calma. Un diálogo entre materiales, mobiliario e iluminación.",
  },
  {
    name: "Decoración",
    image: "interior",
    text: "La capa más personal de un espacio. Piezas, tejidos y detalles que le dan sentido.",
  },
]
const projects = [
  {
    name: "Casa Olivera",
    type: "Reforma integral",
    category: "Reformas",
    image: "interior",
    detail:
      "Una vivienda que se abre a la luz. Piedra, madera y una distribución para compartir.",
    gallery: ["interior", "cocina", "bano"],
  },
  {
    name: "Casa Patio",
    type: "Obra nueva",
    category: "Obra nueva",
    image: "casa",
    detail:
      "La vida alrededor de un patio. Una exploración de volúmenes serenos y transiciones al exterior.",
    gallery: ["casa", "estructura", "interior"],
  },
  {
    name: "Espacio Calma",
    type: "Interiorismo",
    category: "Interiorismo",
    image: "cocina",
    detail:
      "Un refugio cotidiano de materiales naturales, tonos cálidos y detalles que permanecen.",
    gallery: ["cocina", "bano", "interior"],
  },
]
const processSteps = [
  [
    "Escuchar",
    "Primera visita para entender tus necesidades, el espacio y lo que esperas de él.",
  ],
  [
    "Imaginar",
    "Definir la distribución, los materiales y una propuesta que puedas visualizar.",
  ],
  [
    "Planificar",
    "Acordar alcance, mediciones, presupuesto y calendario antes de empezar.",
  ],
  [
    "Construir",
    "Coordinar oficios, compartir avances y revisar cada encuentro entre materiales.",
  ],
  [
    "Acompañar",
    "Revisar juntos la entrega y mantener un canal de seguimiento y posventa.",
  ],
]

export function MoyaLanding() {
  const { dispatch, ready } = useDemo()
  const [service, setService] = useState(0)
  const [filter, setFilter] = useState("Todos")
  const [selectedProject, setSelectedProject] = useState(0)
  const [compare, setCompare] = useState(50)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Reforma integral",
    message: "",
  })
  const dialog = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    const d = dialog.current
    const restore = () => returnFocus.current?.focus()
    d?.addEventListener("close", restore)
    return () => d?.removeEventListener("close", restore)
  }, [])
  const fill = () => {
    setForm({
      name: "Andrea Demo · Ficticia",
      email: "andrea@example.com",
      phone: "000 000 010",
      service: "Reforma integral",
      message:
        "Solicitud de demostración: reforma de una vivienda de 80 m² con cocina abierta y materiales naturales.",
    })
    setSent(false)
  }
  return (
    <main className="moya-site">
      <PrivateControls />
      <MoyaHeader />
      <MoyaWallOpening />
      <MoyaOpening />
      <section
        className="moya-section moya-projects"
        id="proyectos"
        tabIndex={-1}
      >
        <div className="moya-section-heading">
          <div>
            <p className="p-eyebrow">01 / Espacios con intención</p>
            <h2>
              La materia.
              <br />
              <em>Hecha espacio.</em>
            </h2>
          </div>
          <p>
            Tres historias para imaginar
            <br />
            lo que podríamos hacer.
          </p>
        </div>
        <div className="moya-filters" aria-label="Filtrar proyectos">
          {["Todos", "Reformas", "Obra nueva", "Interiorismo"].map((f) => (
            <button
              aria-pressed={filter === f}
              className={filter === f ? "active" : ""}
              key={f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="moya-project-grid">
          {projects
            .filter((p) => filter === "Todos" || p.category === filter)
            .map((p) => (
              <motion.article
                key={p.name}
                initial={{ clipPath: "inset(15% 0 0 0)", opacity: 0.4 }}
                whileInView={{ clipPath: "inset(0% 0 0 0)", opacity: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.7 }}
              >
                <button
                  className="moya-project-image"
                  onClick={(e) => {
                    returnFocus.current = e.currentTarget
                    setSelectedProject(projects.indexOf(p))
                    dialog.current?.showModal()
                  }}
                  aria-label={`Abrir ficha de ${p.name}`}
                >
                  <img
                    src={asset(p.image)}
                    alt={`${p.name}: fotografía ilustrativa de ${p.type.toLowerCase()}`}
                    loading="lazy"
                  />
                  <span>
                    Explorar espacio <ArrowUpRight size={18} />
                  </span>
                </button>
                <div className="moya-project-caption">
                  <h3>{p.name}</h3>
                  <span>{p.type}</span>
                </div>
                <small>Proyecto ficticio · Fotografía ilustrativa</small>
              </motion.article>
            ))}
        </div>
      </section>
      <section className="moya-intro moya-section">
        <p className="p-eyebrow">Construir desde lo esencial</p>
        <h2>
          Hay espacios que se habitan.
          <br />
          <em>Y espacios que se sienten.</em>
        </h2>
        <div>
          <span className="moya-intro-line" />
          <p>
            Una propuesta para dar forma a una manera de construir: honesta con
            los materiales, atenta a los detalles y cercana a las personas.
          </p>
          <p className="moya-demo-note">
            Presentación conceptual. Los proyectos, las fotografías de
            referencia y los testimonios de esta página son material de
            demostración, sin atribución de obras a la empresa.
          </p>
        </div>
      </section>
      <section className="moya-services moya-section" id="servicios">
        <div>
          <p className="p-eyebrow">02 / Del plano a la vida</p>
          <h2>
            Una visión.
            <br />
            <em>Todos los detalles.</em>
          </h2>
          <div className="moya-service-list">
            {services.map((s, i) => (
              <div key={s.name}>
                <button
                  onClick={() => setService(i)}
                  aria-expanded={service === i}
                  aria-controls={`service-${i}`}
                >
                  <span>0{i + 1}</span>
                  {s.name}
                  <Plus size={20} className={service === i ? "rotated" : ""} />
                </button>
                {service === i && (
                  <div className="moya-service-content" id={`service-${i}`}>
                    <p>{s.text}</p>
                    <a
                      href="#presupuesto"
                      onClick={() => setForm({ ...form, service: s.name })}
                    >
                      Pedir presupuesto <ArrowUpRight size={16} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <figure>
          <img
            key={service}
            src={asset(services[service].image)}
            alt={`Referencia ilustrativa para ${services[service].name}`}
            loading="lazy"
          />
          <figcaption>
            Material, textura y luz · Imagen de referencia
          </figcaption>
        </figure>
      </section>
      <section className="moya-compare moya-section" id="antes-despues">
        <div className="moya-section-heading">
          <div>
            <p className="p-eyebrow">03 / Mirar de nuevo</p>
            <h2>
              El mismo espacio.
              <br />
              <em>Otra sensación.</em>
            </h2>
          </div>
          <p>
            Desliza para comparar
            <br />
            la transformación de esta cocina.
          </p>
        </div>
        <div
          className="moya-comparison"
          style={{ "--compare": `${compare}%` } as React.CSSProperties}
        >
          <img
            src={kitchenAsset("despues")}
            width={1168}
            height={657}
            alt="Después: cocina contemporánea con isla de piedra, iluminación cálida y mobiliario de madera"
            loading="lazy"
          />
          <img
            className="moya-before"
            src={kitchenAsset("antes")}
            width={1168}
            height={657}
            alt="Antes: cocina con muebles clásicos de madera, azulejos estampados y sin isla"
            loading="lazy"
          />
          <span className="before-label" style={{opacity:compare>8?1:0}}>Antes</span>
          <span className="after-label" style={{opacity:compare<92?1:0}}>Después</span>
          <div className="comparison-handle" aria-hidden="true">
            <span>↔</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={compare}
            onChange={(e) => setCompare(Number(e.target.value))}
            aria-label="Comparar el antes y el después de la cocina"
            aria-valuetext={`${compare}% de la imagen Antes visible`}
          />
        </div>
        <p className="moya-demo-note">
          Imágenes facilitadas para esta propuesta. Usa el deslizador con el
          ratón, el dedo o las flechas del teclado.
        </p>
      </section>
      <section className="moya-sequence">
        <div className="moya-section-heading">
          <div>
            <p className="p-eyebrow">04 / De dentro hacia fuera</p>
            <h2>
              Lo que no se ve.
              <br />
              <em>También importa.</em>
            </h2>
          </div>
        </div>
        <div className="moya-sequence-grid">
          {[
            ["estructura", "01", "La estructura", "El origen de todo."],
            ["bano", "02", "Los acabados", "El tacto de cada decisión."],
            ["interior", "03", "La entrega", "El comienzo de otra historia."],
          ].map(([img, num, title, subtitle]) => (
            <motion.figure
              key={img}
              initial={{ opacity: 0.4, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <img
                src={asset(img)}
                alt={`${title}, imagen ilustrativa independiente`}
                loading="lazy"
              />
              <figcaption>
                <small>{num} / Fase conceptual</small>
                <h3>{title}</h3>
                <p>{subtitle}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
        <p className="moya-demo-note">
          Secuencia ilustrativa de fases con fotografías de distintos espacios;
          no corresponde al seguimiento de una obra real.
        </p>
      </section>
      <section className="moya-section moya-about" id="empresa">
        <div>
          <p className="p-eyebrow">05 / Nuestra forma de hacer</p>
          <h2>
            El oficio de construir.
            <br />
            <em>
              La calma de
              <br />
              hacerlo bien.
            </em>
          </h2>
          <p>
            Construccions Germans Moya.
            <br />
            Construcción, reformas integrales,
            <br />
            interiorismo y decoración.
          </p>
          <p className="moya-demo-note">
            Texto editorial propuesto para la marca.
            <br />
            Proceso ilustrativo sujeto a validación por la empresa.
          </p>
        </div>
        <div className="moya-process">
          {processSteps.map(([title, text], i) => (
            <details key={title} open={i === 0}>
              <summary>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <Plus size={20} />
              </summary>
              <p>{text}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="moya-testimonial">
        <p className="p-eyebrow">Una experiencia imaginada</p>
        <blockquote>
          «Lo más importante fue sentir
          <br />
          que alguien entendía cómo
          <br />
          <em>queríamos vivir.»</em>
        </blockquote>
        <p>Clara · Personaje ficticio</p>
        <small>
          Testimonio inventado para esta demostración. No es una valoración
          real.
        </small>
      </section>
      <section className="moya-section moya-contact" id="presupuesto">
        <div>
          <p className="p-eyebrow">06 / El siguiente espacio</p>
          <h2>
            Todo empieza
            <br />
            <em>por escucharte.</em>
          </h2>
          <p>Cuéntanos lo que tienes en mente.</p>
          <p className="moya-demo-note">
            Formulario de prueba. Usa únicamente datos ficticios. El envío se
            guarda en el CRM local de esta demo; no se envían correos ni
            solicitudes a la empresa.
          </p>
          <button className="moya-fill-demo" onClick={fill}>
            Rellenar con datos demo <ArrowUpRight size={16} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (dispatch({ type: "lead.create", ...form })) {
              setSent(true)
              setForm({
                name: "",
                email: "",
                phone: "",
                service: "Reforma integral",
                message: "",
              })
            }
          }}
        >
          <div className="p-form-grid">
            <label>
              Tu nombre ficticio
              <input
                name="name"
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="off"
                placeholder="Nombre de ejemplo"
              />
            </label>
            <label>
              Correo ficticio
              <input
                name="email"
                type="email"
                required
                maxLength={200}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="off"
                placeholder="nombre@example.com"
              />
            </label>
            <label>
              Teléfono ficticio
              <input
                name="phone"
                type="tel"
                required
                minLength={6}
                maxLength={30}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="000 000 000"
              />
            </label>
            <label>
              ¿Qué imaginas?
              <select
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
              >
                {services.map((s) => (
                  <option key={s.name}>{s.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Un poco sobre tu proyecto
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={2000}
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="El espacio, tus ideas, lo que te gustaría cambiar…"
            />
          </label>
          <label className="p-check">
            <input type="checkbox" required />
            Confirmo que los datos son ficticios y que este envío es una
            simulación local.
          </label>
          <button className="p-button" disabled={!ready}>
            Enviar solicitud demo <ArrowUpRight size={18} />
          </button>
          {sent && (
            <div className="moya-form-success" role="status">
              Solicitud guardada en el CRM de esta demo.{" "}
              <Link href={`${COMPANY_PATH}/admin?modulo=crm`}>Abrir CRM →</Link>
            </div>
          )}
        </form>
      </section>
      <footer className="moya-footer">
        <img
          src={asset("logo")}
          alt="Construccions Germans Moya"
          loading="lazy"
        />
        <div>
          <p>
            Espacios para vivir.
            <br />
            <em>Una forma de construir.</em>
          </p>
          <a href="#presupuesto">
            Empezamos una conversación <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="moya-footer-bottom">
          <span>Propuesta de SC WebStudio · Entorno privado</span>
          <Link href={`${COMPANY_PATH}/admin`}>
            Explorar administración demo ↗
          </Link>
          <Link href="/propuestas">Volver a propuestas</Link>
        </div>
        <small>
          Marca y fachada facilitadas por el propietario. Resto de fotografías:
          referencias ilustrativas de Unsplash. Proyectos y testimonios
          ficticios.
        </small>
      </footer>
      <dialog
        ref={dialog}
        className="moya-project-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close()
        }}
      >
        <div>
          <button
            className="moya-dialog-close"
            onClick={() => dialog.current?.close()}
            aria-label="Cerrar ficha de proyecto"
          >
            <X />
          </button>
          <p className="p-eyebrow">
            Proyecto ficticio / {projects[selectedProject].type}
          </p>
          <h2>{projects[selectedProject].name}</h2>
          <p>{projects[selectedProject].detail}</p>
          <p className="moya-demo-note">
            Todas las fotografías son ilustrativas. No son trabajos de
            Construccions Germans Moya.
          </p>
          <div className="moya-dialog-gallery">
            {projects[selectedProject].gallery.map((img, i) => (
              <img
                key={img}
                src={asset(img)}
                alt={`Referencia ilustrativa ${i + 1} de ${projects[selectedProject].name}`}
                loading="lazy"
              />
            ))}
          </div>
          <button
            className="p-button"
            onClick={() => {
              dialog.current?.close()
              document.getElementById("presupuesto")?.scrollIntoView()
            }}
          >
            Imaginar mi proyecto <ArrowUpRight size={16} />
          </button>
        </div>
      </dialog>
    </main>
  )
}
