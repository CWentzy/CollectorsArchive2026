import { createTheme, MantineProvider, MantineThemeProvider, type CSSVariablesResolver } from "@mantine/core"
import "@mantine/core/styles.css"
import { Route, Routes } from "react-router-dom"
import "./App.css"
import { Layout } from "./Layout"
import LandingPage from "./pages/LandingPage"
import NotFound from "./pages/NotFound"
import HomePage from "./pages/Home"
import LoginPage from "./pages/LoginPage"

const theme = createTheme({})

const resolver: CSSVariablesResolver = () => ({
	variables: {},
	light: {},
	dark: {},
})

function App() {
	return (
		<MantineThemeProvider theme={theme}>
			<MantineProvider theme={theme} defaultColorScheme="auto" cssVariablesResolver={resolver}>
				<Routes>
					<Route element={<Layout />}>
						<Route path="/" element={<LandingPage/>} />

						{/* to go to home page */}
						<Route path="/HomePage" element={<HomePage/>} />
						<Route path="/LoginPage"element={<LoginPage/>} />


						{/* Should be the last route */}
						<Route path="*" element={<NotFound />} />
					</Route>
				</Routes>
			</MantineProvider>
		</MantineThemeProvider>
	)
}

export default App
