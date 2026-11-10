import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { LockKeyhole, ArrowRight, ArrowLeft } from "lucide-react"
import {
  authConfigured,
  safeReturnPath,
  SESSION_COOKIE,
  validSession,
} from "@/lib/proposals/auth"
import { StudioFrame, StudioLogo } from "@/components/proposals/studio-frame"

export default async function PrivateAccess({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const query = await searchParams
  const next = safeReturnPath(query.next)
  if (await validSession((await cookies()).get(SESSION_COOKIE)?.value))
    redirect(next)
  const configured = authConfigured()
  const errors: Record<string, string> = {
    key: "La palabra clave no es correcta. Inténtalo de nuevo.",
    limit: "Has realizado demasiados intentos. Vuelve a probar en 15 minutos.",
    config:
      "Configura PROPOSALS_ACCESS_KEY en el archivo .env para activar el acceso.",
  }
  const error = !configured
    ? errors.config
    : query.error
      ? errors[query.error] || "No se ha podido acceder. Inténtalo de nuevo."
      : undefined
  return (
    <StudioFrame>
      <section className="sc-access-layout">
        <div className="sc-access-intro">
          <span className="sc-proposals-eyebrow">
            <LockKeyhole size={14} aria-hidden="true" />
            Espacio privado
          </span>
          <h1>
            Las próximas ideas
            <br />
            <span>empiezan aquí.</span>
          </h1>
          <p>
            Un espacio para descubrir propuestas y explorar lo que podemos crear
            juntos.
          </p>
          <Link href="/" className="sc-proposals-back">
            <ArrowLeft size={15} />
            Volver a SC WebStudio
          </Link>
        </div>
        <div className="glass-card sc-access-card">
          <StudioLogo />
          <div className="sc-access-card-heading">
            <h2>Accede a las propuestas</h2>
            <p>Introduce tu palabra clave para continuar.</p>
          </div>
          <form action="/propuestas/session" method="post">
            <input type="hidden" name="next" value={next} />
            <label htmlFor="private-key">Palabra clave</label>
            <input
              id="private-key"
              name="key"
              type="password"
              autoComplete="current-password"
              maxLength={512}
              required
              disabled={!configured}
              placeholder="Tu palabra clave"
              aria-invalid={query.error === "key" || undefined}
              aria-describedby={error ? "access-error" : undefined}
            />
            {error && (
              <p id="access-error" className="sc-access-error" role="alert">
                {error}
              </p>
            )}
            <button className="sc-access-submit" disabled={!configured}>
              Ver propuestas <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
          <span className="sc-access-note">
            <LockKeyhole size={12} aria-hidden="true" />
            Acceso reservado
          </span>
        </div>
      </section>
    </StudioFrame>
  )
}
