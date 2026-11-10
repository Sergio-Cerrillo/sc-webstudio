"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronLeft,
  Clock3,
  FileCheck2,
  Files,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Users,
  Wallet,
  X,
} from "lucide-react"
import {
  access,
  COMPANY_PATH,
  dateES,
  modules,
  roles,
  type Module,
  type Role,
} from "@/lib/proposals/demo"
import { useDemo } from "./demo-provider"
import { PrivateLogout } from "./private-controls"
import { AdminContext } from "./admin-context"
import {
  EditorDialog,
  Printable,
  type Editor,
  type PrintItem,
} from "./admin-ui"
import {
  DashboardView,
  CRMView,
  QuotesView,
  JobsView,
  AgendaView,
  PeopleView,
  PayrollView,
  InvoicesView,
  PurchasesView,
  MaterialsView,
  DocumentsView,
  ReportsView,
  SettingsView,
} from "./admin-modules"

export const moduleSlugs = [
  "inicio",
  "crm",
  "presupuestos",
  "obras",
  "agenda",
  "personal",
  "nominas",
  "facturacion",
  "compras",
  "materiales",
  "documentacion",
  "informes",
  "ajustes",
]
const icons = [
  LayoutDashboard,
  Users,
  Files,
  BriefcaseBusiness,
  CalendarDays,
  Users,
  Wallet,
  FileCheck2,
  ShoppingBag,
  Package,
  ShieldCheck,
  ChartNoAxesCombined,
  Settings2,
]
const descriptions = [
  "La visión completa, en un solo lugar.",
  "Cada conversación, una nueva posibilidad.",
  "Mediciones claras. Decisiones con fundamento.",
  "Del primer replanteo al último detalle.",
  "Personas y recursos, en el momento adecuado.",
  "El equipo que da forma a cada espacio.",
  "Conceptos e importes ficticios para explorar el flujo.",
  "Cobros, pagos y saldos conectados a cada obra.",
  "Del pedido al almacén, sin perder el hilo.",
  "Materiales, herramientas y recursos disponibles.",
  "Cada archivo, donde tiene que estar.",
  "Una lectura clara de la operación de ejemplo.",
  "Tu espacio de trabajo de demostración.",
]
const views = [
  DashboardView,
  CRMView,
  QuotesView,
  JobsView,
  AgendaView,
  PeopleView,
  PayrollView,
  InvoicesView,
  PurchasesView,
  MaterialsView,
  DocumentsView,
  ReportsView,
  SettingsView,
]

function DemoLogin() {
  const { login } = useDemo()
  const descriptions: Record<Role, string> = {
    Dirección: "Visión global, finanzas e informes",
    Administración: "Clientes, presupuestos, compras y personal",
    "Jefe de obra": "Obras, cuadrillas, planificación y partes",
    Operario: "Mis tareas, fichaje, partes y ausencias",
  }
  return (
    <main className="a-login">
      <section>
        <Link href={COMPANY_PATH} className="a-back">
          <ChevronLeft size={16} />
          Volver a la propuesta
        </Link>
        <img
          className="a-login-logo"
          src={`${COMPANY_PATH}/logo.webp`}
          alt="Construccions Germans Moya"
        />
        <p className="p-eyebrow">Espacio de gestión / Modo demo</p>
        <h1>
          Todo en su sitio.
          <br />
          <em>También la gestión.</em>
        </h1>
        <p>
          Explora una jornada de trabajo desde cada perfil. Todos los registros
          son ficticios y los cambios se guardan en este navegador.
        </p>
        <div className="a-role-grid">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => login(role)}
              className={role === "Dirección" ? "featured" : ""}
            >
              <span>
                {role === "Dirección"
                  ? "Entrar como Dirección"
                  : `Acceder como ${role}`}
              </span>
              <small>{descriptions[role]}</small>
              <ArrowUpRight size={20} />
            </button>
          ))}
        </div>
        <small className="a-login-note">
          Accesos de demostración sin credenciales reales. Este login cambia el
          perfil simulado; el acceso privado del portfolio sigue protegido por
          separado.
        </small>
        <PrivateLogout />
      </section>
      <aside>
        <img
          src={`${COMPANY_PATH}/fachada.webp`}
          alt="Fachada de piedra con el símbolo de Germans Moya"
        />
        <div>
          <span className="a-demo-pill">Modo demo</span>
          <p>
            El cuidado del detalle.
            <br />
            <em>Dentro y fuera de la obra.</em>
          </p>
        </div>
      </aside>
    </main>
  )
}

export function MoyaAdmin() {
  const demo = useDemo()
  const [module, setModule] = useState<Module>("Inicio")
  const [search, setSearch] = useState("")
  const [jobFilter, setJobFilter] = useState("")
  const [personFilter, setPersonFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [printItem, setPrintItem] = useState<PrintItem | null>(null)
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("modulo")
    const index = moduleSlugs.indexOf(value || "")
    if (index >= 0) setModule(modules[index])
  }, [])
  useEffect(() => {
    if (demo.role && !access[demo.role].includes(module)) setModule("Inicio")
  }, [demo.role, module])
  if (!demo.ready)
    return <main className="a-loading">Preparando el espacio de gestión…</main>
  if (!demo.role) return <DemoLogin />
  const role = demo.role
  const allowed = access[role]
  const index = modules.indexOf(module)
  const View = views[index]
  const nav = (target: Module, filter = "", jobId = "") => {
    if (!allowed.includes(target)) return
    setModule(target)
    setSearch("")
    setStatusFilter(filter)
    setJobFilter(jobId)
    setPersonFilter("")
    setMobileOpen(false)
    window.history.replaceState(
      null,
      "",
      `${COMPANY_PATH}/admin?modulo=${moduleSlugs[modules.indexOf(target)]}`,
    )
  }
  return (
    <AdminContext.Provider
      value={{
        state: demo.state,
        role,
        search,
        jobFilter,
        personFilter,
        statusFilter,
        nav,
        edit: setEditor,
        print: setPrintItem,
        dispatch: demo.dispatch,
      }}
    >
      <main
        className={`moya-admin ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "sidebar-open" : ""}`}
      >
        <div className="a-mobile-scrim" onClick={() => setMobileOpen(false)} />
        <aside className="a-sidebar">
          <Link href={COMPANY_PATH} className="a-brand">
            <img
              src={`${COMPANY_PATH}/logo.webp`}
              alt="Construccions Germans Moya"
            />
          </Link>
          <div className="a-sidebar-label">
            <span>ESPACIO DE GESTIÓN</span>
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expandir menú" : "Plegar menú"}
            >
              <PanelLeftClose size={18} />
            </button>
            <button
              className="a-mobile-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
          </div>
          <nav aria-label="Módulos de administración">
            {modules.map((m, i) => {
              const Icon = icons[i]
              return allowed.includes(m) ? (
                <button
                  key={m}
                  className={module === m ? "active" : ""}
                  onClick={() => nav(m)}
                  aria-current={module === m ? "page" : undefined}
                  title={m}
                >
                  <Icon size={18} />
                  <span>{m}</span>
                  {m === "CRM y clientes" && (
                    <small>
                      {
                        demo.state.leads.filter((l) => l.status === "Nueva")
                          .length
                      }
                    </small>
                  )}
                </button>
              ) : null
            })}
          </nav>
          <div className="a-sidebar-bottom">
            <span className="a-demo-pill">
              <Activity size={12} /> Modo demo
            </span>
            <p>Datos ficticios · Uso local</p>
            <Link href={COMPANY_PATH}>
              <ArrowUpRight size={16} />
              <span>Ver propuesta web</span>
            </Link>
            <Link href="/propuestas">
              <ChevronLeft size={16} />
              <span>Volver al catálogo</span>
            </Link>
            <PrivateLogout />
          </div>
        </aside>
        <div className="a-main">
          <header className="a-topbar">
            <button
              className="a-menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú de administración"
              aria-expanded={mobileOpen}
            >
              <Menu size={21} />
            </button>
            <div className="a-breadcrumb">
              Germans Moya <span>/</span> {module}
            </div>
            <div className="a-search">
              <Search size={17} />
              <input
                type="search"
                aria-label="Buscar en el módulo actual"
                placeholder="Buscar en este módulo…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="a-demo-pill">Modo demo</span>
            {demo.state.preferences.reminder && (
              <button
                className="a-notifications"
                aria-label="Ver alertas de documentación"
                onClick={() => nav("Documentación", "Caducidad")}
              >
                <Bell size={19} />
                <i />
              </button>
            )}
            <div className="a-user">
              <span>
                {role === "Operario"
                  ? "JF"
                  : role === "Jefe de obra"
                    ? "PF"
                    : "GM"}
              </span>
              <div>
                <strong>{role}</strong>
                <small>Perfil de demostración</small>
              </div>
            </div>
            <button
              className="a-logout"
              onClick={() => {
                setEditor(null)
                setPrintItem(null)
                demo.logout()
              }}
              title="Cerrar sesión demo"
              aria-label="Cerrar sesión demo"
            >
              <LogOut size={18} />
              <span>Cerrar sesión demo</span>
            </button>
          </header>
          <div className="a-page">
            <div className="a-page-heading">
              <div>
                <p className="p-eyebrow">
                  OPERACIÓN / {String(index + 1).padStart(2, "0")}
                </p>
                <h1>
                  {module === "Inicio"
                    ? role === "Operario"
                      ? "Tu jornada, a mano."
                      : "Una buena obra empieza aquí."
                    : module === "Personal"
                      ? "Empleados y cuadrillas"
                      : module === "Materiales"
                        ? "Materiales y maquinaria"
                        : module === "Documentación"
                          ? "Documentación y prevención"
                          : module === "Presupuestos"
                            ? "Presupuestos y mediciones"
                            : module === "Agenda"
                              ? "Agenda y planificación"
                              : module === "Facturación"
                                ? "Facturación y tesorería"
                                : module === "Compras"
                                  ? "Compras y proveedores"
                                  : module === "Ajustes"
                                    ? "Ajustes y actividad"
                                    : module}
                </h1>
                <p>{descriptions[index]}</p>
              </div>
              <span className="a-period">
                <CalendarDays size={16} />
                {dateES(new Date().toISOString())}
                <small>Datos iniciales: noviembre 2026</small>
              </span>
            </div>
            {module !== "Ajustes" && (
              <div className="a-filters">
                <label>
                  Obra
                  <select
                    aria-label="Filtrar por obra"
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                  >
                    <option value="">Todas las obras</option>
                    {demo.state.jobs
                      .filter(
                        (j) => role !== "Operario" || j.crew.includes("emp-3"),
                      )
                      .map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title}
                        </option>
                      ))}
                  </select>
                </label>
                {["Agenda", "Personal", "Nóminas"].includes(module) &&
                  role !== "Operario" && (
                    <label>
                      Persona
                      <select
                        value={personFilter}
                        onChange={(e) => setPersonFilter(e.target.value)}
                      >
                        <option value="">Todo el equipo</option>
                        {demo.state.employees.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                {module !== "Informes" && (
                  <label>
                    Estado / filtro
                    <input
                      aria-label="Filtrar por estado"
                      placeholder="Todos"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    />
                  </label>
                )}
                {(search || jobFilter || statusFilter || personFilter) && (
                  <button
                    className="a-link"
                    onClick={() => {
                      setSearch("")
                      setJobFilter("")
                      setStatusFilter("")
                      setPersonFilter("")
                    }}
                  >
                    Limpiar filtros ×
                  </button>
                )}
              </div>
            )}
            {allowed.includes(module) ? (
              <View />
            ) : (
              <p>Este módulo no está disponible para este perfil.</p>
            )}
            <footer className="a-page-footer">
              <span>Germans Moya · Propuesta de SC WebStudio</span>
              <span>
                Todos los clientes, empleados y documentos son ficticios.
              </span>
            </footer>
          </div>
        </div>
        <nav className="a-mobile-dock" aria-label="Accesos rápidos móvil">
          <button onClick={() => nav("Inicio")}>
            <LayoutDashboard size={19} />
            Inicio
          </button>
          <button onClick={() => nav("Agenda")}>
            <CalendarDays size={19} />
            Agenda
          </button>
          <button onClick={() => nav("Personal")}>
            <Clock3 size={19} />
            {role === "Operario" ? "Fichaje" : "Equipo"}
          </button>
          <button onClick={() => nav("Obras")}>
            <BriefcaseBusiness size={19} />
            Tareas
          </button>
        </nav>
      </main>
      <EditorDialog editor={editor} close={() => setEditor(null)} />
      <Printable
        item={printItem}
        state={demo.state}
        close={() => setPrintItem(null)}
      />
    </AdminContext.Provider>
  )
}
