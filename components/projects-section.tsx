"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import RotatingCard from "./rotating-card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

interface Project {
	title: string
	category: string
	image: string
	description: string
}

const projects: Project[] = [
	{
		title: "E-commerce de PYME",
		category: "Desarrollo Web",
		image: "/ecommerce.webp",
		description:
			"Desarrollamos una tienda dinámica y moderna para un pequeño negocio. Conseguimos redirigir el público a su dominio privado evitando así depender de tiendas online generalizadas. Tienda a medida, con productos propios de la marca.",
	},
	{
		title: "Gestión de Reservas",
		category: "Desarrollo Web",
		image: "/reserva-min.png",
		description:
			"Integración y mejoría constante de un sistema de reservas optimizado y adaptado al tipo de negocio al que pertenece el cliente.",
	},
	{
		title: "Dashboard Analítico",
		category: "Digitalización",
		image: "/dashboard-min.png",
		description:
			"Controlar tu negocio y sus ventas con una vista global sobre el 100% de tus productos es verdaderamente necesario. Desarrollo de dashboard adaptado al tipo de producto del local adaptado a la necesidad de control de la empresa.",
	},
	{
		title: "App de Aprendizaje de Idiomas",
		category: "Aplicación Móvil",
		image: "/talk-min.jpg",
		description:
			"Desarrollo de una idea creativa nacida de la necesidad de tener que aprender idiomas y la falta de herramientas que existen para ello. Conectamos a personas con necesidades similares a la hora de aprender un idioma, pero siendo polos opuestos.",
	},
	{
		title: "Web Simple pero Informativa",
		category: "Desarrollo Web",
		image: "/plur-min.png",
		description:
			"La empresa solicitó mejorar y actualizar su antigua web. Desarrollamos una web completamente nueva, integrando los colores de su marca. Destacamos los servicios en relación al público que se pretendía enfocar la web.",
	},
	{
		title: "Digitalización de PYME",
		category: "Desarrollo Web",
		image: "/digital-min.png",
		description:
			"La empresa quería tener presencia digital y desarrollamos una Web adaptada a las necesidades del cliente. Trasmitiendo la seriedad del tipo de negocio al que pertenece, pero manteniendo la transparencia e información que aportan al cliente.",
	},
]

export default function ProjectsSection() {
	const gridRef = useRef(null)
	const isInView = useInView(gridRef, { once: true, amount: 0.1 })

	return (
		<section
			className="relative py-24 md:py-32 bg-white dark:bg-black transition-colors duration-500"
			id="proyectos"
		>
			<div className="container mx-auto px-4 md:px-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.6 }}
				>
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-light mb-8 text-black dark:text-white transition-colors duration-500 text-center">
							Proyectos Destacados
						</h2>
						<p className="text-lg font-light text-gray-600 max-w-2xl mx-auto">
							Soluciones que han transformado la presencia digital de nuestros
							clientes.
						</p>
					</div>
					<div
						ref={gridRef}
						className="grid grid-cols-1 md:grid-cols-2 gap-8"
					>
						{projects.map((project, index) => (
							<Dialog key={project.title}>
								<motion.div
									initial={{ opacity: 0, y: 30 }}
									animate={
										isInView
											? { opacity: 1, y: 0 }
											: { opacity: 0, y: 30 }
									}
									transition={{ duration: 0.6, delay: index * 0.2 }}
								>
									<RotatingCard>
										<DialogTrigger asChild>
											<div className="overflow-hidden group cursor-pointer">
												<div className="relative h-80 overflow-hidden">
													<Image
														src={project.image || "/placeholder.svg"}
														alt={project.title}
														fill
														className="object-cover transition-transform duration-700 group-hover:scale-110"
													/>
													<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
													<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
														<span className="text-white text-sm font-light tracking-wide px-4 py-2 border border-white">
															Ver proyecto
														</span>
													</div>
												</div>
												<div className="p-6 bg-white dark:bg-black">
													<span className="text-sm font-light text-gray-500">
														{project.category}
													</span>
													<h3 className="text-xl font-normal mt-2 text-black dark:text-white">
														{project.title}
													</h3>
												</div>
											</div>
										</DialogTrigger>
									</RotatingCard>
								</motion.div>
								<DialogContent className="sm:max-w-[600px] bg-white dark:bg-black">
									<DialogHeader>
										<DialogTitle className="text-black dark:text-white">
											{project.title}
										</DialogTitle>
									</DialogHeader>
									<div className="relative h-80 w-full overflow-hidden rounded-md mt-4">
										<Image
											src={project.image || "/placeholder.svg"}
											alt={project.title}
											fill
											className="object-contain"
										/>
									</div>
									<DialogDescription className="mt-4 text-gray-600 dark:text-gray-300">
										{project.description}
									</DialogDescription>
								</DialogContent>
							</Dialog>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	)
}
