import { AppShell, Avatar, Button, Container, Grid, Group, Modal } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconUser } from "@tabler/icons-react"
import { Outlet } from "react-router-dom"
import { CardScanButton } from "./components/CardScan/CardScanButton"
//import { CardScanOverlay } from "./components/CardScan/CardScanOverlay"
import CardScanOverlay from "./components/CardScan/CardScanOverlay"
import Logo from "./components/Logo"
import { ProfilePanel } from "./components/ProfilePanel"

export function Layout() {
	const [scanOpened, { open, close }] = useDisclosure(false)
	const [profileOpened, { toggle: toggleProfile, close: closeProfile }] = useDisclosure(false)

	// Check login state
	const user = JSON.parse(localStorage.getItem("user") || "null")
	const isLoggedIn = !!user

	const ProfileMenu = () => (
		<Avatar
			style={{ cursor: "pointer" }}
			size="sm"
			radius="xl"
			color="spell-green"
			variant="filled"
			onClick={toggleProfile}
		>
			{/*Profile URL can be viewwed on the header now as well*/}
			{!user?.photoUrl && (user?.userName?.[0]?.toUpperCase() ?? <IconUser size={16} />)}
		</Avatar>
	)

	return (
		<AppShell
			header={{ height: 60 }}
			aside={{
				//aside config, collapses when profileOpened is false
				width: 260,
				breakpoint: "sm",
				collapsed: { desktop: !profileOpened, mobile: !profileOpened },
			}}
			padding="md"
		>
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
								{isLoggedIn ? (
									<ProfileMenu />
								) : (
									<Button component="a" href="/login" variant="default" size="sm">
										Login
									</Button>
								)}
							</Group>
							{/* Mobile navigation this has a bug  */}
							<Group hiddenFrom="sm" gap="xs" justify="flex-end">
								<CardScanButton onClick={open} iconOnly />
								{isLoggedIn ? (
									<ProfileMenu />
								) : (
									<Button component="a" href="/login" variant="default" size="sm">
										Login
									</Button>
								)}
							</Group>
						</Grid.Col>
					</Grid>
				</Container>
			</AppShell.Header>

			<AppShell.Aside p={0} withBorder>
				<ProfilePanel opened={profileOpened} onClose={closeProfile} />
			</AppShell.Aside>

			<AppShell.Main>
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
