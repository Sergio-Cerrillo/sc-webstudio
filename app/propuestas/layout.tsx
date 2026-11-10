import type { Metadata } from "next"
import "./proposals.css"
import "./studio-proposals.css"
import "./moya-opening.css"
import "./moya-wall-opening.css"
import "./moya-cinematic.css"
import "./moya-navigation.css"

export const metadata: Metadata = {
  title: {
    default: "Propuestas privadas · SC WebStudio",
    template: "%s · Propuestas",
  },
  description: "Presentación privada de propuestas. Entorno de demostración.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export default function ProposalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
