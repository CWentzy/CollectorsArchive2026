/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				mapper.ts
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			Defines mapping functions to convert server response data into client-side types
 * 									used across the card search components.
 */

import type { CardServerResponse } from "../components/CardSearch/schema"
import type { Card, CardDetails, DisplayCollectionPrint, Print, PrintDetails } from "./ygo/schema"

/*
 * Formats the server-side Card json object to the client-side Card type.
 */
export const formatCard = (data: CardServerResponse): Card => ({
	id: data.cardID,
	name: data.cardName,
	printInfo: {
		id: data.printInfo.printID,
		setCode: data.printInfo.setCode,
		cardRarity: data.printInfo.cardRarity,
	},
})

export const formatPrintingDetails = (data: PrintDetails): Print => ({
	id: data.printID,
	setCode: data.setCode,
	setName: data.setName,
	cardRarity: data.cardRarity,
	releaseDate: data.releaseDate,
})

export const formatCardDetails = (data: CardDetails): Card => ({
	id: data.cardID,
	name: data.name,
	description: data.cardText,
	superType: data.superType,
	subType: data.subType,
	attribute: data.attribute,
	level: data.level,
	atk: data.atk,
	def: data.def,
	pendulumScale: data.pendulumScale,
	linkRating: data.linkRating,
})

export const formatDisplayCollectionPrint = (data: DisplayCollectionPrint): Print => ({
	id: data.printID,
	setCode: data.setCode,
	cardRarity: data.cardRarity,
})
