import { Box, Button, Combobox, Flex, Grid, Group, Input, Stack, Text, useCombobox, Card, Image } from "@mantine/core"
import { GalleryHorizontalEndIcon, LayoutListIcon, SearchIcon, Users2Icon } from "lucide-react"
import { useState } from "react"
//import { useLocation } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import sampleImage from "../assets/singleCardSample.png"
import CardItem from "../pages/CardItem"

export default function HomePage() {
	// grabbing the data I passed from the login page (username + email).
	// react-router stores that info in "location.state", so this lets me pull it out
	// when the user lands on the homepage.
	const user = JSON.parse(localStorage.getItem("user") || "{}")
	const userName = user.userName
	const navigate = useNavigate()

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
					<Input miw={250} leftSection={<SearchIcon size={16} />} placeholder="Enter card name..." />
					<Button variant="light">Search</Button>
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

				<Grid gutter="lg" justify="center" w="75%">
					{[...Array(12)].map((_, index) => (
						<Grid.Col key={index} span="content">
							<CardItem id={index} navigate={navigate} />
						</Grid.Col>
					))}
				</Grid>
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
			}}
		>
			<Combobox.Target>
				<Button
					variant="default"
					// navigate to SingleCardDisplay when dropdown button is clicked
					onClick={() => navigate("/SingleCardDisplay")}
					style={{ width: 150 }}
				>
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
