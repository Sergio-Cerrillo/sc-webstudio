"use client"
import { useState } from "react"
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  FilePlus2,
  Plus,
  Printer,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react"
import {
  access,
  canSeeJob,
  COMPANY_PATH,
  dateES,
  euro,
  finances,
  invoiceBalance,
  invoiceTotal,
  MY_EMPLOYEE,
  payrollNet,
  quoteTotals,
  today,
  nextMonthDate,
  type CalendarEvent,
  type Job,
  type Quote,
} from "@/lib/proposals/demo"
import { useDemo } from "./demo-provider"
import { useAdmin, matches, options, selectedOptions } from "./admin-context"
import {
  Badge,
  downloadCSV,
  Empty,
  Panel,
  Stat,
  Table,
  type Editor,
  type Field,
} from "./admin-ui"

function useActions() {
  const a = useAdmin()
  const jobs = a.state.jobs.filter((j) => canSeeJob(a.role, j))
  const jobField: Field = {
    name: "jobId",
    label: "Obra vinculada",
    options: selectedOptions(jobs),
    value: a.jobFilter || jobs[0]?.id,
  }
  const confirm = (
    title: string,
    description: string,
    action: () => boolean,
    submit = "Confirmar simulación",
  ) => a.edit({ title, description, fields: [], submit, onSubmit: action })
  const invoice = (jobId?: string) =>
    a.edit({
      title: "Crear factura de muestra",
      description:
        "Simulación local sin emisión fiscal ni envío a terceros. Una factura recibida imputa su base al coste de la obra.",
      fields: [
        { ...jobField, value: jobId || jobField.value },
        {
          name: "kind",
          label: "Tipo",
          options: options(["Emitida", "Recibida"]),
        },
        {
          name: "description",
          label: "Concepto",
          value: "Certificación de obra · Muestra",
        },
        {
          name: "base",
          label: "Base (€)",
          type: "number",
          min: 0.01,
          step: ".01",
          value: 1000,
        },
        {
          name: "tax",
          label: "Impuesto ilustrativo (%)",
          type: "number",
          min: 0,
          max: 100,
          value: 21,
        },
        { name: "due", label: "Vencimiento", type: "date", value: today() },
      ],
      submit: "Crear en demo",
      onSubmit: (v) =>
        a.dispatch({
          type: "invoice.create",
          jobId: v.jobId,
          kind: v.kind as "Emitida" | "Recibida",
          base: Number(v.base),
          tax: Number(v.tax),
          description: v.description,
          due: v.due,
        }),
    })
  const report = (jobId?: string) =>
    a.edit({
      title: "Registrar parte de obra",
      fields: [
        { ...jobField, value: jobId || jobField.value },
        {
          name: "hours",
          label: "Horas totales",
          type: "number",
          value: 8,
          min: 0.25,
          max: 16,
          step: ".25",
        },
        {
          name: "overtime",
          label: "De ellas, horas extra",
          type: "number",
          value: 0,
          min: 0,
          max: 16,
          step: ".25",
        },
        {
          name: "allowance",
          label: "Dietas (€)",
          type: "number",
          value: 12,
          min: 0,
          max: 200,
          step: ".01",
        },
        {
          name: "text",
          label: "Trabajo realizado",
          type: "textarea",
          value: "Colocación de pavimento de muestra.",
        },
        {
          name: "incident",
          label: "Incidencia / observación",
          type: "textarea",
          required: false,
        },
      ],
      onSubmit: (v) =>
        a.dispatch({
          type: "report.create",
          jobId: v.jobId,
          hours: Number(v.hours),
          overtime: Number(v.overtime),
          allowance: Number(v.allowance),
          text: v.text,
          incident: v.incident,
        }),
    })
  const absence = () =>
    a.edit({
      title: "Solicitar ausencia",
      description:
        "Solicitud de Júlia Font, empleada ficticia. Administración podrá aprobarla y se añadirá al calendario.",
      fields: [
        {
          name: "kind",
          label: "Tipo",
          options: options(["Vacaciones", "Ausencia personal"]),
        },
        { name: "start", label: "Desde", type: "date", value: today() },
        { name: "end", label: "Hasta", type: "date", value: today() },
      ],
      onSubmit: (v) =>
        a.dispatch({
          type: "absence.request",
          start: v.start,
          end: v.end,
          kind: v.kind,
        }),
    })
  return {
    ...a,
    jobs,
    jobField,
    confirm,
    invoice,
    report,
    absence,
    admin: a.role === "Dirección" || a.role === "Administración",
    manager: a.role !== "Operario",
  }
}

export function DashboardView() {
  const a = useActions()
  const { state: s, role, nav } = a
  const financial = finances(s, a.jobFilter || undefined)
  const jobs = a.jobs.filter(
    (j) =>
      (!a.jobFilter || j.id === a.jobFilter) &&
      matches(a.search, j.title, j.status) &&
      (a.statusFilter === "Activas"
        ? j.status !== "Entregada"
        : matches(a.statusFilter, j.status)),
  )
  const operator = role === "Operario"
  const openShift = s.shifts.find((x) => x.employeeId === MY_EMPLOYEE && !x.end)
  const pending = s.reports.filter(
    (r) =>
      r.status === "Pendiente" && (!a.jobFilter || r.jobId === a.jobFilter),
  )
  return (
    <>
      <div className="a-dashboard-banner">
        <div>
          <span className="p-eyebrow">
            {operator
              ? "MI JORNADA / JÚLIA FONT"
              : "EL DETALLE TAMBIÉN ESTÁ EN LA GESTIÓN"}
          </span>
          <h2>
            {operator
              ? "Tu próximo paso está aquí."
              : "Cada decisión, bien conectada."}
          </h2>
          <p>
            {operator
              ? "Consulta tus asignaciones y registra el trabajo de hoy."
              : "Obras, equipo y administración comparten una misma historia."}
          </p>
          <button
            className="a-button"
            onClick={() =>
              operator ? a.dispatch({ type: "shift.toggle" }) : nav("Obras")
            }
          >
            {operator
              ? openShift
                ? "Fichar salida"
                : "Fichar entrada"
              : "Ver obras activas"}
            <ArrowUpRight size={16} />
          </button>
        </div>
        <img
          src={`${COMPANY_PATH}/fachada.webp`}
          alt="Detalle de la fachada de piedra"
        />
      </div>
      <div className="a-stats">
        <Stat
          title={operator ? "Mis obras" : "Obras activas"}
          value={jobs.filter((j) => j.status !== "Entregada").length}
          detail="Planificación y ejecución"
          onClick={() => nav("Obras", "Activas")}
        />
        <Stat
          title="Partes pendientes"
          value={
            operator
              ? pending.filter((r) => r.employeeId === MY_EMPLOYEE).length
              : pending.length
          }
          detail="Pendientes de revisión"
          onClick={() => nav("Personal", "Pendiente")}
        />
        {a.admin ? (
          <>
            <Stat
              title="Presupuestos pendientes"
              value={s.quotes.filter((q) => q.status !== "Aceptado").length}
              detail="Borradores por revisar"
              onClick={() => nav("Presupuestos", "Borrador")}
            />
            <Stat
              title="Pendiente de cobro"
              value={euro(financial.balance)}
              detail="Saldos de facturas emitidas"
              onClick={() => nav("Facturación", "Cobro pendiente")}
            />
          </>
        ) : (
          <>
            <Stat
              title="Próximos hitos"
              value={
                s.events.filter(
                  (e) => !operator || e.employeeId === MY_EMPLOYEE,
                ).length
              }
              detail="Agenda de demostración"
              onClick={() => nav("Agenda")}
            />
            <Stat
              title="Tareas por completar"
              value={jobs.reduce(
                (n, j) => n + j.tasks.filter((t) => !t.done).length,
                0,
              )}
              detail="En tus obras visibles"
              onClick={() => nav("Obras")}
            />
          </>
        )}
      </div>
      {a.admin && (
        <div className="a-financial-strip">
          <button onClick={() => nav("Facturación")}>
            Cobros simulados <strong>{euro(financial.collected)}</strong>
          </button>
          <button onClick={() => nav("Obras")}>
            Costes acumulados <strong>{euro(financial.cost)}</strong>
          </button>
          <button
            onClick={() =>
              nav(role === "Dirección" ? "Informes" : "Facturación")
            }
          >
            Margen sobre base facturada{" "}
            <strong>{euro(financial.margin)}</strong>
          </button>
        </div>
      )}
      <div className="a-two-columns">
        <Panel
          title={operator ? "Mis asignaciones" : "Obras en foco"}
          action={
            <button className="a-link" onClick={() => nav("Obras")}>
              Todas las obras →
            </button>
          }
        >
          {jobs.map((j) => (
            <button
              className="a-job-summary"
              key={j.id}
              onClick={() => nav("Obras", "", j.id)}
            >
              <div>
                <strong>{j.title}</strong>
                <small>
                  {j.id} · {j.status}
                </small>
              </div>
              <div>
                <span>{j.progress}%</span>
                <progress value={j.progress} max={100} />
              </div>
              <ArrowUpRight size={17} />
            </button>
          ))}
          {!jobs.length && <Empty />}
        </Panel>
        <Panel
          title="En el horizonte"
          subtitle="Hitos y alertas de muestra"
          action={
            <button className="a-link" onClick={() => nav("Agenda")}>
              Agenda →
            </button>
          }
        >
          {s.events
            .filter(
              (e) =>
                (!operator || e.employeeId === MY_EMPLOYEE) &&
                (!a.jobFilter || e.jobId === a.jobFilter),
            )
            .slice(0, 4)
            .map((e) => (
              <button
                className="a-agenda-summary"
                key={e.id}
                onClick={() => nav("Agenda")}
              >
                <span>
                  {e.start.slice(8, 10)}
                  <small>
                    {new Date(
                      `${e.start.slice(0, 10)}T12:00:00`,
                    ).toLocaleString("es-ES", { month: "short" })}
                  </small>
                </span>
                <div>
                  <strong>{e.title}</strong>
                  <small>
                    {e.start.slice(11)} · {e.kind}
                  </small>
                </div>
              </button>
            ))}
          {s.preferences.reminder && (
            <button
              className="a-alert"
              onClick={() => nav("Documentación", "Caducidad")}
            >
              ↗ Revisa los vencimientos preventivos de muestra
            </button>
          )}
        </Panel>
      </div>
      <Panel title="Acciones rápidas">
        <div className="a-quick-actions">
          {operator ? (
            <>
              <button onClick={() => a.report()}>+ Registrar parte</button>
              <button onClick={a.absence}>+ Solicitar ausencia</button>
            </>
          ) : (
            <>
              <button onClick={() => nav("Agenda")}>+ Planificar visita</button>
              {a.admin && (
                <>
                  <button onClick={() => nav("CRM y clientes")}>
                    + Nueva oportunidad
                  </button>
                  <button onClick={() => a.invoice()}>+ Factura demo</button>
                </>
              )}
              <button onClick={() => nav("Personal")}>
                Revisar equipo y partes →
              </button>
            </>
          )}
        </div>
      </Panel>
    </>
  )
}

export function CRMView() {
  const a = useActions()
  const [view, setView] = useState("Tablero")
  const [selected, setSelected] = useState("")
  const leads = a.state.leads.filter(
    (l) =>
      matches(a.search, l.name, l.email, l.service, l.message) &&
      matches(a.statusFilter, l.status) &&
      (!a.jobFilter ||
        a.state.jobs.some((j) => j.id === a.jobFilter && j.leadId === l.id)),
  )
  const lead = leads.find((l) => l.id === selected) || leads[0]
  const quote = (leadId: string) =>
    a.edit({
      title: "Crear presupuesto desde CRM",
      fields: [
        {
          name: "title",
          label: "Nombre del proyecto",
          value: `Proyecto de ${a.state.leads.find((l) => l.id === leadId)?.name}`,
        },
      ],
      onSubmit: (v) => {
        const ok = a.dispatch({ type: "quote.create", leadId, title: v.title })
        if (ok) a.nav("Presupuestos")
        return ok
      },
    })
  return (
    <>
      <div className="a-toolbar">
        <div className="a-segmented">
          {["Tablero", "Lista"].map((v) => (
            <button
              key={v}
              className={view === v ? "active" : ""}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <button
          className="a-button"
          onClick={() =>
            a.edit({
              title: "Nueva oportunidad ficticia",
              fields: [
                { name: "name", label: "Nombre ficticio" },
                { name: "email", label: "Correo ficticio", type: "email" },
                {
                  name: "phone",
                  label: "Teléfono ficticio",
                  value: "000 000 000",
                },
                {
                  name: "service",
                  label: "Servicio",
                  options: options([
                    "Reforma integral",
                    "Obra nueva",
                    "Cocinas y baños",
                    "Interiorismo",
                    "Decoración",
                  ]),
                },
                { name: "message", label: "Necesidad", type: "textarea" },
              ],
              onSubmit: (v) =>
                a.dispatch({
                  type: "lead.create",
                  name: v.name,
                  email: v.email,
                  phone: v.phone,
                  service: v.service,
                  message: v.message,
                }),
            })
          }
        >
          <Plus size={16} />
          Nueva oportunidad
        </button>
      </div>
      {view === "Tablero" ? (
        <div className="a-kanban">
          {["Nueva", "Visita", "Presupuesto", "Ganada"].map((status) => (
            <section key={status}>
              <header>
                <span>{status}</span>
                <Badge>{leads.filter((l) => l.status === status).length}</Badge>
              </header>
              {leads
                .filter((l) => l.status === status)
                .map((l) => (
                  <button
                    key={l.id}
                    className={`a-lead-card ${lead?.id === l.id ? "selected" : ""}`}
                    onClick={() => setSelected(l.id)}
                  >
                    <small>{l.service}</small>
                    <strong>{l.name}</strong>
                    <p>{l.message}</p>
                    <span>
                      {dateES(l.date)} · {l.owner}
                    </span>
                  </button>
                ))}
            </section>
          ))}
        </div>
      ) : (
        <Panel>
          <Table
            label="Oportunidades CRM"
            headings={[
              "Cliente ficticio",
              "Servicio",
              "Estado",
              "Responsable",
              "Ficha",
            ]}
            rows={leads.map((l) => [
              l.name,
              l.service,
              <Badge key={l.id}>{l.status}</Badge>,
              l.owner,
              <button
                className="a-link"
                key={l.id}
                onClick={() => setSelected(l.id)}
              >
                Abrir →
              </button>,
            ])}
          />
        </Panel>
      )}
      {lead ? (
        <Panel
          title={lead.name}
          subtitle={`${lead.email} · ${lead.phone}`}
          action={
            <button className="a-button" onClick={() => quote(lead.id)}>
              Crear presupuesto <ArrowRight size={16} />
            </button>
          }
        >
          <div className="a-detail-grid">
            <div>
              <Badge>{lead.status}</Badge>
              <h3>{lead.service}</h3>
              <p>{lead.message}</p>
              <p>Responsable: {lead.owner}</p>
              <button
                className="a-link"
                onClick={() =>
                  a.edit({
                    title: "Seguimiento de oportunidad",
                    fields: [
                      {
                        name: "status",
                        label: "Etapa",
                        value: lead.status,
                        options: options([
                          "Nueva",
                          "Visita",
                          "Presupuesto",
                          "Ganada",
                        ]),
                      },
                      {
                        name: "owner",
                        label: "Responsable",
                        value: lead.owner,
                        options: a.state.employees
                          .filter((e) => e.id !== MY_EMPLOYEE)
                          .map((e) => ({ value: e.name, label: e.name })),
                      },
                      {
                        name: "note",
                        label: "Nota / visita / seguimiento",
                        type: "textarea",
                        required: false,
                      },
                    ],
                    onSubmit: (v) =>
                      a.dispatch({
                        type: "lead.update",
                        id: lead.id,
                        status: v.status,
                        owner: v.owner,
                        note: v.note,
                      }),
                  })
                }
              >
                Actualizar etapa y añadir nota ↗
              </button>
              <button
                className="a-link"
                onClick={() =>
                  a.confirm(
                    "Simular correo de seguimiento",
                    "Se registrará una nota local. No se enviará ningún correo.",
                    () =>
                      a.dispatch({
                        type: "lead.update",
                        id: lead.id,
                        status: lead.status,
                        owner: lead.owner,
                        note: "Correo de seguimiento simulado localmente. Sin envío.",
                      }),
                  )
                }
              >
                <Send size={14} />
                Simular seguimiento por correo
              </button>
            </div>
            <div>
              <h3>Historial y relaciones</h3>
              {lead.notes.length ? (
                lead.notes.map((n, i) => (
                  <p className="a-timeline-note" key={i}>
                    {n}
                  </p>
                ))
              ) : (
                <p>Sin notas todavía. Solicitud recibida en CRM.</p>
              )}
              {a.state.quotes
                .filter((q) => q.leadId === lead.id)
                .map((q) => (
                  <button
                    className="a-related"
                    key={q.id}
                    onClick={() => a.nav("Presupuestos", q.status)}
                  >
                    {q.id} · {q.title} · {euro(quoteTotals(q).total)} ↗
                  </button>
                ))}
              {a.state.jobs
                .filter((j) => j.leadId === lead.id)
                .map((j) => (
                  <div key={j.id}>
                    <button
                      className="a-related"
                      onClick={() => a.nav("Obras", "", j.id)}
                    >
                      Obra: {j.title} ↗
                    </button>
                    {a.state.invoices
                      .filter((i) => i.jobId === j.id)
                      .map((i) => (
                        <button
                          className="a-related"
                          key={i.id}
                          onClick={() => a.nav("Facturación", "", j.id)}
                        >
                          Factura: {i.id} · Saldo {euro(invoiceBalance(i))} ↗
                        </button>
                      ))}
                  </div>
                ))}
            </div>
          </div>
        </Panel>
      ) : (
        <Empty />
      )}
    </>
  )
}

function QuoteDetail({
  quote,
  resetSelection,
}: {
  quote: Quote
  resetSelection: () => void
}) {
  const a = useActions()
  const [draft, setDraft] = useState<Quote>(structuredClone(quote))
  const totals = quoteTotals(draft)
  const accepted = quote.status === "Aceptado"
  const input = (key: "discount" | "tax", label: string) => (
    <label>
      {label}
      <input
        type="number"
        value={draft[key]}
        min={0}
        max={100}
        onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })}
      />
    </label>
  )
  return (
    <Panel
      title={quote.title}
      subtitle={`${quote.id} · Versión ${quote.version} · ${a.state.leads.find((l) => l.id === quote.leadId)?.name}`}
      action={<Badge>{quote.status}</Badge>}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          a.dispatch({ type: "quote.save", quote: draft })
        }}
      >
        <div className="a-quote-meta">
          <label>
            Nombre del proyecto
            <input
              required
              maxLength={150}
              disabled={accepted}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </label>
          {!accepted && input("discount", "Descuento (%)")}
          {!accepted && input("tax", "Impuesto de ejemplo (%)")}
        </div>
        <div className="a-table-wrap">
          <table className="a-measurements">
            <thead>
              <tr>
                <th>Capítulo / Partida</th>
                <th>Medición</th>
                <th>Unidad</th>
                <th>Coste €/ud</th>
                <th>Precio €/ud</th>
                <th>Importe</th>
                {!accepted && <th>Quitar</th>}
              </tr>
            </thead>
            <tbody>
              {draft.lines.map((l, i) => (
                <tr key={l.id}>
                  <td>
                    <input
                      aria-label={`Capítulo partida ${i + 1}`}
                      required
                      disabled={accepted}
                      value={l.chapter}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          lines: draft.lines.map((x) =>
                            x.id === l.id
                              ? { ...x, chapter: e.target.value }
                              : x,
                          ),
                        })
                      }
                    />
                    <input
                      aria-label={`Descripción partida ${i + 1}`}
                      required
                      disabled={accepted}
                      value={l.title}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          lines: draft.lines.map((x) =>
                            x.id === l.id ? { ...x, title: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </td>
                  {(["qty", "unit", "cost", "price"] as const).map((key) => (
                    <td key={key}>
                      <input
                        aria-label={`${key} partida ${i + 1}`}
                        disabled={accepted}
                        type={key === "unit" ? "text" : "number"}
                        min={key === "qty" ? 0.01 : 0}
                        step=".01"
                        required
                        value={l[key]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            lines: draft.lines.map((x) =>
                              x.id === l.id
                                ? {
                                    ...x,
                                    [key]:
                                      key === "unit"
                                        ? e.target.value
                                        : Number(e.target.value),
                                  }
                                : x,
                            ),
                          })
                        }
                      />
                    </td>
                  ))}
                  <td>{euro(l.qty * l.price)}</td>
                  {!accepted && (
                    <td>
                      <button
                        type="button"
                        aria-label={`Quitar partida ${i + 1}`}
                        disabled={draft.lines.length === 1}
                        onClick={() =>
                          setDraft({
                            ...draft,
                            lines: draft.lines.filter((x) => x.id !== l.id),
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="a-quote-bottom">
          <div>
            {!accepted && (
              <>
                <button
                  type="button"
                  className="a-link"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      lines: [
                        ...draft.lines,
                        {
                          id: crypto.randomUUID(),
                          chapter: "02 · Acabados",
                          title: "Nueva partida",
                          qty: 1,
                          unit: "ud",
                          cost: 0,
                          price: 0,
                        },
                      ],
                    })
                  }
                >
                  + Añadir partida
                </button>
                <button className="a-button" type="submit">
                  Guardar mediciones
                </button>
              </>
            )}
          </div>
          <dl>
            <div>
              <dt>Coste previsto</dt>
              <dd>{euro(totals.cost)}</dd>
            </div>
            <div>
              <dt>Base tras descuento</dt>
              <dd>{euro(totals.base)}</dd>
            </div>
            <div>
              <dt>Impuesto ({draft.tax}%)</dt>
              <dd>{euro(totals.tax)}</dd>
            </div>
            <div>
              <dt>Total de muestra</dt>
              <dd>{euro(totals.total)}</dd>
            </div>
          </dl>
        </div>
      </form>
      <div className="a-action-row">
        <button
          className="a-button secondary"
          onClick={() => {
            if (a.dispatch({ type: "quote.duplicate", id: quote.id }))
              resetSelection()
          }}
        >
          <Copy size={16} />
          Duplicar versión
        </button>
        <button
          className="a-button secondary"
          onClick={() => a.print({ kind: "quote", value: quote })}
        >
          <Printer size={16} />
          Vista imprimible
        </button>
        {!accepted ? (
          <button
            className="a-button"
            onClick={() =>
              a.confirm(
                "Aceptar presupuesto de muestra",
                "Se aceptará la última versión guardada. Esta acción no crea un contrato real.",
                () => a.dispatch({ type: "quote.accept", id: quote.id }),
              )
            }
          >
            Aceptar en demo <Check size={16} />
          </button>
        ) : a.state.jobs.some((j) => j.quoteId === quote.id) ? (
          <button
            className="a-button"
            onClick={() =>
              a.nav(
                "Obras",
                "",
                a.state.jobs.find((j) => j.quoteId === quote.id)!.id,
              )
            }
          >
            Abrir obra vinculada →
          </button>
        ) : (
          <button
            className="a-button"
            onClick={() => {
              if (a.dispatch({ type: "job.convert", quoteId: quote.id }))
                a.nav("Obras")
            }}
          >
            Convertir en obra →
          </button>
        )}
      </div>
      {accepted && (
        <p className="a-note">
          Presupuesto aceptado: duplica una versión para modificar sus
          mediciones.
        </p>
      )}
    </Panel>
  )
}

export function QuotesView() {
  const a = useActions()
  const [selected, setSelected] = useState("")
  const quotes = a.state.quotes.filter(
    (q) =>
      matches(a.search, q.title, q.id) &&
      matches(a.statusFilter, q.status) &&
      (!a.jobFilter ||
        a.state.jobs.some((j) => j.id === a.jobFilter && j.quoteId === q.id)),
  )
  const quote = quotes.find((q) => q.id === selected) || quotes[0]
  return (
    <>
      <div className="a-toolbar">
        <p>{quotes.length} presupuestos · Impuestos e importes ilustrativos</p>
        <button
          className="a-button"
          onClick={() =>
            a.edit({
              title: "Nuevo presupuesto",
              fields: [
                {
                  name: "leadId",
                  label: "Cliente / oportunidad",
                  options: selectedOptions(a.state.leads),
                },
                {
                  name: "title",
                  label: "Nombre del proyecto",
                  value: "Nueva reforma demo",
                },
              ],
              onSubmit: (v) => {
                const ok = a.dispatch({
                  type: "quote.create",
                  leadId: v.leadId,
                  title: v.title,
                })
                if (ok) setSelected("")
                return ok
              },
            })
          }
        >
          <Plus size={16} />
          Nuevo presupuesto
        </button>
      </div>
      <div className="a-record-tabs">
        {quotes.map((q) => (
          <button
            key={q.id}
            className={quote?.id === q.id ? "active" : ""}
            onClick={() => setSelected(q.id)}
          >
            <small>
              {q.id} · v{q.version}
            </small>
            <strong>{q.title}</strong>
            <span>
              {euro(quoteTotals(q).total)} · {q.status}
            </span>
          </button>
        ))}
      </div>
      {quote ? (
        <QuoteDetail
          key={`${quote.id}-${JSON.stringify(quote)}`}
          quote={quote}
          resetSelection={() => setSelected("")}
        />
      ) : (
        <Empty />
      )}
    </>
  )
}

function CrewEditor({ job }: { job: Job }) {
  const a = useActions()
  const [crew, setCrew] = useState(job.crew)
  return (
    <div>
      <p>
        Selecciona personas o asigna una cuadrilla completa. Empleados
        ficticios.
      </p>
      <div className="a-action-row">
        {["Cuadrilla Mediterrània", "Cuadrilla Llevant"].map((name) => (
          <button
            className="a-button secondary"
            key={name}
            onClick={() =>
              setCrew(
                a.state.employees
                  .filter((e) => e.crew === name)
                  .map((e) => e.id),
              )
            }
          >
            {name}
          </button>
        ))}
      </div>
      <div className="a-crew-list">
        {a.state.employees.map((e) => (
          <label key={e.id}>
            <input
              type="checkbox"
              checked={crew.includes(e.id)}
              onChange={(event) =>
                setCrew(
                  event.target.checked
                    ? [...crew, e.id]
                    : crew.filter((x) => x !== e.id),
                )
              }
            />
            <span>
              <strong>{e.name}</strong>
              <small>
                {e.title} · {e.crew}
              </small>
            </span>
          </label>
        ))}
      </div>
      <button
        className="a-button"
        onClick={() => a.dispatch({ type: "job.assign", id: job.id, crew })}
      >
        Guardar equipo asignado
      </button>
    </div>
  )
}

export function JobsView() {
  const a = useActions()
  const [selected, setSelected] = useState("")
  const [tab, setTab] = useState("Resumen")
  const jobs = a.jobs.filter(
    (j) =>
      (!a.jobFilter || a.jobFilter === j.id) &&
      matches(
        a.search,
        j.title,
        j.id,
        j.entries.map((e) => e.text),
      ) &&
      (a.statusFilter === "Activas"
        ? j.status !== "Entregada"
        : matches(a.statusFilter, j.status)),
  )
  const job = jobs.find((j) => j.id === selected) || jobs[0]
  const tabs = [
    "Resumen",
    "Diario e incidencias",
    "Tareas y entrega",
    "Equipo",
    "Documentos",
  ]
  const addEntry = () =>
    job &&
    a.edit({
      title: "Añadir registro de obra",
      fields: [
        {
          name: "kind",
          label: "Tipo de registro",
          options: options([
            "Diario",
            "Incidencia",
            "Cambio de alcance",
            "Certificación",
            "Entrega",
            "Garantía",
            "Posventa",
            "Hito",
          ]),
        },
        { name: "text", label: "Detalle de muestra", type: "textarea" },
      ],
      onSubmit: (v) =>
        a.dispatch({
          type: "job.entry",
          id: job.id,
          kind: v.kind,
          text: v.text,
        }),
    })
  return (
    <>
      <div className="a-record-tabs">
        {jobs.map((j) => (
          <button
            className={job?.id === j.id ? "active" : ""}
            key={j.id}
            onClick={() => setSelected(j.id)}
          >
            <small>{j.id}</small>
            <strong>{j.title}</strong>
            <span>
              {j.status} · {j.progress}%
            </span>
          </button>
        ))}
      </div>
      {job ? (
        <>
          <Panel
            title={job.title}
            subtitle={`${job.id} · ${a.state.leads.find((l) => l.id === job.leadId)?.name}`}
            action={<Badge>{job.status}</Badge>}
          >
            <div className="a-job-header">
              <div>
                <p>
                  Del {dateES(job.start)} al {dateES(job.end)}
                </p>
                <progress max={100} value={job.progress} />
                <strong>{job.progress}% de avance</strong>
              </div>
              <div className="a-action-row">
                {a.admin && (
                  <button
                    className="a-button"
                    onClick={() => a.invoice(job.id)}
                  >
                    Crear factura demo
                  </button>
                )}
                {a.manager ? (
                  <button
                    className="a-button secondary"
                    onClick={() =>
                      a.edit({
                        title: "Actualizar avance",
                        fields: [
                          {
                            name: "progress",
                            label: "Avance (%)",
                            type: "number",
                            min: 0,
                            max: 100,
                            value: job.progress,
                          },
                          {
                            name: "status",
                            label: "Estado",
                            value: job.status,
                            options: options([
                              "Planificación",
                              "En curso",
                              "Entregada",
                            ]),
                          },
                        ],
                        onSubmit: (v) =>
                          a.dispatch({
                            type: "job.progress",
                            id: job.id,
                            progress: Number(v.progress),
                            status: v.status,
                          }),
                      })
                    }
                  >
                    Actualizar avance
                  </button>
                ) : (
                  <button className="a-button" onClick={() => a.report(job.id)}>
                    Registrar parte
                  </button>
                )}
              </div>
            </div>
            <div className="a-tabs">
              {tabs.map((t) => (
                <button
                  key={t}
                  className={tab === t ? "active" : ""}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab === "Resumen" && (
              <>
                <div className="a-detail-grid">
                  <div>
                    <h3>Calendario e hitos</h3>
                    {a.state.events
                      .filter(
                        (e) =>
                          e.jobId === job.id &&
                          (a.role !== "Operario" ||
                            e.employeeId === MY_EMPLOYEE),
                      )
                      .map((e) => (
                        <button
                          key={e.id}
                          className="a-related"
                          onClick={() => a.nav("Agenda", "", job.id)}
                        >
                          {dateES(e.start)} · {e.title} ↗
                        </button>
                      ))}
                    {job.entries
                      .filter((e) => e.kind === "Hito")
                      .map((e) => (
                        <p key={e.id}>{e.text}</p>
                      ))}
                    <button
                      className="a-link"
                      onClick={() => a.nav("Agenda", "", job.id)}
                    >
                      Ver planificación →
                    </button>
                  </div>
                  <div>
                    <h3>Equipo asignado</h3>
                    {job.crew.map((id) => (
                      <p key={id}>
                        {a.state.employees.find((e) => e.id === id)?.name} ·{" "}
                        {a.state.employees.find((e) => e.id === id)?.title}
                      </p>
                    ))}
                    {!job.crew.length && (
                      <p>La obra aún no tiene cuadrilla asignada.</p>
                    )}
                    <h3>Seguimiento</h3>
                    <p>
                      {job.tasks.filter((t) => t.done).length} /{" "}
                      {job.tasks.length} tareas completadas
                    </p>
                    <p>
                      {
                        job.entries.filter((e) => e.kind === "Incidencia")
                          .length
                      }{" "}
                      incidencias registradas
                    </p>
                  </div>
                </div>
                {a.manager && (
                  <>
                    <div className="a-financial-strip">
                      <div>
                        Presupuesto base<strong>{euro(job.budget)}</strong>
                      </div>
                      <div>
                        Coste previsto<strong>{euro(job.plannedCost)}</strong>
                      </div>
                      <div>
                        Coste real acumulado
                        <strong>{euro(job.actualCost)}</strong>
                      </div>
                      <div>
                        Margen estimado a fin de obra
                        <strong>{euro(job.budget - job.plannedCost)}</strong>
                      </div>
                    </div>
                    <div className="a-cost-chart">
                      <div
                        style={{
                          width: `${Math.min(100, (job.actualCost / Math.max(1, job.plannedCost)) * 100)}%`,
                        }}
                      />
                      <span>
                        {Math.round(
                          (job.actualCost / Math.max(1, job.plannedCost)) * 100,
                        )}
                        % del coste previsto consumido
                      </span>
                    </div>
                  </>
                )}
                {a.admin && (
                  <div className="a-financial-strip">
                    <button onClick={() => a.nav("Facturación", "", job.id)}>
                      Facturado con impuestos
                      <strong>{euro(finances(a.state, job.id).sales)}</strong>
                    </button>
                    <button onClick={() => a.nav("Facturación", "", job.id)}>
                      Cobrado
                      <strong>
                        {euro(finances(a.state, job.id).collected)}
                      </strong>
                    </button>
                    <button
                      onClick={() => a.nav("Facturación", "Pendiente", job.id)}
                    >
                      Saldo pendiente
                      <strong>{euro(finances(a.state, job.id).balance)}</strong>
                    </button>
                  </div>
                )}
              </>
            )}
            {tab === "Diario e incidencias" && (
              <>
                <div className="a-toolbar">
                  <p>Diario, cambios, certificaciones y seguimiento</p>
                  {a.manager && (
                    <button className="a-button" onClick={addEntry}>
                      + Añadir registro
                    </button>
                  )}
                </div>
                <img
                  className="a-site-photo"
                  src={`${COMPANY_PATH}/interior.webp`}
                  alt="Fotografía de muestra, sin atribución a la empresa"
                />
                <p className="a-note">
                  Fotografía ilustrativa, no documenta esta obra ficticia.
                </p>
                {job.entries.map((entry) => (
                  <article className="a-timeline-note" key={entry.id}>
                    <Badge>{entry.kind}</Badge>
                    <small>{dateES(entry.date)}</small>
                    <p>{entry.text}</p>
                  </article>
                ))}
                {!job.entries.length && (
                  <Empty>El diario está listo para el primer registro.</Empty>
                )}
              </>
            )}
            {tab === "Tareas y entrega" && (
              <>
                <h3>Lista de comprobación</h3>
                {job.tasks.map((task) => (
                  <label className="a-task" key={task.id}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() =>
                        a.dispatch({
                          type: "task.toggle",
                          jobId: job.id,
                          id: task.id,
                        })
                      }
                    />
                    <span>{task.title}</span>
                    <Badge>{task.done ? "Completada" : "Pendiente"}</Badge>
                  </label>
                ))}
                {a.manager && (
                  <button className="a-button secondary" onClick={addEntry}>
                    Añadir entrega, garantía o posventa
                  </button>
                )}
                {job.entries
                  .filter((e) =>
                    [
                      "Entrega",
                      "Garantía",
                      "Posventa",
                      "Certificación",
                      "Cambio de alcance",
                    ].includes(e.kind),
                  )
                  .map((e) => (
                    <p className="a-timeline-note" key={e.id}>
                      <strong>{e.kind}</strong> · {e.text}
                    </p>
                  ))}
                <p className="a-note">
                  Los cambios de alcance y certificaciones se registran como
                  notas de demostración; no recalculan el contrato.
                </p>
              </>
            )}
            {tab === "Equipo" &&
              (a.manager ? (
                <CrewEditor key={`${job.id}-${job.crew.join()}`} job={job} />
              ) : (
                <div>
                  {job.crew.map((id) => (
                    <p key={id}>
                      {a.state.employees.find((e) => e.id === id)?.name}
                    </p>
                  ))}
                  <p className="a-note">
                    Tu perfil puede consultar las asignaciones y registrar sus
                    propios partes.
                  </p>
                </div>
              ))}
            {tab === "Documentos" && (
              <>
                {a.state.documents
                  .filter((d) => d.jobId === job.id)
                  .map((d) => (
                    <button
                      className="a-related"
                      key={d.id}
                      onClick={() => a.print({ kind: "document", value: d })}
                    >
                      {d.category} · {d.name} · v{d.version} ↗
                    </button>
                  ))}
                <button
                  className="a-button secondary"
                  onClick={() => a.nav("Documentación", "", job.id)}
                >
                  Abrir archivo de obra
                </button>
              </>
            )}
          </Panel>
        </>
      ) : (
        <Empty>
          No hay obras visibles con estos filtros. Las obras recién convertidas
          deben asignarse a una cuadrilla antes de aparecer en el perfil
          Operario.
        </Empty>
      )}
    </>
  )
}

export function AgendaView() {
  const a = useActions()
  const [view, setView] = useState("Semana")
  const [anchor, setAnchor] = useState("2026-11-09")
  const start = new Date(`${anchor}T12:00:00`)
  if (view === "Semana")
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  else start.setDate(1)
  const count =
    view === "Semana"
      ? 7
      : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
  const days = Array.from({ length: count }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return date.toLocaleDateString("sv-SE")
  })
  const events = a.state.events.filter(
    (e) =>
      (!a.jobFilter || e.jobId === a.jobFilter) &&
      (!a.personFilter || e.employeeId === a.personFilter) &&
      (a.role !== "Operario" || e.employeeId === MY_EMPLOYEE) &&
      matches(a.search, e.title, e.resource, e.kind) &&
      matches(a.statusFilter, e.kind),
  )
  const editEvent = (event?: CalendarEvent) =>
    a.edit({
      title: event ? "Editar evento de planificación" : "Planificar evento",
      description:
        "Se comprueban los solapamientos de persona y recurso antes de guardar.",
      fields: [
        {
          name: "title",
          label: "Nombre",
          value: event?.title || "Visita de obra demo",
        },
        { ...a.jobField, value: event?.jobId || a.jobField.value },
        {
          name: "employeeId",
          label: "Persona / responsable",
          options: selectedOptions(a.state.employees),
          value: event?.employeeId || "emp-2",
        },
        {
          name: "kind",
          label: "Tipo",
          options: options([
            "Visita",
            "Turno",
            "Entrega",
            "Mantenimiento",
            "Vencimiento",
          ]),
          value: event?.kind || "Visita",
        },
        {
          name: "resource",
          label: "Vehículo / maquinaria",
          value: event?.resource || "",
          options: [
            { value: "", label: "Sin recurso" },
            ...a.state.equipment.map((e) => ({ value: e.name, label: e.name })),
          ],
        },
        {
          name: "start",
          label: "Inicio",
          type: "datetime-local",
          value: event?.start || `${anchor}T09:00`,
        },
        {
          name: "end",
          label: "Fin",
          type: "datetime-local",
          value: event?.end || `${anchor}T10:00`,
        },
      ],
      onSubmit: (v) =>
        a.dispatch({
          type: "event.save",
          event: {
            id: event?.id || "",
            title: v.title,
            jobId: v.jobId,
            employeeId: v.employeeId,
            resource: v.resource,
            start: v.start,
            end: v.end,
            kind: v.kind,
          },
        }),
    })
  const shift = (direction: number) => {
    const next = new Date(`${anchor}T12:00:00`)
    if (view === "Semana") next.setDate(next.getDate() + direction * 7)
    else {
      next.setDate(1)
      next.setMonth(next.getMonth() + direction)
    }
    setAnchor(next.toLocaleDateString("sv-SE"))
  }
  return (
    <>
      <div className="a-toolbar">
        <div className="a-segmented">
          {["Semana", "Mes"].map((v) => (
            <button
              className={view === v ? "active" : ""}
              key={v}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="a-action-row">
          <button
            aria-label="Periodo anterior"
            className="a-icon-button"
            onClick={() => shift(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <label className="a-date-picker">
            Fecha
            <input
              aria-label="Fecha de agenda"
              type="date"
              value={anchor}
              onChange={(e) => {
                if (e.target.value) setAnchor(e.target.value)
              }}
            />
          </label>
          <button
            aria-label="Periodo siguiente"
            className="a-icon-button"
            onClick={() => shift(1)}
          >
            <ChevronRight size={18} />
          </button>
          {a.manager && (
            <button className="a-button" onClick={() => editEvent()}>
              + Planificar
            </button>
          )}
        </div>
      </div>
      <Panel
        title={`${start.toLocaleString("es-ES", { month: "long", year: "numeric" })}`}
        subtitle="Vacaciones aprobadas, visitas y recursos compartidos"
      >
        <div className={`a-calendar ${view === "Mes" ? "month" : "week"}`}>
          {view === "Mes" &&
            Array.from({ length: (start.getDay() + 6) % 7 }, (_, i) => (
              <div key={`blank-${i}`} className="a-calendar-blank" />
            ))}
          {days.map((date) => (
            <section key={date} className={date === today() ? "today" : ""}>
              <header>
                <small>
                  {new Date(`${date}T12:00:00`).toLocaleString("es-ES", {
                    weekday: "short",
                  })}
                </small>
                <strong>{date.slice(8)}</strong>
              </header>
              {events
                .filter(
                  (e) =>
                    e.start.slice(0, 10) <= date && e.end.slice(0, 10) >= date,
                )
                .map((e) => (
                  <button
                    className={`a-calendar-event ${e.kind === "Vacaciones" ? "vacation" : ""}`}
                    key={e.id}
                    onClick={() =>
                      a.manager && e.jobId
                        ? editEvent(e)
                        : a.confirm(
                            "Detalle de agenda",
                            `${e.title} · ${a.state.employees.find((p) => p.id === e.employeeId)?.name} · ${dateES(e.start)} a ${dateES(e.end)}. ${e.resource || "Sin recurso"}.`,
                            () => true,
                            "Cerrar detalle",
                          )
                    }
                  >
                    <small>
                      {e.start.slice(11)} · {e.kind}
                    </small>
                    <strong>{e.title}</strong>
                    <small>
                      {
                        a.state.employees.find((p) => p.id === e.employeeId)
                          ?.name
                      }
                    </small>
                    {e.resource && <span>{e.resource}</span>}
                  </button>
                ))}
            </section>
          ))}
        </div>
      </Panel>
      <Panel title="Eventos del periodo">
        <Table
          label="Lista de agenda"
          headings={["Evento", "Fecha", "Persona", "Obra / Recurso", "Acción"]}
          rows={events
            .filter(
              (e) =>
                e.start.slice(0, 10) <= days[days.length - 1] &&
                e.end.slice(0, 10) >= days[0],
            )
            .sort((x, y) => x.start.localeCompare(y.start))
            .map((e) => [
              e.title,
              `${dateES(e.start)} · ${e.start.slice(11)}`,
              a.state.employees.find((p) => p.id === e.employeeId)?.name,
              `${a.state.jobs.find((j) => j.id === e.jobId)?.title || "Ausencia"} · ${e.resource || "—"}`,
              a.manager && e.jobId ? (
                <button
                  key={e.id}
                  className="a-link"
                  onClick={() => editEvent(e)}
                >
                  Editar →
                </button>
              ) : (
                <Badge key={e.id}>{e.kind}</Badge>
              ),
            ])}
        />
      </Panel>
    </>
  )
}

export function PeopleView() {
  const a = useActions()
  const operator = a.role === "Operario"
  const employees = a.state.employees.filter(
    (e) =>
      (!operator || e.id === MY_EMPLOYEE) &&
      (!a.personFilter || e.id === a.personFilter) &&
      matches(a.search, e.name, e.crew, e.title) &&
      (!a.jobFilter ||
        a.state.jobs.find((j) => j.id === a.jobFilter)?.crew.includes(e.id)),
  )
  const reports = a.state.reports.filter(
    (r) =>
      (!operator || r.employeeId === MY_EMPLOYEE) &&
      (!a.personFilter || r.employeeId === a.personFilter) &&
      (!a.jobFilter || r.jobId === a.jobFilter) &&
      matches(a.statusFilter, r.status),
  )
  const absences = a.state.absences.filter(
    (r) =>
      (!operator || r.employeeId === MY_EMPLOYEE) &&
      (!a.personFilter || r.employeeId === a.personFilter) &&
      matches(a.statusFilter, r.status),
  )
  const shifts = a.state.shifts.filter(
    (r) =>
      (!operator || r.employeeId === MY_EMPLOYEE) &&
      (!a.personFilter || r.employeeId === a.personFilter),
  )
  const openShift = a.state.shifts.find(
    (r) => r.employeeId === MY_EMPLOYEE && !r.end,
  )
  return (
    <>
      {operator && (
        <Panel
          title="Mi jornada · Júlia Font"
          subtitle="Empleada ficticia / Cuadrilla Mediterrània"
        >
          <div className="a-clock-panel">
            <div>
              <Clock3 size={24} />
              <strong>
                {openShift ? "Jornada en curso" : "Fuera de jornada"}
              </strong>
              {openShift && (
                <span>
                  Entrada:{" "}
                  {new Date(openShift.start).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Europe/Madrid",
                  })}
                </span>
              )}
            </div>
            <button
              className="a-button"
              onClick={() => a.dispatch({ type: "shift.toggle" })}
            >
              {openShift ? "Fichar salida" : "Fichar entrada"}
            </button>
            <button className="a-button secondary" onClick={() => a.report()}>
              Registrar parte
            </button>
            <button className="a-button secondary" onClick={a.absence}>
              Solicitar vacaciones / ausencia
            </button>
          </div>
        </Panel>
      )}
      <div className="a-employee-grid">
        {employees.map((e) => (
          <Panel key={e.id}>
            <div className="a-employee-heading">
              <span className="a-avatar">
                {e.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div>
                <h3>{e.name}</h3>
                <p>{e.title}</p>
              </div>
            </div>
            <Badge>{e.crew}</Badge>
            <p>Jornada de ejemplo: 08:00–16:00</p>
            <p>
              Formación preventiva simulada hasta {dateES(e.trainingExpiry)}
            </p>
            <small>Datos ficticios · Sin documentación laboral real</small>
            <div className="a-employee-stats">
              <span>
                <strong>
                  {a.state.reports
                    .filter((r) => r.employeeId === e.id)
                    .reduce((n, r) => n + r.hours, 0)}{" "}
                  h
                </strong>
                Registradas
              </span>
              <span>
                <strong>
                  {a.state.reports
                    .filter((r) => r.employeeId === e.id)
                    .reduce((n, r) => n + r.overtime, 0)}{" "}
                  h
                </strong>
                Extra
              </span>
            </div>
          </Panel>
        ))}
      </div>
      <Panel
        title="Partes de obra"
        subtitle="La aprobación imputa horas ordinarias, extra al 150% y dietas al coste de obra"
      >
        <Table
          label="Partes de horas e incidencias"
          headings={[
            "Persona / Fecha",
            "Obra",
            "Trabajo / Incidencia",
            "Horas / Extra / Dieta",
            "Estado",
            "Acción",
          ]}
          rows={reports.map((r) => [
            <span key={r.id}>
              {a.state.employees.find((e) => e.id === r.employeeId)?.name}
              <small>{dateES(r.date)}</small>
            </span>,
            a.state.jobs.find((j) => j.id === r.jobId)?.title,
            <span key={r.id}>
              {r.text}
              {r.incident && (
                <small className="a-incident">⚑ {r.incident}</small>
              )}
            </span>,
            `${r.hours} h / ${r.overtime} h / ${euro(r.allowance)}`,
            <Badge key={r.id}>{r.status}</Badge>,
            ["Dirección", "Jefe de obra"].includes(a.role) &&
            r.status === "Pendiente" ? (
              <button
                key={r.id}
                className="a-button small"
                onClick={() => a.dispatch({ type: "report.approve", id: r.id })}
              >
                Revisar y aprobar
              </button>
            ) : (
              "—"
            ),
          ])}
        />
      </Panel>
      <Panel
        title="Vacaciones y ausencias"
        subtitle="Las solicitudes aprobadas aparecen automáticamente en Agenda"
      >
        <Table
          label="Solicitudes de vacaciones"
          headings={["Persona", "Tipo", "Desde", "Hasta", "Estado", "Acción"]}
          rows={absences.map((r) => [
            a.state.employees.find((e) => e.id === r.employeeId)?.name,
            r.kind,
            dateES(r.start),
            dateES(r.end),
            <Badge key={r.id}>{r.status}</Badge>,
            a.admin && r.status === "Pendiente" ? (
              <button
                key={r.id}
                className="a-button small"
                onClick={() =>
                  a.dispatch({ type: "absence.approve", id: r.id })
                }
              >
                Aprobar ausencia
              </button>
            ) : (
              "—"
            ),
          ])}
        />
      </Panel>
      <Panel title="Registro de fichajes">
        <Table
          label="Fichajes de entrada y salida"
          headings={["Persona", "Fecha", "Entrada", "Salida", "Duración"]}
          rows={shifts.map((r) => [
            a.state.employees.find((e) => e.id === r.employeeId)?.name,
            dateES(r.start),
            new Date(r.start).toLocaleTimeString("es-ES", {
              timeZone: "Europe/Madrid",
            }),
            r.end
              ? new Date(r.end).toLocaleTimeString("es-ES", {
                  timeZone: "Europe/Madrid",
                })
              : "En curso",
            r.end
              ? `${Math.max(0, (Date.parse(r.end) - Date.parse(r.start)) / 3600000).toFixed(2)} h`
              : "—",
          ])}
        />
        <p className="a-note">
          Fichar registra la jornada; el parte indica el trabajo realizado. Los
          fichajes no se imputan dos veces a los costes.
        </p>
      </Panel>
    </>
  )
}

export function PayrollView() {
  const a = useActions()
  const [month, setMonth] = useState("2026-11")
  const rows = a.state.payrolls.filter(
    (p) =>
      (a.role !== "Operario" || p.employeeId === MY_EMPLOYEE) &&
      (!a.personFilter || p.employeeId === a.personFilter) &&
      (!a.jobFilter ||
        a.state.jobs
          .find((j) => j.id === a.jobFilter)
          ?.crew.includes(p.employeeId)) &&
      p.month === month &&
      matches(a.statusFilter, p.status) &&
      matches(
        a.search,
        p.id,
        a.state.employees.find((e) => e.id === p.employeeId)?.name,
      ),
  )
  return (
    <>
      <div className="a-toolbar">
        <label>
          Mes de ejemplo
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
        <Badge tone="warning">Simulación · Sin cálculo laboral real</Badge>
      </div>
      <div className="a-stats">
        <Stat
          title="Nóminas de muestra"
          value={rows.length}
          detail="En el periodo y perfil visibles"
        />
        <Stat
          title="Devengos ficticios"
          value={euro(
            rows.reduce((n, p) => n + p.base + p.extra + p.allowance, 0),
          )}
          detail="Base + complementos + dietas"
        />
        <Stat
          title="Deducciones ficticias"
          value={euro(rows.reduce((n, p) => n + p.deduction, 0))}
          detail="Importe agregado ilustrativo"
        />
        <Stat
          title="Líquido simulado"
          value={euro(rows.reduce((n, p) => n + payrollNet(p), 0))}
          detail="Sin transferencias reales"
        />
      </div>
      <Panel
        title={
          a.role === "Operario" ? "Mi nómina de ejemplo" : "Listado de nóminas"
        }
      >
        <Table
          label="Nóminas ficticias"
          headings={[
            "Referencia / Empleado",
            "Base",
            "Complementos / Dietas",
            "Deducción",
            "Líquido",
            "Estado",
            "Acciones",
          ]}
          rows={rows.map((p) => [
            <span key={p.id}>
              {p.id}
              <small>
                {a.state.employees.find((e) => e.id === p.employeeId)?.name}
              </small>
            </span>,
            euro(p.base),
            `${euro(p.extra)} / ${euro(p.allowance)}`,
            euro(p.deduction),
            <strong key={p.id}>{euro(payrollNet(p))}</strong>,
            <Badge key={p.id}>{p.status}</Badge>,
            <div className="a-table-actions" key={p.id}>
              {a.admin && p.status === "Borrador" && (
                <button
                  className="a-link"
                  onClick={() =>
                    a.dispatch({ type: "payroll.review", id: p.id })
                  }
                >
                  Revisar
                </button>
              )}
              {a.admin && p.status === "Revisada" && (
                <button
                  className="a-link"
                  onClick={() =>
                    a.confirm(
                      "Simular pago de nómina",
                      `Se marcará ${p.id} como pagada solo en esta demo. No se enviará ninguna orden de pago. Líquido de ejemplo: ${euro(payrollNet(p))}.`,
                      () => a.dispatch({ type: "payroll.pay", id: p.id }),
                      "Marcar como pagada en demo",
                    )
                  }
                >
                  Simular pago
                </button>
              )}
              <button
                className="a-link"
                onClick={() => a.print({ kind: "payroll", value: p })}
              >
                <Printer size={15} />
                Vista imprimible
              </button>
            </div>,
          ])}
        />
        <p className="a-note">
          Las horas y dietas de los partes no recalculan estas nóminas de
          ejemplo. Los conceptos son fijos e ilustrativos. Operario solo puede
          ver su propia ficha.
        </p>
      </Panel>
    </>
  )
}

export function InvoicesView() {
  const a = useActions()
  const [type, setType] = useState("Todas")
  const rows = a.state.invoices.filter(
    (i) =>
      (!a.jobFilter || i.jobId === a.jobFilter) &&
      (type === "Todas" || i.type === type) &&
      matches(
        a.search,
        i.id,
        i.description,
        a.state.jobs.find((j) => j.id === i.jobId)?.title,
      ) &&
      (!a.statusFilter ||
        (a.statusFilter === "Cobro pendiente"
          ? i.type === "Emitida" && invoiceBalance(i) > 0
          : matches(
              a.statusFilter,
              invoiceBalance(i) > 0 ? "Pendiente" : "Saldada",
            ))),
  )
  const f = finances(a.state, a.jobFilter || undefined)
  return (
    <>
      <div className="a-toolbar">
        <div className="a-segmented">
          {["Todas", "Emitida", "Recibida", "Rectificativa"].map((t) => (
            <button
              key={t}
              className={type === t ? "active" : ""}
              onClick={() => setType(t)}
            >
              {t === "Todas" ? t : `${t}s`}
            </button>
          ))}
        </div>
        <button className="a-button" onClick={() => a.invoice()}>
          <Plus size={16} />
          Factura de muestra
        </button>
      </div>
      <div className="a-stats">
        <Stat
          title="Facturado (con impuestos)"
          value={euro(f.sales)}
          detail="Emitidas y rectificativas"
        />
        <Stat
          title="Cobros simulados"
          value={euro(f.collected)}
          detail="Pagos parciales acumulados"
        />
        <Stat
          title="Pendiente de cobro"
          value={euro(f.balance)}
          detail="Actualizado también en las obras"
        />
        <Stat
          title="Pendiente de pago"
          value={euro(
            a.state.invoices
              .filter(
                (i) =>
                  i.type === "Recibida" &&
                  (!a.jobFilter || i.jobId === a.jobFilter),
              )
              .reduce((n, i) => n + invoiceBalance(i), 0),
          )}
          detail="Facturas recibidas de muestra"
        />
      </div>
      <Panel
        title="Libro de facturas de ejemplo"
        subtitle="Todos los importes y documentos son ficticios"
      >
        <Table
          label="Facturas y saldos"
          headings={[
            "Factura / Concepto",
            "Obra",
            "Tipo / Vencimiento",
            "Total",
            "Cobrado / Pagado",
            "Saldo",
            "Acciones",
          ]}
          rows={rows.map((i) => [
            <span key={i.id}>
              <strong>{i.id}</strong>
              <small>{i.description}</small>
            </span>,
            <button
              className="a-link"
              key={i.id}
              onClick={() => a.nav("Obras", "", i.jobId)}
            >
              {a.state.jobs.find((j) => j.id === i.jobId)?.title} ↗
            </button>,
            <span key={i.id}>
              {i.type}
              <small>{dateES(i.due)}</small>
            </span>,
            euro(invoiceTotal(i)),
            euro(i.paid),
            <strong key={i.id}>{euro(invoiceBalance(i))}</strong>,
            <div className="a-table-actions" key={i.id}>
              {invoiceBalance(i) > 0 &&
                !a.state.invoices.some(
                  (r) => r.description === `Rectificación demo de ${i.id}`,
                ) && (
                  <button
                    className="a-link"
                    onClick={() =>
                      a.edit({
                        title:
                          i.type === "Recibida"
                            ? "Simular pago parcial"
                            : "Registrar cobro parcial",
                        description: `Solo se registra un movimiento local. Saldo disponible: ${euro(invoiceBalance(i))}. No se realizan pagos ni se conecta con un banco.`,
                        fields: [
                          {
                            name: "amount",
                            label: "Importe simulado (€)",
                            type: "number",
                            min: 0.01,
                            max: invoiceBalance(i),
                            step: ".01",
                            value:
                              Math.round((invoiceBalance(i) / 2) * 100) / 100,
                          },
                        ],
                        submit: "Confirmar movimiento demo",
                        onSubmit: (v) =>
                          a.dispatch({
                            type: "invoice.pay",
                            id: i.id,
                            amount: Number(v.amount),
                          }),
                      })
                    }
                  >
                    {i.type === "Recibida" ? "Simular pago" : "Registrar cobro"}
                  </button>
                )}
              <button
                className="a-link"
                onClick={() => a.print({ kind: "invoice", value: i })}
              >
                Vista imprimible
              </button>
              {i.type === "Emitida" &&
                i.paid === 0 &&
                !a.state.invoices.some(
                  (r) => r.description === `Rectificación demo de ${i.id}`,
                ) && (
                  <button
                    className="a-link"
                    onClick={() =>
                      a.confirm(
                        "Crear rectificativa de ejemplo",
                        "Se añadirá una factura negativa por el total, sin validez fiscal. Solo se admite en facturas sin cobros.",
                        () => a.dispatch({ type: "invoice.credit", id: i.id }),
                      )
                    }
                  >
                    Rectificar en demo
                  </button>
                )}
            </div>,
          ])}
        />
      </Panel>
      <Panel title="Gastos y justificantes de muestra">
        <p>
          Las facturas recibidas representan gastos. Los anticipos se crean como
          facturas emitidas con el concepto «Anticipo»; los pagos y cobros
          admiten importes parciales.
        </p>
        <button className="a-button secondary" onClick={() => a.invoice()}>
          Registrar gasto demo
        </button>
        <p className="a-note">
          Los justificantes son las vistas imprimibles «Demo». Puedes asociar
          archivos de muestra desde Documentación. No se generan documentos
          fiscales.
        </p>
      </Panel>
    </>
  )
}

export function PurchasesView() {
  const a = useActions()
  const create = (supplier = "Pedra Demo SL · Ficticio", cost = 32) =>
    a.edit({
      title: "Nuevo pedido para una obra",
      fields: [
        a.jobField,
        {
          name: "supplier",
          label: "Proveedor / subcontrata ficticia",
          value: supplier,
        },
        {
          name: "materialId",
          label: "Material",
          options: selectedOptions(a.state.materials),
        },
        {
          name: "qty",
          label: "Cantidad",
          type: "number",
          min: 0.01,
          step: ".01",
          value: 20,
        },
        {
          name: "unitCost",
          label: "Coste por unidad (€)",
          type: "number",
          min: 0.01,
          step: ".01",
          value: cost,
        },
      ],
      onSubmit: (v) =>
        a.dispatch({
          type: "purchase.create",
          jobId: v.jobId,
          supplier: v.supplier,
          materialId: v.materialId,
          qty: Number(v.qty),
          unitCost: Number(v.unitCost),
        }),
    })
  const rows = a.state.purchases.filter(
    (p) =>
      (!a.jobFilter || p.jobId === a.jobFilter) &&
      matches(
        a.search,
        p.id,
        p.supplier,
        a.state.materials.find((m) => m.id === p.materialId)?.name,
      ) &&
      matches(
        a.statusFilter,
        p.received === p.qty
          ? "Completo"
          : p.received
            ? "Parcial"
            : "Pendiente",
      ),
  )
  return (
    <>
      <div className="a-toolbar">
        <p>Pedidos, albaranes de ejemplo y costes imputados</p>
        {a.admin && (
          <button className="a-button" onClick={() => create()}>
            + Nuevo pedido
          </button>
        )}
      </div>
      <Panel title="Pedidos vinculados a obras">
        <Table
          label="Pedidos y recepciones"
          headings={[
            "Pedido / Proveedor",
            "Obra / Material",
            "Pedido / Recibido",
            "Estado",
            "Coste imputado",
            "Acciones",
          ]}
          rows={rows.map((p) => [
            <span key={p.id}>
              <strong>{p.id}</strong>
              <small>{p.supplier}</small>
            </span>,
            <span key={p.id}>
              {a.state.jobs.find((j) => j.id === p.jobId)?.title}
              <small>
                {a.state.materials.find((m) => m.id === p.materialId)?.name}
              </small>
            </span>,
            `${p.qty} / ${p.received} ${a.state.materials.find((m) => m.id === p.materialId)?.unit}`,
            <Badge key={p.id}>
              {p.received === p.qty
                ? "Completo"
                : p.received
                  ? "Parcial"
                  : "Pendiente"}
            </Badge>,
            euro(p.received * p.unitCost),
            <div className="a-table-actions" key={p.id}>
              {p.received < p.qty && (
                <button
                  className="a-link"
                  onClick={() =>
                    a.edit({
                      title: "Registrar recepción parcial o completa",
                      description:
                        "Esta recepción crea un albarán local, aumenta el stock y añade el coste recibido a la obra. La misma cantidad no se puede recibir dos veces.",
                      fields: [
                        {
                          name: "qty",
                          label: "Unidades recibidas ahora",
                          type: "number",
                          min: 0.01,
                          max: p.qty - p.received,
                          step: ".01",
                          value: Math.min(10, p.qty - p.received),
                        },
                      ],
                      onSubmit: (v) =>
                        a.dispatch({
                          type: "purchase.receive",
                          id: p.id,
                          qty: Number(v.qty),
                        }),
                    })
                  }
                >
                  Recibir material
                </button>
              )}
              <button
                className="a-link"
                onClick={() =>
                  a.confirm(
                    `Albarán de muestra · ${p.id}`,
                    `${p.supplier}. Recibido: ${p.received} de ${p.qty}. Coste imputado: ${euro(p.received * p.unitCost)}. Documento de ejemplo sin validez comercial.`,
                    () => true,
                    "Cerrar albarán",
                  )
                }
              >
                Ver albarán demo
              </button>
              <button
                className="a-link"
                onClick={() => a.nav("Obras", "", p.jobId)}
              >
                Ver coste en obra ↗
              </button>
            </div>,
          ])}
        />
      </Panel>
      <Panel
        title="Comparativa de ofertas ficticias"
        subtitle="Mismo material de ejemplo: piedra caliza, precio unitario sin impuestos"
      >
        <Table
          label="Ofertas ficticias de proveedores"
          headings={[
            "Proveedor / Subcontrata",
            "Especialidad",
            "Plazo de ejemplo",
            "€/m²",
            "Acción",
          ]}
          rows={[
            [
              "Pedra Demo SL · Ficticio",
              "Piedra natural",
              "5 días",
              euro(32),
              a.admin ? (
                <button key="p1" className="a-link" onClick={() => create()}>
                  Crear pedido →
                </button>
              ) : (
                "Consulta"
              ),
            ],
            [
              "Materials Llevant Demo · Ficticio",
              "Acabados y suministros",
              "8 días",
              euro(35),
              a.admin ? (
                <button
                  key="p2"
                  className="a-link"
                  onClick={() =>
                    create("Materials Llevant Demo · Ficticio", 35)
                  }
                >
                  Crear pedido →
                </button>
              ) : (
                "Consulta"
              ),
            ],
            [
              "Oficis Calma Demo · Ficticio",
              "Subcontrata de instalación y suministro",
              "10 días",
              euro(38),
              a.admin ? (
                <button
                  key="p3"
                  className="a-link"
                  onClick={() => create("Oficis Calma Demo · Ficticio", 38)}
                >
                  Crear pedido →
                </button>
              ) : (
                "Consulta"
              ),
            ],
          ]}
        />
      </Panel>
    </>
  )
}

export function MaterialsView() {
  const a = useActions()
  const materials = a.state.materials.filter(
    (m) =>
      matches(a.search, m.name, m.warehouse) &&
      (!a.statusFilter ||
        matches(a.statusFilter, m.stock < m.min ? "Stock bajo" : "Disponible")),
  )
  return (
    <>
      <div className="a-stats">
        <Stat
          title="Referencias"
          value={materials.length}
          detail="Catálogo local de ejemplo"
        />
        <Stat
          title="Alertas de stock"
          value={materials.filter((m) => m.stock < m.min).length}
          detail="Por debajo del mínimo"
        />
        <Stat
          title="Recursos"
          value={a.state.equipment.length}
          detail="Herramientas, vehículos y maquinaria"
        />
        <Stat
          title="Movimientos"
          value={a.state.movements.length}
          detail="Recepciones y ajustes registrados"
        />
      </div>
      <Panel title="Materiales y almacenes">
        <Table
          label="Existencias de materiales"
          headings={[
            "Material",
            "Almacén",
            "Stock / Mínimo",
            "Estado",
            "Coste unitario",
            "Acción",
          ]}
          rows={materials.map((m) => [
            m.name,
            m.warehouse,
            `${m.stock} / ${m.min} ${m.unit}`,
            <Badge tone={m.stock < m.min ? "warning" : ""} key={m.id}>
              {m.stock < m.min ? "Stock bajo" : "Disponible"}
            </Badge>,
            euro(m.cost),
            <button
              key={m.id}
              className="a-link"
              onClick={() =>
                a.edit({
                  title: "Movimiento de almacén",
                  description:
                    "Ajuste local de existencias. Para imputar compras a una obra, usa una recepción de pedido.",
                  fields: [
                    {
                      name: "qty",
                      label: "Cantidad (+ entrada / − salida)",
                      type: "number",
                      step: ".01",
                      value: 1,
                    },
                    {
                      name: "reason",
                      label: "Motivo",
                      value: "Ajuste de stock demo",
                    },
                  ],
                  onSubmit: (v) =>
                    a.dispatch({
                      type: "material.move",
                      id: m.id,
                      qty: Number(v.qty),
                      reason: v.reason,
                    }),
                })
              }
            >
              Registrar movimiento
            </button>,
          ])}
        />
      </Panel>
      <Panel title="Herramientas, vehículos y maquinaria">
        <Table
          label="Disponibilidad de equipos"
          headings={[
            "Recurso",
            "Disponibilidad",
            "Próximo mantenimiento",
            "Acción",
          ]}
          rows={a.state.equipment
            .filter((e) => matches(a.search, e.name, e.status))
            .map((e) => [
              e.name,
              <Badge key={e.id}>{e.status}</Badge>,
              dateES(e.maintenance),
              <button
                className="a-link"
                key={e.id}
                onClick={() =>
                  a.edit({
                    title: "Disponibilidad y mantenimiento",
                    fields: [
                      {
                        name: "status",
                        label: "Disponibilidad",
                        value: e.status,
                        options: options([
                          "Disponible",
                          "En Casa Olivera",
                          "En Casa Patio",
                          "En mantenimiento",
                        ]),
                      },
                      {
                        name: "maintenance",
                        label: "Próxima revisión",
                        type: "date",
                        value: e.maintenance,
                      },
                    ],
                    onSubmit: (v) =>
                      a.dispatch({
                        type: "equipment.save",
                        id: e.id,
                        status: v.status,
                        maintenance: v.maintenance,
                      }),
                  })
                }
              >
                Actualizar
              </button>,
            ])}
        />
      </Panel>
      <Panel title="Historial de movimientos">
        <Table
          label="Movimientos de stock"
          headings={["Fecha", "Material", "Cantidad", "Motivo"]}
          rows={a.state.movements
            .filter(
              (m) =>
                matches(a.search, m.reason) &&
                (!a.jobFilter ||
                  m.reason.includes(
                    a.state.jobs.find((j) => j.id === a.jobFilter)?.title ||
                      "__",
                  )),
            )
            .map((m) => [
              dateES(m.date),
              a.state.materials.find((mat) => mat.id === m.materialId)?.name,
              m.qty,
              m.reason,
            ])}
        />
      </Panel>
    </>
  )
}

export function DocumentsView() {
  const a = useActions()
  const [category, setCategory] = useState("Todas")
  const docs = a.state.documents.filter(
    (d) =>
      a.jobs.some((j) => j.id === d.jobId) &&
      (!a.jobFilter || d.jobId === a.jobFilter) &&
      (category === "Todas" || d.category === category) &&
      matches(a.search, d.name, d.category) &&
      (!a.statusFilter ||
        (a.statusFilter === "Caducidad"
          ? d.expires <= nextMonthDate()
          : matches(a.statusFilter, d.category))),
  )
  return (
    <>
      <div className="a-toolbar">
        <label>
          Clasificación
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {[
              "Todas",
              "Planos",
              "Contratos",
              "Licencias",
              "Fotos",
              "Actas",
              "Prevención",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        {a.manager && (
          <button
            className="a-button"
            onClick={() =>
              a.edit({
                title: "Añadir documento de muestra",
                description:
                  "Archivo opcional, guardado localmente. Solo imágenes o PDF ficticios de hasta 1 MB. No subas documentación personal real.",
                fields: [
                  a.jobField,
                  {
                    name: "name",
                    label: "Nombre de muestra",
                    value: "Documento de demostración",
                  },
                  {
                    name: "category",
                    label: "Clasificación",
                    options: options([
                      "Planos",
                      "Contratos",
                      "Licencias",
                      "Fotos",
                      "Actas",
                      "Prevención",
                    ]),
                  },
                  {
                    name: "version",
                    label: "Versión",
                    type: "number",
                    min: 1,
                    value: 1,
                  },
                  {
                    name: "expires",
                    label: "Caducidad simulada",
                    type: "date",
                    value: "2027-11-09",
                  },
                  {
                    name: "data",
                    label: "Adjunto local opcional",
                    type: "file",
                    required: false,
                  },
                ],
                onSubmit: (v) =>
                  a.dispatch({
                    type: "document.add",
                    doc: {
                      jobId: v.jobId,
                      name: v.name,
                      category: v.category,
                      version: Number(v.version),
                      expires: v.expires,
                      data: v.data || undefined,
                    },
                  }),
              })
            }
          >
            + Añadir muestra / versión
          </button>
        )}
      </div>
      <div className="a-alert">
        Documentos ficticios. Las fechas y alertas no acreditan cumplimiento
        preventivo ni permisos de obra.
      </div>
      <Panel
        title="Archivo de obra"
        subtitle="Clasificación, versiones y vencimientos de demostración"
      >
        <Table
          label="Documentos de muestra"
          headings={[
            "Documento",
            "Clasificación",
            "Obra",
            "Versión",
            "Caducidad",
            "Acción",
          ]}
          rows={docs.map((d) => [
            d.name,
            d.category,
            a.state.jobs.find((j) => j.id === d.jobId)?.title,
            `v${d.version}`,
            <span key={d.id}>
              {dateES(d.expires)}
              {d.expires <= nextMonthDate() && (
                <Badge tone="warning">Revisar</Badge>
              )}
            </span>,
            <button
              className="a-link"
              key={d.id}
              onClick={() => a.print({ kind: "document", value: d })}
            >
              Abrir muestra ↗
            </button>,
          ])}
        />
      </Panel>
      <Panel title="Prevención y formación">
        <Table
          label="Vencimientos simulados de formación"
          headings={[
            "Persona ficticia",
            "Cuadrilla",
            "Formación de muestra hasta",
          ]}
          rows={a.state.employees
            .filter((e) => a.role !== "Operario" || e.id === MY_EMPLOYEE)
            .filter((e) => matches(a.search, e.name))
            .map((e) => [e.name, e.crew, dateES(e.trainingExpiry)])}
        />
      </Panel>
    </>
  )
}

export function ReportsView() {
  const a = useActions()
  const [from, setFrom] = useState("2026-01-01")
  const [to, setTo] = useState("2027-12-31")
  const invoices = a.state.invoices.filter(
    (i) =>
      (!a.jobFilter || i.jobId === a.jobFilter) &&
      i.date >= from &&
      i.date <= to &&
      matches(a.search, i.id, i.description),
  )
  const reports = a.state.reports.filter(
    (r) =>
      (!a.jobFilter || r.jobId === a.jobFilter) &&
      r.date >= from &&
      r.date <= to,
  )
  const purchases = a.state.purchases.filter(
    (p) =>
      (!a.jobFilter || p.jobId === a.jobFilter) &&
      p.date >= from &&
      p.date <= to,
  )
  const ledger = a.state.transactions.filter(
    (t) =>
      (!a.jobFilter || t.jobId === a.jobFilter) &&
      t.date >= from &&
      t.date <= to &&
      matches(
        a.search,
        t.reference,
        a.state.jobs.find((j) => j.id === t.jobId)?.title,
      ),
  )
  const issued = invoices.filter((i) => i.type !== "Recibida")
  const sales = issued.reduce((n, i) => n + i.base, 0)
  const collected = ledger
    .filter((t) => t.kind === "Cobro")
    .reduce((n, t) => n + t.amount, 0)
  const jobs = a.jobs.filter(
    (j) => (!a.jobFilter || j.id === a.jobFilter) && matches(a.search, j.title),
  )
  const cost = ledger
    .filter((t) => t.kind === "Coste")
    .reduce((n, t) => n + t.amount, 0)
  const csv = () =>
    downloadCSV(
      "informe-operativo",
      [
        "Tipo",
        "Referencia",
        "Obra",
        "Fecha",
        "Importe / horas",
        "Cobrado / recibido",
        "Estado",
      ],
      [
        ...invoices.map((i) => [
          i.type,
          i.id,
          a.state.jobs.find((j) => j.id === i.jobId)?.title || "",
          dateES(i.date),
          invoiceTotal(i),
          i.paid,
          invoiceBalance(i) > 0 ? "Pendiente" : "Saldada",
        ]),
        ...reports.map((r) => [
          "Parte",
          r.id,
          a.state.jobs.find((j) => j.id === r.jobId)?.title || "",
          dateES(r.date),
          r.hours,
          r.overtime,
          r.status,
        ]),
        ...purchases.map((p) => [
          "Pedido",
          p.id,
          a.state.jobs.find((j) => j.id === p.jobId)?.title || "",
          dateES(p.date),
          p.qty * p.unitCost,
          p.received * p.unitCost,
          p.received === p.qty ? "Completa" : "Pendiente",
        ]),
        ...ledger.map((t) => [
          t.kind,
          t.reference,
          a.state.jobs.find((j) => j.id === t.jobId)?.title || "",
          dateES(t.date),
          t.amount,
          0,
          "Movimiento demo",
        ]),
        ...jobs.map((j) => [
          "Coste acumulado",
          j.id,
          j.title,
          "Acumulado",
          j.actualCost,
          j.plannedCost,
          j.status,
        ]),
      ],
    )
  return (
    <>
      <div className="a-toolbar">
        <div className="a-action-row">
          <label>
            Desde
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              min={from}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
        <button className="a-button" onClick={csv}>
          <ArrowDownToLine size={16} />
          Exportar CSV demo
        </button>
      </div>
      <div className="a-stats">
        <Stat
          title="Ventas (base)"
          value={euro(sales)}
          detail="Facturas del periodo"
        />
        <Stat
          title="Cobros del periodo"
          value={euro(collected)}
          detail="Movimientos simulados en esas fechas"
        />
        <Stat
          title="Horas registradas"
          value={reports.reduce((n, r) => n + r.hours, 0)}
          detail="Partes del periodo"
        />
        <Stat
          title="Costes del periodo"
          value={euro(cost)}
          detail="Costes imputados en esas fechas"
        />
      </div>
      <Panel
        title="Coste y margen por obra"
        subtitle="Previsión y acumulados de obra; abajo se detallan los movimientos del periodo seleccionado."
      >
        <Table
          label="Rentabilidad acumulada por obra"
          headings={[
            "Obra",
            "Presupuesto base",
            "Coste previsto",
            "Coste acumulado",
            "Margen estimado",
            "Saldo de cobro",
          ]}
          rows={jobs.map((j) => [
            j.title,
            euro(j.budget),
            euro(j.plannedCost),
            euro(j.actualCost),
            euro(j.budget - j.plannedCost),
            euro(finances(a.state, j.id).balance),
          ])}
        />
      </Panel>
      <div className="a-two-columns">
        <Panel
          title="Ventas por periodo"
          subtitle="Base de facturas seleccionadas"
        >
          <div className="a-report-bars">
            {jobs.map((j) => {
              const total = issued
                .filter((i) => i.jobId === j.id)
                .reduce((n, i) => n + i.base, 0)
              return (
                <div key={j.id}>
                  <span>
                    {j.title}
                    <strong>{euro(total)}</strong>
                  </span>
                  <div>
                    <i
                      style={{
                        width: `${Math.max(0, (total / Math.max(1, sales)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
        <Panel title="Compras y horas">
          <p>
            Margen del periodo (base facturada − costes):{" "}
            <strong>{euro(sales - cost)}</strong>
          </p>
          <p>
            Pagos del periodo:{" "}
            <strong>
              {euro(
                ledger
                  .filter((t) => t.kind === "Pago")
                  .reduce((n, t) => n + t.amount, 0),
              )}
            </strong>
          </p>
          <p>
            Pedidos creados en el periodo:{" "}
            <strong>
              {euro(purchases.reduce((n, p) => n + p.qty * p.unitCost, 0))}
            </strong>
          </p>
          <p>
            Compras recibidas en el periodo:{" "}
            <strong>
              {euro(
                ledger
                  .filter((t) => t.kind === "Compra")
                  .reduce((n, t) => n + t.amount, 0),
              )}
            </strong>
          </p>
          <p>
            Horas aprobadas del periodo:{" "}
            <strong>
              {reports
                .filter((r) => r.status === "Aprobado")
                .reduce((n, r) => n + r.hours, 0)}{" "}
              h
            </strong>
          </p>
          <p>
            Horas extra del periodo:{" "}
            <strong>{reports.reduce((n, r) => n + r.overtime, 0)} h</strong>
          </p>
          <p className="a-note">
            El CSV incluye facturas, partes, pedidos y movimientos del periodo,
            además de los costes acumulados de obra identificados como tales.
          </p>
        </Panel>
      </div>
    </>
  )
}

export function SettingsView() {
  const a = useActions()
  const { reset } = useDemo()
  return (
    <>
      <div className="a-two-columns">
        <Panel title="Empresa y preferencias">
          <p>{a.state.preferences.name}</p>
          <p>Dirección ficticia: Calle Ejemplo, 0</p>
          <p>
            Serie de documentos demo:{" "}
            <strong>{a.state.preferences.series}</strong>
          </p>
          <p>
            Avisos:{" "}
            {a.state.preferences.reminder
              ? "Activados en la demo"
              : "Desactivados en preferencias"}
          </p>
          <button
            className="a-button secondary"
            onClick={() =>
              a.edit({
                title: "Preferencias de demostración",
                fields: [
                  {
                    name: "name",
                    label: "Nombre ficticio de empresa",
                    value: a.state.preferences.name,
                  },
                  {
                    name: "series",
                    label: "Serie de ejemplo",
                    value: a.state.preferences.series,
                  },
                  {
                    name: "reminder",
                    label: "Preferencia de avisos",
                    value: String(a.state.preferences.reminder),
                    options: [
                      { value: "true", label: "Activados" },
                      { value: "false", label: "Desactivados" },
                    ],
                  },
                ],
                onSubmit: (v) =>
                  a.dispatch({
                    type: "preferences.save",
                    preferences: {
                      name: v.name,
                      series: v.series,
                      reminder: v.reminder === "true",
                    },
                  }),
              })
            }
          >
            Editar preferencias
          </button>
          <p className="a-note">
            Los avisos son locales en pantalla. No se envían notificaciones
            externas.
          </p>
        </Panel>
        <Panel title="Datos de la demo">
          <p>
            Los cambios se guardan en este navegador, aislados de otras
            propuestas. Restablecer recupera los registros iniciales y elimina
            los cambios locales.
          </p>
          <div className="a-action-row">
            <button
              className="a-button secondary"
              onClick={() =>
                downloadCSV(
                  "actividad",
                  ["Fecha", "Perfil", "Acción"],
                  a.state.activity.map((log) => [log.date, log.role, log.text]),
                )
              }
            >
              <ArrowDownToLine size={16} />
              Exportar actividad
            </button>
            <button
              className="a-button danger"
              onClick={() =>
                a.confirm(
                  "Restablecer la demo",
                  "Se eliminarán las solicitudes, presupuestos, fichajes y demás cambios locales de esta propuesta. Se recuperarán los datos iniciales. El acceso privado y el perfil actual se conservarán.",
                  () => {
                    reset()
                    return true
                  },
                  "Sí, restablecer datos demo",
                )
              }
            >
              <RotateCcw size={16} />
              Restablecer demo
            </button>
          </div>
          <p className="a-note">
            Los roles son una simulación local. No sustituyen la autenticación
            del propietario ni sirven para almacenar información real.
          </p>
        </Panel>
      </div>
      <Panel title="Roles y estados de ejemplo">
        <Table
          label="Permisos de perfiles demo"
          headings={["Perfil", "Módulos disponibles", "Alcance"]}
          rows={Object.entries(access).map(([role, values]) => [
            role,
            values.join(" · "),
            role === "Operario"
              ? "Solo obras asignadas, partes, ausencias y nómina propia"
              : role === "Jefe de obra"
                ? "Planificación, ejecución, revisión de partes y documentación"
                : role === "Administración"
                  ? "Operación administrativa sin módulo de informes de Dirección"
                  : "Operación completa e informes",
          ])}
        />
        <p className="a-note">
          Estados: oportunidad Nueva → Visita → Presupuesto → Ganada;
          presupuesto Borrador → Aceptado; obra Planificación → En curso →
          Entregada. Los cambios de rol se hacen cerrando la sesión demo.
        </p>
      </Panel>
      <Panel title="Registro de actividad">
        <Table
          label="Actividad de demostración"
          headings={["Fecha", "Perfil", "Acción"]}
          rows={a.state.activity
            .filter((log) => matches(a.search, log.text, log.role))
            .slice(0, 60)
            .map((log) => [dateES(log.date), log.role, log.text])}
        />
      </Panel>
    </>
  )
}
