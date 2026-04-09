import { Accordion, Badge, Group, Stack, Text } from "@mantine/core"
import type { CardInformation, CardsAndPrints, PrintingInformation } from "../types/api"
import Printing from "./Printing"

export default function CardCollection({ cardsAndPrints }: { cardsAndPrints: CardsAndPrints | null }) {
	const cards = cardsAndPrints?.cardsInfo as CardInformation[] | undefined
	const prints = cardsAndPrints?.printsInfo as PrintingInformation[] | undefined

	// Filter out duplicate cards since the API returns one per print (not ideal tbh) TODO: maybe modify the API?
	const uniqueCards = cards?.filter((card, index, self) => index === self.findIndex((c) => c.cardID === card.cardID))

	return (
		<Stack w="100%">
			{uniqueCards?.length && prints?.length ? (
				// For each card (unique)
				uniqueCards.map((card) => {
					// Find all prints of that card by matching cardID
					const cardPrints = prints.filter((print) => print.cardID === card.cardID)

					// If there are multiple prints for the same card, show them in an accordion
					if (cardPrints.length > 1) {
						return (
							<Accordion key={card.cardID} variant="separated" radius="md">
								<Accordion.Item value={card.cardID}>
									<Accordion.Control>
										<Group w="100%">
											<Text size="sm">{card.cardName}</Text>
											<Badge variant="light" size="sm" fw={500}>
												{`${cardPrints.length} printing${cardPrints.length > 1 ? "s" : ""}`}
											</Badge>
										</Group>
									</Accordion.Control>
									<Accordion.Panel>
										<Stack gap="xs">
											{prints
												.filter((print) => print.cardID === card.cardID)
												.map((print) => (
													<Printing key={print.printID} printInfo={print} cardInfo={card} />
												))}
										</Stack>
									</Accordion.Panel>
								</Accordion.Item>
							</Accordion>
						)
					} else {
						// If there's only one print, show it without accordion
						return (
							<Printing
								key={card.cardID}
								printInfo={prints.find((print) => print.cardID === card.cardID) || ({} as PrintingInformation)}
								cardInfo={card}
							/>
						)
					}
				})
			) : !uniqueCards?.length ? (
				<Text size="md" c="dimmed" mt="md">
					No cards found.
				</Text>
			) : (
				uniqueCards.map((card) => (
					<Printing
						key={card.cardID}
						printInfo={prints?.find((print) => print.cardID === card.cardID) || ({} as PrintingInformation)}
						cardInfo={card}
					/>
				))
			)}
		</Stack>
	)
}
