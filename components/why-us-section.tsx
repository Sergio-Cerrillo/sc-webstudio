"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { Zap, Users, Clock, Award, Speech, ClipboardCheck } from "lucide-react"
import RotatingCard from "./rotating-card"
import { useIsMobile } from "../hooks/use-mobile" // Corrected import path

const reasons = [
	{
		icon: <Zap className="w-6 h-6" />,
		title: "Tecnología de Vanguardia",
		description:
			"Utilizamos las últimas tecnologías para garantizar soluciones modernas y eficientes.",
	},
	{
		icon: <Users className="w-6 h-6" />,
		title: "Enfoque Centrado en el Usuario",
		description:
			"Diseñamos pensando en la experiencia del usuario final para maximizar la satisfacción.",
	},
	{
		icon: <Clock className="w-6 h-6" />,
		title: "Entrega Puntual",
		description:
			"Nos comprometemos a cumplir con los plazos establecidos sin comprometer la calidad.",
	},
	{
		icon: <Award className="w-6 h-6" />,
		title: "Calidad Garantizada",
		description:
			"Cada proyecto pasa por rigurosos controles de calidad antes de ser entregado.",
	},
	{
		icon: <ClipboardCheck className="w-6 h-6" />,
		title: "Plan Adaptado",
		description:
			"Si tu proyecto requiere un mantenimiento periódico, desarrollaremos una planificación adaptada a ti.",
	},
	{
		icon: <Speech className="w-6 h-6" />,
		title: "Comunicación 24/7",
		description:
			"De manera dinámica, adaptamos el proyecto a las necesidades que van surgiendo. Tanto ideas por nuestra parte como por parte del cliente.",
	},
]

function useSectionFade(ref: React.RefObject<HTMLElement>) {
	const [visible, setVisible] = useState(true)
	useEffect(() => {
		function onScroll() {
			if (!ref.current) return
			const rect = ref.current.getBoundingClientRect()
			const windowHeight = window.innerHeight || document.documentElement.clientHeight
			const threshold = 0.2 // Ahora desaparece cuando queda un 20% visible
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

export default function WhyUsSection() {
	const ref = useRef<HTMLElement>(null)
	const isVisible = useSectionFade(ref) // Retained for card animations
	const isMobile = useIsMobile() // Initialize useIsMobile

	// Scroll-based animations for desktop
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"],
	})
	const opacityScroll = useTransform(scrollYProgress, [0, 0.5], [1, 0])
	const yScroll = useTransform(scrollYProgress, [0, 0.5], [0, 100])
	const scaleScroll = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])

	return (
		<section
			ref={ref}
			className="relative py-24 md:py-32 bg-white dark:bg-black transition-colors duration-500"
			id="porque-nosotros" // Corrected ID
		>
			<div className="container mx-auto px-4 md:px-6">
				<motion.div
					style={
						isMobile
							? {} // On mobile, scroll-driven animations are disabled; entrance animation handles appearance.
							: { opacity: opacityScroll, y: yScroll, scale: scaleScroll } // Scroll-based for desktop
					}
					initial={{ opacity: 0, y: 20, scale: 0.9 }} // Entrance animation start state
					animate={{ opacity: 1, y: 0, scale: 1 }}     // Entrance animation end state
					transition={{ duration: 0.6 }}             // Entrance animation duration
				>
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-light mb-8 text-black dark:text-white transition-colors duration-500 text-center">
							¿Por qué elegirnos?
						</h2>
						<p className="text-lg font-light text-gray-600 max-w-2xl mx-auto">
							Nos distinguimos por nuestro compromiso con la excelencia y la innovación
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{reasons.map((reason, index) => (
							<motion.div
								key={reason.title} // Using reason.title as key, assuming it's unique
								initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
								animate={
									isVisible // Card animations still use isVisible from useSectionFade
										? { opacity: 1, x: 0 }
										: { opacity: 0, x: index % 2 === 0 ? -20 : 20 }
								}
								transition={{ duration: 0.6, delay: index * 0.1 }}
							>
								<RotatingCard>
									<div className="flex items-start p-6 border border-gray-100 dark:border-gray-700 min-h-44 bg-white dark:bg-black shadow-sm dark:shadow-[0_2px_10px_0_rgba(220,220,220,0.3)] hover:shadow-md transition-shadow duration-300">
										<div className="mr-4 text-black dark:text-white">{reason.icon}</div>
										<div>
											<h3 className="text-lg font-normal mb-2 dark:text-white">
												{reason.title}
											</h3>
											<p className="font-light text-gray-600 dark:text-gray-300">
												{reason.description}
											</p>
										</div>
									</div>
								</RotatingCard>
							</motion.div>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	)
}
