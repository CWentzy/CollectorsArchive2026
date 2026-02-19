import { useContext } from "react"
import { AuthContext } from "./context"
import type { AuthContextValue } from "./context"

/**
 * Access the current auth session from any component.
 * Returns { user, token, isAuthenticated, login, logout }.
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext)
	if (!context) throw new Error("useAuth must be used within <AuthProvider>")
	return context
}
