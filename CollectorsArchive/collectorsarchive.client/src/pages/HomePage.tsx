import {
	Box,
	Button,
	Combobox,
	Flex,
	Grid,
	Group,
	Input,
	Select,
	Skeleton,
	Stack,
	Text,
	useCombobox,
} from "@mantine/core"
import { GalleryHorizontalEndIcon, LayoutListIcon, SearchIcon, Users2Icon } from "lucide-react"
import { useState } from "react"
import { useLocation } from "react-router-dom"

export default function HomePage() {
	// grabbing the data I passed from the login page (username + email).
	// react-router stores that info in "location.state", so this lets me pull it out
	// when the user lands on the homepage.
	const location = useLocation()
	const userName = location.state?.userName

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

				{/* CARD GRID */}
				<Grid gutter="lg" justify="center" w="75%">
					{[...Array(8)].map((_, index) => (
						<Grid.Col key={index} span="content">
							<Skeleton height={250} w={200} radius="md" animate />
						</Grid.Col>
					))}
				</Grid>
			</Stack>
		</Box>
	)
}

const GameTypes = ["Yu Gi Oh", "Pokémon", "Magic"]

// I am importing this function for user to search game easly, can be with the rarity or alphabets or any other criteria, this can be
// modified later inspiredd by mantine lool
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
					{value || <Input.Placeholder>Display Games</Input.Placeholder>}
				</Select>
			</Combobox.Target>

			<Combobox.Dropdown>
				<Combobox.Options>{options}</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	)
}
