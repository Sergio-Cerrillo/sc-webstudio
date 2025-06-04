import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import ServicesSection from "@/components/services-section"
import ProjectsSection from "@/components/projects-section"
import WhyUsSection from "@/components/why-us-section"
import ContactSection from "@/components/contact-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Header />
      <HeroSection />
      <ServicesSection />
      <ProjectsSection />
      <WhyUsSection />
      <Footer />
    </main>
  )
}
