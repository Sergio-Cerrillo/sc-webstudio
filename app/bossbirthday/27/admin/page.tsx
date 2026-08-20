import type { Metadata } from "next"
import { birthday27 } from "../data"
import { Birthday27Admin } from "./birthday-27-admin"

export const metadata: Metadata = {
  title: "Admin — Boss Birthday 27",
  robots: {
    index: false,
    follow: false,
  },
}

export default function Birthday27AdminPage() {
  return <Birthday27Admin title={birthday27.admin.title} emptyText={birthday27.admin.empty} />
}
