import { Anchor, Flex, Group, Image, Card as MantineCard, SimpleGrid, Text } from "@mantine/core"
import type { Card } from "../../types/ygo/schema"
import QuantityPicker from "../QuantityPicker"

interface CardYGOProps {
	cardData: Card
}

export default function CardYGO({ cardData }: CardYGOProps) {
	const imageUrl = cardData.printInfo?.imageUrl || "assets/images/card_placeholder_ygo.jpg" // TODO: Should be game-aware

	return (
		<MantineCard key={cardData.id} padding="md" withBorder>
			<SimpleGrid cols={2}>
				<Group align="center">
					{imageUrl && <Image src={imageUrl} alt={cardData.name} w={64} />}

					<div>
						<Anchor href={`/card/${cardData?.id}`} target="_blank">
							<Text fw={500}>{cardData.name}</Text>
						</Anchor>

						<Text c="dimmed" size="xs">
							{cardData.printInfo?.setCode} - Rarity: {cardData.printInfo?.cardRarity}
						</Text>

						<Text c="dimmed" size="xs">
							Print ID: {cardData.printInfo?.id} {/* COME BACK TO THIS ITS THE PRINTID WE SEE IN COMPONENT*/}
						</Text>
					</div>
				</Group>

				<Flex direction="column" justify="center" align="flex-end">
					<QuantityPicker
						printID={cardData.printInfo?.id ?? undefined}
						onChange={(q) => console.log("quantity changed:", q)}
					/>
				</Flex>
			</SimpleGrid>
		</MantineCard>
	)
}
