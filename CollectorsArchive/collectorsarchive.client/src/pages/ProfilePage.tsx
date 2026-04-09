import {
	Avatar,
	Badge,
	Box,
	Button,
	Card,
	Divider,
	Flex,
	Group,
	LoadingOverlay,
	Paper,
	ScrollArea,
	Stack,
	Text,
} from "@mantine/core"
import { IconCalendar, IconCards, IconChevronLeft, IconLayoutList } from "@tabler/icons-react"
import { GalleryHorizontalEndIcon, LayoutListIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import CardCollection from "../components/CardCollection"
import CardLists from "../components/Cardlists"
import type { CardsAndPrints, PrintingInformation } from "../types/api"
import { formatDate } from "../utils"

const GET_USER_PROFILE = `${import.meta.env.VITE_SERVER_URL}/api/UserProfile`
const GET_USER_COLLECTION_URL = `${import.meta.env.VITE_SERVER_URL}/api/DisplayCollection/DisplayCollection`

type Member = {
	userId: number
	bio: string | null
	userName: string
	photoUrl: string | null
	joinDate: string | null
}

type Tab = "collection" | "cardlists" //To track which tab is active

export default function ProfilePage() {
	const { userId } = useParams()

	const location = useLocation()
	const navigate = useNavigate()
	//const member = location.state?.member as Member | undefined
	
	const [listsCount, setListsCount] = useState<number | null>(null)
	const [cardAndPrints, setCardAndPrints] = useState<CardsAndPrints | null>(null)
	const [loading, setLoading] = useState(true)
	const [member, setMember] = useState<Member | null>(location.state?.member ?? null)
	const [activeTab, setActiveTab] = useState<Tab>("collection")

	useEffect(() => {
		if (!member?.userId) return
		const fetchListsCount = async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/UserList/GetUserLists?userProfileID=${member.userId}`)
				const data = await res.json()
				setListsCount(data.length)
			} catch (err) {
				console.error(err)
			}
		}
		fetchListsCount()
	}, [member])

	useEffect(() => {
		if (member) return

		const fetchUserProfile = async () => {
			try {
				const response = await fetch(`${GET_USER_PROFILE}/${userId}`)
				if (!response.ok) throw new Error("Failed to fetch user profile")
				const data = await response.json()
				setMember(data)
			} catch (err) {
				console.error(err)
			}
		}

		fetchUserProfile()
	}, [userId, member])

	useEffect(() => {
		const fetchCollection = async () => {
			try {
				const response = await fetch(GET_USER_COLLECTION_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ UserName: member?.userName }),
				})

				if (!response.ok) throw new Error("Failed to fetch collection")

				const data = await response.json()

				const cardsInfo = data.cards
				const printsInfo = data.printings

				setCardAndPrints({ cardsInfo, printsInfo })
			} catch (err) {
				console.error(err)
			} finally {
				setLoading(false)
			}
		}

		fetchCollection()
	}, [member])

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
	const loggedInUser = JSON.parse(localStorage.getItem("user") || "null")
	const isOwner = loggedInUser?.userId === member.userId

	const printsInfo = cardAndPrints?.printsInfo as PrintingInformation[] | undefined // multiple prints

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

						<Card shadow="sm" p={{ base: "md", sm: "xl" }} radius="md">
							<Flex gap={{ base: "md", sm: "lg" }} direction={{ base: "column", sm: "row" }} align="center">
								{/* Avatar */}
								<Avatar src={member.photoUrl} size={90} radius={90} name={member?.userName} color="initials" />

								{/* Name, bio, join date */}
								<Flex direction="column" gap="sm" align={{ base: "center", sm: "flex-start" }}>
									<Flex
										direction={{ base: "column", sm: "row" }}
										rowGap={6}
										columnGap="sm"
										align="center"
										justify={{ base: "center", sm: "flex-start" }}
									>
										<Text fw={700} size="xl" lh={1.2}>
											{member.userName}
										</Text>
										<Badge variant="light" color="spell-green" size="xs" radius="sm">
											Collector
										</Badge>
									</Flex>

									{member.bio && (
										<Text size="sm" c="dimmed" fs="italic" ta={{ base: "center", sm: "left" }}>
											{member.bio}
										</Text>
									)}

									<Flex gap={6} align="center" justify={{ base: "center", sm: "flex-start" }}>
										<IconCalendar size={14} color="var(--mantine-color-dimmed)" />
										<Text size="xs" c="dimmed">
											Joined {formatDate(member.joinDate)}
										</Text>
									</Flex>
								</Flex>

								{/* Stats */}
								<Flex direction="column" gap="xs" ml={{ sm: "auto" }} align="flex-start" mt={{ base: "xs", sm: 0 }}>
									<Group gap="xs">
										<IconCards size={16} color="var(--mantine-color-dimmed)" />
										<Text size="sm">Cards Collected</Text>
										<Text size="sm" fw={700} ml="xs" c="spell-green">
											{printsInfo?.length ?? "—"}
										</Text>
									</Group>

									<Group gap="xs">
										<IconLayoutList size={16} color="var(--mantine-color-dimmed)" />
										<Text size="sm">Card Lists</Text>
										<Text size="sm" fw={700} ml="xs" c="spell-green">
											{listsCount ?? "—"}
										</Text>
									</Group>
								</Flex>
							</Flex>
						</Card>

						<Divider />

						{/* Filter + category buttons */}
						<Stack gap="md">
							{/* <Flex justify="flex-end" w="100%">
						<DropDownListForSearching />
					</Flex> */}
							<Flex justify="flex-start" gap="md" wrap="wrap">
								<Button
									variant={activeTab === "collection" ? "filled" : "light"}
									color="green"
									leftSection={<GalleryHorizontalEndIcon size={16} />}
									onClick={() => setActiveTab("collection")}
								>
									Collection
								</Button>
								<Button
									variant={activeTab === "cardlists" ? "filled" : "light"}
									color="grape"
									leftSection={<LayoutListIcon size={16} />}
									onClick={() => setActiveTab("cardlists")}
								>
									Card Lists
								</Button>
							</Flex>
						</Stack>

						{activeTab === "collection" && (
							<Paper shadow="sm" py="md" px="lg" radius="md" withBorder>
								<Text size="lg" fw={600} mb="md">
									Collection
								</Text>
								<ScrollArea style={{ height: "50vh" }} offsetScrollbars="present" pos="relative">
									<LoadingOverlay
										visible={loading}
										overlayProps={{ radius: "md", blur: 2 }}
										loaderProps={{ type: "dots" }}
									/>
									<CardCollection cardsAndPrints={cardAndPrints} />
								</ScrollArea>
							</Paper>
						)}

				{activeTab === "cardlists" && (
					<CardLists userProfileID={member.userId} isOwner={isOwner} />
				)}
			</Stack>
		</Box>
	)
}