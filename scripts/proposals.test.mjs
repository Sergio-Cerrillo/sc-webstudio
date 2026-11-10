import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { stripTypeScriptTypes } from "node:module"
import {
  initialDemo,
  transact,
  quoteTotals,
  invoiceBalance,
  invoiceTotal,
  finances,
  payrollNet,
  canSeeJob,
  access,
  MY_EMPLOYEE,
  isDemoState,
} from "../lib/proposals/demo.ts"
import {
  authConfigured,
  proposalOrigin,
  createSession,
  validSession,
  safeReturnPath,
  SESSION_TTL,
} from "../lib/proposals/auth.ts"

const at = "2026-11-09T10:00:00.000Z"
const run = (s, cmd, role = "Dirección") => {
  const next = transact(s, cmd, role, at)
  assert.equal(
    isDemoState(JSON.parse(JSON.stringify(next))),
    true,
    `Estado persistible tras ${cmd.type}`,
  )
  return next
}

test("1 · Solicitud → CRM → presupuesto con mediciones → aceptación → obra", () => {
  const original = initialDemo()
  let s = run(
    original,
    {
      type: "lead.create",
      name: "Cliente Demo",
      email: "demo@example.com",
      phone: "000000000",
      service: "Reforma integral",
      message: "Solicitud ficticia de reforma",
    },
    null,
  )
  assert.equal(original.leads.length + 1, s.leads.length)
  const leadId = s.leads[0].id
  s = run(
    s,
    { type: "quote.create", leadId, title: "Reforma prueba" },
    "Administración",
  )
  let q = s.quotes[0]
  q = {
    ...q,
    discount: 10,
    tax: 21,
    lines: [
      {
        id: "p1",
        chapter: "Obra",
        title: "Pavimento",
        qty: 20,
        unit: "m²",
        cost: 25,
        price: 50,
      },
    ],
  }
  s = run(s, { type: "quote.save", quote: q })
  assert.deepEqual(quoteTotals(s.quotes[0]), {
    subtotal: 1000,
    cost: 500,
    base: 900,
    tax: 189,
    total: 1089,
  })
  assert.throws(() => run(s, { type: "job.convert", quoteId: q.id }))
  s = run(s, { type: "quote.accept", id: q.id })
  s = run(s, { type: "job.convert", quoteId: q.id })
  assert.equal(s.jobs[0].leadId, leadId)
  assert.equal(s.jobs[0].budget, 900)
  assert.equal(s.jobs[0].plannedCost, 500)
  assert.equal(s.leads[0].status, "Ganada")
  assert.throws(() => run(s, { type: "job.convert", quoteId: q.id }))
  assert.throws(() => run(s, { type: "quote.save", quote: q }))
  s = run(s, { type: "quote.duplicate", id: q.id })
  assert.equal(s.quotes[0].version, 2)
  assert.equal(s.quotes[0].status, "Borrador")
})

test("2 · Cuadrilla → fichaje → parte con incidencia → revisión y coste", () => {
  let s = initialDemo()
  s = run(
    s,
    { type: "job.assign", id: "OBR-002", crew: ["emp-2", MY_EMPLOYEE] },
    "Jefe de obra",
  )
  assert.equal(canSeeJob("Operario", s.jobs[1]), true)
  s = run(s, { type: "shift.toggle" }, "Operario")
  assert.equal(s.shifts[0].end, undefined)
  s = transact(
    s,
    { type: "shift.toggle" },
    "Operario",
    "2026-11-09T18:00:00.000Z",
  )
  assert.ok(s.shifts[0].end)
  s = run(
    s,
    {
      type: "report.create",
      jobId: "OBR-002",
      hours: 8,
      overtime: 1,
      allowance: 12,
      text: "Trabajo ficticio",
      incident: "Incidencia de prueba",
    },
    "Operario",
  )
  const reportId = s.reports[0].id
  assert.ok(s.jobs[1].entries.some((e) => e.text === "Incidencia de prueba"))
  const before = s.jobs[1].actualCost
  assert.throws(() =>
    run(s, { type: "report.approve", id: reportId }, "Operario"),
  )
  s = run(s, { type: "report.approve", id: reportId }, "Jefe de obra")
  assert.equal(s.jobs[1].actualCost - before, 182)
  assert.equal(s.transactions[0].amount, 182)
  assert.equal(s.reports[0].status, "Aprobado")
  assert.throws(() =>
    run(s, { type: "report.approve", id: reportId }, "Jefe de obra"),
  )
})

test("3 · Factura → cobro parcial → mismo saldo en factura, obra y resumen", () => {
  let s = initialDemo()
  const before = finances(s, "OBR-002")
  s = run(s, {
    type: "invoice.create",
    jobId: "OBR-002",
    kind: "Emitida",
    base: 1000,
    tax: 21,
    description: "Anticipo ficticio",
    due: "2026-12-01",
  })
  const invoiceId = s.invoices[0].id
  assert.equal(invoiceTotal(s.invoices[0]), 1210)
  s = run(
    s,
    { type: "invoice.pay", id: invoiceId, amount: 300 },
    "Administración",
  )
  assert.equal(invoiceBalance(s.invoices[0]), 910)
  assert.equal(finances(s, "OBR-002").balance - before.balance, 910)
  assert.equal(finances(s).collected, 36600)
  assert.equal(s.transactions[0].kind, "Cobro")
  assert.equal(s.transactions[0].amount, 300)
  assert.throws(() =>
    run(s, { type: "invoice.pay", id: invoiceId, amount: 1000 }),
  )
  assert.throws(() => run(s, { type: "invoice.credit", id: invoiceId }))
})

test("4 · Vacaciones Operario → aprobación Administración → agenda", () => {
  let s = initialDemo()
  s = run(
    s,
    {
      type: "absence.request",
      start: "2026-12-21",
      end: "2026-12-24",
      kind: "Vacaciones",
    },
    "Operario",
  )
  const id = s.absences[0].id
  assert.throws(() => run(s, { type: "absence.approve", id }, "Jefe de obra"))
  s = run(s, { type: "absence.approve", id }, "Administración")
  assert.equal(s.absences[0].status, "Aprobada")
  assert.equal(s.events[0].kind, "Vacaciones")
  assert.equal(s.events[0].employeeId, MY_EMPLOYEE)
  assert.equal(s.events[0].start, "2026-12-21T00:00")
  assert.throws(() => run(s, { type: "absence.approve", id }))
  assert.throws(() =>
    run(
      s,
      {
        type: "absence.request",
        start: "2026-12-23",
        end: "2026-12-24",
        kind: "Vacaciones",
      },
      "Operario",
    ),
  )
})

test("5 · Pedido → recepción parcial → stock, albarán, coste e informe", () => {
  let s = initialDemo()
  s = run(
    s,
    {
      type: "purchase.create",
      jobId: "OBR-002",
      supplier: "Proveedor ficticio",
      materialId: "mat-1",
      qty: 20,
      unitCost: 32,
    },
    "Administración",
  )
  const id = s.purchases[0].id
  const stock = s.materials[0].stock,
    cost = s.jobs[1].actualCost
  s = run(s, { type: "purchase.receive", id, qty: 5 }, "Jefe de obra")
  assert.equal(s.purchases[0].received, 5)
  assert.equal(s.materials[0].stock, stock + 5)
  assert.equal(s.jobs[1].actualCost, cost + 160)
  assert.equal(s.movements[0].qty, 5)
  assert.equal(s.transactions[0].kind, "Compra")
  assert.equal(s.transactions[0].amount, 160)
  assert.throws(() => run(s, { type: "purchase.receive", id, qty: 16 }))
  s = run(s, { type: "purchase.receive", id, qty: 15 })
  assert.equal(s.purchases[0].received, 20)
  assert.throws(() => run(s, { type: "purchase.receive", id, qty: 1 }))
})

test("6 · Nómina → revisión → pago simulado con conceptos coherentes", () => {
  let s = initialDemo()
  const id = "NOM-001"
  assert.equal(payrollNet(s.payrolls[0]), 1680)
  assert.throws(() => run(s, { type: "payroll.pay", id }))
  s = run(s, { type: "payroll.review", id }, "Administración")
  s = run(s, { type: "payroll.pay", id }, "Administración")
  assert.equal(s.payrolls[0].status, "Pagada")
  assert.equal(payrollNet(s.payrolls[0]), 1680)
  assert.throws(() => run(s, { type: "payroll.pay", id }))
  assert.throws(() => run(s, { type: "payroll.review", id }, "Operario"))
})

test("Permisos de perfiles y transacciones sin sesión demo", () => {
  const s = initialDemo()
  assert.ok(!access.Operario.includes("Facturación"))
  assert.ok(!access.Operario.includes("Informes"))
  assert.ok(!access["Jefe de obra"].includes("Nóminas"))
  assert.equal(canSeeJob("Operario", s.jobs[1]), false)
  assert.throws(() =>
    run(
      s,
      {
        type: "report.create",
        jobId: "OBR-002",
        hours: 8,
        overtime: 0,
        allowance: 0,
        text: "Prueba",
        incident: "",
      },
      "Operario",
    ),
  )
  assert.throws(() =>
    run(
      s,
      {
        type: "invoice.create",
        jobId: "OBR-001",
        kind: "Emitida",
        base: 1,
        tax: 0,
        description: "Demo",
        due: "2026-12-01",
      },
      "Operario",
    ),
  )
  assert.throws(() =>
    run(s, { type: "quote.create", leadId: "cli-1", title: "Prueba" }, null),
  )
})

test("Agenda detecta solapamientos de personas y maquinaria; stock no negativo", () => {
  const s = initialDemo()
  const event = {
    id: "",
    title: "Prueba",
    jobId: "OBR-002",
    employeeId: "emp-4",
    resource: "Furgoneta 01",
    start: "2026-11-10T10:00",
    end: "2026-11-10T11:00",
    kind: "Turno",
  }
  assert.throws(
    () => run(s, { type: "event.save", event }, "Jefe de obra"),
    /Solapamiento/,
  )
  const next = run(
    s,
    {
      type: "event.save",
      event: { ...event, start: "2026-11-10T11:00", end: "2026-11-10T12:00" },
    },
    "Jefe de obra",
  )
  assert.equal(next.events.length, s.events.length + 1)
  assert.throws(() =>
    run(s, { type: "material.move", id: "mat-1", qty: -100, reason: "Prueba" }),
  )
})

test("Persistencia serializable, consistencia del histórico y restablecimiento puro", () => {
  let s = initialDemo()
  s = run(
    s,
    { type: "task.toggle", jobId: "OBR-001", id: "task-2" },
    "Operario",
  )
  const restored = JSON.parse(JSON.stringify(s))
  assert.equal(isDemoState(restored), true)
  assert.equal(restored.jobs[0].tasks[1].done, true)
  assert.equal(initialDemo().jobs[0].tasks[1].done, false)
  for (const job of s.jobs)
    assert.equal(
      s.transactions
        .filter((t) => t.kind === "Coste" && t.jobId === job.id)
        .reduce((n, t) => n + t.amount, 0),
      job.actualCost,
    )
  for (const invoice of s.invoices.filter((i) => i.type === "Emitida"))
    assert.equal(
      s.transactions
        .filter((t) => t.kind === "Cobro" && t.reference === invoice.id)
        .reduce((n, t) => n + t.amount, 0),
      invoice.paid,
    )
})

test("Recuperación de almacenamiento rechaza estructuras, fechas y relaciones corruptas", () => {
  const missingName = initialDemo()
  delete missingName.jobs[0].title
  assert.equal(isDemoState(missingName), false)
  const badDate = initialDemo()
  badDate.documents[0].expires = "fecha rota"
  assert.equal(isDemoState(badDate), false)
  const orphan = initialDemo()
  orphan.quotes[0].leadId = "inexistente"
  assert.equal(isDemoState(orphan), false)
  const wrongPayroll = initialDemo()
  wrongPayroll.payrolls[0].base = null
  assert.equal(isDemoState(wrongPayroll), false)
  assert.equal(isDemoState({ ...initialDemo(), preferences: {} }), false)
})

test("Sesión HMAC: firma, expiración, rotación y configuración ausente", async () => {
  process.env.PROPOSALS_ACCESS_KEY = "prueba"
  assert.equal(authConfigured(), true)
  const now = Date.now()
  const session = await createSession(now)
  assert.equal(await validSession(session, now), true)
  assert.equal(await validSession(`${session}x`, now), false)
  assert.equal(await validSession(session, now + SESSION_TTL * 1000 + 1), false)
  process.env.PROPOSALS_ACCESS_KEY = "rotated-test-only-key"
  assert.equal(await validSession(session, now), false)
  delete process.env.PROPOSALS_ACCESS_KEY
  assert.equal(await validSession(session, now), false)
})

test("El límite de intentos funciona sin configurar servicios externos", async () => {
  const source = (
    await readFile(
      new URL("../lib/proposals/rate-limit.ts", import.meta.url),
      "utf8",
    )
  ).replace('import "server-only"', "")
  const compiled = stripTypeScriptTypes(source)
  const { allowLogin } = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  )
  for (let i = 0; i < 6; i++)
    assert.equal(await allowLogin("client-demo"), true)
  assert.equal(await allowLogin("client-demo"), false)
  assert.equal(await allowLogin("other-client-demo"), true)
})

test("El origen público se obtiene de la petición sin otra variable de entorno", () => {
  assert.equal(
    proposalOrigin(
      "http://localhost:3000/propuestas/session",
      new Headers({ host: "portfolio.example", "x-forwarded-proto": "https" }),
    ),
    "https://portfolio.example",
  )
})

test("Retorno tras login limita destinos a /propuestas y evita bucles", () => {
  assert.equal(
    safeReturnPath("/propuestas/construccions-germans-moya/admin?modulo=crm"),
    "/propuestas/construccions-germans-moya/admin?modulo=crm",
  )
  for (const path of [
    "https://evil.example/propuestas",
    "//evil.example/propuestas",
    "/propuestas/acceso",
    "/propuestas/session",
    "/propuestas-otra",
    "/\\evil.example",
    "/propuestas/\r\nLocation:evil",
  ])
    assert.equal(safeReturnPath(path), "/propuestas")
})
