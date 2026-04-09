/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				AdvancedFilters.tsx
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			The main advanced filters component, which dynamically renders game-specific
 * 									filter components based on the selected game in the card search form.
 */

import type { Game } from "./schema"
import YGOAdvancedFilters from "./ygo/YGOAdvancedFilters"

interface AdvancedFiltersProps {
	game: Game | undefined
}

export default function AdvancedFilters({ game }: AdvancedFiltersProps) {
	if (game === "ygo") {
		return <YGOAdvancedFilters />
	}

	return null
}
