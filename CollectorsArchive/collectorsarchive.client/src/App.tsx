import { createTheme, MantineProvider, MantineThemeProvider, type CSSVariablesResolver } from "@mantine/core"
import "@mantine/core/styles.css"
import { Route, Routes } from "react-router-dom"
import "./App.css"
import Home from "./pages/Home"
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
					<Route path="/" element={<Home />} />

					{/* Should be the last route */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</MantineProvider>
		</MantineThemeProvider>
	)
}

export default App
