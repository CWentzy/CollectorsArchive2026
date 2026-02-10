import { AppShell, Group, Text } from "@mantine/core"
import { Outlet } from "react-router-dom"

export function Layout() {
	return (
		<AppShell header={{ height: 60 }} padding="md">
			<AppShell.Header>
				<Group justify="center" align="center" h="100%">
					<Text>Collector's Archive</Text>
				</Group>
			</AppShell.Header>

			<AppShell.Main>
				{/* Renders the children of <Route element={<Layout />}> in App.tsx */}
				<Outlet />
			</AppShell.Main>
		</AppShell>
	)
}
