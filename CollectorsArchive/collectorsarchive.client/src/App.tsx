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
import { Route, Routes } from "react-router-dom"
import { AuthProvider } from "./auth/AuthContext"
import { ProtectedRoute } from "./auth/ProtectedRoute"
import { Layout } from "./Layout"
import HomePage from "./pages/HomePage"
import LandingPage from "./pages/LandingPage"
import NotFound from "./pages/NotFound"

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
		"--mantine-color-body": lighten(accentColor[0], 0.75), // tiny hint of the color
	},
	dark: {},
})

function App() {
	return (
		/* wrapping the whole app with GoogleOAuthProvider so google login works everywhere */
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<MantineThemeProvider theme={theme}>
				<MantineProvider theme={theme} defaultColorScheme="auto" cssVariablesResolver={resolver}>
					<AuthProvider>
						<Routes>
							<Route element={<Layout />}>
								<Route path="/" element={<LandingPage />} />

								{/* Protected routes. Redirects to / if not authenticated */}
								<Route element={<ProtectedRoute />}>
									<Route path="/home" element={<HomePage />} />
								</Route>

								{/* Should be the last route */}
								<Route path="*" element={<NotFound />} />
							</Route>
						</Routes>
					</AuthProvider>
				</MantineProvider>
			</MantineThemeProvider>
		</GoogleOAuthProvider>
	)
}

export default App
