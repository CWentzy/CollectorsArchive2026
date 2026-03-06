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

export interface Card {
	id: string
	name: string
	set: string
	imageUrl?: string
}

export interface Set {
	id: string
	name: string
	game: Game
}

export interface SearchResult {
	type: SearchType
	data: Card | Set
}
