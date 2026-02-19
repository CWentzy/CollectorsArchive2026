import { AppShell, Container, Grid, Group, Modal } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Outlet } from "react-router-dom"
import UserButton from "./components/Auth/UserButton"
import { CardScanButton } from "./components/CardScan/CardScanButton"
import { CardScanOverlay } from "./components/CardScan/CardScanOverlay"
import Logo from "./components/Logo"

export function Layout() {
	const [scanOpened, { open, close }] = useDisclosure(false)

	return (
		<AppShell header={{ height: 60 }} padding="md">
			<AppShell.Header>
				<Container size="xl" py="xs">
					<Grid justify="space-between" align="center">
						<Grid.Col span={{ base: "content", sm: 4, md: "auto" }}>
							<Group wrap="nowrap">
								<Logo />
							</Group>
						</Grid.Col>

						{/* Mobile Scan Button */}
						<Grid.Col span="content" visibleFrom="sm">
							<Group justify="center" align="center">
								<CardScanButton onClick={open} />
							</Group>
						</Grid.Col>

						<Grid.Col span={{ base: "auto", xs: 3, sm: 4, md: "auto" }}>
							{/* Desktop navigation */}
							<Group visibleFrom="sm" gap="xs" justify="flex-end">
								<UserButton />
							</Group>
							<Group hiddenFrom="sm" gap="xs" justify="flex-end">
								<CardScanButton onClick={open} iconOnly />
								<UserButton />
							</Group>
						</Grid.Col>
					</Grid>
				</Container>
			</AppShell.Header>

			<AppShell.Main>
				{/* Renders the children of <Route element={<Layout />}> in App.tsx */}
				<Container size="xl">
					<Outlet />
				</Container>

				<Modal opened={scanOpened} onClose={close} fullScreen withCloseButton={false} keepMounted={false} padding={0}>
					<CardScanOverlay onClose={close} />
				</Modal>
			</AppShell.Main>
		</AppShell>
	)
}
