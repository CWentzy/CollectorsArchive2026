// Card DTOs (Data Transfer Objects)
export interface CardInformation {
	gameID: number
	cardID: string
	cardName: string
	cardText?: string

	// Generic object containing all of the additional card information depending on the game
	cardAttributes?: YGOCard | MTGCard
}

export interface YGOCard {
	superType: string
	subType: string

	// Monster specific attributes
	attribute?: string
	classifications?: string[]

	level?: string
	attack?: string
	defense?: string

	pendulumScale?: string
	linkRating?: string
}

export interface MTGCard {
	superType?: string
	subTypes?: string[]

	manaCost?: string
	type?: string

	// Creature specific attributes
	power?: string
	toughness?: string
}

// Printing DTOs (Data Transfer Objects)
export interface PrintingInformation {
	gameID: number
	printID: string
	cardSetID: string
	setName: string
	setCode: string
	rarity: string
	releaseDate: Date

	// Redundant Card Information
	cardID?: string
	cardName?: string

	// Information about a specific user
	userID?: number
	quantity?: number
}

// Other
export interface CardsAndPrints {
	cardsInfo: CardInformation | CardInformation[]
	printsInfo: PrintingInformation | PrintingInformation[]
}
