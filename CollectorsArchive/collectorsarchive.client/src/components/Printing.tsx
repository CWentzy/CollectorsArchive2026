import { Anchor, Flex, Group, Image, Card as MantineCard, Text } from "@mantine/core"
import { useState, useEffect } from "react"
import type { CardInformation, PrintingInformation } from "../types/api"
import { getCardImageUrl } from "../utils"
import { GameIDToGame, type GameID } from "./CardSearch/schema"
import QuantityPicker from "./QuantityPicker"

interface PrintingProps {
	printInfo: PrintingInformation
	cardInfo?: CardInformation
	withCardLink?: boolean
}

export default function Printing({ printInfo, cardInfo, withCardLink = true }: PrintingProps) {
	const gameId: GameID = cardInfo?.gameID || printInfo.gameID
	const cardId = cardInfo?.cardID || printInfo.cardID
	const cardName = cardInfo?.cardName || printInfo.cardName || "Unknown Card"
	const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("user"))

	const releaseDate = printInfo.releaseDate ? new Date(printInfo.releaseDate).toLocaleDateString() : "Unknown"
	const cardImageUrl = cardId ? getCardImageUrl(gameId, cardId, cardName) : null
	useEffect(() => {
		const handleAuthChange = () => setIsLoggedIn(!!localStorage.getItem("user"))
		window.addEventListener("authChange", handleAuthChange)
        return () => window.removeEventListener("authChange", handleAuthChange)
	}, [])
	return (
		<MantineCard key={printInfo.printID} padding="md" withBorder>
			<Flex gap="md" justify="space-between" align="center" direction={{ base: "column", sm: "row" }}>
				<Group align="center" wrap="nowrap">
					<Image
						loading="lazy"
						src={cardImageUrl}
						fallbackSrc={`/assets/images/card_placeholder_${GameIDToGame[gameId]}.jpg`}
						alt={`${cardName} image`}
						fit="contain"
						w={75}
					/>

					<div>
						{withCardLink ? (
							<Anchor href={`/card/${GameIDToGame[gameId]}/${cardId}`} target="_blank">
								<Text size="sm" fw={600}>
									{cardName}
								</Text>
							</Anchor>
						) : (
							<Text size="sm" fw={600}>
								{cardName}
							</Text>
						)}

						<Text c="dimmed" size="xs">
							Rarity: <b>{printInfo.rarity}</b>
						</Text>
						<Text c="dimmed" size="xs">
							Set Code: <b>{printInfo.setCode}</b>
						</Text>
						{printInfo.setName && (
							<Text c="dimmed" size="xs">
								Set Name: <b>{printInfo.setName}</b>
							</Text>
						)}
						<Text c="dimmed" size="xs">
							Release Date: <b>{releaseDate}</b>
						</Text>
					</div>
				</Group>

				<Flex direction={{ base: "row", sm: "column" }} justify="center" align="flex-end">
					{isLoggedIn && (
						<QuantityPicker printID={printInfo.printID ?? undefined} initialQuantity={printInfo.quantity ?? 0} />
					)}
				</Flex>
			</Flex>
		</MantineCard>
	)
}
