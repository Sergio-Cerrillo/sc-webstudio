import type { Metadata } from "next"
import { MoyaAdmin } from "@/components/proposals/moya-admin"
export const metadata: Metadata = { title: "Gestión Germans Moya · Demo" }
export default function AdminPage() {
  return <MoyaAdmin />
}
