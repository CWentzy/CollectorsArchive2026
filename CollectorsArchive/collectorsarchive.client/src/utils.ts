/*
 * PROGRAMMER:			Hassan Alqhwaizi (8896386)
 * FILENAME:				utils.ts
 * ASSIGNMENT:			PROG3221 - Capstone
 * DESCRIPTION:			Utility functions. Might split it up into multiple files in the future if it
 * 									gets too big.
 */

export function getCardImageUrl(gameID: string, cardID: string): string {
	const unpaddedCardID = cardID.replace(/^0+/, "") // Remove zeroes from the start of the cardID
	return `${import.meta.env.VITE_CARD_IMAGE_URL_YGO}/${unpaddedCardID}.jpg`
}

export const formatDate = (dateStr: string | null) => {
	if (!dateStr) return "Unknown"
	return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}
