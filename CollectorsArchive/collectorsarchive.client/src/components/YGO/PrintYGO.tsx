import { Flex, Group, Image, Card as MantineCard, SimpleGrid, Text } from "@mantine/core"
import type { Card, Print } from "../../types/ygo/schema"
import QuantityPicker from "../QuantityPicker"

interface PrintYGOProps {
	printData: Print
	cardData?: Card
	displayName?: boolean
}

export default function PrintYGO({ printData, cardData, displayName }: PrintYGOProps) {
	const imageUrl = printData.imageUrl || "/assets/images/card_placeholder_ygo.jpg"
	const releaseDate = printData.releaseDate ? new Date(printData.releaseDate).toLocaleDateString() : "Unknown"

	return (
		<MantineCard key={printData.id} padding="md" withBorder>
			<SimpleGrid cols={2}>
				<Group align="center">
					{imageUrl && <Image src={imageUrl} w={64} />}

					<div>
						{displayName && cardData?.name ? (
							<Text size="sm" fw={600}>
								{cardData?.name}
							</Text>
						) : (
							<Text size="sm" fw={600}>
								{printData.id}
							</Text>
						)}

						<Text c="dimmed" size="xs">
							{displayName && cardData?.name ? "Print ID: " : ""} <b>{printData.id}</b>
						</Text>
						<Text c="dimmed" size="xs">
							Rarity: <b>{printData.cardRarity}</b>
						</Text>
						<Text c="dimmed" size="xs">
							Set Code: <b>{printData.setCode}</b>
						</Text>
						{printData.setName && (
							<Text c="dimmed" size="xs">
								Set Name: <b>{printData.setName}</b>
							</Text>
						)}
						<Text c="dimmed" size="xs">
							Release Date: <b>{releaseDate}</b>
						</Text>
					</div>
				</Group>

				<Flex direction="column" justify="center" align="flex-end">
					<QuantityPicker printID={printData.id ?? undefined} onChange={(q) => console.log("quantity changed:", q)} />
				</Flex>
			</SimpleGrid>
		</MantineCard>
	)
}
