/*
 * PROGRAMMER:          Hassan Alqhwaizi (8896386)
 * FILENAME:            utils.ts
 * ASSIGNMENT:          PROG3221 - Capstone
 * DESCRIPTION:         Utility functions. Might split it up into multiple files in the future if it
 *                                  gets too big.
 * MODIFIED BY:           Ermiyas Gulti
 */

import { GameID } from "./components/CardSearch/schema"

const CARD_IMAGE_BASE_URLS: Record<GameID, string> = {
	1: import.meta.env.VITE_CARD_IMAGE_URL_YGO,
	2: import.meta.env.VITE_CARD_IMAGE_URL_MTG_A_G,
	3: import.meta.env.VITE_CARD_IMAGE_URL_MTG_H_Z,
	4: import.meta.env.VITE_CARD_IMAGE_URL_POKEMON,
}

export function getCardImageUrl(gameID: GameID, cardID: string, cardName: string): string {
	let baseUrl = CARD_IMAGE_BASE_URLS[gameID]
	if (!baseUrl) return ""

	// So If MTG Card name starts with A-G, use the A-G base URL,
	// otherwise use the H-Z base URL.
	// We have multiple cloudinary accounts to store the images bcos its free tier has a limit of 25k transformations per month, so
	if (gameID === GameID.mtg) {
		const firstLetter = cardName[0].toUpperCase()

		if (firstLetter >= "A" && firstLetter <= "G") {
			baseUrl = import.meta.env.VITE_CARD_IMAGE_URL_MTG_A_G
		} else {
			baseUrl = import.meta.env.VITE_CARD_IMAGE_URL_MTG_H_Z
		}

		return `${baseUrl}/${encodeURIComponent(cardName)}.jpg`
	}

	const unpaddedCardID = cardID.replace(/^0+/, "") // Remove zeroes from the start of the cardID
	const cardIDOrName = gameID === GameID.ygo ? unpaddedCardID : cardName

	return `${baseUrl}/${cardIDOrName}.jpg`
}

export const formatDate = (dateStr: string | null) => {
	if (!dateStr) return "Unknown"
	return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}
