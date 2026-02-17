import { createTheme, MantineProvider, MantineThemeProvider, type CSSVariablesResolver } from "@mantine/core"
import "@mantine/core/styles.css"
import { Route, Routes } from "react-router-dom"
import "./App.css"
import { Layout } from "./Layout"
import LandingPage from "./pages/LandingPage"
import NotFound from "./pages/NotFound"
import HomePage from "./pages/Home"
import LoginPage from "./pages/LoginPage"
//import RegisterPage from "./pages/RegisterPage"
import { GoogleOAuthProvider } from "@react-oauth/google" // importing this To add Google sign-in to our code

const theme = createTheme({})

const resolver: CSSVariablesResolver = () => ({
	variables: {},
	light: {},
	dark: {},
})

function App() {
	return (
		// we need to  provide the client ID that you got from Google and wrap this code withwith GoogleOAuthProvider
		<GoogleOAuthProvider clientId="887271318818-l8omtrnmumbkr0tc4ssu031qkbii4t8i.apps.googleusercontent.com">
			<MantineThemeProvider theme={theme}>
				<MantineProvider theme={theme} defaultColorScheme="auto" cssVariablesResolver={resolver}>
					<Routes>
						<Route element={<Layout />}>
							<Route path="/" element={<LandingPage />} />

							{/* to go to home page */}
							<Route path="/HomePage" element={<HomePage />} />
							<Route path="/LoginPage" element={<LoginPage />} />
							{/*<Route path="/RegisterPage" element={<RegisterPage />} />*/}

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
