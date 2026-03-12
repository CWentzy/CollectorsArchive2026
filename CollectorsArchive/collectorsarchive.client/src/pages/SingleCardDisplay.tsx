import { useEffect, useState } from "react"
import {
	Box,
	Card,
	Image,
	Text,
	Button,
	Stack,
	Group,
	Grid,
	Badge,
	Divider,
	Title,
	UnstyledButton,
	Loader,
	Center,
} from "@mantine/core"
import { IconChevronLeft, IconInfoCircle, IconTimeline, IconCards } from "@tabler/icons-react"

import sampleImage from "assets\images\card_placeholder_ygo.jpg"

const GET_USER_COLLECTION_URL = "https://collectorsarchive.azurewebsites.net/api/DisplayCollection"
//import { Link } from "react-router-dom"

interface CardItem {
	id: string
	name: string
	// TODO: Add more fields here when backend returns them -- imageUrl, rarity, type, attribute
}
//COLELCTION GRID VIEW

export default function UserCollection() {
	const [cards, setCards] = useState<CardItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [selectedCard, setSelectedCard] = useState<CardItem | null>(null)

	// Read username from localStorage (set during login)
	const storedUser = localStorage.getItem("user")
	const userName = storedUser ? JSON.parse(storedUser).userName : null

	useEffect(() => {
		if (!userName) {
			setError("No user found. Please log in.")
			setLoading(false)
			return
		}

		const fetchCollection = async () => {
			try {
				const response = await fetch(`${GET_USER_COLLECTION_URL}/${userName}`)

				if (!response.ok) throw new Error("Failed to fetch collection")

				const data: CardItem[] = await response.json()
				setCards(data)
			} catch (err) {
				setError("Could not load your collection. Please try again later.")
				console.error(err)
			} finally {
				setLoading(false)
			}
		}

		fetchCollection()
	}, [userName])

	// If a card is selected, show the detail view
	if (selectedCard) {
		return (
			<SingleCardDetail
				card={selectedCard}
				onBack={() => setSelectedCard(null)}
			/>
		)
	}

	if (loading) {
		return (
			<Center h="100vh">
				<Loader size="lg" />
			</Center>
		)
	}

	if (error) {
		return (
			<Center h="100vh">
				<Text c="red">{error}</Text>
			</Center>
		)
	}

	if (cards.length === 0) {
		return (
			<Center h="100vh">
				<Text c="dimmed">Your collection is empty. Start adding cards!</Text>
			</Center>
		)
	}

	return (
		<Box bg="gray.0" style={{ minHeight: "100vh" }} p="xl">
			<Title order={2} mb="xl">
				{userName}'s Collection
			</Title>

			{/* 4 columns x 3 rows grid */}
			<Grid gutter="lg">
				{cards.map((card) => (
					<Grid.Col key={card.id} span={{ base: 6, sm: 4, md: 3 }}>
						<Card
							shadow="sm"
							radius="md"
							padding="sm"
							withBorder
							style={{ cursor: "pointer" }}
							onClick={() => setSelectedCard(card)}
						>
							{/* TODO: Replace sampleImage with card.imageUrl once backend provides it
								Change to: <Image src={card.imageUrl} alt={card.name} ... />
							*/}
							<Image src={sampleImage} alt={card.name} radius="sm" fit="contain" h={200} />

							{/* Card name from backend */}
							<Text fw={600} size="sm" ta="center" mt="xs" lineClamp={1}>
								{card.name}
							</Text>

							{/* TODO: Uncomment when backend returns rarity
							<Badge size="xs" variant="dot" color="yellow" mt={4}>
								{card.rarity}
							</Badge> */}
						</Card>
					</Grid.Col>
				))}
			</Grid>
		</Box>
	)
}

// ─────────────────────────────────────────────
// SINGLE CARD DETAIL VIEW
// ─────────────────────────────────────────────
function SingleCardDetail({
	card,
	onBack,
}: {
	card: CardItem
	onBack: () => void
}) {
	// TODO: Once backend returns full card details by ID, fetch them here using card.id
	// e.g. GET /api/Cards/{card.id} → replace the placeholder values below with real data

	return (
		<Box bg="gray.0" style={{ minHeight: "100vh" }}>
			<Box maw={1100} mx="auto" p="xl">
				{/* Back to collection */}
				<UnstyledButton mb="xl" onClick={onBack}>
					<Group gap={4} c="dimmed">
						<IconChevronLeft size={16} />
						<Text size="sm" fw={600}>
							Back to Collection
						</Text>
					</Group>
				</UnstyledButton>

				<Grid gutter={40}>
					{/* Card Image Column */}
					<Grid.Col span={{ base: 12, md: 5 }}>
						<Card
							shadow="xl"
							radius="lg"
							p="xl"
							bg="white"
							style={{
								border: "1px solid var(--mantine-color-gray-2)",
								top: "2rem",
								position: "sticky",
							}}
						>
							{/* TODO: Replace sampleImage with real card image once backend provides it */}
							<Image src={sampleImage} alt={card.name} radius="md" fit="contain" h={520} />
						</Card>
					</Grid.Col>

					{/* Details Column */}
					<Grid.Col span={{ base: 12, md: 7 }}>
						<Stack gap="xl">
							{/* Header — name comes from backend, rest is placeholder for now */}
							<Box>
								<Title order={1} fz={44} fw={900} lts={-1.5} lh={1}>
									{card.name}
								</Title>
								<Group mt="md" gap="xs">
									{/* TODO: Replace placeholder badges with real data from backend */}
									<Badge variant="dot" size="lg" color="blue">
										Type TBD
									</Badge>
									<Badge variant="dot" size="lg" color="orange">
										Attribute TBD
									</Badge>
									<Badge variant="gradient" gradient={{ from: "yellow", to: "orange", deg: 45 }} size="lg">
										Rarity TBD
									</Badge>
								</Group>
							</Box>

							<Divider />

							{/* Description — placeholder until backend returns it */}
							<Stack gap="xs">
								<Group gap="xs" c="dimmed">
									<IconInfoCircle size={18} />
									<Text fw={700} size="xs" tt="uppercase" lts={1}>
										Description
									</Text>
								</Group>
								{/* TODO: Replace with real description from backend */}
								<Text size="lg" lh={1.6} c="dimmed">
									No description available yet.
								</Text>
							</Stack>

							{/* Printing Info — placeholder */}
							<Stack gap="xs">
								<Group gap="xs" c="dimmed">
									<IconTimeline size={18} />
									<Text fw={700} size="xs" tt="uppercase" lts={1}>
										Printing Information
									</Text>
								</Group>
								{/* TODO: Replace with real printing info from backend */}
								<Text size="md" c="dark.3">
									No printing information available yet.
								</Text>
							</Stack>

							{/* Card Specifications Grid — placeholder */}
							<Card withBorder radius="lg" p="xl" shadow="sm">
								<Group gap="xs" mb="lg">
									<IconCards size={20} />
									<Text fw={800} size="sm" tt="uppercase" lts={0.5}>
										Card Specifications
									</Text>
								</Group>

								<Grid gutter={30}>
									{[
										{ label: "Type", value: "TBD" },
										{ label: "Attribute", value: "TBD" },
										{ label: "Rarity", value: "TBD" },
										{ label: "Release Date", value: "TBD" },
										// TODO: Replace all "TBD" values with real fields from backend
									].map((item) => (
										<Grid.Col span={6} key={item.label}>
											<Text size="xs" c="dimmed" fw={700} tt="uppercase" mb={4}>
												{item.label}
											</Text>
											<Text fw={600} size="md">
												{item.value}
											</Text>
										</Grid.Col>
									))}
								</Grid>
							</Card>

							<Group justify="space-between" grow>
								<Button size="xl" radius="md" h={60} fz="md" variant="filled" color="green">
									Add to Your Collection
								</Button>
								<Button size="xl" radius="md" h={60} fz="md" variant="filled" color="green">
									Add to Wishlist
								</Button>
							</Group>
						</Stack>
					</Grid.Col>
				</Grid>
			</Box>
		</Box>
	)
}