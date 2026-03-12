/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				mapper.ts
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			Defines mapping functions to convert server response data into client-side types
 * 									used across the card search components.
 */

import type { Card, CardServerResponse } from "./schema"

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
