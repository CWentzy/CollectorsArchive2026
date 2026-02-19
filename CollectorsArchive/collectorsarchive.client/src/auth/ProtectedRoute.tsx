import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./useAuth"

/**
 * Wrap protected routes with this component.
 * Redirects to / if the user is not authenticated.
 */
export function ProtectedRoute() {
	const { isAuthenticated } = useAuth()
	return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}
