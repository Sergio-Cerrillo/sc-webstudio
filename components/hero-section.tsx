"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowDown } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"

function useSectionFade(ref: React.RefObject<HTMLElement>) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    function onScroll() {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const windowHeight = window.innerHeight || document.documentElement.clientHeight
      const threshold = 0.1
      const isVisible =
        rect.bottom > windowHeight * threshold &&
        rect.top < windowHeight * (1 - threshold)
      setVisible(isVisible)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [ref])
  return visible
}

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isVisible = useSectionFade(ref)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])

  // Estado para la rotación 3D del logo
  const [logoRotation, setLogoRotation] = useState({ x: 0, y: 0 })
  const logoRef = useRef<HTMLDivElement>(null)

  // Handler de movimiento del mouse para rotación 3D
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!logoRef.current) return
      const rect = logoRef.current.getBoundingClientRect()
      // Centro del logo
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      // Diferencia entre mouse y centro del logo
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      // Limita la rotación máxima (en grados)
      const maxRotate = 30
      const rotateY = Math.max(-maxRotate, Math.min(maxRotate, dx / 20))
      const rotateX = Math.max(-maxRotate, Math.min(maxRotate, -dy / 30))
      setLogoRotation({ x: rotateX, y: rotateY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black transition-colors duration-500" id="inicio">
      {/* Toggle de modo claro/oscuro fijo arriba - REMOVED FROM HERE */}
      {/* 
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-4 right-8 z-50 flex items-center gap-2"
      >
        <span className="text-xs text-gray-500">🌙</span>
        {mounted && (
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label="Toggle dark mode"
          />
        )}
        <span className="text-xs text-gray-500">☀️</span>
      </motion.div>
      */}
      <motion.div
        style={{ opacity, y, scale }}
        animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 100, scale: 0.9 }}
        className="container mx-auto px-4 md:px-6 text-center z-10 bg-white dark:bg-black transition-colors duration-500"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className=" flex justify-center"
        >
          <div
            ref={logoRef}
            style={{
              width: 600,
              height: 350,
              transform: `perspective(1000px) rotateX(${logoRotation.x}deg) rotateY(${logoRotation.y}deg)`,
              transition: 'transform 0.25s cubic-bezier(.22,1,.36,1)'
            }}
          >
            {mounted && (
              <Image
                src={theme === "dark" ? "/logo/logo-full-w.png" : "/logo/logo-full-b.png"}
                width={1600}
                height={525}
                alt="Logo de la empresa"
                priority
              />
            )}
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl lg:text-3xl font-extralight tracking-wider mb-6 -mt-24 dark:text-white text-black"
        >
          Imagine It. Experience It. Digitalize It.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <a
            href="#servicios"
            className="inline-flex items-center justify-center px-8 py-3 border border-black dark:border-white text-sm font-light tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300 text-black dark:text-white"
          >
            Descubrir
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-1/2 z-10 transform -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}>
          <ArrowDown size={24} className="dark:text-white text-black" />
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white z-0 dark:bg-gradient-to-b dark:from-black/0 dark:via-black/0 dark:to-black" />
    </section>
  )
}
