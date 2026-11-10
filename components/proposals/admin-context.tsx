"use client"
import { createContext, useContext } from "react"
import type { Command, DemoState, Module, Role } from "@/lib/proposals/demo"
import type { Editor, PrintItem } from "./admin-ui"

export type AdminContextValue = {
  state: DemoState
  role: Role
  search: string
  jobFilter: string
  personFilter: string
  statusFilter: string
  nav: (module: Module, filter?: string, jobId?: string) => void
  edit: (editor: Editor) => void
  print: (item: PrintItem) => void
  dispatch: (command: Command) => boolean
}
export const AdminContext = createContext<AdminContextValue | null>(null)
export function useAdmin() {
  const value = useContext(AdminContext)
  if (!value) throw new Error("Missing admin context")
  return value
}
export const matches = (search: string, ...values: unknown[]) =>
  values
    .join(" ")
    .toLocaleLowerCase("es")
    .includes(search.toLocaleLowerCase("es"))
export const options = (values: string[]) =>
  values.map((value) => ({ value, label: value }))
export const selectedOptions = (
  values: { id: string; title?: string; name?: string }[],
) =>
  values.map((row) => ({
    value: row.id,
    label: row.title || row.name || row.id,
  }))
