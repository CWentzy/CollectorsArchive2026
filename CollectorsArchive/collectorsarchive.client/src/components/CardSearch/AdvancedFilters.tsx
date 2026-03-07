import { Text } from "@mantine/core"
import type { Game, SearchType } from "./schema"
import YGOAdvancedFilters from "./ygo/YGOAdvancedFilters"
import type { YGOFormFilters } from "./ygo/schema"

export type CardSearchFormAdvancedFilters = YGOFormFilters // just to keep it clean when we add more games

interface AdvancedFiltersProps {
	searchType: SearchType
	game: Game | undefined
}

export default function AdvancedFilters({ searchType, game }: AdvancedFiltersProps) {
	if (game === "ygo") {
		return <YGOAdvancedFilters />
	}

	return (
		<Text c="dimmed" size="sm">
			Advanced filtering options to search by '{searchType}' in game '{game}' will go here.
		</Text>
	)
}
