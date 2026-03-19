import { Group, Image, Card as MantineCard, Text } from "@mantine/core"
import type { Card } from "../../types/ygo/schema"
import QuantityPicker from "../QuantityPicker"

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

					<Text c="dimmed" size="xs">
						Print ID: {cardData.printInfo?.id} {/* COME BACK TO THIS ITS THE PRINTID WE SEE IN COMPONENT*/}
					</Text>
				</div>
				<QuantityPicker
					printID={cardData.printInfo?.id ?? undefined}
					onChange={(q) => console.log("quantity changed:", q)}
				/>
			</Group>
		</MantineCard>
	)
}
