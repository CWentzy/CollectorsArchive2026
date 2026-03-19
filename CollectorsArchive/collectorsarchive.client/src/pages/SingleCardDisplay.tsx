import { Badge, Box, Grid, Group, Image, LoadingOverlay, Stack, Text, Title } from "@mantine/core"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import PrintYGO from "../components/YGO/PrintYGO"
import { formatCardDetails, formatPrintingDetails } from "../types/mapper"
import type { Card, Print, PrintDetails } from "../types/ygo/schema"

const placeholderImageUrl = "/assets/images/card_placeholder_ygo.jpg"
const SingleCardDisplayYGO =
	"https://collectorsarchive.azurewebsites.net/api/SingleCardDisplayYGOes/SingleCardDisplayYGO"

interface CardAndPrints {
	prints: Print[]
	card?: Card
}

export default function SingleCardDisplay() {
	const { id } = useParams<{ id: string }>()
	const [cardAndPrints, setCardAndPrints] = useState<CardAndPrints | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function fetchCard() {
			const response = await fetch(SingleCardDisplayYGO, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ cardID: id }),
			})

			const data = await response.json()

			const prints = data.printings.map((print: PrintDetails) => formatPrintingDetails(print))
			const card = data.card ? formatCardDetails(data.card) : undefined

			setCardAndPrints({ card, prints })

			console.log("Card:", card)
			console.log("Printings:", data.printings)

			setLoading(false)
		}

		fetchCard()
	}, [id])

	return (
		<Box py="xl">
			<Box mx="auto">
				<Grid gutter={50} align="center">
					{/* Card Image Column */}
					<Grid.Col span="content">
						{/* TODO: Replace with real card image from backend */}
						<Image src={placeholderImageUrl} alt={"Card Iamge"} fit="contain" h={520} />
					</Grid.Col>

					{/* Details Column */}
					<Grid.Col span="auto" pos="relative">
						<LoadingOverlay visible={loading} overlayProps={{ radius: "md", blur: 2 }} loaderProps={{ type: "dots" }} />

						<Stack gap="xl">
							<Stack gap="md">
								{/* Header — name and id come from route params */}
								<Title order={1} fz={42} fw={800}>
									{cardAndPrints?.card?.name ?? "Unknown Card"}
								</Title>

								<Group gap="xs">
									{cardAndPrints?.card?.superType && (
										<Badge size="md" variant="gradient" gradient={{ from: "yellow", to: "red", deg: 45 }} fw={600}>
											{cardAndPrints?.card?.superType}
										</Badge>
									)}

									{cardAndPrints?.card?.subType && (
										<Badge size="md" variant="transparent" fw={600}>
											{cardAndPrints?.card?.subType}
										</Badge>
									)}
								</Group>

								{/* Description — card Text is a descriiption of the card */}
								<div>
									<Text c="dimmed">
										{cardAndPrints?.card?.description ?? "No description available for this card."}
									</Text>

									<Group justify="flex-end" w="100%">
										<Text c="dimmed" size="xs">
											ID: {cardAndPrints?.card?.id ?? "Unknown ID"}
										</Text>
									</Group>
								</div>
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
					</Grid.Col>
				</Grid>
			</Box>

			{!loading && (
				<Stack gap="md" mt="xl">
					<Text size="lg" fw={600}>
						Printings
					</Text>

					<Stack gap="xs">
						{cardAndPrints?.prints.length ? (
							cardAndPrints.prints.map((print) => (
								<PrintYGO key={print.id} printData={print} cardData={cardAndPrints.card} />
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
