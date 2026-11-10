import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, validSession } from "@/lib/proposals/auth"
import { DemoProvider } from "@/components/proposals/demo-provider"

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await validSession((await cookies()).get(SESSION_COOKIE)?.value)))
    redirect("/propuestas/acceso?next=/propuestas/construccions-germans-moya")
  return (
    <div className="proposals-root">
      <DemoProvider>{children}</DemoProvider>
    </div>
  )
}
