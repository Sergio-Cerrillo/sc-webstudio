"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Instagram, Twitter, Linkedin, Mail } from "lucide-react"
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
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="text-xl font-light tracking-wider">
              {/* Render the logo only when the component is mounted */}
              {mounted && (
                <Image src={theme === "dark" ? "/logo/logo-w.png" : "/logo/logo-b.png"} width={96} height={56} alt="logo" />
              )}
            </Link>
            <p className="mt-4 text-gray-400 font-light">
              Transformamos ideas en experiencias digitales excepcionales.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-normal mb-4">Enlaces</h3>
            <ul className="space-y-2">
              {footerNavItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-gray-400 font-light hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-normal mb-4">Contacto</h3>
            <p className="text-gray-400 font-light mb-4">
              ¿Tienes alguna pregunta o proyecto en mente? Contáctanos hoy mismo.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="https://instagram.com/scwebstudio"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3 }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </motion.a>
              
              
              <motion.a
                href="mailto:info@scwebstudio.com"
                whileHover={{ y: -3 }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Mail size={20} />
                <span className="sr-only">Email</span>
              </motion.a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 font-light text-sm">
            © {currentYear} SC WebStudio. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
