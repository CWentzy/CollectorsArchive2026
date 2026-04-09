import { AppShell, Avatar, Button, Container, Grid, Group, Modal } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
//import { useMemo } from "react"
import { Outlet } from "react-router-dom"
import { CardScanButton } from "./components/CardScan/CardScanButton"
import { useState, useEffect } from "react"
//import { CardScanOverlay } from "./components/CardScan/CardScanOverlay"
import CardScanOverlay from "./components/CardScan/CardScanOverlay"
import CardSearchButton from "./components/CardSearch/CardSearchButton"
import CreditsFooter from "./components/CreditsFooter"
import Logo from "./components/Logo"
import { ProfilePanel, type UserProfile } from "./components/ProfilePanel"

function ProfileMenu({ user, toggleProfile }: { user: UserProfile; toggleProfile: () => void }) {
	return (
		<Avatar
			src={user.photoUrl}
			style={{ cursor: "pointer" }}
			size="md"
			radius="xl"
			name={user?.userName}
			color="initials"
			onClick={toggleProfile}
		/>
	)
}

export function Layout() {
	const [scanOpened, { open, close }] = useDisclosure(false)
	const [profileOpened, { toggle: toggleProfile, close: closeProfile }] = useDisclosure(false)

	// Re-read user from localStorage whenever the route changes
	//const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), [])
	const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"))

	const isLoggedIn = !!user
	useEffect(() => {
		const handleAuthChange = () => {
			setUser(JSON.parse(localStorage.getItem("user") || "null"))
		}
		window.addEventListener("authChange", handleAuthChange)
		return () => window.removeEventListener("authChange", handleAuthChange)
	}, [])
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
								<CardSearchButton onClick={() => (window.location.href = "/search")} />
							</Group>
						</Grid.Col>

						<Grid.Col span={{ base: "auto", xs: 3, sm: 4, md: "auto" }}>
							{/* Desktop navigation */}
							<Group visibleFrom="sm" gap="xs" justify="flex-end">
								{isLoggedIn ? (
									<ProfileMenu user={user} toggleProfile={toggleProfile} />
								) : (
									<Button component="a" href="/login" variant="default" size="sm">
										Login
									</Button>
								)}
							</Group>
							{/* Mobile navigation this has a bug  */}
							<Group hiddenFrom="sm" gap="xs" justify="flex-end">
								<CardScanButton iconOnly onClick={open} />
								<CardSearchButton iconOnly onClick={() => (window.location.href = "/search")} />
								{isLoggedIn ? (
									<ProfileMenu user={user} toggleProfile={toggleProfile} />
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

				<CreditsFooter />

				<Modal opened={scanOpened} onClose={close} fullScreen withCloseButton={false} keepMounted={false} padding={0}>
					<CardScanOverlay onClose={close} />
				</Modal>
			</AppShell.Main>
		</AppShell>
	)
}
