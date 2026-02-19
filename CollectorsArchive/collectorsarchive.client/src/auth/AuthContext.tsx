import { useCallback, useReducer, useState, type ReactNode } from "react"
import { AuthContext, type AuthContextValue, type AuthState, type User } from "./context"

const TOKEN_KEY = "ca_token"
const USER_KEY = "ca_user"

type AuthAction = { type: "LOGIN"; payload: { token: string; user: User } } | { type: "LOGOUT" }

function authReducer(state: AuthState, action: AuthAction): AuthState {
	switch (action.type) {
		case "LOGIN":
			return { user: action.payload.user, token: action.payload.token, isAuthenticated: true }
		case "LOGOUT":
			return { user: null, token: null, isAuthenticated: false }
		default:
			return state
	}
}

function getInitialState(): AuthState {
	try {
		const token = localStorage.getItem(TOKEN_KEY)
		const userRaw = localStorage.getItem(USER_KEY)
		if (token && userRaw) {
			const user = JSON.parse(userRaw) as User
			return { user, token, isAuthenticated: true }
		}
	} catch {
		// Empty or corrupted storage
	}
	return { user: null, token: null, isAuthenticated: false }
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(authReducer, undefined, getInitialState)

	const login = useCallback((token: string, user: User) => {
		localStorage.setItem(TOKEN_KEY, token)
		localStorage.setItem(USER_KEY, JSON.stringify(user))
		dispatch({ type: "LOGIN", payload: { token, user } })
	}, [])

	const logout = useCallback(() => {
		localStorage.removeItem(TOKEN_KEY)
		localStorage.removeItem(USER_KEY)
		dispatch({ type: "LOGOUT" })
	}, [])

	const [loginPopoverOpened, setLoginPopoverOpened] = useState(false)
	const openLoginPopover = useCallback(() => setLoginPopoverOpened(true), [])
	const closeLoginPopover = useCallback(() => setLoginPopoverOpened(false), [])

	const value: AuthContextValue = { ...state, login, logout, loginPopoverOpened, openLoginPopover, closeLoginPopover }

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
