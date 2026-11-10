import Link from "next/link"
export function PrivateLogout({
  className = "p-text-button",
}: { className?: string } = {}) {
  return (
    <form action="/propuestas/session" method="post">
      <input type="hidden" name="intent" value="logout" />
      <button className={className} type="submit">
        Cerrar acceso privado ↗
      </button>
    </form>
  )
}
export function PrivateControls() {
  return (
    <div className="private-controls">
      <Link href="/propuestas">← Propuestas</Link>
      <span>Presentación privada · Material demo</span>
      <PrivateLogout />
    </div>
  )
}
