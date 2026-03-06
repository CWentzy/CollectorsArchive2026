import { Text } from "@mantine/core"
import type { Game, SearchType } from "./schema"

interface AdvancedFiltersProps {
	searchType: SearchType
	game: Game | undefined
}

export default function AdvancedFilters({ searchType, game }: AdvancedFiltersProps) {
	return (
		<Text c="dimmed" size="sm">
			Advanced filtering options to search by '{searchType}' in game '{game}' will go here.
		</Text>
	)
}
