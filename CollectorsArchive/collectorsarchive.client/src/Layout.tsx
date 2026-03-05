import { AppShell, Avatar, Button, Container, Grid, Group, Menu, Modal, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconLogout, IconUser } from "@tabler/icons-react"
import { Outlet, useNavigate } from "react-router-dom"
import { CardScanButton } from "./components/CardScan/CardScanButton"
import { CardScanOverlay } from "./components/CardScan/CardScanOverlay"
import Logo from "./components/Logo"
import { ProfilePanel } from "./components/ProfilePanel"

export function Layout() {
	const [scanOpened, { open, close }] = useDisclosure(false)
	const [profileOpened, { toggle: toggleProfile, close: closeProfile }] = useDisclosure(false)
	const navigate = useNavigate()

	// Check login state
	const user = JSON.parse(localStorage.getItem("user") || "null")
	const isLoggedIn = !!user

	// Logout handler
	const handleLogout = () => {
		localStorage.removeItem("user")
		closeProfile()
		navigate("/login")
	}
	const ProfileMenu = () => (
		<Menu shadow="md" width={160} position="bottom-end" withArrow>
			<Menu.Target>
				{/*For now we are just using the first letter of the username as avatar, but we can replace it with actual profile picture in the future*/}
				<Avatar
					style={{ cursor: "pointer" }}
					size="sm"
					radius="xl"
					color="spell-green"
					variant="filled"
				>
					{user?.userName?.[0]?.toUpperCase() ?? <IconUser size={16} />}
				</Avatar>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Label>
					<Text size="xs" c="dimmed" truncate>
						{user?.userName}
					</Text>
				</Menu.Label>
				<Menu.Item
					leftSection={<IconUser size={14} />}
					onClick={toggleProfile}
				>
					Profile
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item
					leftSection={<IconLogout size={14} />}
					color="red"
					onClick={handleLogout}
				>
					Logout
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	)
	return (
		<AppShell header={{ height: 60 }}
			aside={{ //aside config, collapses when profileOpened is false
				width: 260,
				breakpoint: "sm",
				collapsed: { desktop: !profileOpened, mobile: !profileOpened },
			}}
			padding="md">
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
							{/* Mobile navigation */}
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
