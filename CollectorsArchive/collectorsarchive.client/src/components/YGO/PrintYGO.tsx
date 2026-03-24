import { Anchor, Flex, Group, Card as MantineCard, SimpleGrid, Text } from "@mantine/core"
import type { CardInformation, PrintingInformation } from "../../types/api"
import { Game } from "../CardSearch/schema"
import QuantityPicker from "../QuantityPicker"

interface PrintYGOProps {
	printInfo: PrintingInformation
	cardInfo?: CardInformation
	withCardLink?: boolean
}

export default function PrintYGO({ printInfo, cardInfo, withCardLink = true }: PrintYGOProps) {
	const releaseDate = printInfo.releaseDate ? new Date(printInfo.releaseDate).toLocaleDateString() : "Unknown"

	return (
		<MantineCard key={printInfo.printID} padding="md" withBorder>
			<SimpleGrid cols={2}>
				<Group align="center">
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

				<Flex direction="column" justify="center" align="flex-end">
					<QuantityPicker printID={printInfo.printID ?? undefined} initialQuantity={printInfo.quantity ?? 0} />
				</Flex>
			</SimpleGrid>
		</MantineCard>
	)
}
