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
		title: "Plataforma digital a medida",
		category: "Gestión integral",
		image: "/happycheese.png",
		description:
			"Diseñamos y desarrollamos una plataforma propia que centraliza toda la operativa de la empresa: catálogo de productos, sabores, precios, porciones y tiendas, gestión de pedidos y pagos, paneles analíticos en tiempo real, automatizaciones y comunicaciones transaccionales. Además, se creó una experiencia web optimizada para la captación y conversión de clientes, conectada directamente con el sistema de gestión interno.",
	},
	{
		title: "Sistema de gestión integral",
		category: "Gestión integral",
		image: "/lify.png",
		description:
			"Creamos una plataforma a medida que unifica presencia digital, operaciones y administración en un único ecosistema. La solución integra una web corporativa optimizada, gestión de maquinaria, control de recaudaciones, seguimiento de inventario, administración de clientes y un sistema avanzado de usuarios con roles y permisos personalizados. Los operadores pueden acceder de forma segura mediante credenciales para consultar, gestionar y supervisar toda la actividad desde una interfaz intuitiva y moderna, complementada con herramientas de localización geográfica, visualización en tiempo real y una experiencia de usuario adaptada a cualquier dispositivo.",
	},
	{
		title: "Gimnasio con reservas online",
		category: "Gestión integral",
		image: "/soro.png",
		description:
			"Desarrollo de una experiencia web moderna y una plataforma de administración que centraliza la gestión de clases, reservas, horarios y usuarios, permitiendo optimizar la operativa del centro y mejorar la experiencia de los socios mediante herramientas digitales intuitivas y escalables.",
	},
	{
		title: "Digitalización de PYME",
		category: "Desarrollo Web",
		image: "/asce.png",
		description:
			"Diseño y desarrollo de una plataforma web moderna con páginas de servicios, experiencia responsive, modos claro y oscuro, arquitectura optimizada para SEO y una interfaz orientada a transmitir confianza, profesionalidad y facilitar la captación de nuevos clientes.",
	},
	{
		title: "Gestión de reservas",
		category: "Desarrollo Web",
		image: "/reserva-min.png",
		description:
			"Integración y mejoría constante de un sistema de reservas optimizado y adaptado al tipo de negocio al que pertenece el cliente.",
	},
	{
		title: "Dashboard analítico",
		category: "Digitalización",
		image: "/dashboard-min.png",
		description:
			"Controlar tu negocio y sus ventas con una vista global sobre el 100% de tus productos es verdaderamente necesario. Desarrollo de dashboard adaptado al tipo de producto del local adaptado a la necesidad de control de la empresa.",
	},
	{
		title: "App de aprendizaje de idiomas",
		category: "Aplicación Móvil",
		image: "/talk-min.jpg",
		description:
			"Desarrollo de una idea creativa nacida de la necesidad de tener que aprender idiomas y la falta de herramientas que existen para ello. Conectamos a personas con necesidades similares a la hora de aprender un idioma, pero siendo polos opuestos.",
	},
	{
		title: "Web informativa",
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
	const featuredProject = projects[0]
	const restProjects = projects.slice(1)

	return (
		<section
			className="relative overflow-hidden py-24 md:py-32 bg-transparent"
			id="proyectos"
		>
			<div className="container mx-auto px-4 md:px-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0, scale: 1 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
				>
					<div className="mb-16 text-center">
						<span className="glass-surface inline-flex items-center rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-700 dark:text-neutral-300">
							Casos reales
						</span>
						<h2 className="mt-5 text-3xl md:text-5xl font-light tracking-[-0.02em] text-black dark:text-white">
							Proyectos Destacados
						</h2>
						<p className="mt-5 text-base md:text-lg font-light text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							Soluciones que han transformado la presencia digital de nuestros
							clientes.
						</p>
					</div>
					<div className="space-y-6" ref={gridRef}>
						<Dialog>
							<motion.div
								initial={{ opacity: 0, y: 28 }}
								animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
								transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
							>
								<RotatingCard>
									<DialogTrigger asChild>
										<div className="glass-card group cursor-pointer overflow-hidden lg:grid lg:grid-cols-2 lg:items-stretch">
											<div className="relative h-72 overflow-hidden md:h-80 lg:h-full">
												<Image
													src={featuredProject.image || "/placeholder.svg"}
													alt={featuredProject.title}
													fill
													className="object-cover transition-transform duration-700 group-hover:scale-105"
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
												<div className="absolute left-4 top-4 rounded-full border border-white/35 bg-black/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white whitespace-nowrap backdrop-blur-md">
													{featuredProject.category}
												</div>
											</div>
											<div className="flex h-full flex-col justify-between p-6 md:p-8">
												<div>
													<h3 className="text-2xl md:text-3xl font-medium text-black dark:text-white">
														{featuredProject.title}
													</h3>
													<p className="mt-4 text-sm md:text-base leading-relaxed font-light text-gray-600 dark:text-gray-300">
														{featuredProject.description}
													</p>
												</div>
												<span className="mt-6 inline-flex w-fit rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
													Ver caso completo
												</span>
											</div>
										</div>
									</DialogTrigger>
								</RotatingCard>
							</motion.div>
							<DialogContent className="sm:max-w-[760px] glass-card border-white/20 bg-white/80 dark:bg-black/70">
								<DialogHeader>
									<DialogTitle className="text-black dark:text-white text-2xl font-medium">
										{featuredProject.title}
									</DialogTitle>
								</DialogHeader>
								<div className="relative mt-4 h-80 w-full overflow-hidden rounded-2xl">
									<Image
										src={featuredProject.image || "/placeholder.svg"}
										alt={featuredProject.title}
										fill
										className="object-contain"
									/>
								</div>
								<DialogDescription className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
									{featuredProject.description}
								</DialogDescription>
							</DialogContent>
						</Dialog>

						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
							{restProjects.map((project, index) => (
								<Dialog key={project.title}>
									<motion.div
										initial={{ opacity: 0, y: 30 }}
										animate={
											isInView
												? { opacity: 1, y: 0 }
												: { opacity: 0, y: 30 }
										}
										transition={{ duration: 0.65, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
									>
										<RotatingCard>
											<DialogTrigger asChild>
												<div className="glass-card group flex h-full cursor-pointer flex-col overflow-hidden">
													<div className="relative h-64 overflow-hidden">
														<Image
															src={project.image || "/placeholder.svg"}
															alt={project.title}
															fill
															className="object-cover transition-transform duration-700 group-hover:scale-110"
														/>
														<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
														<div className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/25 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white whitespace-nowrap backdrop-blur-md">
															{project.category}
														</div>
														<div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
															<span className="rounded-full border border-white/35 bg-black/30 px-4 py-2 text-white text-xs font-medium tracking-[0.16em] uppercase backdrop-blur-md">
																Ver proyecto
															</span>
														</div>
													</div>
													<div className="flex flex-1 flex-col p-6">
														<h3 className="text-xl font-medium text-black dark:text-white">
															{project.title}
														</h3>
														<p className="mt-3 text-sm leading-relaxed font-light text-gray-600 dark:text-gray-300 line-clamp-4">
															{project.description}
														</p>
													</div>
												</div>
											</DialogTrigger>
										</RotatingCard>
									</motion.div>
									<DialogContent className="sm:max-w-[700px] glass-card border-white/20 bg-white/80 dark:bg-black/70">
										<DialogHeader>
											<DialogTitle className="text-black dark:text-white text-2xl font-medium">
												{project.title}
											</DialogTitle>
										</DialogHeader>
										<div className="relative h-80 w-full overflow-hidden rounded-2xl mt-4">
											<Image
												src={project.image || "/placeholder.svg"}
												alt={project.title}
												fill
												className="object-contain"
											/>
										</div>
										<DialogDescription className="mt-4 text-base text-gray-600 dark:text-gray-300 leading-relaxed">
											{project.description}
										</DialogDescription>
									</DialogContent>
								</Dialog>
							))}
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
