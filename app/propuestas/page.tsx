import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ArrowUpRight, LockKeyhole } from "lucide-react"
import { SESSION_COOKIE, validSession } from "@/lib/proposals/auth"
import { proposals } from "@/lib/proposals/catalog"
import { PrivateLogout } from "@/components/proposals/private-controls"
import { StudioFrame } from "@/components/proposals/studio-frame"

export default async function Proposals() {
  if (!(await validSession((await cookies()).get(SESSION_COOKIE)?.value)))
    redirect("/propuestas/acceso")
  return (
    <StudioFrame>
      <section className="sc-catalog-intro">
        <div>
          <span className="sc-proposals-eyebrow">
            <LockKeyhole size={14} aria-hidden="true" />
            Tus propuestas
          </span>
          <h1>
            Ideas que puedes
            <br />
            <span>ver y explorar.</span>
          </h1>
          <p>
            Descubre cada proyecto, recorre sus posibilidades y prueba la
            experiencia.
          </p>
        </div>
        <PrivateLogout className="glass-button sc-proposals-logout" />
      </section>
      <section className="sc-catalog-grid" aria-label="Propuestas disponibles">
        {proposals.map((p, i) => (
          <article key={p.slug} className="glass-card sc-proposal-card">
            <Link href={`/propuestas/${p.slug}`} className="sc-proposal-cover">
              <img
                src={p.cover}
                alt="Fachada de piedra de la propuesta de Germans Moya"
              />
              <span>Propuesta {String(i + 1).padStart(2, "0")}</span>
              <div className="sc-proposal-cover-arrow">
                <ArrowUpRight size={21} />
              </div>
            </Link>
            <div className="sc-proposal-content">
              <p className="sc-proposal-category">{p.category}</p>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <Link className="sc-access-submit" href={`/propuestas/${p.slug}`}>
                Abrir propuesta <ArrowUpRight size={18} />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </StudioFrame>
  )
}
