import {
	Accordion,
	Box,
	Button,
	Divider,
	Flex,
	Group,
	Image,
	Card as MantineCard,
	Paper,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
	useMantineTheme,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { useMediaQuery } from "@mantine/hooks"
import { DicesIcon, LanguagesIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"
import { useState } from "react"
import AdvancedFilters from "./AdvancedFilters"
import {
	Game,
	SEARCH_QUERY_MAX_LENGTH,
	SEARCH_QUERY_MIN_LENGTH,
	SearchType,
	type Card,
	type SearchResult,
	type Set,
} from "./schema"

const dummyResults: SearchResult[] = [
	{
		type: SearchType.card,
		data: {
			id: "17589298",
			name: "Sword of Dark Rites",
			set: "Force of the Breaker",
			imageUrl: "assets/images/17589298.jpg",
		},
	},
]

interface QuerySectionProps {
	type: SearchType
	onTypeChange: (value: SearchType) => void
	queryProps: React.ComponentPropsWithoutRef<typeof TextInput>
}

function QuerySection({ type, onTypeChange, queryProps }: QuerySectionProps) {
	return (
		<Stack gap={4}>
			{/* min height to avoid layout shift when error shows */}
			<Flex gap="md" align="flex-start" mih={60}>
				<SegmentedControl
					value={type}
					onChange={(value) => onTypeChange(value as SearchType)}
					data={[
						{ label: "Card", value: SearchType.card },
						{ label: "Set", value: SearchType.set },
					]}
					w={150}
				/>
				<TextInput flex={1} placeholder={`Enter ${type} name`} {...queryProps} />
			</Flex>
		</Stack>
	)
}

interface GameSelectorProps {
	game: Game | undefined
	onGameChange: (value: Game) => void
	isMobile?: boolean
}

function GameSelector({ game, onGameChange, isMobile }: GameSelectorProps) {
	const gameOptions = [
		{ label: "All", value: "all" },
		{ label: "Yu-Gi-Oh!", value: Game.ygo },
		{ label: "Magic: The Gathering", value: Game.mtg },
		{ label: "Pokémon", value: Game.pokemon },
	]

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
					value={game === undefined ? "all" : game}
					onChange={(value) => onGameChange(value as Game)}
					data={gameOptions}
					allowDeselect={false}
				/>
			) : (
				<SegmentedControl value={game} onChange={(value) => onGameChange(value as Game)} data={gameOptions} />
			)}
		</Stack>
	)
}

interface LanguageSelectorProps {
	language: string
	onLanguageChange: (value: string) => void
	isMobile?: boolean
}

function LanguageSelector({ language, onLanguageChange, isMobile }: LanguageSelectorProps) {
	const languageOptions = [
		{ label: "English", value: "en" },
		{ label: "French", value: "fr" },
		{ label: "German", value: "de" },
	]

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
					value={language}
					onChange={(value) => onLanguageChange(value as string)}
					data={languageOptions}
					allowDeselect={false}
				/>
			) : (
				<SegmentedControl
					value={language}
					onChange={(value) => onLanguageChange(value as string)}
					data={languageOptions}
				/>
			)}
		</Stack>
	)
}

function AdvancedFiltersSection({ searchType, game }: { searchType: SearchType; game: Game | undefined }) {
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

interface SearchResultsProps {
	results: SearchResult[]
}

function SearchResults({ results }: SearchResultsProps) {
	return (
		<Stack gap="md">
			{results.length === 0 ? (
				<Text c="dimmed">No results to display.</Text>
			) : (
				results.map((result) => {
					if (result.type === SearchType.card) {
						const cardData = result.data as Card

						return (
							<MantineCard key={cardData.id} padding="md" withBorder>
								<Group align="center">
									{cardData.imageUrl && <Image src={cardData.imageUrl} alt={cardData.name} h="100%" w={128} />}
									<div>
										<Text fw={500}>{cardData.name}</Text>
										<Text c="dimmed" size="sm">
											{cardData.set}
										</Text>
									</div>
								</Group>
							</MantineCard>
						)
					} else if (result.type === SearchType.set) {
						const setData = result.data as Set
						return (
							<MantineCard key={setData.id} padding="md" withBorder>
								<Group>
									<div>
										<Text fw={500}>{setData.name}</Text>
										<Text c="dimmed" size="sm">
											Game: {setData.game}
										</Text>
									</div>
								</Group>
							</MantineCard>
						)
					}
				})
			)}
		</Stack>
	)
}

export default function CardSearchForm() {
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`)

	const [accordionValue, setAccordionValue] = useState<string | null>("search")

	const form = useForm({
		mode: "controlled",
		initialValues: {
			query: "" as string,
			searchType: SearchType.card as SearchType,
			game: "all" as Game | undefined,
			language: "en" as string,
		},
		transformValues: (values) => ({
			...values,
			query: values.query?.trim().replace(/\s{2,}/g, " ") || "", // trim, and limit consecutive spaces to 1
		}),
		validate: {
			query: (value) =>
				value.length >= SEARCH_QUERY_MIN_LENGTH && value.length <= SEARCH_QUERY_MAX_LENGTH
					? null
					: `Search term must be between ${SEARCH_QUERY_MIN_LENGTH} and ${SEARCH_QUERY_MAX_LENGTH} characters`,
			searchType: (value) => (Object.values(SearchType).includes(value) ? null : "Invalid search type"),
			game: (value) => (value === undefined || Object.values(Game).includes(value) ? null : "Invalid game selection"),
			language: (value) => (value ? null : "Language is required"),
		},
	})

	const handleSubmit = async (values: typeof form.values) => {
		setAccordionValue(null) // close accordion on mobile after submitting

		console.log("Search submitted with values:", values)
	}

	return (
		<Stack gap="xl" p={0}>
			{/* Search Tool */}
			<Accordion defaultValue={accordionValue} onChange={setAccordionValue} variant="separated">
				<Accordion.Item value="search">
					<Accordion.Control icon={<SearchIcon />}>
						<Text fw={500}>Search Tool</Text>
					</Accordion.Control>
					<Accordion.Panel pt="md" p="xs">
						<form onSubmit={form.onSubmit(handleSubmit)}>
							<Stack>
								<QuerySection
									type={form.values.searchType}
									onTypeChange={(value) => form.setFieldValue("searchType", value)}
									queryProps={form.getInputProps("query")}
								/>

								<GameSelector
									game={form.values.game}
									onGameChange={(value) => form.setFieldValue("game", value)}
									isMobile={isMobile}
								/>

								<LanguageSelector
									language={form.values.language}
									onLanguageChange={(value) => form.setFieldValue("language", value)}
									isMobile={isMobile}
								/>

								<Box mt="lg">
									<AdvancedFiltersSection searchType={form.values.searchType} game={form.values.game} />
								</Box>

								<Group justify="flex-end">
									<Button type="submit">Search</Button>
								</Group>
							</Stack>
						</form>
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>

			<Divider label="Search Results" />

			{/* Search Results */}
			<Paper>
				<SearchResults results={dummyResults} />
			</Paper>
		</Stack>
	)
}
