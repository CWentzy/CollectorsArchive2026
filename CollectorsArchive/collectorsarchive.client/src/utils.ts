/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				utils.ts
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			Utility functions. Might split it up into multiple files in the future if it
 * 									gets too big.
 */

import { GameID } from "./components/CardSearch/schema"

const CARD_IMAGE_BASE_URLS: Record<GameID, string> = {
	1: import.meta.env.VITE_CARD_IMAGE_URL_YGO,
	2: import.meta.env.VITE_CARD_IMAGE_URL_MTG,
	3: import.meta.env.VITE_CARD_IMAGE_URL_POKEMON,
}

export function getCardImageUrl(gameID: GameID, cardID: string, cardName: string): string {
	const baseUrl = CARD_IMAGE_BASE_URLS[gameID]
	if (!baseUrl) return ""

	const unpaddedCardID = cardID.replace(/^0+/, "") // Remove zeroes from the start of the cardID
	const cardIDOrName = gameID === GameID.ygo ? unpaddedCardID : cardName

	return `${baseUrl}/${cardIDOrName}.jpg`
}

export const formatDate = (dateStr: string | null) => {
	if (!dateStr) return "Unknown"
	return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}
