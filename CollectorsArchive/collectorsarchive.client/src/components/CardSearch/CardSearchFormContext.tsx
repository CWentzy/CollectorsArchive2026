/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				CardSearchFormContext.tsx
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			Defines the context and types for the card search form, including the base form
 * 									values and the provider + hooks to access the form state across components.
 */

import { createFormContext } from "@mantine/form"
import type { Game, SearchType } from "./schema"
import type { YGOFormFilters } from "./ygo/schema"

// Base fields + optional game-specific fields
// If you add a new game, add its filter interface to this intersection. Example: Partial<YGOFormFilters | AnotherGameFormFilters>
export interface CardSearchFormValues extends Partial<YGOFormFilters> {
	query: string
	searchType: SearchType
	game: Game | undefined
}

export const [CardSearchFormProvider, useCardSearchFormContext, useCardSearchForm] =
	createFormContext<CardSearchFormValues>()
