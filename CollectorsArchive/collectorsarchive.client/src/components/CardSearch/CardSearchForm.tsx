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
	Flex,
	Group,
	LoadingOverlay,
	Pagination,
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
import { SearchIcon, SlidersHorizontalIcon } from "lucide-react"
import { memo, useCallback, useMemo, useState } from "react"
import type { CardInformation, CardsAndPrints, PrintingInformation } from "../../types/api"
import CardCollection from "../CardCollection"
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
	GameToFriendlyName,
	GameToID,
	SEARCH_QUERY_MAX_LENGTH,
	SEARCH_QUERY_MIN_LENGTH,
	SearchType,
} from "./schema"

const CARD_SEARCH_ENDPOINT = `${import.meta.env.VITE_SERVER_URL}/api/CardSearch/AdvancedSearchCard`
const SET_SEARCH_ENDPOINT = `${import.meta.env.VITE_SERVER_URL}/api/CardSearch/AdvancedSearchSet`
const RESULTS_PER_PAGE = 12

const gameValidators = buildGameValidators()

const initialFormValues: CardSearchFormValues = {
	query: "" as string,
	searchType: SearchType.set as SearchType,
	game: Game.ygo as Game | undefined,
}

function QuerySection({ isMobile }: { isMobile?: boolean }) {
	const form = useCardSearchFormContext()
	const [searchType, setSearchType] = useState<SearchType>(form.getValues().searchType)
	const handleSearchTypeWatch = useCallback(({ value }: { value: SearchType }) => {
		setSearchType(value)
	}, [])

	form.watch("searchType", handleSearchTypeWatch)

	return (
		<Stack gap={4} w="100%">
			{/* min height to avoid layout shift when error shows */}
			<Flex gap={isMobile ? "xs" : "md"} align="flex-start">
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
		{ label: "All Games", value: "all" },
		{ label: GameToFriendlyName[Game.ygo], value: Game.ygo },
		{ label: GameToFriendlyName[Game.mtg], value: Game.mtg },
		{ label: GameToFriendlyName[Game.pokemon], value: Game.pokemon },
	]

	function handleGameChange(value: string | null) {
		if (!value) return
		const oldGame = form.getValues().game
		const newGame = value === "all" ? undefined : (value as Game)
		const currentValues = form.getValues()

		const clearedFieldValues = Object.fromEntries(
			getGameFieldKeys(oldGame).map((key) => [key, undefined])
		) as Partial<CardSearchFormValues>
		const defaults = getGameDefaults(newGame)

		form.setValues({
			...currentValues,
			...clearedFieldValues,
			game: newGame,
			...defaults,
		})
	}

	const defaultGame = form.getValues().game ?? "all"

	return (
		<>
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
		</>
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

function AdvancedFiltersSection({
	accordionValue,
	onChange,
}: {
	accordionValue: string | null
	onChange: (value: string | null) => void
}) {
	const form = useCardSearchFormContext()
	const [searchType, setSearchType] = useState<SearchType>(form.getValues().searchType)
	const [game, setGame] = useState<Game | undefined>(form.getValues().game)

	const handleSearchTypeWatch = useCallback(({ value }: { value: SearchType }) => {
		setSearchType(value)
	}, [])
	const handleGameWatch = useCallback(({ value }: { value: Game | undefined }) => {
		setGame(value)
	}, [])

	form.watch("searchType", handleSearchTypeWatch)
	form.watch("game", handleGameWatch)

	return (
		<Accordion variant="separated" value={accordionValue} onChange={onChange} radius="md">
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
	cardsAndPrints: CardsAndPrints | null
}

function normalizeToArray<T>(value: T | T[] | undefined): T[] {
	if (!value) return []
	return Array.isArray(value) ? value : [value]
}

function getUniqueCards(cards: CardInformation[]): CardInformation[] {
	const cardIds = new Set<string>()
	const uniqueCards: CardInformation[] = []

	for (const card of cards) {
		if (cardIds.has(card.cardID)) continue
		cardIds.add(card.cardID)
		uniqueCards.push(card)
	}

	return uniqueCards
}

const SearchResult = memo(function SearchResult({ cardsAndPrints }: SearchResultProps) {
	const [activePage, setActivePage] = useState(1)
	const cards = useMemo(() => normalizeToArray<CardInformation>(cardsAndPrints?.cardsInfo), [cardsAndPrints?.cardsInfo])
	const prints = useMemo(
		() => normalizeToArray<PrintingInformation>(cardsAndPrints?.printsInfo),
		[cardsAndPrints?.printsInfo]
	)
	const uniqueCards = useMemo(() => getUniqueCards(cards), [cards])

	if (!cardsAndPrints) {
		return null
	}

	const totalPages = Math.max(1, Math.ceil(uniqueCards.length / RESULTS_PER_PAGE))
	const currentPage = Math.min(activePage, totalPages)
	const startIndex = (currentPage - 1) * RESULTS_PER_PAGE
	const paginatedCards = uniqueCards.slice(startIndex, startIndex + RESULTS_PER_PAGE)
	const visibleCardIds = new Set(paginatedCards.map((card) => card.cardID))
	const paginatedPrints = prints.filter((print) => print.cardID && visibleCardIds.has(print.cardID))

	if (uniqueCards.length === 0) {
		return <Text c="dimmed">No results found. Try adjusting your search or filters.</Text>
	}

	return (
		<Paper shadow="sm" py="md" px="lg" radius="md" withBorder>
			<Group justify="space-between" align="center" mb="md">
				<Text size="lg" fw={600}>
					Search Results
				</Text>
				<Text size="sm" c="dimmed">
					{uniqueCards.length} {uniqueCards.length === 1 ? "card" : "cards"} found
				</Text>
			</Group>

			<CardCollection
				cardsAndPrints={{
					cardsInfo: paginatedCards,
					printsInfo: paginatedPrints,
				}}
			/>

			{totalPages > 1 ? (
				<Group justify="space-between" mt="lg">
					<Text size="sm" c="dimmed">
						Showing {startIndex + 1}-{Math.min(startIndex + paginatedCards.length, uniqueCards.length)} of{" "}
						{uniqueCards.length} cards
					</Text>
					<Pagination value={currentPage} onChange={setActivePage} total={totalPages} />
				</Group>
			) : null}
		</Paper>
	)
})

export default function CardSearchForm() {
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)

	const [accordionValue, setAccordionValue] = useState<string | null>(null) // closed by default
	const [searching, setSearching] = useState(false)
	const [cardAndPrints, setCardAndPrints] = useState<CardsAndPrints | null>(null)
	const [searchResultKey, setSearchResultKey] = useState(0)

	const form = useCardSearchForm({
		mode: "uncontrolled",
		initialValues: initialFormValues,
		transformValues: (values) => ({
			...values,
			query: values.query?.trim().replace(/\s{2,}/g, " ") || "", // trim, and limit consecutive spaces to 1
		}),
		validate: {
			query: (value) => {
				// Card search can have empty query
				if (form.getValues().searchType === SearchType.card) return null

				// Set search requires a query
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
	})

	const handleSubmit = async (values: typeof form.values) => {
		try {
			setSearching(true)

			const payload = JSON.stringify({
				// The API expects the following body
				GameID: GameToID(values.game as Game) || 0, // send 0 for "all" since API expects that
				Query: values.query,
				SearchType: values.searchType,
				AdvancedFilters: {}, // TODO: include advanced filters in the request body
			})

			const endpoint = values.searchType === SearchType.card ? CARD_SEARCH_ENDPOINT : SET_SEARCH_ENDPOINT
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: payload,
			})

			console.log("Search submitted with payload:", payload)

			if (!response.ok) {
				throw new Error(`${values.searchType} search failed with status ${response.status}`)
			}

			const data = await response.json()

			const cardsInfo = data.cards || []
			const printsInfo = data.printings || []

			setCardAndPrints({ cardsInfo, printsInfo })
			setSearchResultKey((prev) => prev + 1)
		} catch (error) {
			console.error("Error during search:", error)
		} finally {
			setAccordionValue(null) // close accordion after results are shown
			setSearching(false)
		}
	}

	return (
		<Stack gap="xl" p={0}>
			<CardSearchFormProvider form={form}>
				<form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
					<Stack gap="sm" p={0}>
						<Stack>
							<Stack gap={6}>
								<Text size="xs" fw={600} c="dimmed">
									1. SELECT GAME
								</Text>
								<GameSelector isMobile={isMobile} />
							</Stack>

							<Stack gap={6}>
								<Text size="xs" fw={600} c="dimmed">
									2. APPLY FILTERS
								</Text>
								<AdvancedFiltersSection accordionValue={accordionValue} onChange={setAccordionValue} />
							</Stack>

							<Stack gap={6}>
								<Text size="xs" fw={600} c="dimmed">
									3. ENTER SEARCH QUERY
								</Text>

								<Flex gap="md" align="flex-start">
									<Box flex={1}>
										<QuerySection isMobile={isMobile} />
									</Box>

									<Button type="submit" loading={searching}>
										{isMobile ? <SearchIcon size={16} /> : "Search"}
									</Button>
								</Flex>
							</Stack>
						</Stack>
					</Stack>
				</form>
			</CardSearchFormProvider>

			{/* Search Results */}
			<Paper pos="relative">
				<LoadingOverlay visible={searching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
				<SearchResult key={searchResultKey} cardsAndPrints={cardAndPrints} />
			</Paper>
		</Stack>
	)
}
