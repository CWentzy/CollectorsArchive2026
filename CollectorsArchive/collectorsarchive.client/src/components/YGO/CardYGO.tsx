import { Anchor, Flex, Group, Image, Card as MantineCard, SimpleGrid, Text } from "@mantine/core"
import type { CardInformation, PrintingInformation } from "../../types/api"
import { Game } from "../CardSearch/schema"
import QuantityPicker from "../QuantityPicker"

interface CardYGOProps {
	cardInfo: CardInformation
	printInfo?: PrintingInformation
}

export default function CardYGO({ cardInfo, printInfo }: CardYGOProps) {
	const imageUrl = "assets/images/card_placeholder_ygo.jpg" // TODO: Should be game-aware

	return (
		<MantineCard key={cardInfo.cardID} padding="md" withBorder>
			<SimpleGrid cols={2}>
				<Group align="center">
					{imageUrl && <Image src={imageUrl} alt={cardInfo.cardName} w={64} />}

					<div>
						<Anchor href={`/card/${Game.ygo}/${cardInfo?.cardID}`} target="_blank">
							<Text fw={500}>{cardInfo.cardName}</Text>
						</Anchor>

						<Text c="dimmed" size="xs">
							{printInfo?.setCode} - Rarity: {printInfo?.rarity}
						</Text>

						<Text c="dimmed" size="xs">
							Print ID: {printInfo?.printID} {/* COME BACK TO THIS ITS THE PRINTID WE SEE IN COMPONENT*/}
						</Text>
					</div>
				</Group>

				<Flex direction="column" justify="center" align="flex-end">
					<QuantityPicker printID={printInfo?.printID ?? undefined} initialQuantity={printInfo?.quantity ?? 0} />
				</Flex>
			</SimpleGrid>
		</MantineCard>
	)
}
