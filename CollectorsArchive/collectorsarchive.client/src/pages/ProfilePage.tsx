import {
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	Combobox,
	Divider,
	Flex,
	Grid,
	Group,
	Select,
	Skeleton,
	Stack,
	Text,
	useCombobox,
} from "@mantine/core"
import { IconCalendar, IconCards, IconChevronLeft, IconLayoutList, IconUsers } from "@tabler/icons-react"
import { GalleryHorizontalEndIcon, LayoutListIcon, Users2Icon } from "lucide-react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

type Member = {
	userId: number
	userName: string
	photoUrl: string | null
	joinDate: string | null
}

const formatDate = (dateStr: string | null) => {
	if (!dateStr) return "Unknown"
	return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export default function MemberProfilePage() {
	const location = useLocation()
	const navigate = useNavigate()
	const member = location.state?.member as Member | undefined

	// If someone navigates here directly without state, show a fallback
	if (!member) {
		return (
			<Box mih="100vh" w="100%" py="md" px="xl">
				<Stack gap="md">
					<Button
						variant="subtle"
						color="gray"
						size="xs"
						leftSection={<IconChevronLeft size={14} />}
						onClick={() => navigate("/members")}
						w="fit-content"
					>
						Back to Members
					</Button>
					<Text c="dimmed">Member not found.</Text>
				</Stack>
			</Box>
		)
	}

	return (
		<Box mih="100vh" w="100%" py="md" px="xl">
			<Stack gap="xl">

				{/* Back button */}
				<Button
					variant="subtle"
					color="gray"
					size="xs"
					leftSection={<IconChevronLeft size={14} />}
					onClick={() => navigate("/members")}
					w="fit-content"
				>
					Back to Members
				</Button>

				{/* Profile header */}
				<Card shadow="sm" padding="xl" radius="md" withBorder>
					<Group align="flex-start" gap="xl" wrap="wrap">

						{/* Avatar */}
						<Avatar
							src={member.photoUrl ?? undefined}
							size={90}
							radius="xl"
							color="spell-green"
							variant="filled"
							style={{
								fontSize: "2.2rem",
								fontWeight: 700,
								flexShrink: 0,
								border: "3px solid var(--mantine-color-spell-green-4)",
							}}
						>
							{!member.photoUrl && member.userName[0]?.toUpperCase()}
						</Avatar>

						{/* Name, bio, join date */}
						<Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
							<Group gap="sm" align="center">
								<Text fw={700} size="xl" lh={1.2}>
									{member.userName}
								</Text>
								<Badge variant="light" color="spell-green" size="sm" radius="sm">
									Collector
								</Badge>
							</Group>

							<Text size="sm" c="dimmed" fs="italic">
								No bio yet.
							</Text>

							<Group gap="xs" mt={2}>
								<IconCalendar size={13} color="var(--mantine-color-dimmed)" />
								<Text size="xs" c="dimmed">
									Joined {formatDate(member.joinDate)}
								</Text>
							</Group>
						</Stack>

						{/* Stats */}
						<Stack gap="xs" style={{ flexShrink: 0 }}>
							<Group gap="xs">
								<IconCards size={14} color="var(--mantine-color-spell-green-5)" />
								<Text size="sm">Cards Collected</Text>
								<Text size="sm" fw={700} ml="xs" c="spell-green">--</Text>
							</Group>
							<Group gap="xs">
								<IconLayoutList size={14} color="var(--mantine-color-spell-green-5)" />
								<Text size="sm">Card Lists</Text>
								<Text size="sm" fw={700} ml="xs" c="spell-green">--</Text>
							</Group>
							<Group gap="xs">
								<IconUsers size={14} color="var(--mantine-color-spell-green-5)" />
								<Text size="sm">Friends</Text>
								<Text size="sm" fw={700} ml="xs" c="spell-green">--</Text>
							</Group>
						</Stack>

					</Group>
				</Card>

				<Divider />

				{/* Filter + category buttons */}
				<Stack gap="md">
					<Flex justify="flex-end" w="100%">
						<DropDownListForSearching />
					</Flex>
					<Flex justify="flex-start" gap="md" wrap="wrap">
						<Button variant="light" color="green" leftSection={<GalleryHorizontalEndIcon size={16} />}>
							Collected Cards
						</Button>
						<Button variant="light" color="grape" leftSection={<LayoutListIcon size={16} />}>
							Card Lists
						</Button>
						<Button variant="light" color="pink" leftSection={<Users2Icon size={16} />}>
							Friends
						</Button>
					</Flex>
				</Stack>

				{/* Card grid */}
				<Grid gutter="lg" justify="center" w="75%" mx="auto">
					{[...Array(8)].map((_, i) => (
						<Grid.Col key={i} span="content">
							<Skeleton height={250} w={200} radius="md" animate />
						</Grid.Col>
					))}
				</Grid>

			</Stack>
		</Box>
	)
}

const GameTypes = ["Yu Gi Oh", "Pokémon", "Magic"]

function DropDownListForSearching() {
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	})
	const [value, setValue] = useState<string | null>(null)
	const options = GameTypes.map((item) => (
		<Combobox.Option value={item} key={item}>
			{item}
		</Combobox.Option>
	))
	return (
		<Combobox
			store={combobox}
			onOptionSubmit={(val) => {
				setValue(val)
				combobox.closeDropdown()
			}}
		>
			<Combobox.Target>
				<Select
					miw={150}
					component="button"
					type="button"
					pointer
					rightSection={<Combobox.Chevron />}
					rightSectionPointerEvents="none"
					onClick={() => combobox.toggleDropdown()}
				>
					{value || "Display Games"}
				</Select>
			</Combobox.Target>
			<Combobox.Dropdown>
				<Combobox.Options>{options}</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	)
}