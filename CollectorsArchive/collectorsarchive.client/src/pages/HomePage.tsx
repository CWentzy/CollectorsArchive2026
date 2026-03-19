import { Box, Button, Center, Combobox, Flex, Group, Loader, Stack, Text, useCombobox } from "@mantine/core"
import { GalleryHorizontalEndIcon, LayoutListIcon, SearchIcon, Users2Icon } from "lucide-react"
import { useEffect, useState } from "react"
//import { useLocation } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import sampleImage from "../assets/singleCardSample.png"
import PrintYGO from "../components/YGO/PrintYGO"
import { formatDisplayCollectionPrint } from "../types/mapper"
import type { Card, DisplayCollectionPrint, Print } from "../types/ygo/schema"
const GET_USER_COLLECTION_URL = "https://collectorsarchive.azurewebsites.net/api/DisplayCollection/DisplayCollection"
//interface CardData {
//	cardID: string
//	cardName: string
//}

interface PrintWithCard {
	print: Print
	card?: Card
}

export default function HomePage() {
	// grabbing the data I passed from the login page (username + email).
	// react-router stores that info in "location.state", so this lets me pull it out
	// when the user lands on the homepage.
	const user = JSON.parse(localStorage.getItem("user") || "{}")
	const userName = user.userName
	const navigate = useNavigate()

	// const [cards, setCards] = useState<CardData[]>([])
	const [prints, setPrints] = useState<PrintWithCard[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

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
				console.log("Backend response:", data) //CHECKING THE BACKEND RESPONSE

				// Cards are nested under "collection" in the response
				const prints: PrintWithCard[] = data.collection.map((print: DisplayCollectionPrint) => {
					const printWithCard: PrintWithCard = {
						print: formatDisplayCollectionPrint(print),
						card: {
							id: print.cardID,
							name: print.cardName,
						},
					}
					return printWithCard
				})

				setPrints(prints)

				console.log("First card:", data.collection[0])
			} catch (err) {
				setError("Could not load cards. Please try again later.")
				console.error(err)
			} finally {
				setLoading(false)
			}
		}

		fetchCollection()
	}, [userName])
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

				{/* Search */}
				<Group align="center" gap="xs" w="100%">
					<Button
						component="a"
						href="/search"
						size="lg"
						variant="light"
						color="green"
						leftSection={<SearchIcon size={18} />}
					>
						{" "}
						Search Page{" "}
					</Button>
				</Group>
			</Stack>

			<Stack gap="xl" mt="xl" align="center">
				<Flex justify="flex-end" align="flex-end" w="100%">
					<DropDownListForSearching navigate={navigate} />
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

				{/* CARD GRID */}

				{loading ? (
					<Center mt="xl">
						<Loader size="lg" />
					</Center>
				) : error ? (
					<Center mt="xl">
						<Text c="red">{error}</Text>
					</Center>
				) : prints.length === 0 ? (
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
					<Stack w="100%">
						{prints.map((print: PrintWithCard) => {
							const printData = print.print
							const cardData = print.card
							return <PrintYGO key={printData.id} printData={printData} cardData={cardData} />
						})}
					</Stack>
				)}
			</Stack>
		</Box>
	)
}

const GameTypes = ["Yu Gi Oh", "Pokémon", "Magic"]

// I am importing this function for user to search game easly, can be with the rarity or alphabets or any other criteria, this can be
// modified later inspired by mantine lool
function DropDownListForSearching({ navigate }: { navigate: any }) {
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	})

	const [value, setValue] = useState<string | null>(null)

	const options = GameTypes.map((item) => (
		<Combobox.Option value={item} key={item}>
			<Group gap="sm">
				<img src={sampleImage} alt={item} style={{ width: 24, height: 24, borderRadius: 4 }} />
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
				navigate("/SingleCardDisplay")
			}}
		>
			<Combobox.Target>
				<Button variant="default" onClick={() => combobox.toggleDropdown()} style={{ width: 150 }}>
					<Group gap="sm">
						{value && <img src={sampleImage} alt={value} style={{ width: 20, height: 20, borderRadius: 4 }} />}
						{value || "Display Games"}
					</Group>
				</Button>
			</Combobox.Target>

			<Combobox.Dropdown>
				<Combobox.Options>{options}</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	)
}
