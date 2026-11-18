import { RouterProvider } from "react-router"
import { AppProvider } from "../store/AppContext"
import { useAppStore } from "../store/AppContext"
import { AppErrorBoundary } from "./AppErrorBoundary"
import { router } from "./routes"

function AppRoutes() {
  const { resetDemoData } = useAppStore()

  return (
    <AppErrorBoundary resetDemoData={resetDemoData}>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
