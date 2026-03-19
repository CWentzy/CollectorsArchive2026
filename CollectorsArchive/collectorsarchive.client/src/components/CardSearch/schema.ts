/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				schema.ts
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			Defines the types, interfaces, and constants used across card search
 * 									components.
 */

import type { Card } from "../../types/ygo/schema"

export const SEARCH_QUERY_MIN_LENGTH = 3
export const SEARCH_QUERY_MAX_LENGTH = 100

export const SearchType = {
	card: "card",
	set: "set",
} as const

export type SearchType = (typeof SearchType)[keyof typeof SearchType]

export const Game = {
	ygo: "ygo",
	mtg: "mtg",
	pokemon: "pokemon",
} as const

export type Game = (typeof Game)[keyof typeof Game]

export const Language = {
	en: "en",
	fr: "fr",
	de: "de",
	it: "it",
	pt: "pt",
} as const

export type Language = (typeof Language)[keyof typeof Language]

export const LanguageNames: Record<Language, string> = {
	en: "English",
	fr: "French",
	de: "German",
	it: "Italian",
	pt: "Portuguese",
}

// Server response types
export interface CardServerResponse {
	cardID: string
	cardName: string
	printInfo: {
		printID: number
		setCode: string
		cardRarity: string
	}
}

// Client-side types
export interface Set {
	id: string
	name: string
	game: Game
}

export interface SearchResult {
	type: SearchType
	data: Card | Card[]
}
