"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, Moon, Sun, X } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Servicios", href: "#servicios" },
    { label: "Proyectos", href: "#proyectos" },
    { label: "Por que nosotros", href: "#porque-nosotros" },
    { label: "Contacto", href: "#contacto" },
  ]

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "pointer-events-auto mx-auto mt-2 flex w-[calc(100%-1rem)] items-center justify-between px-4 py-3 transition-all duration-500 sm:mt-4 sm:w-[calc(100%-2rem)] sm:px-5",
          isScrolled
            ? "glass-surface rounded-2xl border border-white/50 shadow-[0_10px_35px_rgba(15,23,42,0.12)] dark:border-white/15 md:max-w-5xl"
            : "rounded-none border border-transparent bg-transparent shadow-none md:max-w-6xl",
        )}
      >
        <Link href="#inicio" className="flex items-center" aria-label="Inicio">
          {mounted && (
            <Image
              src={theme === "dark" ? "/logo/logo-w.png" : "/logo/logo-b.png"}
              width={96}
              height={56}
              alt="SC WebStudio"
              className="h-auto w-20 sm:w-24"
              priority
            />
          )}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium tracking-wide text-neutral-700 transition-colors duration-300 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {mounted && (
            <div className="glass-surface flex items-center gap-2 rounded-full px-2 py-1.5">
              <Sun size={13} className="text-amber-500" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Cambiar tema"
              />
              <Moon size={13} className="text-indigo-400" />
            </div>
          )}
          <Link
            href="#contacto"
            className="glass-button rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-700 dark:text-neutral-200"
          >
            ¿Hablamos?
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Abrir menu"
          className="glass-surface rounded-full p-2 text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white md:hidden"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          opacity: mobileMenuOpen ? 1 : 0,
          y: mobileMenuOpen ? 0 : -10,
          pointerEvents: mobileMenuOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
        className="pointer-events-none mx-auto mt-2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:hidden"
      >
        <div className="glass-surface pointer-events-auto rounded-2xl p-4">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-white/50 hover:text-neutral-950 dark:text-neutral-200 dark:hover:bg-white/10 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="#contacto"
              className="mt-1 rounded-xl border border-neutral-900/10 bg-neutral-900 px-3 py-2 text-center text-sm font-medium text-white dark:border-white/20 dark:bg-white dark:text-neutral-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Agendar llamada
            </Link>
          </nav>
        </div>
      </motion.div>
    </header>
  )
}
