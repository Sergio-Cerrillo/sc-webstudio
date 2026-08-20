"use client"

import { useEffect, useMemo, useState } from "react"
import { RefreshCw } from "lucide-react"
import { listBirthdayRsvps, type BirthdayRsvpListResponse } from "../rsvp"

export function Birthday27Admin({ title, emptyText }: { title: string; emptyText: string }) {
  const [data, setData] = useState<BirthdayRsvpListResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const adminKey = useMemo(() => {
    if (typeof window === "undefined") {
      return undefined
    }

    return new URLSearchParams(window.location.search).get("key") ?? undefined
  }, [])

  async function loadRsvps() {
    setLoading(true)
    setData(await listBirthdayRsvps(adminKey))
    setLoading(false)
  }

  useEffect(() => {
    void loadRsvps()
  }, [])

  const yesCount = data?.rsvps.filter((rsvp) => rsvp.attending).length ?? 0
  const noCount = data?.rsvps.filter((rsvp) => !rsvp.attending).length ?? 0

  return (
    <main className="min-h-screen bg-[#11100e] px-5 py-8 text-[#f8f0df] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#9b8f78]">
              bossbirthday / 27
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-none sm:text-6xl">{title}</h1>
          </div>
          <button
            type="button"
            onClick={loadRsvps}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#efe4cf]/20 px-4 text-sm text-[#f8f0df]"
            aria-label="Actualizar"
          >
            <RefreshCw size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            ["Total", data?.rsvps.length ?? 0],
            ["Vienen", yesCount],
            ["Dramas", noCount],
          ].map(([label, value]) => (
            <div key={label} className="border border-[#efe4cf]/12 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8d8373]">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm leading-6 text-[#8d8373]">
          Modo de persistencia: <span className="text-[#f8f0df]">{data?.mode ?? "cargando"}</span>
        </p>

        <div className="mt-8 divide-y divide-[#efe4cf]/12 border-y border-[#efe4cf]/12">
          {loading ? (
            <p className="py-8 text-[#aaa08e]">Consultando expedientes...</p>
          ) : data && data.rsvps.length > 0 ? (
            data.rsvps.map((rsvp) => (
              <article key={rsvp.id ?? `${rsvp.name}-${rsvp.submittedAt}`} className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#8d8373]">Persona registrada</p>
                    <h2 className="text-2xl font-semibold">{rsvp.name}</h2>
                    <p className="mt-1 text-sm text-[#8d8373]">
                      {rsvp.guestId ? `Invitado: ${rsvp.guestId}` : "Invitado sin enlace personalizado"}
                    </p>
                  </div>
                  <span className="shrink-0 border border-[#efe4cf]/18 px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#c0ad89]">
                    {rsvp.attending ? "Viene" : "Drama"}
                  </span>
                </div>
                {rsvp.comment ? <p className="mt-4 leading-7 text-[#aaa08e]">{rsvp.comment}</p> : null}
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#625c52]">
                  {new Date(rsvp.submittedAt).toLocaleString("es-ES")}
                </p>
              </article>
            ))
          ) : (
            <p className="py-8 text-[#aaa08e]">{emptyText}</p>
          )}
        </div>
      </div>
    </main>
  )
}
