import { createFormContext } from "@mantine/form"
import type { CardSearchFormAdvancedFilters } from "./AdvancedFilters"
import type { Game, SearchType } from "./schema"

export interface CardSearchFormValues {
	// General
	query: string
	searchType: SearchType
	game: Game | undefined

	// Game specific
	advancedFilters: CardSearchFormAdvancedFilters
}

export const [CardSearchFormProvider, useCardSearchFormContext, useCardSearchForm] =
	createFormContext<CardSearchFormValues>()
