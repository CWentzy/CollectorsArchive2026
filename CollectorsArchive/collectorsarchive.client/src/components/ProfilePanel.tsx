import {
	ActionIcon,
	Avatar,
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Stack,
	Text,
	Transition,
	useMantineColorScheme,
} from "@mantine/core"
import {
	IconCalendar,
	IconEdit,
	IconLayoutList,
	IconLogout,
	IconMoon,
	IconSun,
	IconUsers,
	IconX,
	IconCards,
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"

interface ProfilePanelProps {
	opened: boolean
	onClose: () => void
}

export function ProfilePanel({ opened, onClose }: ProfilePanelProps) {
	const user = JSON.parse(localStorage.getItem("user") || "null")
	const userName = user?.userName ?? "User"
	const email = user?.email ?? ""
	const joinDate = "February 2025"

	const { colorScheme, toggleColorScheme } = useMantineColorScheme()
	const isDark = colorScheme === "dark"
	const navigate = useNavigate()

	const handleLogout = () => {
		localStorage.removeItem("user")
		onClose()
		navigate("/login")
	}

	return (
		<Transition mounted={opened} transition="slide-left" duration={300} timingFunction="ease">
			{(styles) => (
				<Box style={{ ...styles, height: "100%", overflowY: "auto" }}>
					<Stack gap="md" p="lg" h="100%">

						{/* ── Close button ── */}
						<Group justify="flex-end">
							<ActionIcon
								variant="subtle"
								color="gray"
								size="sm"
								onClick={onClose}
								aria-label="Close profile panel"
							>
								<IconX size={16} />
							</ActionIcon>
						</Group>

						{/* ── Avatar + Name ── */}
						<Stack align="center" gap="xs">
							<Avatar
								size={80}
								radius="xl"
								color="spell-green"
								variant="filled"
								style={{
									fontSize: "2rem",
									fontWeight: 600,
									border: "3px solid var(--mantine-color-spell-green-4)",
								}}
							>
								{userName[0]?.toUpperCase()}
							</Avatar>

							<Stack gap={2} align="center">
								<Text fw={600} size="lg" lh={1.2}>
									{userName}
								</Text>
								<Text size="xs" c="dimmed" truncate maw={180}>
									{email}
								</Text>
							</Stack>

							<Badge variant="light" color="spell-green" size="sm" radius="sm">
								Collector
							</Badge>
						</Stack>

						<Divider />

						{/* ── Bio ── */}
						<Stack gap={4}>
							<Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
								Bio
							</Text>
							<Text size="sm" c="dimmed" fs="italic">
								No bio yet — tell the world about your collection!
							</Text>
						</Stack>

						<Divider />

						{/* ── Join Date ── */}
						<Group gap="xs">
							<IconCalendar size={14} color="var(--mantine-color-dimmed)" />
							<Text size="xs" c="dimmed">
								Joined {joinDate}
							</Text>
						</Group>

						{/* ── Edit Button ── */}
						<Button
							variant="light"
							color="spell-green"
							size="xs"
							leftSection={<IconEdit size={14} />}
							disabled
						>
							Edit Profile
						</Button>

						<Divider />

						{/* ── Stats Section ── */}
						<Stack gap={4}>
							<Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
								Stats
							</Text>
						</Stack>

						<Group gap="xs" align="center">
							<IconCards size={14} color="var(--mantine-color-spell-green-5)" />
							<Text size="sm">Cards Collected</Text>
							<Text size="sm" fw={600} ml="auto" c="spell-green">--</Text>
						</Group>

						<Group gap="xs" align="center">
							<IconLayoutList size={14} color="var(--mantine-color-spell-green-5)" />
							<Text size="sm">Card Lists</Text>
							<Text size="sm" fw={600} ml="auto" c="spell-green">--</Text>
						</Group>

						<Group gap="xs" align="center">
							<IconUsers size={14} color="var(--mantine-color-spell-green-5)" />
							<Text size="sm">Friends</Text>
							<Text size="sm" fw={600} ml="auto" c="spell-green">--</Text>
						</Group>

						<Divider />

						{/* ── Theme Toggle ── */}
						<Group justify="space-between" align="center">
							<Text size="sm" c="dimmed">
								{isDark ? "Dark mode" : "Light mode"}
							</Text>
							<ActionIcon
								variant="light"
								color="spell-green"
								size="md"
								onClick={() => toggleColorScheme()}
								aria-label="Toggle colour scheme"
							>
								{isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
							</ActionIcon>
						</Group>

						<Divider />

						{/* ── Logout ── */}
						<Button
							variant="light"
							color="red"
							size="xs"
							leftSection={<IconLogout size={14} />}
							onClick={handleLogout}
							mt="auto"
						>
							Logout
						</Button>

					</Stack>
				</Box>
			)}
		</Transition>
	)
}