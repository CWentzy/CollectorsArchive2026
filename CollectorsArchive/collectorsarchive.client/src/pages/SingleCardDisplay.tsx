import { Box, Card, Grid, Group, Image, LoadingOverlay, Stack, Table, Text, Title } from "@mantine/core"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Game, GameID } from "../components/CardSearch/schema"
import PrintYGO from "../components/YGO/PrintYGO"
import type { CardInformation, CardsAndPrints, MTGCard, PrintingInformation, YGOCard } from "../types/api"

const ygoCardImageUrl = "/assets/images/card_placeholder_ygo.jpg"
const SingleCardDisplayYGO = `${import.meta.env.VITE_SERVER_URL}/api/SingleCardDisplayYGOes/SingleCardDisplayYGO`

function CardAttributes({ cardInfo }: { cardInfo?: CardInformation }) {
	if (!cardInfo) return null

	let attributes = null

	switch (cardInfo.gameID) {
		case GameID.ygo:
			attributes = cardInfo.cardAttributes as YGOCard
			break
		case GameID.mtg:
			attributes = cardInfo.cardAttributes as MTGCard
			break
		default:
			return null
	}

	return (
		<Card withBorder>
			<Card.Section withBorder inheritPadding py="xs">
				<Text size="sm" fw={500}>
					Attributes
				</Text>
			</Card.Section>
			<Card.Section inheritPadding py="xs">
				{attributes ? (
					<Table variant="vertical" layout="fixed" withRowBorders={false}>
						<Table.Tbody>
							{Object.entries(attributes).map(([key, value]) => (
								<Table.Tr key={key}>
									<Table.Td w={150}>
										<Text c="dimmed" size="xs" tt="uppercase">
											{key.replace(/([A-Z])/g, " $1").trim()}
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size="sm" fw={500}>
											{value}
										</Text>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				) : (
					<Text size="sm" c="dimmed">
						No information available for this card.
					</Text>
				)}
			</Card.Section>
		</Card>
	)
}

export default function SingleCardDisplay() {
	const { game, cardID } = useParams()

	const [cardAndPrints, setCardAndPrints] = useState<CardsAndPrints | null>(null)
	const [loading, setLoading] = useState(true)
	const gameID = GameID[game as Game]

	useEffect(() => {
		async function fetchCard() {
			const response = await fetch(SingleCardDisplayYGO, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ gameID, cardID }),
			})

			const data = await response.json()

			const printsInfo = data.printings
			const cardsInfo = data.card

			setCardAndPrints({ cardsInfo, printsInfo })

			setLoading(false)
		}

		fetchCard()
	}, [gameID, cardID])

	const cardInfo = cardAndPrints?.cardsInfo as CardInformation | undefined // single card
	const printsInfo = cardAndPrints?.printsInfo as PrintingInformation[] | undefined // multiple prints

	return (
		<Box py="xl">
			<Box mx="auto">
				<Grid gutter={50} align="center">
					{/* Card Image Column */}
					<Grid.Col span="auto">
						{/* TODO: Replace with real card image from backend */}
						{gameID === GameID.ygo && (
							<Image src={ygoCardImageUrl} alt={"Card Iamge"} fit="contain" h={520} mah={520} />
						)}
					</Grid.Col>

					{/* Details Column */}
					<Grid.Col span="auto" pos="relative">
						<LoadingOverlay visible={loading} overlayProps={{ radius: "md", blur: 2 }} loaderProps={{ type: "dots" }} />

						<Stack gap="xl">
							<Stack gap="md">
								{/* Header — name and id come from route params */}
								<Title order={1} fz={42} fw={800}>
									{cardInfo?.cardName ?? "Unknown Card"}
								</Title>

								{/* Description — card text is a description of the card */}
								<div>
									<Text c="dimmed">{cardInfo?.cardText ?? "No description available for this card."}</Text>

									<Group justify="flex-end" w="100%">
										<Text c="dimmed" size="xs">
											ID: {cardInfo?.cardID ?? "Unknown ID"}
										</Text>
									</Group>
								</div>
							</Stack>

							{/* Game-specific attributes */}
							<CardAttributes cardInfo={cardInfo} />

							{/* <Group justify="space-between" grow>
								<Button size="md" variant="light">
									Add to Collection
								</Button>
								<Button size="md" variant="light">
									Add to Wishlist
								</Button>
							</Group> */}
						</Stack>
					</Grid.Col>
				</Grid>
			</Box>

			{!loading && (
				<Stack gap="md" mt="xl">
					<Text size="lg" fw={600}>
						Printings
					</Text>

					<Stack gap="xs">
						{printsInfo?.length ? (
							printsInfo.map((print) => (
								<PrintYGO key={print.printID} printInfo={print} cardInfo={cardInfo} withCardLink={false} />
							))
						) : (
							<Text c="dimmed" size="sm">
								This card has no printings.
							</Text>
						)}
					</Stack>
				</Stack>
			)}
		</Box>
	)
}
