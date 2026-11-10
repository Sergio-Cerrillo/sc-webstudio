import type { Metadata } from "next"
import { MoyaLanding } from "@/components/proposals/moya-landing"
export const metadata: Metadata = {
  title: "Construccions Germans Moya · Propuesta",
}
export default function MoyaPage() {
  return <MoyaLanding />
}
