import { GoogleOAuthProvider } from "@react-oauth/google" // this is for using google Aoth

import {
	createTheme,
	lighten,
	MantineProvider,
	MantineThemeProvider,
	type CSSVariablesResolver,
	type MantineColorsTuple,
} from "@mantine/core"
import "@mantine/core/styles.css"
import { useEffect } from "react" // Added for session check
import { Route, Routes, useNavigate } from "react-router-dom" // Added useNavigate
import { Layout } from "./Layout"
import HomePage from "./pages/HomePage"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import MembersPage from "./pages/MembersPage"
import NotFound from "./pages/NotFound"
import ProfilePage from "./pages/ProfilePage"
import SearchPage from "./pages/SearchPage"
import SingleCardDisplay from "./pages/SingleCardDisplay"

const accentColor: MantineColorsTuple = [
	"#e8fcf5",
	"#daf2ea",
	"#b8e2d5",
	"#93d2bd",
	"#74c4aa",
	"#5fbb9d",
	"#53b797",
	"#47ad8c",
	"#368f73",
	"#237c62",
]

const theme = createTheme({
	colors: {
		"spell-green": accentColor,
	},

	primaryColor: "spell-green",
	defaultGradient: { from: "green", to: "spell-green", deg: 45 },
})

const resolver: CSSVariablesResolver = () => ({
	variables: {},
	light: {
		"--mantine-color-body": lighten(accentColor[0], 0.75), // hint of the color
	},
	dark: {},
})

function App() {
	const navigate = useNavigate()

	useEffect(() => {
		const checkLoginStatus = () => {
			const userStr = localStorage.getItem("user")
			if (!userStr) return

			try {
				const user = JSON.parse(userStr)

				// TEST TIME: 1 minute (60,000 ms)
				//const SESSION_DURATION = 1 * 60 * 1000
				const SESSION_DURATION = 12 * 60 * 60 * 1000
				const currentTime = Date.now()

				if (user.loginTime && currentTime - user.loginTime > SESSION_DURATION) {
					console.log("Session expired - auto logging out")
					localStorage.removeItem("user")
					navigate("/login")
				}
			} catch (error) {
				console.error("Error parsing user session:", error)
				localStorage.removeItem("user")
			}
		}

		// Check immediately when app loads
		checkLoginStatus()

		// Check every 5 seconds to catch the expiration exactly
		const interval = setInterval(checkLoginStatus, 5000)

		return () => clearInterval(interval)
	}, [navigate])

	return (
		/* wrapping the whole app with GoogleOAuthProvider so google login works everywhere */
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<MantineThemeProvider theme={theme}>
				<MantineProvider theme={theme} defaultColorScheme="auto" cssVariablesResolver={resolver}>
					<Routes>
						<Route element={<Layout />}>
							{/* TODO: landing and home page should be the same path: / rendered depending on session state */}
							<Route path="/" element={<LandingPage />} />
							<Route path="/home" element={<HomePage />} />

							<Route path="/login" element={<LoginPage />} />
							<Route path="/search" element={<SearchPage />} />
							<Route path="/members" element={<MembersPage />} />
							<Route path="/profile/:userId" element={<ProfilePage />} />

							{/* we need a card id to able to display the exact card this might come from backkkendd  */}
							<Route path="/card/:game/:cardID" element={<SingleCardDisplay />} />
							{/* Should be the last route */}
							<Route path="*" element={<NotFound />} />
						</Route>
					</Routes>
				</MantineProvider>
			</MantineThemeProvider>
		</GoogleOAuthProvider>
	)
}

export default App
