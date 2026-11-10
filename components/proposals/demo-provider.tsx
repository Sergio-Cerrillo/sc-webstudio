"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import {
  DEMO_KEY,
  DEMO_ROLE_KEY,
  initialDemo,
  isDemoState,
  roles,
  transact,
  type Command,
  type DemoState,
  type Role,
} from "@/lib/proposals/demo"

type DemoContext = {
  state: DemoState
  role: Role | null
  ready: boolean
  notice: string
  error: string
  dispatch: (command: Command) => boolean
  login: (role: Role) => void
  logout: () => void
  reset: () => void
}
const Context = createContext<DemoContext | null>(null)
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialDemo)
  const current = useRef(state)
  const [role, setRole] = useState<Role | null>(null)
  const [ready, setReady] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DEMO_KEY)
      if (raw) {
        const saved: unknown = JSON.parse(raw)
        if (!isDemoState(saved)) throw new Error("Formato incompatible")
        setState(saved)
        current.current = saved
      }
      const savedRole = sessionStorage.getItem(DEMO_ROLE_KEY)
      if (roles.includes(savedRole as Role)) setRole(savedRole as Role)
    } catch {
      setError(
        "No se han podido leer los datos guardados. Puedes exportar o restablecer la demo desde Ajustes. Comprueba que el almacenamiento del navegador esté permitido.",
      )
    }
    setReady(true)
    const sync = (event: StorageEvent) => {
      if (event.key !== DEMO_KEY || !event.newValue) return
      try {
        const saved = JSON.parse(event.newValue)
        if (isDemoState(saved)) {
          current.current = saved
          setState(saved)
        }
      } catch {
        /* Ignore partial writes from other tabs. */
      }
    }
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(""), 6000)
    return () => clearTimeout(timer)
  }, [notice])
  const save = useCallback((next: DemoState) => {
    localStorage.setItem(DEMO_KEY, JSON.stringify(next))
    current.current = next
    setState(next)
    setError("")
  }, [])
  const dispatch = useCallback(
    (command: Command) => {
      try {
        // Read the latest snapshot to preserve actions made in another tab.
        const raw = localStorage.getItem(DEMO_KEY)
        const saved = raw ? JSON.parse(raw) : current.current
        const next = transact(
          isDemoState(saved) ? saved : current.current,
          command,
          role,
        )
        save(next)
        setNotice(next.activity[0].text)
        return true
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "No se puede guardar. Revisa el espacio disponible del navegador.",
        )
        return false
      }
    },
    [role, save],
  )
  const login = (value: Role) => {
    try {
      sessionStorage.setItem(DEMO_ROLE_KEY, value)
      setRole(value)
      setError("")
    } catch {
      setError(
        "Permite el almacenamiento de sesión para usar el administrador.",
      )
    }
  }
  const logout = () => {
    sessionStorage.removeItem(DEMO_ROLE_KEY)
    setRole(null)
  }
  const reset = () => {
    if (role !== "Dirección" && role !== "Administración") return
    try {
      save(initialDemo())
      setNotice("Demo restablecida a sus datos iniciales.")
    } catch {
      setError("No se puede restablecer el almacenamiento.")
    }
  }
  return (
    <Context.Provider
      value={{
        state,
        role,
        ready,
        notice,
        error,
        dispatch,
        login,
        logout,
        reset,
      }}
    >
      {children}
      {notice && (
        <div className="demo-toast" role="status">
          ✓ {notice}
        </div>
      )}
      {error && (
        <div className="demo-toast demo-toast-error" role="alert">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  )
}
export function useDemo() {
  const value = useContext(Context)
  if (!value) throw new Error("Missing DemoProvider")
  return value
}
