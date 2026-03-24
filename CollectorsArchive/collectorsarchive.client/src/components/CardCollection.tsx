import { Accordion, Badge, Group, Stack, Text } from "@mantine/core"
import type { CardInformation, CardsAndPrints, PrintingInformation } from "../types/api"
import PrintYGO from "./YGO/PrintYGO"

export default function CardCollection({ cardsAndPrints }: { cardsAndPrints: CardsAndPrints | null }) {
	const cards = cardsAndPrints?.cardsInfo as CardInformation[] | undefined
	const prints = cardsAndPrints?.printsInfo as PrintingInformation[] | undefined

	// Filter out duplicate cards since the API returns one per print (not ideal tbh) TODO: maybe modify the API?
	const uniqueCards = cards?.filter((card, index, self) => index === self.findIndex((c) => c.cardID === card.cardID))

	return (
		<Stack w="100%">
			{uniqueCards?.length && prints?.length ? (
				uniqueCards.map((card) => (
					<Accordion key={card.cardID} variant="separated" radius="md">
						<Accordion.Item value={card.cardID}>
							<Accordion.Control>
								<Group w="100%">
									<Text size="sm">{card.cardName}</Text>
									<Badge variant="light" size="sm" fw={500}>
										{`${prints.filter((print) => print.cardID === card.cardID).length} printing${prints.filter((print) => print.cardID === card.cardID).length > 1 ? "s" : ""}`}
									</Badge>
								</Group>
							</Accordion.Control>
							<Accordion.Panel>
								<Stack gap="xs">
									{prints
										.filter((print) => print.cardID === card.cardID)
										.map((print) => (
											<PrintYGO key={print.printID} printInfo={print} cardInfo={card} />
										))}
								</Stack>
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>
				))
			) : (
				<Text c="dimmed" size="sm">
					This member hasn't added any cards to their collection yet.
				</Text>
			)}
		</Stack>
	)
}
