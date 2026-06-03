"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Instagram, Mail } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react" // Added useEffect and useState

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false) // Added mounted state

  // Effect to set mounted to true only on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  const footerNavItems = [
    { label: "Servicios", href: "#servicios" },
    { label: "Proyectos", href: "#proyectos" },
    { label: "Por qué nosotros", href: "#porque-nosotros" }, // Corrected href
    { label: "Contacto", href: "#contacto" },
  ]

  return (
    <footer className="bg-transparent py-12 text-neutral-800 dark:text-neutral-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="glass-card grid grid-cols-1 gap-10 p-8 md:grid-cols-3">
          <div>
            <Link href="/" className="text-xl font-light tracking-wider">
              {/* Render the logo only when the component is mounted */}
              {mounted && (
                <Image src={theme === "dark" ? "/logo/logo-w.png" : "/logo/logo-b.png"} width={96} height={56} alt="logo" />
              )}
            </Link>
            <p className="mt-4 font-light text-neutral-600 dark:text-neutral-400">
              Transformamos ideas en experiencias digitales excepcionales.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-normal">Enlaces</h3>
            <ul className="space-y-2">
              {footerNavItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="font-light text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-normal">Contacto</h3>
            <p className="mb-4 font-light text-neutral-600 dark:text-neutral-400">
              ¿Tienes alguna pregunta o proyecto en mente? Contáctanos hoy mismo.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="https://instagram.com/scwebstudio"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </motion.a>


              <motion.a
                href="mailto:info@scwebstudio.com"
                whileHover={{ y: -3 }}
                className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              >
                <Mail size={20} />
                <span className="sr-only">Email</span>
              </motion.a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-300/60 pt-6 text-center dark:border-white/10">
          <p className="text-sm font-light text-neutral-500 dark:text-neutral-500">
            © {currentYear} SC WebStudio. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
