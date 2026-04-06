/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				schema.ts
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			Defines the types, interfaces, and constants used across card search
 * 									components.
 */

import type { CardInformation, PrintingInformation } from "../../types/api"

export const SEARCH_QUERY_MIN_LENGTH = 3
export const SEARCH_QUERY_MAX_LENGTH = 100

export const SearchType = {
	card: "card",
	set: "set",
} as const

export type SearchType = (typeof SearchType)[keyof typeof SearchType]

// Game
export const Game = {
	ygo: "ygo",
	mtg: "mtg",
	pokemon: "pokemon",
} as const

export const GameID: Record<Game, number> = {
	ygo: 1,
	mtg: 2,
	pokemon: 3,
}

export const GameIDToGame: Record<number, Game> = {
	1: "ygo",
	2: "mtg",
	3: "pokemon",
}

export type Game = (typeof Game)[keyof typeof Game]
export type GameID = (typeof GameID)[keyof typeof GameID]

export const GameToID = (game: Game): GameID => GameID[game]
export const GameToFriendlyName: Record<Game, string> = {
	ygo: "Yu-Gi-Oh!",
	mtg: "Magic: The Gathering",
	pokemon: "Pokémon",
}

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
	cardInfo: CardInformation | CardInformation[]
	printInfo?: PrintingInformation | PrintingInformation[]
}
