/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				CardSearchForm.tsx
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			The main card search form component, which contains the search query input, game selector, advanced filters,
 * 									and search results.
 */

import {
	Accordion,
	Box,
	Button,
	Divider,
	Flex,
	Group,
	JsonInput,
	LoadingOverlay,
	Paper,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
	useMantineTheme,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { DicesIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"
import { useState } from "react"
import { formatCard } from "../../types/mapper"
import type { Card } from "../../types/ygo/schema"
import CardYGO from "../YGO/CardYGO"
import AdvancedFilters from "./AdvancedFilters"
import {
	CardSearchFormProvider,
	useCardSearchForm,
	useCardSearchFormContext,
	type CardSearchFormValues,
} from "./CardSearchFormContext"
import { buildGameValidators, getGameDefaults, getGameFieldKeys } from "./gameFilterConfigs"
import {
	Game,
	SEARCH_QUERY_MAX_LENGTH,
	SEARCH_QUERY_MIN_LENGTH,
	SearchType,
	type CardServerResponse,
	type SearchResult,
} from "./schema"

const gameValidators = buildGameValidators()

const initialFormValues: CardSearchFormValues = {
	query: "" as string,
	searchType: SearchType.set as SearchType,
	game: Game.ygo as Game | undefined,
}

const dummyResult: SearchResult = {
	type: SearchType.card,
	data: [
		{
			id: "17589298",
			name: "Test Card",
			printInfo: {
				id: 0,
				setCode: "Force of the Breaker",
				cardRarity: "Super Rare",
				imageUrl: "assets/images/card_placeholder_ygo.jpg",
			},
		},
	],
}

function QuerySection() {
	const form = useCardSearchFormContext()
	const [searchType, setSearchType] = useState<SearchType>(form.getValues().searchType)

	form.watch("searchType", ({ value }) => setSearchType(value))

	return (
		<Stack gap={4}>
			{/* min height to avoid layout shift when error shows */}
			<Flex gap="md" align="flex-start" mih={60}>
				<SegmentedControl
					key={form.key("searchType")}
					{...form.getInputProps("searchType")}
					data={[
						{ label: "Card", value: SearchType.card },
						{ label: "Set", value: SearchType.set },
					]}
					w={150}
				/>
				<TextInput
					key={form.key("query")}
					{...form.getInputProps("query")}
					flex={1}
					placeholder={`Enter ${searchType} name`}
				/>
			</Flex>
		</Stack>
	)
}

function GameSelector({ isMobile }: { isMobile?: boolean }) {
	const form = useCardSearchFormContext()

	const gameOptions = [
		{ label: "All", value: "all" },
		{ label: "Yu-Gi-Oh!", value: Game.ygo },
		{ label: "Magic: The Gathering", value: Game.mtg },
		{ label: "Pokémon", value: Game.pokemon },
	]

	function handleGameChange(value: string | null) {
		if (!value) return
		const oldGame = form.getValues().game
		const newGame = value === "all" ? undefined : (value as Game)

		// Clear old game's fields
		for (const key of getGameFieldKeys(oldGame)) {
			form.setFieldValue(key, undefined)
		}

		// Set new game and its defaults
		form.setFieldValue("game", newGame as unknown as Game)
		const defaults = getGameDefaults(newGame)
		for (const [key, value] of Object.entries(defaults)) {
			form.setFieldValue(key, value)
		}
	}

	const defaultGame = form.getValues().game ?? undefined

	return (
		<Stack gap={4}>
			<Group gap={4}>
				<ThemeIcon color="bright" variant="transparent" size="xs">
					<DicesIcon />
				</ThemeIcon>
				<Text size="sm" fw={500}>
					Game
				</Text>
			</Group>
			{isMobile ? (
				<Select
					key={form.key("game")}
					defaultValue={defaultGame}
					onChange={handleGameChange}
					error={form.errors.game}
					data={gameOptions}
					allowDeselect={false}
				/>
			) : (
				<SegmentedControl
					key={form.key("game")}
					defaultValue={defaultGame}
					onChange={handleGameChange}
					data={gameOptions}
				/>
			)}
		</Stack>
	)
}

/* function LanguageSelector({ isMobile }: { isMobile?: boolean }) {
	const form = useCardSearchFormContext()

	const languageOptions = Object.values(Language).map((lang) => ({ label: LanguageNames[lang], value: lang }))

	return (
		<Stack gap={4}>
			<Group gap={4}>
				<ThemeIcon color="bright" variant="transparent" size="xs">
					<LanguagesIcon />
				</ThemeIcon>
				<Text size="sm" fw={500}>
					Language
				</Text>
			</Group>
			{isMobile ? (
				<Select
					key={form.key("language")}
					{...form.getInputProps("language")}
					data={languageOptions}
					allowDeselect={false}
				/>
			) : (
				<SegmentedControl key={form.key("language")} {...form.getInputProps("language")} data={languageOptions} />
			)}
		</Stack>
	)
} */

function AdvancedFiltersSection() {
	const form = useCardSearchFormContext()
	const [searchType, setSearchType] = useState<SearchType>(form.getValues().searchType)
	const [game, setGame] = useState<Game | undefined>(form.getValues().game)

	form.watch("searchType", ({ value }) => setSearchType(value))
	form.watch("game", ({ value }) => setGame(value))

	return (
		<Accordion variant="separated">
			<Accordion.Item value="filters">
				<Accordion.Control>
					<Group gap={4}>
						<ThemeIcon color="bright" variant="transparent" size="xs">
							<SlidersHorizontalIcon />
						</ThemeIcon>
						<Text size="sm" fw={500}>
							Advanced Filters
						</Text>
					</Group>
				</Accordion.Control>
				<Accordion.Panel>
					<AdvancedFilters searchType={searchType} game={game} />
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion>
	)
}

interface SearchResultProps {
	result: SearchResult
}

function SearchResult({ result }: SearchResultProps) {
	if (!result || (Array.isArray(result.data) && result.data.length === 0)) {
		return <Text c="dimmed">No results to display.</Text>
	}

	return (
		<Stack gap="md">
			{(result.data as Card[]).map((item) => {
				const cardData = item as Card
				return <CardYGO key={cardData.id} cardData={cardData} />
			})}
		</Stack>
	)
}

export default function CardSearchForm() {
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)

	const [accordionValue, setAccordionValue] = useState<string | null>("search")
	const [searching, setSearching] = useState(false)
	const [searchResult, setSearchResult] = useState<SearchResult>()

	const [debugValues, setDebugValues] = useState<typeof form.values>(initialFormValues) // for debugging - TODO: remove

	const form = useCardSearchForm({
		mode: "uncontrolled",
		initialValues: initialFormValues,
		transformValues: (values) => ({
			...values,
			query: values.query?.trim().replace(/\s{2,}/g, " ") || "", // trim, and limit consecutive spaces to 1
		}),
		validate: {
			query: (value) => {
				if (value.length < SEARCH_QUERY_MIN_LENGTH || value.length > SEARCH_QUERY_MAX_LENGTH) {
					return `Search term must be between ${SEARCH_QUERY_MIN_LENGTH} and ${SEARCH_QUERY_MAX_LENGTH} characters`
				}
				return null
			},
			searchType: (value) => {
				return Object.values(SearchType).includes(value) ? null : "Invalid search type"
			},
			game: (value) => {
				return value === undefined || Object.values(Game).includes(value) ? null : "Invalid game selection"
			},
			...gameValidators,
		},
		onValuesChange: (values) => setDebugValues(values), // for debugging - TODO: remove
	})

	const handleSubmit = async (values: typeof form.values) => {
		try {
			setSearching(true)

			// Search - get from /api/AdvancedSearchSet
			const response = await fetch("https://collectorsarchive.azurewebsites.net/api/CardSearch/AdvancedSearchSet", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					advancedFilters: {}, // TODO: include advanced filters in the request body
					...values,
				}),
			})

			if (!response.ok) {
				throw new Error(`Search failed with status ${response.status}`)
			}

			const cardsList: CardServerResponse[] = await response.json()

			setSearchResult({
				type: SearchType.card,
				data: cardsList.map(formatCard),
			})
		} catch (error) {
			console.error("Error during search:", error)
		} finally {
			setAccordionValue(null) // close accordion after results are shown
			setSearching(false)
		}

		console.log("Search submitted with values:", values)
	}

	return (
		<Stack gap="xl" p={0}>
			<Accordion value={accordionValue} onChange={setAccordionValue} variant="separated">
				<Accordion.Item value="search">
					<Accordion.Control icon={<SearchIcon />}>
						<Text fw={500}>Search Tool</Text>
					</Accordion.Control>
					<Accordion.Panel pt="md" p="xs">
						{/* Search Tool */}
						<CardSearchFormProvider form={form}>
							<form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
								<Stack>
									<QuerySection />

									<GameSelector isMobile={isMobile} />

									<Box mt="lg">
										{/* For debugging - TODO: remove */}
										<div>
											<Text size="xs" c="dimmed" fw={200}>
												Live form values (for debugging):
											</Text>
											<JsonInput value={JSON.stringify(debugValues, null, 2)} readOnly rows={10} />
										</div>

										<AdvancedFiltersSection />
									</Box>

									<Group justify="flex-end">
										<Button type="submit" loading={searching}>
											Search
										</Button>
									</Group>
								</Stack>
							</form>
						</CardSearchFormProvider>
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>

			<Divider label="Search Results" />

			{/* Search Results */}
			<Paper pos="relative">
				<LoadingOverlay visible={searching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
				<SearchResult result={searchResult || dummyResult} />
			</Paper>
		</Stack>
	)
}
