import { createTheme, MantineProvider, MantineThemeProvider, type CSSVariablesResolver } from "@mantine/core"
import "@mantine/core/styles.css"
import "./App.css"

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
				Collector's Archive
			</MantineProvider>
		</MantineThemeProvider>
	)
}

export default App
