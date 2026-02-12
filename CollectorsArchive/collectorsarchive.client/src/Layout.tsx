import { AppShell, Button, Group } from "@mantine/core"
import { Outlet } from "react-router-dom"
import Logo from "./components/Logo"

export function Layout() {
	return (
		<AppShell header={{ height: 60 }} padding="md">
			<AppShell.Header>
				<Group justify="space-between" h="100%" px="md">
					<Logo />

					<Group>
						<Button component="a" href="/login" variant="default" size="sm">
							Login
						</Button>
					</Group>
				</Group>
			</AppShell.Header>

			<AppShell.Main>
				{/* Renders the children of <Route element={<Layout />}> in App.tsx */}
				<Outlet />
			</AppShell.Main>
		</AppShell>
	)
}
