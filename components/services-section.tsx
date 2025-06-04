"use client"

import { useRef, useEffect, useState } from "react"
// Updated Framer Motion imports
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { Globe, Smartphone, BarChart3, Code, AtSign, Ear } from "lucide-react"
import RotatingCard from "./rotating-card"
import { useIsMobile } from "@/hooks/use-mobile" // Import useIsMobile

const services = [
	{
		icon: <Globe className="w-8 h-8" />,
		title: "Páginas Web",
		description:
			"Diseño y desarrollo de sitios web a medida, optimizados para todos los dispositivos y motores de búsqueda.",
	},
	{
		icon: <Smartphone className="w-8 h-8" />,
		title: "Aplicaciones Móviles",
		description:
			"Creación de aplicaciones nativas e híbridas para iOS y Android que potencian la experiencia de tus usuarios.",
	},
	{
		icon: <BarChart3 className="w-8 h-8" />,
		title: "Digitalización de Negocios",
		description:
			"Transformamos tu negocio tradicional en digital, optimizando procesos y mejorando la eficiencia.",
	},
	{
		icon: <Code className="w-8 h-8" />,
		title: "Soluciones a Medida",
		description:
			"Desarrollo de software personalizado que se adapta perfectamente a las necesidades específicas de tu empresa.",
	},
	{
		icon: <AtSign className="w-8 h-8" />,
		title: "SEO",
		description:
			"Análisis y mejora del posicionamiento de tu web en los buscadores principales.",
	},
	{
		icon: <Ear className="w-8 h-8" />,
		title: "Te escuchamos",
		description:
			"Cuéntanos qué necesitas o desarrollaremos tu necesidad hasta cumplir el objetivo.",
	},
]

function useSectionFade(ref: React.RefObject<HTMLElement>) {
	const [visible, setVisible] = useState(true)
	useEffect(() => {
		function onScroll() {
			if (!ref.current) return
			const rect = ref.current.getBoundingClientRect()
			const windowHeight =
				window.innerHeight || document.documentElement.clientHeight
			// Cambia el threshold para que la sección solo desaparezca cuando esté a punto de salir completamente
			const threshold = 0.01 // Solo desaparece cuando queda menos del 1% visible
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

export default function ServicesSection() {
	const ref = useRef<HTMLElement>(null)
	const isVisible = useSectionFade(ref)
	const isMobile = useIsMobile() // Get mobile state

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
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

	// Framer Motion fade progresivo al hacer scroll (igual que hero-section)
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

	return (
		<section
			ref={ref}
			className="relative py-24 md:py-32 bg-white dark:bg-black transition-colors duration-500"
			id="servicios"
		>
			<div className="container mx-auto px-4 md:px-6">
				<motion.div
					style={{ opacity, y, scale }}
					animate={
						isVisible
							? { opacity: 1, y: 0, scale: 1 }
							: { opacity: 0, y: 100, scale: 0.9 }
					}
					initial={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.6 }}
				>
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-light mb-8 text-black dark:text-white transition-colors duration-500 text-center">
							Nuestros Servicios
						</h2>
						<p className="text-lg font-light text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Ofrecemos soluciones tecnológicas integrales para impulsar tu
							presencia digital.
						</p>
					</div>
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate={isVisible ? "visible" : "hidden"}
						className="grid grid-cols-1 md:grid-cols-3 gap-8"
					>
						{services.map((service) => (
							<motion.div key={service.title} variants={itemVariants}>
								<RotatingCard className="h-full">
									<div className="bg-white dark:bg-black border border-gray-100 dark:border-gray-700 dark:shadow-[0_2px_10px_0_rgba(220,220,220,0.3)] p-8 h-full flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-300">
										<div className="mb-6 text-black dark:text-white">
											{service.icon}
										</div>
										<h3 className="text-xl font-normal mb-4 text-black dark:text-white">
											{service.title}
										</h3>
										<p className="font-light text-gray-600 dark:text-gray-400">
											{service.description}
										</p>
									</div>
								</RotatingCard>
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	)
}
