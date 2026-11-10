"use client"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { X, ArrowUpRight, Printer } from "lucide-react"
import {
  dateES,
  euro,
  invoiceBalance,
  invoiceTotal,
  payrollNet,
  quoteTotals,
  type DemoState,
  type Doc,
  type Invoice,
  type Payroll,
  type Quote,
} from "@/lib/proposals/demo"

export function Badge({
  children,
  tone = "",
}: {
  children: ReactNode
  tone?: string
}) {
  return <span className={`a-badge ${tone}`}>{children}</span>
}
export function Empty({
  children = "No hay registros con estos filtros.",
}: {
  children?: ReactNode
}) {
  return <div className="a-empty">{children}</div>
}
export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="a-panel">
      {(title || action) && (
        <header>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
export function Stat({
  title,
  value,
  detail,
  onClick,
}: {
  title: string
  value: string | number
  detail: string
  onClick?: () => void
}) {
  const Tag = onClick ? "button" : "div"
  return (
    <Tag className="a-stat" onClick={onClick}>
      <span>
        {title}
        {onClick && <ArrowUpRight size={15} />}
      </span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </Tag>
  )
}
export function Table({
  headings,
  rows,
  label,
}: {
  headings: string[]
  rows: ReactNode[][]
  label: string
}) {
  return rows.length ? (
    <div className="a-table-wrap">
      <table aria-label={label}>
        <thead>
          <tr>
            {headings.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty />
  )
}
export type Field = {
  name: string
  label: string
  type?: string
  value?: string | number
  required?: boolean
  min?: number | string
  max?: number | string
  step?: string
  options?: { value: string; label: string }[]
  hint?: string
}
export type Editor = {
  title: string
  description?: string
  fields: Field[]
  submit?: string
  onSubmit: (values: Record<string, string>) => boolean | Promise<boolean>
}

export function EditorDialog({
  editor,
  close,
}: {
  editor: Editor | null
  close: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  useEffect(() => {
    if (editor) {
      setError("")
      ref.current?.showModal()
    } else ref.current?.close()
  }, [editor])
  return (
    <dialog
      ref={ref}
      className="a-dialog"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div>
        <button
          className="a-dialog-close"
          onClick={close}
          aria-label="Cerrar formulario"
        >
          <X size={20} />
        </button>
        <p className="p-eyebrow">Modo demo · Datos ficticios</p>
        <h2>{editor?.title}</h2>
        <p>
          {editor?.description ||
            "Los cambios se guardan únicamente en este navegador."}
        </p>
        {editor && (
          <form
            key={editor.title}
            onSubmit={async (e) => {
              e.preventDefault()
              setError("")
              setPending(true)
              const data = new FormData(e.currentTarget)
              const values: Record<string, string> = {}
              for (const [key, value] of data.entries()) {
                if (value instanceof File && value.size) {
                  if (
                    value.size > 1024 * 1024 ||
                    ![
                      "image/png",
                      "image/jpeg",
                      "image/webp",
                      "application/pdf",
                    ].includes(value.type)
                  ) {
                    setError(
                      "Adjunta una imagen o PDF de muestra de hasta 1 MB.",
                    )
                    setPending(false)
                    return
                  }
                  const bytes = new Uint8Array(await value.arrayBuffer())
                  let text = ""
                  for (const n of bytes) text += String.fromCharCode(n)
                  values[key] = `data:${value.type};base64,${btoa(text)}`
                } else values[key] = String(value instanceof File ? "" : value)
              }
              try {
                if (await editor.onSubmit(values)) close()
              } catch (e) {
                setError(e instanceof Error ? e.message : "Revisa los datos.")
              } finally {
                setPending(false)
              }
            }}
          >
            <div className="p-form-grid">
              {editor.fields.map((f) => (
                <label
                  key={f.name}
                  className={f.type === "textarea" ? "wide" : ""}
                >
                  {f.label}
                  {f.options ? (
                    <select
                      name={f.name}
                      defaultValue={f.value}
                      required={f.required !== false}
                    >
                      {f.options.map((o) => (
                        <option value={o.value} key={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      name={f.name}
                      defaultValue={f.value}
                      required={f.required !== false}
                      maxLength={2000}
                      rows={3}
                    />
                  ) : (
                    <input
                      name={f.name}
                      type={f.type || "text"}
                      defaultValue={f.type === "file" ? undefined : f.value}
                      required={f.required !== false}
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      maxLength={f.type === "text" || !f.type ? 200 : undefined}
                      accept={
                        f.type === "file"
                          ? "image/png,image/jpeg,image/webp,application/pdf"
                          : undefined
                      }
                    />
                  )}
                  {f.hint && <small>{f.hint}</small>}
                </label>
              ))}
            </div>
            {error && (
              <p className="p-error" role="alert">
                {error}
              </p>
            )}
            <div className="a-dialog-actions">
              <button
                type="button"
                className="a-button secondary"
                onClick={close}
              >
                Cancelar
              </button>
              <button className="a-button" disabled={pending}>
                {pending ? "Guardando…" : editor.submit || "Guardar en demo"}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  )
}

export type PrintItem =
  | { kind: "quote"; value: Quote }
  | { kind: "invoice"; value: Invoice }
  | { kind: "payroll"; value: Payroll }
  | { kind: "document"; value: Doc }
export function Printable({
  item,
  state,
  close,
}: {
  item: PrintItem | null
  state: DemoState
  close: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (item) ref.current?.showModal()
    else ref.current?.close()
  }, [item])
  if (!item) return null
  const job =
    "jobId" in item.value
      ? state.jobs.find((j) => j.id === (item.value as Invoice | Doc).jobId)
      : undefined
  return (
    <dialog ref={ref} className="a-print-dialog" onCancel={close}>
      <div className="a-print-controls">
        <strong>Vista imprimible · Simulación</strong>
        <button className="a-button" onClick={() => window.print()}>
          <Printer size={16} />
          Imprimir
        </button>
        <button className="a-button secondary" onClick={close}>
          Cerrar
        </button>
      </div>
      <article className="a-print-page">
        <div className="a-print-watermark">DEMO · SIMULACIÓN</div>
        <header>
          <h2>Construccions Germans Moya</h2>
          <p>
            Empresa y registros de ejemplo · Dirección ficticia: Calle Ejemplo,
            0
          </p>
          <p>Sin validez fiscal, contractual, laboral o preventiva</p>
        </header>
        <h1>
          {item.kind === "quote"
            ? "Presupuesto"
            : item.kind === "invoice"
              ? "Factura de muestra"
              : item.kind === "payroll"
                ? "Nómina de ejemplo"
                : "Documento de muestra"}{" "}
          · {item.value.id}
        </h1>
        {job && <p>Obra: {job.title}</p>}
        {item.kind === "quote" && (
          <>
            <p>
              {item.value.title} · Versión {item.value.version} ·{" "}
              {item.value.status}
            </p>
            <p>
              Cliente ficticio:{" "}
              {state.leads.find((l) => l.id === item.value.leadId)?.name}
            </p>
            <Table
              label="Partidas de presupuesto de muestra"
              headings={["Capítulo / Partida", "Medición", "Precio", "Total"]}
              rows={item.value.lines.map((l) => [
                <span key={l.id}>
                  {l.chapter}
                  <br />
                  {l.title}
                </span>,
                `${l.qty} ${l.unit}`,
                euro(l.price),
                euro(l.qty * l.price),
              ])}
            />
            <p>
              Descuento: {item.value.discount}% · Impuesto de ejemplo:{" "}
              {item.value.tax}%
            </p>
            <p>
              Base: {euro(quoteTotals(item.value).base)} · Impuesto:{" "}
              {euro(quoteTotals(item.value).tax)}
            </p>
            <h2>Total: {euro(quoteTotals(item.value).total)}</h2>
          </>
        )}
        {item.kind === "invoice" && (
          <>
            <p>
              {item.value.description} · {item.value.type}
            </p>
            <p>
              Fecha: {dateES(item.value.date)} · Vencimiento:{" "}
              {dateES(item.value.due)}
            </p>
            <p>
              Base: {euro(item.value.base)} · Impuesto ilustrativo:{" "}
              {item.value.tax}%
            </p>
            <h2>Total: {euro(invoiceTotal(item.value))}</h2>
            <p>Cobrado / pagado en simulación: {euro(item.value.paid)}</p>
            <p>Pendiente: {euro(invoiceBalance(item.value))}</p>
            <p>
              No se ha emitido una factura fiscal ni se ha realizado ninguna
              transacción.
            </p>
          </>
        )}
        {item.kind === "payroll" && (
          <>
            <p>
              Empleado ficticio:{" "}
              {
                state.employees.find((e) => e.id === item.value.employeeId)
                  ?.name
              }
            </p>
            <p>
              Periodo: {item.value.month.split("-").reverse().join("/")} ·
              Estado: {item.value.status}
            </p>
            <Table
              label="Conceptos ficticios de nómina"
              headings={["Concepto", "Devengo", "Deducción"]}
              rows={[
                ["Salario base de ejemplo", euro(item.value.base), "—"],
                ["Complementos ficticios", euro(item.value.extra), "—"],
                ["Dietas simuladas", euro(item.value.allowance), "—"],
                [
                  "Deducción agregada ilustrativa",
                  "—",
                  euro(item.value.deduction),
                ],
              ]}
            />
            <h2>Líquido simulado: {euro(payrollNet(item.value))}</h2>
            <p>
              Ejemplo didáctico. No aplica reglas laborales ni calcula
              retenciones reales. No acredita un pago.
            </p>
          </>
        )}
        {item.kind === "document" && (
          <>
            <h2>{item.value.name}</h2>
            <p>
              {item.value.category} · Versión {item.value.version} · Caducidad
              simulada: {dateES(item.value.expires)}
            </p>
            {item.value.data ? (
              <a
                className="a-button"
                download={`muestra-${item.value.id}.${item.value.data.startsWith("data:application/pdf") ? "pdf" : "png"}`}
                href={item.value.data}
              >
                Descargar adjunto local
              </a>
            ) : item.value.category === "Fotos" ? (
              <img
                src="/propuestas/construccions-germans-moya/interior.webp"
                alt="Fotografía ilustrativa de muestra"
              />
            ) : item.value.category === "Planos" ? (
              <svg
                viewBox="0 0 600 300"
                role="img"
                aria-label="Esquema ficticio de distribución"
              >
                <path
                  d="M40 40H560V260H40ZM260 40V170H560M40 190H260V260M410 170V260"
                  fill="none"
                  stroke="#3f5142"
                  strokeWidth="6"
                />
                <text x="80" y="110" fontSize="18">
                  Estar · Ejemplo
                </text>
                <text x="330" y="100" fontSize="18">
                  Cocina · Ejemplo
                </text>
                <text x="80" y="230" fontSize="16">
                  Acceso
                </text>
              </svg>
            ) : (
              <>
                <p>
                  Este documento es un recurso ficticio para mostrar la
                  organización de archivos, versiones y avisos de la aplicación.
                </p>
                <p>
                  Contenido de muestra: descripción del alcance, lista de
                  revisión, seguimiento y observaciones. No acredita una
                  licencia, certificación, contrato o evaluación preventiva.
                </p>
              </>
            )}
          </>
        )}
        <footer>
          DEMO · Datos ficticios · Solo para presentación ·{" "}
          {dateES(new Date().toISOString())}
        </footer>
      </article>
    </dialog>
  )
}

export function downloadCSV(
  name: string,
  headings: string[],
  rows: (string | number)[][],
) {
  const cell = (value: string | number) => {
    const text = String(value)
    return `"${(/^[=+\-@\t\r]/.test(text) && typeof value === "string" ? "'" : "") + text.replaceAll('"', '""')}"`
  }
  const csv =
    "\uFEFF" +
    [headings, ...rows].map((row) => row.map(cell).join(";")).join("\r\n")
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  )
  const a = document.createElement("a")
  a.href = url
  a.download = `${name}-demo.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
