"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { Mail, Phone, MapPin, Linkedin, Github, Send, MessageCircle, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useIsMobile } from "@/hooks/use-mobile"
import RotatingCard from "./rotating-card"

const contactInfo = [
    {
        icon: <Mail className="w-6 h-6" />,
        title: "Email",
        value: "info@scwebstudio.tech",
        link: "mailto:info@scwebstudio.tech",
    },
    {
        icon: <Phone className="w-6 h-6" />,
        title: "Teléfono",
        value: "+34 692 526 521",
        link: "tel:+34692526521",
    },
    {
        icon: <MapPin className="w-6 h-6" />,
        title: "Ubicación",
        value: "Palma de Mallorca, Islas Baleares, España",
        link: null,
    },
]

const socialLinks = [
    {
        icon: <Instagram className="w-5 h-5" />,
        name: "Instagram",
        link: "https://instagram.com/scwebstudio",
    }
]

function useSectionFade(ref: React.RefObject<HTMLElement>) {
    const [visible, setVisible] = useState(true)
    useEffect(() => {
        function onScroll() {
            if (!ref.current) return
            const rect = ref.current.getBoundingClientRect()
            const windowHeight = window.innerHeight || document.documentElement.clientHeight
            const threshold = 0.2
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

export default function ContactSection() {
    const ref = useRef<HTMLElement>(null)
    const isVisible = useSectionFade(ref)
    const isMobile = useIsMobile()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    })

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    })

    // Call useTransform unconditionally
    const scrollOpacity = useTransform(scrollYProgress, [0, 0.95], [1, 0])
    const scrollY = useTransform(scrollYProgress, [0, 0.95], [0, 100])
    const scrollScale = useTransform(scrollYProgress, [0, 0.95], [1, 0.9])

    // Conditionally use the values based on isMobile
    const opacity = isMobile ? 1 : scrollOpacity
    const y = isMobile ? 0 : scrollY
    const scale = isMobile ? 1 : scrollScale

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Aquí puedes integrar un servicio de envío de emails como EmailJS, Formspree, etc.
        const mailtoLink = `mailto:info@scwebstudio.tech?subject=Contacto desde la web&body=Nombre: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0A%0D%0AMensaje:%0D%0A${formData.message}`
        window.location.href = mailtoLink
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    return (
        <motion.section
            id="contacto"
            ref={ref}
            style={{ opacity, y, scale }}
            className="min-h-screen flex items-center justify-center py-20 px-4 md:px-6 relative overflow-hidden bg-transparent"
        >
            <div className="container mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-light mb-4 text-black dark:text-white">
                        Hablemos de tu proyecto
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                        ¿Tienes una idea en mente? Estamos aquí para convertirla en realidad. Contáctanos y
                        empecemos a trabajar juntos.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Información de contacto */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate={isVisible ? "visible" : "hidden"}
                        className="space-y-8"
                    >
                        <motion.div variants={itemVariants}>
                            <h3 className="text-2xl font-light mb-6 text-black dark:text-white">
                                Información de contacto
                            </h3>
                            <div className="space-y-4">
                                {contactInfo.map((info) => (
                                    <RotatingCard key={info.title} className="h-full">
                                        <div className="glass-card p-6 transition-all duration-300">
                                            {info.link ? (
                                                <a
                                                    href={info.link}
                                                    className="flex items-start gap-4 group"
                                                >
                                                    <div className="text-black dark:text-white mt-1 group-hover:scale-110 transition-transform">
                                                        {info.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                            {info.title}
                                                        </p>
                                                        <p className="text-black dark:text-white font-light group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                                                            {info.value}
                                                        </p>
                                                    </div>
                                                </a>
                                            ) : (
                                                <div className="flex items-start gap-4">
                                                    <div className="text-black dark:text-white mt-1">
                                                        {info.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                            {info.title}
                                                        </p>
                                                        <p className="text-black dark:text-white font-light">
                                                            {info.value}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </RotatingCard>
                                ))}
                            </div>
                        </motion.div>

                        {/* Redes sociales */}
                        <motion.div variants={itemVariants}>
                            <h4 className="text-lg font-light mb-4 text-black dark:text-white">
                                Síguenos en redes
                            </h4>
                            <div className="flex gap-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="glass-surface w-12 h-12 rounded-full flex items-center justify-center text-black dark:text-white hover:scale-110 transition-all duration-300"
                                        aria-label={social.name}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Mensaje adicional */}
                        <motion.div
                            variants={itemVariants}
                            className="glass-card p-6"
                        >
                            <MessageCircle className="w-8 h-8 text-black dark:text-white mb-3" />
                            <h4 className="text-lg font-light mb-2 text-black dark:text-white">
                                ¿Prefieres una videollamada?
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Podemos agendar una reunión online para discutir tu proyecto en detalle.
                                ¡Escríbenos y coordinamos!
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Formulario de contacto */}
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate={isVisible ? "visible" : "hidden"}
                    >
                        <RotatingCard className="h-full">
                            <div className="glass-card p-8">
                                <h3 className="text-2xl font-light mb-6 text-black dark:text-white">
                                    Envíanos un mensaje
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-light mb-2 text-black dark:text-white"
                                        >
                                            Nombre
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Tu nombre"
                                            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-black dark:text-white focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-light mb-2 text-black dark:text-white"
                                        >
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="tu@email.com"
                                            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-black dark:text-white focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="block text-sm font-light mb-2 text-black dark:text-white"
                                        >
                                            Mensaje
                                        </label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            required
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Cuéntanos sobre tu proyecto..."
                                            rows={6}
                                            className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-black dark:text-white focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 resize-none"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300 py-6 text-base font-light"
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        Enviar mensaje
                                    </Button>
                                </form>
                            </div>
                        </RotatingCard>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    )
}