import { createTheme, MantineProvider, MantineThemeProvider, type CSSVariablesResolver } from "@mantine/core"
import "@mantine/core/styles.css"
import { Route, Routes } from "react-router-dom"
import "./App.css"
import { Layout } from "./Layout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

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
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />

						{/* Should be the last route */}
						<Route path="*" element={<NotFound />} />
					</Route>
				</Routes>
			</MantineProvider>
		</MantineThemeProvider>
	)
}

export default App
