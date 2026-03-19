import { Badge, Box, Button, Card, Divider, Grid, Group, Image, Stack, Text, Title } from "@mantine/core"
import { IconCards, IconInfoCircle, IconTimeline } from "@tabler/icons-react"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
// importing the interface here
import type { SingleCardDetailsForYGOes } from "../types/SingleCardDisplayForYGOes"
import type { PrintingDetails } from "../types/PrintingDetailsDisplay"

const placeholderImageUrl = "/assets/images/card_placeholder_ygo.jpg"
const SingleCardDisplayYGO =
	"https://collectorsarchive.azurewebsites.net/api/SingleCardDisplayYGOes/SingleCardDisplayYGO"

export default function SingleCardDisplay() {
	const { id } = useParams<{ id: string }>()
	const [cardDetails, setCard] = useState<SingleCardDetailsForYGOes | null>(null)
	const [printDetails, setPrintDetails] = useState<PrintingDetails[] | null>(null)

	useEffect(() => {
		async function fetchCard() {
			const response = await fetch(SingleCardDisplayYGO, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ cardID: id }),
			})

			const data = await response.json()
			setCard(data.card)
			setPrintDetails(data.printings)
			console.log("CARD RESPONSE:", data.card)
			console.log("Printing Info:", data.printings)
		}

		fetchCard()
	}, [id])

	return (
		<Box mih="100vh">
			<Box maw={1100} mx="auto" p="xl">
				<Grid gutter={40}>
					{/* Card Image Column */}
					<Grid.Col span={{ base: 12, md: 5 }}>
						<Card shadow="xl" radius="md" p="xl">
							{/* TODO: Replace with real card image from backend */}
							<Image src={placeholderImageUrl} alt={"Card Iamge"} fit="contain" h={520} />
						</Card>
					</Grid.Col>

					{/* Details Column */}
					<Grid.Col span={{ base: 12, md: 7 }}>
						<Stack gap="xl">
							{/* Header — name and id come from route params */}
							<Stack>
								<Stack gap={4}>
									<Title order={1} fz={52} fw={900} lts={-1.5} lh={1}>
										{cardDetails?.name ?? "Unknown Card"}
									</Title>

									<Text size="sm" fw={600} c="dimmed">
										ID: {cardDetails?.cardID}
									</Text>
								</Stack>

								<Group gap="sm" align="center">
									<Badge size="lg" radius="sm" variant="filled" color="spell-green" fw={700}>
										Super Type
									</Badge>

									<Badge
										size="lg"
										radius="sm"
										variant="gradient"
										gradient={{ from: "yellow", to: "orange", deg: 45 }}
										fw={600}
									>
										{cardDetails?.superType ?? "Unknown"}
									</Badge>
								</Group>
							</Stack>

							<Divider />

							{/* Description — card Text is a descriiption of the card */}
							<Stack gap="xs">
								<Group gap="xs" c="dimmed">
									<IconInfoCircle size={18} />
									<Text fw={700} size="md" tt="uppercase" lts={1}>
										Description
									</Text>
									<Text fw={500} size="sm">
										{cardDetails?.cardText}
									</Text>
								</Group>
							</Stack>
							{/* Card Specifications */}
							<Card withBorder radius="md" p="lg">
								<Group gap="xs" mb="lg">
									<IconCards size={20} />
									<Text fw={800} size="sm" tt="uppercase" lts={0.5}>
										Card Specifications
									</Text>
								</Group>

								<Grid gutter={30}>
									{[
										{ label: "Super Type", value: cardDetails?.superType },
										{ label: "Sub Type", value: cardDetails?.subType },
										{ label: "Card ID ", value: cardDetails?.cardID },
										{ label: "Card Name ", value: cardDetails?.name },
										{ label: "Release Date", value: "TBD" },
									].map((item) => (
										<Grid.Col span={6} key={item.label}>
											<Text size="xs" c="dimmed" fw={500} tt="uppercase" mb={4}>
												{item.label}
											</Text>
											<Text fw={600} size="md">
												{item.value}
											</Text>
										</Grid.Col>
									))}
								</Grid>
							</Card>

							<Group justify="space-between" grow>
								<Button size="lg" radius="md" fz="md" variant="light">
									Add to Collection
								</Button>
								<Button size="lg" radius="md" fz="md" variant="light">
									Add to Wishlist :
									<Text>
										{printDetails?.map((p) => (
											<div key={p.PrintID}>
												<p>Set: {p.SetName}</p>
												<p>Code: {p.SetCode}</p>
												<p>Rarity: {p.CardRarity}</p>
												<p>Release: {new Date(p.ReleaseDate).toLocaleDateString()}</p>
											</div>
										))}
									</Text>
								</Button>
							</Group>
						</Stack>
					</Grid.Col>
				</Grid>
			</Box>
		</Box>
	)
}
function setCard(card: any) {
	throw new Error("Function not implemented.")
}
