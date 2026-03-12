import { Group, Image, Card as MantineCard, Text } from "@mantine/core"
import type { Card } from "../CardSearch/schema"

interface CardYGOProps {
	cardData: Card
}

export default function CardYGO({ cardData }: CardYGOProps) {
	const imageUrl = cardData.printInfo?.imageUrl || "assets/images/card_placeholder_ygo.jpg" // TODO: Should be game-aware

	return (
		<MantineCard key={cardData.id} padding="md" withBorder>
			<Group align="center">
				{imageUrl && <Image src={imageUrl} alt={cardData.name} h="100%" w={128} />}
				<div>
					<Text fw={500}>{cardData.name}</Text>
					<Text c="dimmed" size="xs">
						{cardData.printInfo?.setCode} - Rarity: {cardData.printInfo?.cardRarity}
					</Text>
				</div>
			</Group>
		</MantineCard>
	)
}
