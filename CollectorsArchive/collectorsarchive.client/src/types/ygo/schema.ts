// Server response types
export interface CardDetails {
	cardID: string
	name: string
	cardText: string
	superType: string
	subType: string
	attribute?: string
	level?: number
	atk?: number
	def?: number
	pendulumScale?: number
	linkRating?: number
}

export interface PrintDetails {
	printID: number
	setCode: string
	setName: string
	cardRarity: string
	releaseDate: Date
}

export interface DisplayCollectionPrint {
	printID: number
	cardID: string
	cardName: string
	setCode: string
	cardRarity: string
}

// Client-side types
export interface Card {
	id: string
	name: string
	description?: string
	superType?: string
	subType?: string
	attribute?: string
	level?: number
	atk?: number
	def?: number
	pendulumScale?: number
	linkRating?: number
	printInfo?: Print
}

export interface Print {
	id: number
	setCode: string
	setName?: string
	cardRarity: string
	releaseDate?: Date
	imageUrl?: string
}

export interface PrintWithCard {
	print: Print
	card?: Card
}
