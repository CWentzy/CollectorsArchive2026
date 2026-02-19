import { createContext } from "react"

export interface User {
	email: string
	userName: string
	pictureUrl?: string
}

export interface AuthState {
	user: User | null
	token: string | null
	isAuthenticated: boolean
}

export interface AuthContextValue extends AuthState {
	login: (token: string, user: User) => void
	logout: () => void
	loginPopoverOpened: boolean
	openLoginPopover: () => void
	closeLoginPopover: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
