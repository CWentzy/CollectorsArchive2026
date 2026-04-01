import {
	Box,
	Button,
	Center,
	Combobox,
	Flex,
	Group,
	Loader,
	LoadingOverlay,
	Paper,
	ScrollArea,
	Stack,
	Text,
	useCombobox,
} from "@mantine/core"
import { GalleryHorizontalEndIcon, LayoutListIcon } from "lucide-react"
import { useEffect, useState } from "react"
import CardCollection from "../components/CardCollection"
import CardLists from "../components/Cardlists"
import type { CardsAndPrints, PrintingInformation } from "../types/api"

const GET_USER_COLLECTION_URL = `${import.meta.env.VITE_SERVER_URL}/api/DisplayCollection/DisplayCollection`

type Tab = "collection" | "cardlists"
export default function HomePage() {
	// grabbing the data I passed from the login page (username + email).
	// react-router stores that info in "location.state", so this lets me pull it out
	// when the user lands on the homepage.
	const user = JSON.parse(localStorage.getItem("user") || "{}")
	const userName = user.userName

	const [cardAndPrints, setCardAndPrints] = useState<CardsAndPrints | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [activeTab, setActiveTab] = useState<Tab>("collection")

	useEffect(() => {
		if (!userName) {
			setError("No user found. Please log in.")
			setLoading(false)
			return
		}

		const fetchCollection = async () => {
			try {
				const response = await fetch(GET_USER_COLLECTION_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ UserName: userName }),
				})

				if (!response.ok) throw new Error("Failed to fetch collection")

				const data = await response.json()

				const cardsInfo = data.cards
				const printsInfo = data.printings

				setCardAndPrints({ cardsInfo, printsInfo })
			} catch (err) {
				setError("Could not load cards. Please try again later.")
				console.error(err)
			} finally {
				setLoading(false)
			}
		}

		fetchCollection()
	}, [userName])

	const printsInfo = cardAndPrints?.printsInfo as PrintingInformation[] | undefined // multiple prints

	return (
		<Box mih="100vh" w="100%" py="md">
			{/* this box is for header part  */}
			<Stack gap="xs">
				{/* the name and logo goes here */}
				{/* I have deleted the logo and text from here */}

				{/* this is for welcome text and user name is a place holder variable  */}
				<Text fz="xl" fw={400}>
					Welcome{userName ? `, ${userName}` : ""}!
				</Text>
			</Stack>

			<Stack gap="xl" mt="xl" align="center">
				<Flex justify="flex-end" align="flex-end" w="100%">
					<DropDownListForSearching />
				</Flex>

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

				{/* CARD GRID */}
				{activeTab === "collection" && (
					<>
						{loading ? (
							<Center mt="xl">
								<Loader size="lg" />
							</Center>
						) : error ? (
							<Center mt="xl">
								<Text c="red">{error}</Text>
							</Center>
						) : !printsInfo?.length ? (
							<Center mt="xl">
								<Text c="dimmed">No cards found in your collection.</Text>
							</Center>
						) : (
							//<Grid gutter="lg" justify="center" w="75%">
							//	{cards.map((card) => (
							//		<Grid.Col key={card.cardID} span="content">
							//			<CardItem id={card.cardID} name={card.cardName} navigate={navigate} />
							//		</Grid.Col>
							//	))}
							//</Grid>

							/* Collection */
							<Paper py="md" px="lg" w="100%" radius="md" withBorder>
								<Text size="lg" fw={600} mb="md">
									My Collection
								</Text>

								<ScrollArea style={{ height: "100vh" }} offsetScrollbars pos="relative">
									<LoadingOverlay
										visible={loading}
										overlayProps={{ radius: "md", blur: 2 }}
										loaderProps={{ type: "dots" }}
									/>
									<CardCollection cardsAndPrints={cardAndPrints} />
								</ScrollArea>
							</Paper>
						)}
					</>
				)}
				{activeTab === "cardlists" && (
					<Box w="100%">
						<CardLists />
					</Box>
				)}
			</Stack>
		</Box>
	)
}

const GameTypes = ["Yu Gi Oh", "Pokémon", "Magic"]

// I am importing this function for user to search game easly, can be with the rarity or alphabets or any other criteria, this can be
// modified later inspired by mantine lool
function DropDownListForSearching() {
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	})

	const [value, setValue] = useState<string | null>(null)

	const options = GameTypes.map((item) => (
		<Combobox.Option value={item} key={item}>
			<Group gap="sm">
				<Text>{item}</Text>
			</Group>
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
				<Button onClick={() => combobox.toggleDropdown()} disabled>
					{value || "Display Games"}
				</Button>
			</Combobox.Target>

			<Combobox.Dropdown>
				<Combobox.Options>{options}</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	)
}
