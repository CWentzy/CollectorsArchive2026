import { Badge, Box, Button, Card, Divider, Grid, Group, Image, Stack, Text, Title } from "@mantine/core"
import { IconCards, IconInfoCircle, IconTimeline } from "@tabler/icons-react"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
// importing the interface here
import type { SingleCardDetailsForYGOes } from "../types/SingleCardDisplayForYGOes"

const placeholderImageUrl = "/assets/images/card_placeholder_ygo.jpg"
const SingleCardDisplayYGO =
	"https://collectorsarchive.azurewebsites.net/api/SingleCardDisplayYGOes/SingleCardDisplayYGO"

export default function SingleCardDisplay() {
	const { id } = useParams<{ id: string }>()
	const [cardDetails, setCard] = useState<SingleCardDetailsForYGOes | null>(null)

	useEffect(() => {
		async function fetchCard() {
			const response = await fetch(SingleCardDisplayYGO, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ cardID: id }),
			})

			const data = await response.json()
			setCard(data.card)
			console.log("CARD RESPONSE:", data.card)
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
								<Group gap="xs" align="flex-end">
									<Title order={1} fz={44} fw={900} lts={-1.5} lh={1}>
										{/* the name of the card here as a title  */}
										<Text>Card Name :{cardDetails?.name}</Text>
									</Title>
									<Text size="xs" fw={700}>
										ID: {cardDetails?.cardID}
									</Text>
								</Group>

								<Group gap="sm" align="center">
									<Badge size="lg" radius="sm" variant="filled" color="orange" fw={700}>
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
									<Text fw={700} size="xs" tt="uppercase" lts={1}>
										Description :{cardDetails?.cardText}
									</Text>
								</Group>

								{/* incase if the description comes null?? we will do it later  */}
								<Text size="md">No description available yet.</Text>
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
									Add to Wishlist
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
