/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				AdvancedFilters.tsx
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			The main advanced filters component, which dynamically renders game-specific
 * 									filter components based on the selected game in the card search form.
 */

import { Text } from "@mantine/core"
import type { Game, SearchType } from "./schema"
import YGOAdvancedFilters from "./ygo/YGOAdvancedFilters"

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
