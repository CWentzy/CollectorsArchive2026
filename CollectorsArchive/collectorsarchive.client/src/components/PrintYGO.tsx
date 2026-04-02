import { Anchor, Flex, Group, Image, Card as MantineCard, Text } from "@mantine/core"
import type { CardInformation, PrintingInformation } from "../types/api"
import { getCardImageUrl } from "../utils"
import { Game } from "./CardSearch/schema"
import QuantityPicker from "./QuantityPicker"

interface PrintYGOProps {
	printInfo: PrintingInformation
	cardInfo?: CardInformation
	withCardLink?: boolean
}

export default function PrintYGO({ printInfo, cardInfo, withCardLink = true }: PrintYGOProps) {
	const releaseDate = printInfo.releaseDate ? new Date(printInfo.releaseDate).toLocaleDateString() : "Unknown"
	const cardImageUrl = cardInfo?.cardID ? getCardImageUrl(Game.ygo, cardInfo?.cardID) : null

	return (
		<MantineCard key={printInfo.printID} padding="md" withBorder>
			<Flex gap="md" justify="space-between" align="center" direction={{ base: "column", sm: "row" }}>
				<Group align="center" wrap="nowrap">
					<Image loading="lazy" src={cardImageUrl} alt={`${cardInfo?.cardName} image`} fit="contain" w={75} />

					<div>
						{withCardLink ? (
							<Anchor href={`/card/${Game.ygo}/${cardInfo?.cardID}`} target="_blank">
								<Text size="sm" fw={600}>
									{cardInfo?.cardName}
								</Text>
							</Anchor>
						) : (
							<Text size="sm" fw={600}>
								{cardInfo?.cardName}
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
					<QuantityPicker printID={printInfo.printID ?? undefined} initialQuantity={printInfo.quantity ?? 0} />
				</Flex>
			</Flex>
		</MantineCard>
	)
}
