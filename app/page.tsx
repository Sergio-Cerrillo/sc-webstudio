"use client"

import { motion } from "framer-motion"
import Hero from "@/components/Hero"
import ServicesSection from "@/components/services-section"
import ProjectsSection from "@/components/projects-section"
import WhyUsSection from "@/components/why-us-section"
import ContactSection from "@/components/contact-section"
import Footer from "@/components/footer"
import Header from "@/components/header"

const reveal = {
  hidden: { opacity: 0, y: 36, filter: "blur(10px)", scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function Home() {
  return (
    <main className="site-bg relative min-h-screen text-black dark:text-white">
      <Header />
      <Hero />

      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <ServicesSection />
      </motion.div>

      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <ProjectsSection />
      </motion.div>

      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <WhyUsSection />
      </motion.div>

      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <ContactSection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <Footer />
      </motion.div>
    </main>
  )
}
