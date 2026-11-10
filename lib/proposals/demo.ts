export const DEMO_KEY = "sc:proposal:construccions-germans-moya:v1"
export const DEMO_ROLE_KEY = `${DEMO_KEY}:role`
export const COMPANY_PATH = "/propuestas/construccions-germans-moya"
export const roles = [
  "Dirección",
  "Administración",
  "Jefe de obra",
  "Operario",
] as const
export type Role = (typeof roles)[number]
export const modules = [
  "Inicio",
  "CRM y clientes",
  "Presupuestos",
  "Obras",
  "Agenda",
  "Personal",
  "Nóminas",
  "Facturación",
  "Compras",
  "Materiales",
  "Documentación",
  "Informes",
  "Ajustes",
] as const
export type Module = (typeof modules)[number]
export const access: Record<Role, readonly Module[]> = {
  Dirección: modules,
  Administración: modules.filter((m) => m !== "Informes"),
  "Jefe de obra": [
    "Inicio",
    "Obras",
    "Agenda",
    "Personal",
    "Materiales",
    "Documentación",
  ],
  Operario: [
    "Inicio",
    "Obras",
    "Agenda",
    "Personal",
    "Nóminas",
    "Documentación",
  ],
}
export const MY_EMPLOYEE = "emp-3"
export type Line = {
  id: string
  chapter: string
  title: string
  qty: number
  unit: string
  cost: number
  price: number
}
export type Lead = {
  id: string
  name: string
  email: string
  phone: string
  service: string
  message: string
  status: string
  owner: string
  date: string
  notes: string[]
}
export type Quote = {
  id: string
  leadId: string
  title: string
  version: number
  status: string
  discount: number
  tax: number
  lines: Line[]
}
export type JobEntry = { id: string; kind: string; text: string; date: string }
export type Job = {
  id: string
  quoteId: string
  leadId: string
  title: string
  status: string
  budget: number
  plannedCost: number
  actualCost: number
  progress: number
  crew: string[]
  start: string
  end: string
  entries: JobEntry[]
  tasks: { id: string; title: string; done: boolean }[]
}
export type Employee = {
  id: string
  name: string
  title: string
  crew: string
  hourly: number
  trainingExpiry: string
}
export type CalendarEvent = {
  id: string
  title: string
  jobId: string
  employeeId: string
  resource: string
  start: string
  end: string
  kind: string
}
export type Report = {
  id: string
  employeeId: string
  jobId: string
  hours: number
  overtime: number
  allowance: number
  text: string
  incident: string
  status: string
  date: string
}
export type Absence = {
  id: string
  employeeId: string
  start: string
  end: string
  kind: string
  status: string
}
export type Payroll = {
  id: string
  employeeId: string
  month: string
  base: number
  extra: number
  allowance: number
  deduction: number
  status: string
}
export type Invoice = {
  id: string
  jobId: string
  type: string
  base: number
  tax: number
  paid: number
  date: string
  due: string
  description: string
}
export type Purchase = {
  id: string
  jobId: string
  supplier: string
  materialId: string
  qty: number
  received: number
  unitCost: number
  date: string
}
export type Material = {
  id: string
  name: string
  unit: string
  stock: number
  min: number
  warehouse: string
  cost: number
}
export type Doc = {
  id: string
  name: string
  jobId: string
  category: string
  version: number
  expires: string
  data?: string
}
export type DemoState = {
  version: 1
  leads: Lead[]
  quotes: Quote[]
  jobs: Job[]
  employees: Employee[]
  events: CalendarEvent[]
  reports: Report[]
  absences: Absence[]
  shifts: { id: string; employeeId: string; start: string; end?: string }[]
  payrolls: Payroll[]
  invoices: Invoice[]
  purchases: Purchase[]
  materials: Material[]
  equipment: { id: string; name: string; status: string; maintenance: string }[]
  documents: Doc[]
  movements: {
    id: string
    materialId: string
    qty: number
    reason: string
    date: string
  }[]
  transactions: {
    id: string
    jobId: string
    kind: "Coste" | "Cobro" | "Pago" | "Compra"
    amount: number
    date: string
    reference: string
  }[]
  activity: { id: string; text: string; date: string; role: string }[]
  preferences: { name: string; series: string; reminder: boolean }
}
export const euro = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
    n,
  )
export const dateES = (s: string) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Madrid",
  }).format(new Date(s.length === 10 ? `${s}T12:00:00` : s))
export const today = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" })
export function nextMonthDate() {
  const d = new Date(`${today()}T12:00:00`)
  d.setDate(d.getDate() + 30)
  return d.toLocaleDateString("sv-SE")
}
export const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
export function quoteTotals(q: Quote) {
  const subtotal = money(q.lines.reduce((n, l) => n + l.qty * l.price, 0))
  const cost = money(q.lines.reduce((n, l) => n + l.qty * l.cost, 0))
  const base = money(subtotal * (1 - q.discount / 100))
  const tax = money((base * q.tax) / 100)
  return { subtotal, cost, base, tax, total: money(base + tax) }
}
export const invoiceTotal = (i: Invoice) =>
  money(i.base + money((i.base * i.tax) / 100))
export const invoiceBalance = (i: Invoice) => money(invoiceTotal(i) - i.paid)
export const payrollNet = (p: Payroll) =>
  money(p.base + p.extra + p.allowance - p.deduction)
export function finances(s: DemoState, jobId?: string) {
  const invoices = s.invoices.filter(
    (i) =>
      (!jobId || i.jobId === jobId) &&
      (i.type === "Emitida" || i.type === "Rectificativa"),
  )
  const sales = money(invoices.reduce((a, i) => a + invoiceTotal(i), 0))
  const collected = money(invoices.reduce((a, i) => a + i.paid, 0))
  const cost = money(
    s.jobs
      .filter((j) => !jobId || j.id === jobId)
      .reduce((a, j) => a + j.actualCost, 0),
  )
  const revenue = money(invoices.reduce((a, i) => a + i.base, 0))
  return {
    sales,
    collected,
    balance: money(sales - collected),
    cost,
    margin: money(revenue - cost),
  }
}

export function initialDemo(): DemoState {
  return {
    version: 1,
    leads: [
      {
        id: "cli-1",
        name: "Clara Vidal · Ficticia",
        email: "clara@example.com",
        phone: "000 000 001",
        service: "Reforma integral",
        message: "Renovar una vivienda y abrir la cocina al salón.",
        status: "Ganada",
        owner: "Laia Serra",
        date: "2026-10-01",
        notes: [
          "Visita inicial realizada. Vivienda de muestra en Calle Ejemplo, 1.",
        ],
      },
      {
        id: "cli-2",
        name: "Marc Soler · Ficticio",
        email: "marc@example.com",
        phone: "000 000 002",
        service: "Obra nueva",
        message: "Vivienda unifamiliar alrededor de un patio.",
        status: "Ganada",
        owner: "Laia Serra",
        date: "2026-10-12",
        notes: [
          "Proyecto de demostración. Dirección ficticia: Calle Ejemplo, 2.",
        ],
      },
      {
        id: "cli-3",
        name: "Nora Rius · Ficticia",
        email: "nora@example.com",
        phone: "000 000 003",
        service: "Interiorismo",
        message: "Actualizar materiales e iluminación.",
        status: "Ganada",
        owner: "Laia Serra",
        date: "2026-09-01",
        notes: ["Entrega realizada. Calle Ejemplo, 3 (ficticia)."],
      },
      {
        id: "cli-4",
        name: "Alex Costa · Ficticio",
        email: "alex@example.com",
        phone: "000 000 004",
        service: "Cocinas y baños",
        message: "Cocina luminosa con madera y piedra.",
        status: "Nueva",
        owner: "Laia Serra",
        date: "2026-11-09",
        notes: [],
      },
    ],
    quotes: [
      {
        id: "PRE-001",
        leadId: "cli-1",
        title: "Casa Olivera · Reforma integral",
        version: 1,
        status: "Aceptado",
        discount: 0,
        tax: 21,
        lines: [
          {
            id: "l1",
            chapter: "01 · Obra",
            title: "Reforma integral",
            qty: 80,
            unit: "m²",
            cost: 650,
            price: 1000,
          },
        ],
      },
      {
        id: "PRE-002",
        leadId: "cli-2",
        title: "Casa Patio · Obra nueva",
        version: 1,
        status: "Aceptado",
        discount: 0,
        tax: 21,
        lines: [
          {
            id: "l2",
            chapter: "01 · Estructura",
            title: "Construcción vivienda",
            qty: 160,
            unit: "m²",
            cost: 1000,
            price: 1500,
          },
        ],
      },
      {
        id: "PRE-003",
        leadId: "cli-3",
        title: "Espacio Calma · Interiorismo",
        version: 1,
        status: "Aceptado",
        discount: 0,
        tax: 21,
        lines: [
          {
            id: "l3",
            chapter: "01 · Interiorismo",
            title: "Diseño y acabados",
            qty: 1,
            unit: "ud",
            cost: 12000,
            price: 20000,
          },
        ],
      },
    ],
    jobs: [
      {
        id: "OBR-001",
        quoteId: "PRE-001",
        leadId: "cli-1",
        title: "Casa Olivera",
        status: "En curso",
        budget: 80000,
        plannedCost: 52000,
        actualCost: 28400,
        progress: 62,
        crew: ["emp-2", "emp-3"],
        start: "2026-10-01",
        end: "2026-12-18",
        entries: [
          {
            id: "entry-1",
            kind: "Diario",
            text: "Instalaciones terminadas. Comienza la colocación de pavimento. Foto de muestra disponible en Documentación.",
            date: "2026-11-09",
          },
          {
            id: "entry-2",
            kind: "Hito",
            text: "Entrega de carpinterías · 18/11/2026",
            date: "2026-11-18",
          },
        ],
        tasks: [
          { id: "task-1", title: "Revisar instalaciones", done: true },
          { id: "task-2", title: "Colocar pavimento", done: false },
          { id: "task-3", title: "Lista de entrega y garantías", done: false },
        ],
      },
      {
        id: "OBR-002",
        quoteId: "PRE-002",
        leadId: "cli-2",
        title: "Casa Patio",
        status: "Planificación",
        budget: 240000,
        plannedCost: 160000,
        actualCost: 4200,
        progress: 8,
        crew: ["emp-2"],
        start: "2026-11-16",
        end: "2027-06-30",
        entries: [
          {
            id: "entry-3",
            kind: "Hito",
            text: "Replanteo · 16/11/2026",
            date: "2026-11-16",
          },
        ],
        tasks: [{ id: "task-4", title: "Validar replanteo", done: false }],
      },
      {
        id: "OBR-003",
        quoteId: "PRE-003",
        leadId: "cli-3",
        title: "Espacio Calma",
        status: "Entregada",
        budget: 20000,
        plannedCost: 12000,
        actualCost: 11800,
        progress: 100,
        crew: ["emp-3"],
        start: "2026-09-01",
        end: "2026-10-15",
        entries: [
          {
            id: "entry-4",
            kind: "Posventa",
            text: "Revisión de iluminación agendada. Garantía ilustrativa: consultar acta demo.",
            date: "2026-11-12",
          },
        ],
        tasks: [{ id: "task-5", title: "Acta de entrega", done: true }],
      },
    ],
    employees: [
      {
        id: "emp-1",
        name: "Laia Serra",
        title: "Administración",
        crew: "Oficina",
        hourly: 24,
        trainingExpiry: "2027-04-10",
      },
      {
        id: "emp-2",
        name: "Pau Ferrer",
        title: "Jefe de obra",
        crew: "Cuadrilla Mediterrània",
        hourly: 28,
        trainingExpiry: "2026-11-20",
      },
      {
        id: "emp-3",
        name: "Júlia Font",
        title: "Oficial de obra",
        crew: "Cuadrilla Mediterrània",
        hourly: 20,
        trainingExpiry: "2027-03-15",
      },
      {
        id: "emp-4",
        name: "Oriol Costa",
        title: "Instalaciones",
        crew: "Cuadrilla Llevant",
        hourly: 22,
        trainingExpiry: "2027-02-01",
      },
    ],
    events: [
      {
        id: "evt-1",
        title: "Visita de seguimiento",
        jobId: "OBR-001",
        employeeId: "emp-3",
        resource: "Furgoneta 01",
        start: "2026-11-10T09:00",
        end: "2026-11-10T10:30",
        kind: "Visita",
      },
      {
        id: "evt-2",
        title: "Entrega de carpintería",
        jobId: "OBR-001",
        employeeId: "emp-2",
        resource: "Camión grúa",
        start: "2026-11-18T08:00",
        end: "2026-11-18T12:00",
        kind: "Entrega",
      },
      {
        id: "evt-3",
        title: "Replanteo Casa Patio",
        jobId: "OBR-002",
        employeeId: "emp-2",
        resource: "Furgoneta 01",
        start: "2026-11-16T08:00",
        end: "2026-11-16T11:00",
        kind: "Turno",
      },
      {
        id: "evt-4",
        title: "Revisión posventa",
        jobId: "OBR-003",
        employeeId: "emp-3",
        resource: "",
        start: "2026-11-12T10:00",
        end: "2026-11-12T11:00",
        kind: "Mantenimiento",
      },
    ],
    shifts: [],
    reports: [
      {
        id: "part-1",
        employeeId: "emp-3",
        jobId: "OBR-001",
        hours: 8,
        overtime: 0,
        allowance: 12,
        text: "Preparación de soportes",
        incident: "Revisar una toma de agua antes de cerrar el tabique.",
        status: "Pendiente",
        date: "2026-11-09",
      },
    ],
    absences: [],
    payrolls: [
      {
        id: "NOM-001",
        employeeId: "emp-3",
        month: "2026-11",
        base: 1800,
        extra: 120,
        allowance: 60,
        deduction: 300,
        status: "Borrador",
      },
      {
        id: "NOM-002",
        employeeId: "emp-2",
        month: "2026-11",
        base: 2400,
        extra: 160,
        allowance: 60,
        deduction: 420,
        status: "Revisada",
      },
      {
        id: "NOM-003",
        employeeId: "emp-1",
        month: "2026-11",
        base: 2100,
        extra: 0,
        allowance: 0,
        deduction: 340,
        status: "Borrador",
      },
    ],
    invoices: [
      {
        id: "DEMO-001",
        jobId: "OBR-001",
        type: "Emitida",
        base: 20000,
        tax: 21,
        paid: 12100,
        date: "2026-11-01",
        due: "2026-11-30",
        description: "Anticipo reforma · Simulación",
      },
      {
        id: "DEMO-002",
        jobId: "OBR-003",
        type: "Emitida",
        base: 20000,
        tax: 21,
        paid: 24200,
        date: "2026-10-15",
        due: "2026-11-15",
        description: "Entrega interiorismo · Simulación",
      },
      {
        id: "GAS-001",
        jobId: "OBR-001",
        type: "Recibida",
        base: 800,
        tax: 21,
        paid: 0,
        date: "2026-11-05",
        due: "2026-11-25",
        description: "Materiales de muestra · Incluidos en coste inicial",
      },
    ],
    purchases: [
      {
        id: "PED-001",
        jobId: "OBR-001",
        supplier: "Pedra Demo SL · Ficticio",
        materialId: "mat-1",
        qty: 60,
        received: 0,
        unitCost: 32,
        date: "2026-11-09",
      },
    ],
    materials: [
      {
        id: "mat-1",
        name: "Piedra caliza",
        unit: "m²",
        stock: 18,
        min: 25,
        warehouse: "Almacén principal",
        cost: 32,
      },
      {
        id: "mat-2",
        name: "Mortero de cal",
        unit: "saco",
        stock: 48,
        min: 20,
        warehouse: "Almacén principal",
        cost: 9,
      },
      {
        id: "mat-3",
        name: "Roble natural",
        unit: "m²",
        stock: 12,
        min: 15,
        warehouse: "Almacén obra",
        cost: 48,
      },
    ],
    equipment: [
      {
        id: "maq-1",
        name: "Furgoneta 01",
        status: "Disponible",
        maintenance: "2026-12-10",
      },
      {
        id: "maq-2",
        name: "Cortadora de piedra",
        status: "En Casa Olivera",
        maintenance: "2026-11-18",
      },
      {
        id: "maq-3",
        name: "Camión grúa",
        status: "Disponible",
        maintenance: "2027-01-15",
      },
    ],
    documents: [
      {
        id: "doc-1",
        name: "Plano de distribución · Muestra",
        jobId: "OBR-001",
        category: "Planos",
        version: 2,
        expires: "2027-01-01",
      },
      {
        id: "doc-2",
        name: "Evaluación preventiva · Sin validez",
        jobId: "OBR-001",
        category: "Prevención",
        version: 1,
        expires: "2026-11-20",
      },
      {
        id: "doc-3",
        name: "Contrato de obra · Ficticio",
        jobId: "OBR-002",
        category: "Contratos",
        version: 1,
        expires: "2027-06-30",
      },
      {
        id: "doc-4",
        name: "Acta de entrega y garantía · Ejemplo",
        jobId: "OBR-003",
        category: "Actas",
        version: 1,
        expires: "2027-10-15",
      },
      {
        id: "doc-5",
        name: "Fotografía ilustrativa",
        jobId: "OBR-001",
        category: "Fotos",
        version: 1,
        expires: "2027-12-31",
      },
      {
        id: "doc-6",
        name: "Licencia · Documento ficticio",
        jobId: "OBR-002",
        category: "Licencias",
        version: 1,
        expires: "2027-06-30",
      },
    ],
    movements: [],
    transactions: [
      {
        id: "tx-1",
        jobId: "OBR-001",
        kind: "Coste",
        amount: 28400,
        date: "2026-11-01",
        reference: "Coste inicial acumulado de muestra",
      },
      {
        id: "tx-2",
        jobId: "OBR-002",
        kind: "Coste",
        amount: 4200,
        date: "2026-11-01",
        reference: "Planificación inicial de muestra",
      },
      {
        id: "tx-3",
        jobId: "OBR-003",
        kind: "Coste",
        amount: 11800,
        date: "2026-10-15",
        reference: "Coste inicial interiorismo de muestra",
      },
      {
        id: "tx-4",
        jobId: "OBR-001",
        kind: "Cobro",
        amount: 12100,
        date: "2026-11-01",
        reference: "DEMO-001",
      },
      {
        id: "tx-5",
        jobId: "OBR-003",
        kind: "Cobro",
        amount: 24200,
        date: "2026-10-15",
        reference: "DEMO-002",
      },
    ],
    activity: [
      {
        id: "act-0",
        text: "Demo inicial preparada. Todos los registros son ficticios.",
        date: "2026-11-09T08:00:00",
        role: "Sistema",
      },
    ],
    preferences: {
      name: "Germans Moya · Empresa ficticia para la demo",
      series: "DEMO",
      reminder: true,
    },
  }
}

export type Command =
  | {
      type: "lead.create"
      name: string
      email: string
      phone: string
      service: string
      message: string
    }
  | {
      type: "lead.update"
      id: string
      status: string
      owner: string
      note?: string
    }
  | { type: "quote.create"; leadId: string; title: string }
  | { type: "quote.save"; quote: Quote }
  | { type: "quote.duplicate"; id: string }
  | { type: "quote.accept"; id: string }
  | { type: "job.convert"; quoteId: string }
  | { type: "job.assign"; id: string; crew: string[] }
  | { type: "job.progress"; id: string; progress: number; status: string }
  | { type: "job.entry"; id: string; kind: string; text: string }
  | { type: "task.toggle"; jobId: string; id: string }
  | { type: "event.save"; event: CalendarEvent }
  | { type: "shift.toggle" }
  | {
      type: "report.create"
      jobId: string
      hours: number
      overtime: number
      allowance: number
      text: string
      incident: string
    }
  | { type: "report.approve"; id: string }
  | { type: "absence.request"; start: string; end: string; kind: string }
  | { type: "absence.approve"; id: string }
  | { type: "payroll.review" | "payroll.pay"; id: string }
  | {
      type: "invoice.create"
      jobId: string
      base: number
      tax: number
      kind: "Emitida" | "Recibida"
      description: string
      due: string
    }
  | { type: "invoice.pay"; id: string; amount: number }
  | { type: "invoice.credit"; id: string }
  | {
      type: "purchase.create"
      jobId: string
      supplier: string
      materialId: string
      qty: number
      unitCost: number
    }
  | { type: "purchase.receive"; id: string; qty: number }
  | { type: "material.move"; id: string; qty: number; reason: string }
  | { type: "equipment.save"; id: string; status: string; maintenance: string }
  | { type: "document.add"; doc: Omit<Doc, "id"> }
  | { type: "preferences.save"; preferences: DemoState["preferences"] }

const adminRoles: Role[] = ["Dirección", "Administración"]
const siteRoles: Role[] = ["Dirección", "Administración", "Jefe de obra"]
function requireRole(role: Role | null, allowed: Role[]) {
  if (!role || !allowed.includes(role))
    throw new Error("Este perfil demo no permite esta acción.")
}
function positive(n: number, max = 1e9) {
  if (!Number.isFinite(n) || n <= 0 || n > max)
    throw new Error("Introduce una cantidad válida mayor que cero.")
}
function nonnegative(n: number) {
  if (!Number.isFinite(n) || n < 0 || n > 1e9)
    throw new Error("Importe o medición no válidos.")
}
function requireText(value: string, max = 2000) {
  if (!value.trim() || value.length > max)
    throw new Error("Completa los campos de texto con una longitud válida.")
}
function requireDate(value: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}/.test(value) ||
    Number.isNaN(new Date(value).getTime())
  )
    throw new Error("La fecha no es válida.")
}
function find<T extends { id: string }>(rows: T[], id: string): T {
  const row = rows.find((r) => r.id === id)
  if (!row) throw new Error("No se encuentra el registro relacionado.")
  return row
}
export function canSeeJob(role: Role, job: Job) {
  return role !== "Operario" || job.crew.includes(MY_EMPLOYEE)
}

// One transaction updates every related module. Reducer permissions are checked
// as well as UI permissions. These are demo roles, never the private auth boundary.
export function transact(
  previous: DemoState,
  command: Command,
  role: Role | null,
  now = new Date().toISOString(),
): DemoState {
  const s: DemoState = structuredClone(previous)
  const id = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  const date = new Date(now).toLocaleDateString("sv-SE", {
    timeZone: "Europe/Madrid",
  })
  let message = ""
  if (command.type !== "lead.create") requireRole(role, roles.slice() as Role[])
  const jobFor = (jobId: string) => {
    const job = find(s.jobs, jobId)
    if (role && !canSeeJob(role, job))
      throw new Error("Obra no asignada a tu perfil.")
    return job
  }
  switch (command.type) {
    case "lead.create": {
      requireText(command.name, 100)
      requireText(command.message)
      requireText(command.phone, 30)
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(command.email) ||
        command.email.length > 200
      )
        throw new Error("Introduce un correo válido.")
      s.leads.unshift({
        ...command,
        id: id("CLI"),
        name: command.name.trim(),
        status: "Nueva",
        owner: "Laia Serra",
        notes: [],
        date,
      })
      message = "Solicitud demo recibida desde la landing"
      break
    }
    case "lead.update": {
      requireRole(role, adminRoles)
      const l = find(s.leads, command.id)
      l.status = command.status
      l.owner = command.owner
      if (command.note?.trim())
        l.notes.push(`${dateES(date)} · ${command.note.trim()}`)
      message = "Seguimiento CRM actualizado"
      break
    }
    case "quote.create": {
      requireRole(role, adminRoles)
      find(s.leads, command.leadId)
      requireText(command.title, 150)
      s.quotes.unshift({
        id: id("PRE"),
        leadId: command.leadId,
        title: command.title,
        version: 1,
        status: "Borrador",
        discount: 0,
        tax: 21,
        lines: [
          {
            id: id("line"),
            chapter: "01 · Obra",
            title: "Trabajos de ejemplo",
            qty: 1,
            unit: "ud",
            cost: 7000,
            price: 10000,
          },
        ],
      })
      find(s.leads, command.leadId).status = "Presupuesto"
      message = "Presupuesto de muestra creado"
      break
    }
    case "quote.save": {
      requireRole(role, adminRoles)
      const old = find(s.quotes, command.quote.id)
      if (old.status === "Aceptado")
        throw new Error(
          "Duplica una versión para modificar un presupuesto aceptado.",
        )
      const q = command.quote
      requireText(q.title, 150)
      nonnegative(q.discount)
      nonnegative(q.tax)
      if (
        q.discount > 100 ||
        q.tax > 100 ||
        !q.lines.length ||
        q.lines.length > 100
      )
        throw new Error("Revisa descuento, impuesto y partidas.")
      for (const l of q.lines) {
        requireText(l.title, 200)
        positive(l.qty)
        nonnegative(l.cost)
        nonnegative(l.price)
      }
      s.quotes = s.quotes.map((item) =>
        item.id === q.id
          ? {
              ...q,
              leadId: old.leadId,
              status: old.status,
              version: old.version,
            }
          : item,
      )
      message = "Mediciones y precios guardados"
      break
    }
    case "quote.duplicate": {
      requireRole(role, adminRoles)
      const q = find(s.quotes, command.id)
      s.quotes.unshift({
        ...structuredClone(q),
        id: id("PRE"),
        version: q.version + 1,
        status: "Borrador",
      })
      message = "Nueva versión de presupuesto creada"
      break
    }
    case "quote.accept": {
      requireRole(role, adminRoles)
      const q = find(s.quotes, command.id)
      positive(quoteTotals(q).base)
      q.status = "Aceptado"
      find(s.leads, q.leadId).status = "Ganada"
      message = "Aceptación de presupuesto simulada"
      break
    }
    case "job.convert": {
      requireRole(role, adminRoles)
      const q = find(s.quotes, command.quoteId)
      if (q.status !== "Aceptado")
        throw new Error("Acepta el presupuesto antes de convertirlo.")
      if (s.jobs.some((j) => j.quoteId === q.id))
        throw new Error("Este presupuesto ya tiene una obra.")
      const totals = quoteTotals(q)
      s.jobs.unshift({
        id: id("OBR"),
        title: q.title,
        quoteId: q.id,
        leadId: q.leadId,
        status: "Planificación",
        budget: totals.base,
        plannedCost: totals.cost,
        actualCost: 0,
        progress: 0,
        crew: [],
        start: date,
        end: `${Number(date.slice(0, 4)) + 1}${date.slice(4)}`,
        entries: [],
        tasks: [
          { id: id("task"), title: "Visita de replanteo", done: false },
          {
            id: id("task"),
            title: "Lista de entrega y garantías",
            done: false,
          },
        ],
      })
      message = "Presupuesto convertido en obra"
      break
    }
    case "job.assign": {
      requireRole(role, siteRoles)
      const j = jobFor(command.id)
      for (const e of command.crew) find(s.employees, e)
      j.crew = [...new Set(command.crew)]
      message = "Equipo de obra asignado"
      break
    }
    case "job.progress": {
      requireRole(role, siteRoles)
      nonnegative(command.progress)
      if (command.progress > 100)
        throw new Error("El avance no puede superar el 100 %.")
      const j = jobFor(command.id)
      j.progress = command.progress
      j.status = command.status
      message = "Avance de obra actualizado"
      break
    }
    case "job.entry": {
      requireRole(role, siteRoles)
      requireText(command.text)
      jobFor(command.id).entries.unshift({
        id: id("entry"),
        kind: command.kind,
        text: command.text,
        date,
      })
      message = `${command.kind} añadido a la obra`
      break
    }
    case "task.toggle": {
      const task = find(jobFor(command.jobId).tasks, command.id)
      task.done = !task.done
      message = "Tarea actualizada"
      break
    }
    case "event.save": {
      requireRole(role, siteRoles)
      const e = command.event
      requireText(e.title, 150)
      jobFor(e.jobId)
      find(s.employees, e.employeeId)
      requireDate(e.start)
      requireDate(e.end)
      if (e.end <= e.start)
        throw new Error("El fin debe ser posterior al inicio.")
      const conflict = s.events.find(
        (other) =>
          other.id !== e.id &&
          other.start < e.end &&
          other.end > e.start &&
          (other.employeeId === e.employeeId ||
            (!!e.resource && other.resource === e.resource)),
      )
      if (conflict)
        throw new Error(
          `Solapamiento con «${conflict.title}». Cambia la hora, persona o recurso.`,
        )
      const newEvent = { ...e, id: e.id || id("evt") }
      s.events = [newEvent, ...s.events.filter((x) => x.id !== e.id)]
      message = "Evento de planificación guardado"
      break
    }
    case "shift.toggle": {
      const open = s.shifts.find((x) => x.employeeId === MY_EMPLOYEE && !x.end)
      if (open) {
        open.end = now
        message = "Salida registrada"
      } else {
        s.shifts.unshift({
          id: id("shift"),
          employeeId: MY_EMPLOYEE,
          start: now,
        })
        message = "Entrada registrada"
      }
      break
    }
    case "report.create": {
      jobFor(command.jobId)
      requireText(command.text)
      positive(command.hours, 16)
      nonnegative(command.overtime)
      nonnegative(command.allowance)
      if (command.overtime > command.hours || command.allowance > 200)
        throw new Error("Revisa las horas extra y las dietas.")
      s.reports.unshift({
        ...command,
        id: id("PAR"),
        employeeId: MY_EMPLOYEE,
        status: "Pendiente",
        date,
      })
      if (command.incident.trim())
        jobFor(command.jobId).entries.unshift({
          id: id("entry"),
          kind: "Incidencia",
          text: command.incident,
          date,
        })
      message = "Parte de horas enviado a revisión"
      break
    }
    case "report.approve": {
      requireRole(role, ["Dirección", "Jefe de obra"])
      const r = find(s.reports, command.id)
      if (r.status === "Aprobado") throw new Error("El parte ya está aprobado.")
      const cost = money(
        (r.hours - r.overtime) * find(s.employees, r.employeeId).hourly +
          r.overtime * find(s.employees, r.employeeId).hourly * 1.5 +
          r.allowance,
      )
      r.status = "Aprobado"
      jobFor(r.jobId).actualCost = money(jobFor(r.jobId).actualCost + cost)
      s.transactions.unshift({
        id: id("tx"),
        jobId: r.jobId,
        kind: "Coste",
        amount: cost,
        date,
        reference: r.id,
      })
      message = "Parte aprobado y coste de mano de obra imputado"
      break
    }
    case "absence.request": {
      requireDate(command.start)
      requireDate(command.end)
      if (command.end < command.start)
        throw new Error("Revisa el intervalo de ausencia.")
      if (
        s.absences.some(
          (a) =>
            a.employeeId === MY_EMPLOYEE &&
            a.start <= command.end &&
            a.end >= command.start,
        )
      )
        throw new Error("Ya existe una solicitud en esas fechas.")
      s.absences.unshift({
        ...command,
        id: id("AUS"),
        employeeId: MY_EMPLOYEE,
        status: "Pendiente",
      })
      message = "Solicitud de ausencia registrada"
      break
    }
    case "absence.approve": {
      requireRole(role, adminRoles)
      const a = find(s.absences, command.id)
      if (a.status === "Aprobada")
        throw new Error("La ausencia ya está aprobada.")
      a.status = "Aprobada"
      s.events.unshift({
        id: id("evt"),
        title: `${a.kind} · ${find(s.employees, a.employeeId).name}`,
        jobId: "",
        employeeId: a.employeeId,
        resource: "",
        start: `${a.start}T00:00`,
        end: `${a.end}T23:59`,
        kind: a.kind,
      })
      message = "Ausencia aprobada y añadida al calendario"
      break
    }
    case "payroll.review":
    case "payroll.pay": {
      requireRole(role, adminRoles)
      const p = find(s.payrolls, command.id)
      if (command.type === "payroll.pay" && p.status !== "Revisada")
        throw new Error("Revisa la nómina antes de simular el pago.")
      if (p.status === "Pagada")
        throw new Error("La nómina ya figura como pagada.")
      p.status = command.type === "payroll.review" ? "Revisada" : "Pagada"
      message = `${p.status === "Pagada" ? "Pago de nómina simulado" : "Nómina de muestra revisada"}`
      break
    }
    case "invoice.create": {
      requireRole(role, adminRoles)
      const job = jobFor(command.jobId)
      positive(command.base)
      nonnegative(command.tax)
      requireDate(command.due)
      requireText(command.description)
      if (command.tax > 100)
        throw new Error("El impuesto no puede superar el 100 %.")
      s.invoices.unshift({
        id: id(s.preferences.series || "DEMO"),
        jobId: command.jobId,
        type: command.kind,
        base: money(command.base),
        tax: command.tax,
        paid: 0,
        date,
        due: command.due,
        description: command.description,
      })
      if (command.kind === "Recibida") {
        job.actualCost = money(job.actualCost + command.base)
        s.transactions.unshift({
          id: id("tx"),
          jobId: job.id,
          kind: "Coste",
          amount: money(command.base),
          date,
          reference: s.invoices[0].id,
        })
      }
      message = "Factura de muestra creada. Sin emisión fiscal"
      break
    }
    case "invoice.pay": {
      requireRole(role, adminRoles)
      const i = find(s.invoices, command.id)
      positive(command.amount)
      if (
        s.invoices.some(
          (r) => r.description === `Rectificación demo de ${i.id}`,
        )
      )
        throw new Error("La factura ha sido rectificada en la demo.")
      if (command.amount > invoiceBalance(i))
        throw new Error("El importe supera el saldo pendiente.")
      i.paid = money(i.paid + command.amount)
      s.transactions.unshift({
        id: id("tx"),
        jobId: i.jobId,
        kind: i.type === "Recibida" ? "Pago" : "Cobro",
        amount: money(command.amount),
        date,
        reference: i.id,
      })
      message =
        i.type === "Recibida"
          ? "Pago parcial simulado"
          : "Cobro parcial simulado"
      break
    }
    case "invoice.credit": {
      requireRole(role, adminRoles)
      const i = find(s.invoices, command.id)
      if (
        i.type !== "Emitida" ||
        s.invoices.some(
          (other) => other.description === `Rectificación demo de ${i.id}`,
        )
      )
        throw new Error("No se puede duplicar esta rectificativa.")
      if (i.paid)
        throw new Error(
          "La rectificativa demo solo admite facturas sin cobros; los reembolsos quedan fuera de esta simulación.",
        )
      s.invoices.unshift({
        ...i,
        id: id("RECT"),
        base: -i.base,
        paid: 0,
        type: "Rectificativa",
        description: `Rectificación demo de ${i.id}`,
      })
      message = "Rectificativa de ejemplo creada"
      break
    }
    case "purchase.create": {
      requireRole(role, adminRoles)
      jobFor(command.jobId)
      find(s.materials, command.materialId)
      requireText(command.supplier, 150)
      positive(command.qty)
      positive(command.unitCost)
      s.purchases.unshift({ ...command, id: id("PED"), received: 0, date })
      message = "Pedido vinculado a la obra"
      break
    }
    case "purchase.receive": {
      requireRole(role, siteRoles)
      const p = find(s.purchases, command.id)
      positive(command.qty)
      if (command.qty > p.qty - p.received)
        throw new Error("La recepción supera la cantidad pendiente.")
      p.received += command.qty
      find(s.materials, p.materialId).stock += command.qty
      const j = jobFor(p.jobId)
      j.actualCost = money(j.actualCost + command.qty * p.unitCost)
      s.movements.unshift({
        id: id("mov"),
        materialId: p.materialId,
        qty: command.qty,
        reason: `Recepción ${p.id} → ${j.title}`,
        date,
      })
      for (const kind of ["Coste", "Compra"] as const)
        s.transactions.unshift({
          id: id("tx"),
          jobId: j.id,
          kind,
          amount: money(command.qty * p.unitCost),
          date,
          reference: p.id,
        })
      message = "Recepción registrada: stock y coste de obra actualizados"
      break
    }
    case "material.move": {
      requireRole(role, siteRoles)
      const m = find(s.materials, command.id)
      if (
        !Number.isFinite(command.qty) ||
        !command.qty ||
        m.stock + command.qty < 0
      )
        throw new Error("El movimiento no puede dejar existencias negativas.")
      requireText(command.reason)
      m.stock += command.qty
      s.movements.unshift({
        id: id("mov"),
        materialId: m.id,
        qty: command.qty,
        reason: command.reason,
        date,
      })
      message = "Movimiento de almacén registrado"
      break
    }
    case "equipment.save": {
      requireRole(role, siteRoles)
      requireDate(command.maintenance)
      const e = find(s.equipment, command.id)
      e.status = command.status
      e.maintenance = command.maintenance
      message = "Disponibilidad y mantenimiento actualizados"
      break
    }
    case "document.add": {
      requireRole(role, siteRoles)
      const d = command.doc
      jobFor(d.jobId)
      requireText(d.name, 150)
      requireDate(d.expires)
      if (!Number.isInteger(d.version) || d.version < 1 || d.version > 9999)
        throw new Error("La versión debe ser un entero entre 1 y 9999.")
      if (
        d.data &&
        (!/^data:(image\/(png|jpeg|webp)|application\/pdf);base64,/.test(
          d.data,
        ) ||
          d.data.length > 1400000)
      )
        throw new Error("Adjunta un PDF o imagen de muestra de hasta 1 MB.")
      s.documents.unshift({ ...d, id: id("DOC") })
      message = "Documento local de muestra añadido"
      break
    }
    case "preferences.save": {
      requireRole(role, adminRoles)
      requireText(command.preferences.name, 150)
      requireText(command.preferences.series, 20)
      s.preferences = command.preferences
      message = "Preferencias demo guardadas"
      break
    }
  }
  s.activity.unshift({
    id: id("act"),
    text: message,
    date: now,
    role: role || "Landing",
  })
  s.activity = s.activity.slice(0, 250)
  return s
}

const storageShape = initialDemo()
// Empty seed collections still need a shape when recovering browser storage.
storageShape.shifts = [{ id: "", employeeId: "", start: "" }]
storageShape.absences = [
  { id: "", employeeId: "", start: "", end: "", kind: "", status: "" },
]
storageShape.movements = [
  { id: "", materialId: "", qty: 0, reason: "", date: "" },
]

function matchesShape(value: unknown, shape: unknown): boolean {
  if (Array.isArray(shape))
    return (
      Array.isArray(value) &&
      value.length <= 5000 &&
      value.every((item) => matchesShape(item, shape[0]))
    )
  if (shape && typeof shape === "object") {
    return (
      !!value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.entries(shape).every(([key, example]) =>
        matchesShape((value as Record<string, unknown>)[key], example),
      )
    )
  }
  return (
    typeof value === typeof shape &&
    (typeof value !== "number" || Number.isFinite(value))
  )
}

export function isDemoState(value: unknown): value is DemoState {
  if (!matchesShape(value, storageShape)) return false
  const s = value as DemoState
  if (s.version !== 1) return false
  const validDate = (text: string) =>
    /^\d{4}-\d{2}-\d{2}/.test(text) && Number.isFinite(Date.parse(text))
  const validForeign = (rows: { id: string }[], id: string) =>
    rows.some((row) => row.id === id)
  const collections = Object.values(s).filter(Array.isArray) as {
    id: string
  }[][]
  if (
    collections.some(
      (rows) => new Set(rows.map((row) => row.id)).size !== rows.length,
    )
  )
    return false
  return (
    s.leads.every((l) => validDate(l.date)) &&
    s.quotes.every((q) => validForeign(s.leads, q.leadId)) &&
    s.jobs.every(
      (j) =>
        validForeign(s.leads, j.leadId) &&
        validForeign(s.quotes, j.quoteId) &&
        validDate(j.start) &&
        validDate(j.end) &&
        j.crew.every((id) => validForeign(s.employees, id)) &&
        j.entries.every((e) => validDate(e.date)),
    ) &&
    s.employees.every((e) => validDate(e.trainingExpiry)) &&
    s.equipment.every((e) => validDate(e.maintenance)) &&
    s.events.every(
      (e) =>
        validForeign(s.employees, e.employeeId) &&
        (!e.jobId || validForeign(s.jobs, e.jobId)) &&
        validDate(e.start) &&
        validDate(e.end),
    ) &&
    s.reports.every(
      (r) =>
        validForeign(s.employees, r.employeeId) &&
        validForeign(s.jobs, r.jobId) &&
        validDate(r.date),
    ) &&
    s.absences.every(
      (a) =>
        validForeign(s.employees, a.employeeId) &&
        validDate(a.start) &&
        validDate(a.end),
    ) &&
    s.shifts.every(
      (shift) =>
        validForeign(s.employees, shift.employeeId) &&
        validDate(shift.start) &&
        (shift.end === undefined ||
          (typeof shift.end === "string" && validDate(shift.end))),
    ) &&
    s.payrolls.every((p) => validForeign(s.employees, p.employeeId)) &&
    s.invoices.every(
      (i) =>
        validForeign(s.jobs, i.jobId) && validDate(i.date) && validDate(i.due),
    ) &&
    s.purchases.every(
      (p) =>
        validForeign(s.jobs, p.jobId) &&
        validForeign(s.materials, p.materialId) &&
        validDate(p.date),
    ) &&
    s.documents.every(
      (d) =>
        validForeign(s.jobs, d.jobId) &&
        validDate(d.expires) &&
        (d.data === undefined ||
          (typeof d.data === "string" &&
            /^data:(image\/(png|jpeg|webp)|application\/pdf);base64,/.test(
              d.data,
            ) &&
            d.data.length <= 1400000)),
    ) &&
    s.transactions.every(
      (t) => validForeign(s.jobs, t.jobId) && validDate(t.date),
    ) &&
    s.movements.every(
      (m) => validForeign(s.materials, m.materialId) && validDate(m.date),
    ) &&
    s.activity.every((a) => validDate(a.date))
  )
}
