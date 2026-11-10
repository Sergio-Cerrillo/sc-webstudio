"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion, useScroll, type Variants } from "framer-motion"
import { ArrowDown, Check, Send, ShieldAlert } from "lucide-react"
import { birthday27 } from "../data"
import { submitBirthdayRsvp } from "../rsvp"

type Guest = ReturnType<typeof import("../data").getBirthday27Guest>

type CountdownState = {
  days: number
  hours: number
  minutes: number
  seconds: number
  hasArrived: boolean
}

type RsvpChoice = "yes" | "no"

const targetTime = new Date(birthday27.event.targetDateIso).getTime()
const revealViewport = { once: true, amount: 0.25 }
const officialStatuses = ["aprobado", "pendiente", "grave", "inevitable", "fase dos", "documentado"]

const reveal: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

function getCountdownState(): CountdownState {
  const difference = targetTime - Date.now()

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      hasArrived: true,
    }
  }

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
    hasArrived: false,
  }
}

function twoDigits(value: number) {
  return value.toString().padStart(2, "0")
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#c0ad89]">
      {children}
    </p>
  )
}

function AtmosphericLayer({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,240,223,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(248,240,223,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <motion.div
        animate={reduceMotion ? undefined : { opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(184,74,56,0.20),transparent_38%),linear-gradient(180deg,rgba(17,16,14,0)_0%,rgba(17,16,14,0.82)_72%)]"
      />
      <motion.div
        animate={reduceMotion ? undefined : { y: ["-20%", "120%"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#f8f0df]/[0.035] to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#11100e] to-transparent" />
    </div>
  )
}

function Countdown() {
  const [countdown, setCountdown] = useState<CountdownState | null>(null)

  useEffect(() => {
    setCountdown(getCountdownState())

    const interval = window.setInterval(() => {
      setCountdown(getCountdownState())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <section className="px-5 py-16 sm:px-8">
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        className="relative mx-auto max-w-3xl py-10"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b84a38] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#efe4cf]/25 to-transparent" />
        <SectionLabel>Faltan</SectionLabel>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#8d8373]">
          El tiempo administrativo se agota. La situación se está volviendo irreversible.
        </p>
        {countdown?.hasArrived ? (
          <p className="mt-6 text-4xl font-semibold leading-[0.98] text-[#f8f0df] sm:text-6xl">
            El acto ha comenzado.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["días", countdown?.days],
              ["horas", countdown?.hours],
              ["minutos", countdown?.minutes],
              ["segundos", countdown?.seconds],
            ].map(([label, value]) => (
              <div key={label as string} className="min-w-0 bg-[#f8f0df]/[0.035] p-4">
                <motion.p
                  key={`${label}-${value}`}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-[3.05rem] leading-none text-[#f8f0df] sm:text-6xl"
                >
                  {typeof value === "number" ? twoDigits(value) : "--"}
                </motion.p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#766f63]">{label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}

export function BossBirthday27Experience({ guest }: { guest?: Guest }) {
  const rsvpRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const [excuseCount, setExcuseCount] = useState(0)
  const [classifiedTaps, setClassifiedTaps] = useState(0)
  const [introOpen, setIntroOpen] = useState(true)
  const [name, setName] = useState(guest?.name ?? "")
  const [attending, setAttending] = useState<RsvpChoice>("yes")
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const excuseMessage = useMemo(() => {
    if (excuseCount === 0) {
      return "Se aceptan excusas. Se juzgan todas."
    }

    return birthday27.excuseResponses[(excuseCount - 1) % birthday27.excuseResponses.length]
  }, [excuseCount])

  function scrollToRsvp() {
    rsvpRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")

    try {
      await submitBirthdayRsvp({
        guestId: guest?.id,
        name: name.trim(),
        attending: attending === "yes",
        comment: comment.trim() || undefined,
        submittedAt: new Date().toISOString(),
      })

      setSubmitted(true)
    } catch {
      setSubmitError("El sistema administrativo ha tropezado. Inténtalo otra vez con solemnidad.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#11100e] text-[#f8f0df] selection:bg-[#b84a38] selection:text-[#fff8ec]">
      <AtmosphericLayer reduceMotion={prefersReducedMotion} />
      <motion.div
        className="fixed inset-x-0 top-0 z-40 h-[3px] origin-left bg-[#b84a38]"
        style={{ scaleX: scrollYProgress }}
      />
      <AnimatePresence>
        {introOpen ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#11100e] px-5"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.92, opacity: 0, filter: "blur(14px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-sm text-center"
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#9b8f78]">
                protocolo iniciado
              </p>
              <p className="mt-4 text-[9rem] font-semibold leading-none text-[#f8f0df]">27.</p>
              <p className="mt-3 text-sm uppercase tracking-[0.22em] text-[#b84a38]">nivel desbloqueado</p>
              <p className="mx-auto mt-6 max-w-[17rem] text-sm leading-6 text-[#8d8373]">
                Se requiere autorización explícita para consultar este documento innecesariamente importante.
              </p>
              <button
                type="button"
                onClick={() => setIntroOpen(false)}
                className="mt-8 inline-flex min-h-14 w-full items-center justify-center bg-[#f8f0df] px-6 text-sm font-black uppercase tracking-[0.18em] text-[#11100e] transition-transform active:scale-[0.98]"
              >
                Acceder
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="relative z-10 flex min-h-[100svh] flex-col overflow-hidden px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.1rem+env(safe-area-inset-top))] sm:px-8">
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="pointer-events-none absolute inset-x-5 top-24 h-px bg-[#efe4cf]/12"
        />
        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { y: [-8, 8, -8] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-16 top-32 h-44 w-44 rounded-full border border-[#b84a38]/25"
        />
        <motion.div
          aria-hidden="true"
          animate={prefersReducedMotion ? undefined : { rotate: [0, 2, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 border border-[#efe4cf]/10"
        />

        <div className="flex items-center justify-between text-[0.66rem] uppercase tracking-[0.22em] text-[#8d8373]">
          <span>{birthday27.edition}</span>
          <span>cena</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-12">
          {guest ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="mb-8 max-w-[18rem]"
            >
              <p className="text-2xl font-medium leading-tight text-[#f8f0df]">{guest.name}.</p>
              <p className="mt-2 text-sm leading-6 text-[#aaa08e]">{guest.message}</p>
            </motion.div>
          ) : null}

          <motion.h1
            initial={{ opacity: 0, y: 18, filter: "blur(8px)", scale: 0.94 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={{ delay: 1.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative text-[clamp(9rem,54vw,26rem)] font-semibold leading-[0.72] tracking-normal text-[#f8f0df]"
            onClick={() => setClassifiedTaps((count) => count + 1)}
          >
            {birthday27.age}.
          </motion.h1>

          <div className="mt-9 max-w-xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#b84a38]">
              {birthday27.heroCopy.eyebrow}
            </p>
            <p className="mt-3 text-2xl font-medium leading-tight sm:text-4xl">{birthday27.heroCopy.headline}</p>
            <p className="mt-3 text-base leading-7 text-[#aaa08e]">{birthday27.heroCopy.body}</p>
            <p className="mt-4 text-base leading-7 text-[#aaa08e]">
              {birthday27.heroCopy.invitation}
            </p>
            {classifiedTaps >= 3 ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 inline-flex border border-[#efe4cf]/15 px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#c0ad89]"
              >
                Información irrelevante descubierta
              </motion.p>
            ) : null}
          </div>

          <dl className="mt-9 grid gap-3 text-sm sm:grid-cols-3">
            {[
              ["Fecha", birthday27.event.dateLabel],
              ["Hora", birthday27.event.timeLabel],
              ["Lugar", birthday27.event.placeLabel],
            ].map(([label, value]) => (
              <motion.div
                key={label}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.55 }}
                className="border-t border-[#efe4cf]/15 pt-3"
              >
                <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-[#766f63]">{label}</dt>
                <dd className="mt-1 text-base text-[#f8f0df]">{value}</dd>
              </motion.div>
            ))}
          </dl>
        </div>

        <div className="grid gap-3 pb-1 sm:flex">
          <button
            type="button"
            onClick={scrollToRsvp}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#f8f0df] px-6 text-base font-semibold text-[#11100e] transition-transform active:scale-[0.98]"
          >
            Me apunto
            <ArrowDown aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            onClick={() => setExcuseCount((count) => count + 1)}
            className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#efe4cf]/20 px-6 text-base font-semibold text-[#f8f0df] transition-transform active:translate-y-0.5"
          >
            {excuseCount === 0 ? "Tengo una excusa lamentable" : "Insistir con la excusa"}
          </button>
        </div>
        <p className="mt-3 min-h-6 text-sm text-[#8d8373]" aria-live="polite">
          {excuseMessage}
        </p>
      </section>

      <section className="relative z-10 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end justify-between gap-5">
            <SectionLabel>Información crítica</SectionLabel>
            <p className="text-right text-[0.62rem] uppercase tracking-[0.18em] text-[#625c52]">acta interna</p>
          </div>
          <div className="relative mt-8">
            <div className="absolute bottom-0 left-[0.95rem] top-0 w-px bg-gradient-to-b from-[#b84a38] via-[#efe4cf]/14 to-transparent sm:left-[7.65rem]" />
            {birthday27.criticalInfo.map((item, index) => (
              <motion.div
                key={item.label}
                variants={reveal}
                initial="hidden"
                whileInView="visible"
                viewport={revealViewport}
                className="relative grid gap-4 py-7 pl-12 sm:grid-cols-[10rem_1fr] sm:pl-0"
              >
                <span className="absolute left-0 top-8 grid h-8 w-8 place-items-center bg-[#11100e] font-mono text-xs text-[#b84a38] sm:left-[6.7rem]">
                  {twoDigits(index + 1)}
                </span>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#c0ad89]">{item.label}</h2>
                  <p className="mt-2 text-[0.62rem] uppercase tracking-[0.16em] text-[#766f63]">
                    {officialStatuses[index % officialStatuses.length]}
                  </p>
                </div>
                <div className="relative">
                  <motion.div
                    aria-hidden="true"
                    initial={prefersReducedMotion ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={revealViewport}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-4 h-px origin-left bg-gradient-to-r from-[#b84a38] via-[#efe4cf]/18 to-transparent"
                  />
                  <p className="text-[1.7rem] font-medium leading-[1.02] text-[#f8f0df] sm:text-4xl">{item.text}</p>
                  {item.aside ? <p className="mt-3 text-sm leading-6 text-[#8d8373]">{item.aside}</p> : null}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Countdown />

      <section ref={rsvpRef} className="relative z-10 scroll-mt-4 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <SectionLabel>RSVP</SectionLabel>
          <motion.h2
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
            className="mt-5 text-5xl font-semibold leading-[0.92] text-[#f8f0df] sm:text-7xl"
          >
            Solicitud para asistir al 27º aniversario
          </motion.h2>

          <form onSubmit={handleSubmit} className="mt-9 space-y-7">
            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b8f78]">¿Quién viene?</span>
              <span className="mt-2 block text-sm leading-6 text-[#8d8373]">
                Identifícate. La maquinaria social necesita saber a quién va a permitir entrar en la historia.
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
                className="mt-3 min-h-14 w-full rounded-none border-0 border-b border-[#efe4cf]/25 bg-transparent px-0 text-xl text-[#f8f0df] outline-none transition-colors placeholder:text-[#5d574e] focus:border-[#c0ad89]"
                placeholder="Tu nombre, alias o denominación oficial"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b8f78]">¿Vienes?</legend>
              <div className="mt-4 grid gap-3">
                {[
                  ["yes", "Obviamente"],
                  ["no", "No, y quiero decepcionar personalmente al anfitrión"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className="flex min-h-14 cursor-pointer items-center gap-3 border border-[#efe4cf]/18 px-4 text-base text-[#f8f0df] transition-colors has-[:checked]:border-[#c0ad89] has-[:checked]:bg-[#f8f0df]/6"
                  >
                    <input
                      type="radio"
                      name="attending"
                      value={value}
                      checked={attending === value}
                      onChange={() => setAttending(value as RsvpChoice)}
                      className="h-5 w-5 accent-[#c0ad89]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <motion.p
                key={attending}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-start gap-2 text-sm leading-6 text-[#8d8373]"
                aria-live="polite"
              >
                <ShieldAlert className="mt-0.5 shrink-0 text-[#b84a38]" size={16} aria-hidden="true" />
                {birthday27.rsvpFeedback[attending]}
              </motion.p>
            </fieldset>

            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9b8f78]">
                Comentario opcional
              </span>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={5}
                className="mt-3 w-full resize-none rounded-none border border-[#efe4cf]/18 bg-transparent p-4 text-base leading-7 text-[#f8f0df] outline-none transition-colors placeholder:text-[#5d574e] focus:border-[#c0ad89]"
                placeholder="Alergias, exigencias, declaraciones de amor..."
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting || submitted}
              className="inline-flex min-h-16 w-full items-center justify-center gap-2 bg-[#b84a38] px-6 text-sm font-black uppercase tracking-[0.16em] text-[#fff8ec] shadow-[0_0_45px_rgba(184,74,56,0.25)] transition-transform active:scale-[0.98] disabled:cursor-default disabled:bg-[#4d473f] sm:w-auto"
            >
              {submitted ? <Check aria-hidden="true" size={18} /> : <Send aria-hidden="true" size={18} />}
              {submitted ? "Solicitud recibida" : isSubmitting ? "Enviando..." : "Enviar solicitud"}
            </button>
            {submitError ? <p className="text-sm leading-6 text-[#d48a7c]">{submitError}</p> : null}
          </form>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mt-8 overflow-hidden border-l border-[#c0ad89] pl-5"
              aria-live="polite"
            >
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.8, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: -6 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mb-5 inline-flex border-2 border-[#b84a38] px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-[#b84a38]"
              >
                solicitud recibida
              </motion.div>
              <p className="text-2xl font-medium text-[#f8f0df]">Solicitud recibida, {name.trim()}.</p>
              <p className="mt-2 leading-7 text-[#aaa08e]">
                Nuestro equipo evaluará tu candidatura. Spoiler: probablemente sí. Tiempo estimado de respuesta:
                entre 3 y 5 días laborables.
              </p>
            </motion.div>
          ) : null}
        </div>
      </section>

      <footer className="relative z-10 px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-16 sm:px-8">
        <div className="mx-auto max-w-3xl border-t border-[#efe4cf]/12 pt-8">
          <p className="text-[7.5rem] font-semibold leading-none text-[#f8f0df]">27</p>
          <p className="mt-5 max-w-sm text-lg leading-7 text-[#aaa08e]">
            Una cena innecesariamente documentada para celebrar que sigo envejeciendo.
          </p>
          <p className="mt-10 text-[0.66rem] uppercase tracking-[0.22em] text-[#766f63]">{birthday27.edition}</p>
        </div>
      </footer>
    </main>
  )
}
