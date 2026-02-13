import { AppShell, Group, Text, Image } from "@mantine/core"
import { Outlet } from "react-router-dom"

import ourIcon from "./assets/ourLogo.png"

export function Layout() {
	return (
		<AppShell header={{ height: 60 }} padding="md">
			<AppShell.Header>
				<Group justify="center" align="center" gap={12} p="md" bg="#073763">
					<Image
						src={ourIcon}
						style={{
							width: "50px",
							height: "50px",
							objectFit: "contain",
						}}
					/>

					<Text size="xl" c="white">
						Collector's Archive
					</Text>
				</Group>
			</AppShell.Header>

			<AppShell.Main bg="#073763">
				<Outlet />
			</AppShell.Main>
		</AppShell>
	)
}
