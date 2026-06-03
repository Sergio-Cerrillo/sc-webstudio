"use client"

import Image from "next/image"
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import FloatingTechCarousel from "@/components/FloatingTechCarousel"
import RotatingWord from "@/components/RotatingWord"

const technologies = [
    "Next.js",
    "React",
    "TypeScript",
    "Supabase",
    "PostgreSQL",
    "Vercel",
    "Stripe",
    "Figma",
    "Tailwind",
    "Framer Motion",
    "Resend",
    "OpenAI",
]

export default function Hero() {
    const [mounted, setMounted] = useState(false)
    const { theme } = useTheme()

    const sectionRef = useRef<HTMLElement>(null)
    const logoRef = useRef<HTMLDivElement>(null)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const rotateX = useSpring(useTransform(mouseY, [-90, 90], [8, -8]), {
        stiffness: 120,
        damping: 18,
        mass: 0.7,
    })
    const rotateY = useSpring(useTransform(mouseX, [-90, 90], [-10, 10]), {
        stiffness: 120,
        damping: 18,
        mass: 0.7,
    })
    const driftX = useSpring(useTransform(mouseX, [-120, 120], [-10, 10]), {
        stiffness: 80,
        damping: 15,
    })
    const driftY = useSpring(useTransform(mouseY, [-120, 120], [-8, 8]), {
        stiffness: 80,
        damping: 15,
    })

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    })

    const fadeOut = useTransform(scrollYProgress, [0, 0.65], [1, 0.2])

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        function handleMouseMove(event: MouseEvent) {
            if (!logoRef.current) return

            const rect = logoRef.current.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2

            mouseX.set((event.clientX - centerX) / 6)
            mouseY.set((event.clientY - centerY) / 7)
        }

        window.addEventListener("mousemove", handleMouseMove, { passive: true })
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [mouseX, mouseY])

    return (
        <section
            ref={sectionRef}
            id="inicio"
            className="relative isolate min-h-[100svh] overflow-hidden bg-transparent pt-24 sm:pt-28"
        >
            <motion.div
                style={{ opacity: fadeOut }}
                className="relative z-20 mx-auto grid min-h-[calc(100svh-7.5rem)] w-full max-w-[1320px] grid-cols-1 gap-12 px-5 pb-12 sm:px-8 md:gap-14 lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-10 xl:pb-16"
            >
                <motion.div
                    initial={{ opacity: 0, y: 34, filter: "blur(14px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="order-2 max-w-xl space-y-7 lg:order-1"
                >
                    <motion.span
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="glass-surface inline-flex items-center rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-700 dark:text-neutral-300"
                    >
                        Enterprise SaaS Studio
                    </motion.span>

                    <h1 className="text-balance text-[clamp(2.8rem,7.4vw,6.2rem)] font-medium leading-[0.93] tracking-[-0.03em] text-neutral-950 dark:text-white">
                        La solución que
                        <br />
                        <RotatingWord
                            words={["buscas.", "quieres.", "necesitas."]}
                            className="bg-gradient-to-r from-neutral-950 to-neutral-700 bg-clip-text font-semibold text-transparent dark:from-white dark:to-neutral-300"
                        />
                    </h1>

                    <p className="max-w-lg text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-300">
                        Construimos productos digitales con nivel enterprise: arquitectura robusta,
                        interfaz impecable y performance de primer nivel desde el primer release.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <a
                            href="#contacto"
                            className="group inline-flex items-center rounded-full border border-neutral-900/80 bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[0_14px_28px_rgba(15,23,42,0.28)] dark:border-white/80 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                        >
                            Agendar discovery call
                        </a>
                        <a
                            href="#proyectos"
                            className="glass-button inline-flex items-center rounded-full px-6 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-200"
                        >
                            Ver proyectos
                        </a>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 22, scale: 0.96, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="order-1 flex items-center justify-center lg:order-2"
                >
                    <motion.div
                        ref={logoRef}
                        style={{
                            rotateX,
                            rotateY,
                            x: driftX,
                            y: driftY,
                            transformPerspective: 1200,
                        }}
                        className="relative w-full max-w-[760px]"
                    >
                        {mounted && (
                            <Image
                                src={theme === "dark" ? "/logo/logo-full-w.png" : "/logo/logo-full-b.png"}
                                width={1600}
                                height={525}
                                alt="SC WebStudio"
                                priority
                                className="h-auto w-full drop-shadow-[0_12px_26px_rgba(0,0,0,0.35)]"
                            />
                        )}
                    </motion.div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="order-3 pt-2 text-center text-balance text-[clamp(1.05rem,2.1vw,1.75rem)] font-semibold uppercase leading-[1.15] tracking-[0.14em] text-neutral-950 dark:text-white lg:col-span-2"
                >
                    Imagine it. Experience it. Digitalize it.
                </motion.p>
            </motion.div>

            <motion.div
                style={{ y: useTransform(scrollYProgress, [0, 1], [0, 26]) }}
                className="pointer-events-none absolute inset-x-0 bottom-[5%] z-10 hidden lg:block"
            >
                <FloatingTechCarousel
                    items={technologies}
                    direction="right"
                    duration={62}
                    className="pointer-events-auto mx-auto w-full max-w-none px-5 opacity-90"
                />
            </motion.div>

            <div className="mx-auto mt-2 w-full max-w-6xl px-5 pb-10 sm:px-8 lg:hidden">
                <FloatingTechCarousel items={technologies} direction="left" duration={52} className="w-full" />
            </div>
        </section>
    )
}
