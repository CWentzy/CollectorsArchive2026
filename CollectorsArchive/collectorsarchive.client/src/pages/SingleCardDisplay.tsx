import {
	ActionIcon,
	Box,
	Card,
	CopyButton,
	Flex,
	Group,
	Image,
	Paper,
	Rating,
	Skeleton,
	Stack,
	Table,
	Text,
	Title,
} from "@mantine/core"
import { CopyCheckIcon, CopyIcon, ShieldHalfIcon, SwordsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Game, GameID, GameIDToGame } from "../components/CardSearch/schema"
import Printing from "../components/Printing"
import type { CardInformation, CardsAndPrints, MTGCard, PrintingInformation, YGOCard } from "../types/api"
import { getCardImageUrl } from "../utils"

const SingleCardDisplayYGO = `${import.meta.env.VITE_SERVER_URL}/api/SingleCardDisplayYGOes/SingleCardDisplayYGO`

function CardAttributesYGO({ attributes }: { attributes: YGOCard }) {
	const level = attributes.level ? Number(attributes.level) : null

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="md">
				<Group gap="xs" mb={6}>
					{/* Attribute */}
					{attributes.attribute && (
						<Image
							src={`/assets/images/ygo/symbols/${attributes.attribute.toLowerCase()}.svg`}
							alt={`${attributes.attribute} Attribute`}
							w={48}
							h={48}
						/>
					)}

					<Group gap={6}>
						{/* Sub Type */}
						{attributes.subType && <Text fw={600}>{attributes.subType}</Text>}

						{/* Super Type */}
						{attributes.superType && (
							<Text tt="capitalize" c="dimmed">
								{"/ "} {attributes.superType.toLowerCase()}
							</Text>
						)}
					</Group>
				</Group>

				{/* Card Level */}
				{level && (
					<Group gap="xs" mb="xs">
						{level && <Rating value={level} fractions={1} count={level} readOnly />}
						<Text size="xs" fw={600} c="dimmed">
							LEVEL {level}
						</Text>
					</Group>
				)}

				<Flex gap="md" wrap="wrap" align="center">
					{/* Attack */}
					{attributes.attack && (
						<Card shadow="sm" radius="md" px="sm" py="xs" miw={125}>
							<Stack gap={4}>
								<Group gap="xs">
									<SwordsIcon size={16} color="var(--mantine-color-dimmed)" />
									<Text size="xs" fw={800} c="dimmed">
										ATK
									</Text>
								</Group>
								<Text fw={700}>{attributes.attack}</Text>
							</Stack>
						</Card>
					)}

					{/* Defense */}
					{attributes.defense && (
						<Card shadow="sm" radius="md" px="sm" py="xs" miw={125}>
							<Stack gap={4}>
								<Group gap="xs">
									<ShieldHalfIcon size={16} color="var(--mantine-color-dimmed)" />
									<Text size="xs" fw={800} c="dimmed">
										DEF
									</Text>
								</Group>
								<Text fw={700}>{attributes.defense}</Text>
							</Stack>
						</Card>
					)}

					{/* Pendulum */}
					{attributes.pendulumScale && (
						<Card shadow="sm" radius="md" px="sm" py="xs" miw={125}>
							<Stack gap={4}>
								<Text size="xs" fw={800} c="dimmed">
									PENDULUM
								</Text>
								<Text fw={700}>{attributes.pendulumScale}</Text>
							</Stack>
						</Card>
					)}

					{/* Link */}
					{attributes.linkRating && (
						<Card shadow="sm" radius="md" px="sm" py="xs" miw={125}>
							<Stack gap={4}>
								<Text size="xs" fw={800} c="dimmed">
									LINK RATING
								</Text>
								<Text fw={700}>{attributes.linkRating}</Text>
							</Stack>
						</Card>
					)}
				</Flex>
			</Stack>
		</Paper>
	)
}

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

	return attributes === null ? (
		<Text c="dimmed" size="sm">
			No attributes available for this card.
		</Text>
	) : cardInfo.gameID === GameID.ygo ? (
		<CardAttributesYGO attributes={attributes as YGOCard} />
	) : (
		<Card withBorder>
			<Card.Section withBorder inheritPadding py="xs">
				<Text size="sm" fw={500}>
					Attributes
				</Text>
			</Card.Section>
			<Card.Section inheritPadding py="xs">
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

			const printsInfo = data.printsInfo
			const cardsInfo = data.cardsInfo

			setCardAndPrints({ cardsInfo, printsInfo })

			setLoading(false)
		}

		fetchCard()
	}, [gameID, cardID])

	const cardInfo = cardAndPrints?.cardsInfo as CardInformation | undefined // single card
	const printsInfo = cardAndPrints?.printsInfo as PrintingInformation[] | undefined // multiple prints
	const cardImageUrl = cardInfo?.cardID ? getCardImageUrl(cardInfo.gameID, cardInfo?.cardID, cardInfo?.cardName) : null

	return (
		<Box py="xl">
			<Box mx="auto">
				<Flex
					gap="xl"
					justify="center"
					direction={{ base: "column", md: "row" }}
					align={{ base: "center", md: "center" }}
				>
					{/* Card Image Column */}
					<Box w={{ base: "100%", md: "auto" }}>
						<Group align="center" justify="center" w="100%">
							{/* TODO: Replace with real card image from backend */}
							{gameID === GameID.ygo && (
								<Image
									src={cardImageUrl}
									loading="lazy"
									fallbackSrc={`/assets/images/card_placeholder_${GameIDToGame[gameID]}.jpg`}
									alt={cardInfo?.cardName ?? "Card Image"}
									fit="contain"
									h={{ base: 320, md: 520 }}
									mah={{ base: 320, md: 520 }}
								/>
							)}
						</Group>
					</Box>

					{/* Details Column */}
					<Box w={{ base: "100%", md: "min(720px, 100%)" }}>
						{loading ? (
							<>
								<Skeleton height={60} width="70%" mb="xl" />
								<Skeleton height={20} width="100%" mb="xs" />
								<Skeleton height={20} width="85%" mb="xs" />
								<Skeleton height={20} width="95%" mb="xs" />
								<Skeleton height={20} width="90%" mb="xs" />
								<Skeleton height={250} width="100%" mt="xl" />
							</>
						) : (
							<Stack gap="xl">
								<Stack gap="md">
									{/* Header — name and id come from route params */}
									<Title order={1} fw={800}>
										{cardInfo?.cardName ?? "Unknown Card"}
									</Title>

									{/* Description — card text is a description of the card */}
									<div>
										<Text c="dimmed" size="sm">
											{cardInfo?.cardText ?? "No description available for this card."}
										</Text>
									</div>
								</Stack>

								{/* Game-specific attributes */}
								<Stack gap={4}>
									<CardAttributes cardInfo={cardInfo} />

									{/* Card ID */}
									<Group gap={4} justify="flex-end" w="100%" mt={4}>
										<Text c="dimmed" size="xs">
											{cardInfo?.cardID ?? "Unknown ID"}
										</Text>
										<CopyButton value={cardInfo?.cardID ?? ""} timeout={2000}>
											{({ copied, copy }) => (
												<ActionIcon variant="light" color={copied ? "spell-green" : "gray"} size="sm" onClick={copy}>
													{copied ? <CopyCheckIcon size={12} /> : <CopyIcon size={12} />}
												</ActionIcon>
											)}
										</CopyButton>
									</Group>
								</Stack>

								{/* <Group justify="space-between" grow>
								<Button size="md" variant="light">
									Add to Collection
								</Button>
								<Button size="md" variant="light">
									Add to Wishlist
								</Button>
							</Group> */}
							</Stack>
						)}
					</Box>
				</Flex>
			</Box>

			{!loading && (
				<Stack gap="md" mt="xl">
					<Text size="lg" fw={600}>
						Printings
					</Text>

					<Stack gap="xs">
						{printsInfo?.length ? (
							printsInfo.map((print) => (
								<Printing key={print.printID} printInfo={print} cardInfo={cardInfo} withCardLink={false} />
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
