"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch" // Importar Switch

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme() // Obtener setTheme también
  const [mounted, setMounted] = useState(false) // Estado para controlar si el componente está montado

  // Efecto para establecer mounted a true solo en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Servicios", href: "#servicios" },
    { label: "Proyectos", href: "#proyectos" },
    { label: "Por qué nosotros", href: "#porque-nosotros" }, // Corrected href
    { label: "Contacto", href: "#contacto" },
  ]

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ opacity: isScrolled ? 0.95 : 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? `${theme === "dark" ? "bg-black/90 shadow-[0_4px_24px_0_rgba(120,120,120,0.25)]" : "bg-white/90 shadow-md"} backdrop-blur-md dark:shadow-[0_4px_24px_0_rgba(120,120,120,0.25)]` : "bg-transparent"}
      `}
    >
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-light tracking-wider">
          {/* Renderizar el logo solo cuando el componente esté montado */}
          {mounted && (
            <Image src={theme === "dark" ? "/logo/logo-w.png" : "/logo/logo-b.png"} width={96} height={56} alt="logo" />
          )}
        </Link>

        {/* Navegación de escritorio con Switch en el medio */}
        <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
          {navItems.slice(0, 2).map((item) => ( // First two items
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors dark:text-white text-black drop-shadow dark:drop-shadow-lg"
            >
              {item.label}
            </Link>
          ))}

          {/* Switch de tema en el centro */}
          {mounted && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">🌙</span>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
              <span className="text-xs text-gray-500">☀️</span>
            </div>
          )}

          {navItems.slice(2).map((item) => ( // Last two items
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors dark:text-white text-black drop-shadow dark:drop-shadow-lg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Botón de menú móvil */}
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden focus:outline-none text-black dark:text-white" // Added text-black dark:text-white
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-white dark:bg-black shadow-lg dark:shadow-[0_4px_32px_0_rgba(120,120,120,0.25)] transition-shadow duration-500"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col items-center space-y-4"> {/* Centrar items en menú móvil */}
            {navItems.map((item) => ( // Use navItems for mobile menu as well
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-light py-2 text-black dark:text-white" // Añadido text-black dark:text-white
                onClick={() => setMobileMenuOpen(false)} // Close menu on click
              >
                {item.label}
              </Link>
            ))}
            {/* Switch de tema en el menú móvil */}
            {mounted && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-gray-500">🌙</span>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  aria-label="Toggle dark mode"
                />
                <span className="text-xs text-gray-500">☀️</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
