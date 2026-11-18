import type { ReactNode } from "react"
import { Navigate } from "react-router"
import { useAppStore } from "../store/AppContext"

export function RequireAuth({ children }: { children: ReactNode }) {
  const { data } = useAppStore()
  return data.loggedIn ? children : <Navigate to="/landing" replace />
}

export function PublicOnly({ children }: { children: ReactNode }) {
  const { data } = useAppStore()
  return data.loggedIn ? <Navigate to="/" replace /> : children
}

export function RouteFallback() {
  const { data } = useAppStore()
  return <Navigate to={data.loggedIn ? "/" : "/landing"} replace />
}
