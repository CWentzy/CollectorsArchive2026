import { Badge, Box, Button, Card, Divider, Grid, Group, Image, Stack, Text, Title } from "@mantine/core"
import { IconCards, IconInfoCircle, IconTimeline } from "@tabler/icons-react"
import { useParams } from "react-router-dom"

const placeholderImageUrl = "/assets/images/card_placeholder_ygo.jpg"

export default function SingleCardDisplay() {
	const { id } = useParams<{ id: string; }>()

	// TODO: Once backend returns full card details by ID, fetch them here using id
	// e.g. GET /api/Cards/{id} → replace all TBD placeholders below with real data

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
										{/*{name ?? "Unknown Card"}*/}
									</Title>
									<Text size="xs" c="dimmed">
										ID: {id}
									</Text>
								</Group>

								<Group gap="xs">
									{/* TODO: Replace placeholder badges with real data from backend */}
									<Badge variant="dot" size="lg" color="blue">
										Type TBD
									</Badge>
									<Badge variant="dot" size="lg" color="orange">
										Attribute TBD
									</Badge>
									<Badge variant="gradient" size="lg" gradient={{ from: "yellow", to: "orange", deg: 45 }}>
										Rarity TBD
									</Badge>
								</Group>
							</Stack>

							<Divider />

							{/* Description — placeholder until backend returns it */}
							<Stack gap="xs">
								<Group gap="xs" c="dimmed">
									<IconInfoCircle size={18} />
									<Text fw={700} size="xs" tt="uppercase" lts={1}>
										Description
									</Text>
								</Group>

								{/* TODO: Replace with real description from backend */}
								<Text size="md">No description available yet.</Text>
							</Stack>

							{/* Printing Info — placeholder */}
							<Stack gap="xs">
								<Group gap="xs" c="dimmed">
									<IconTimeline size={18} />
									<Text fw={700} size="xs" tt="uppercase" lts={1}>
										Printing Information
									</Text>
								</Group>

								{/* TODO: Replace with real printing info from backend */}
								<Text size="md">No printing information available yet.</Text>
							</Stack>

							{/* Card Specifications — placeholder */}
							<Card withBorder radius="md" p="lg">
								<Group gap="xs" mb="lg">
									<IconCards size={20} />
									<Text fw={800} size="sm" tt="uppercase" lts={0.5}>
										Card Specifications
									</Text>
								</Group>

								<Grid gutter={30}>
									{[
										{ label: "Type", value: "TBD" },
										{ label: "Attribute", value: "TBD" },
										{ label: "Rarity", value: "TBD" },
										{ label: "Release Date", value: "TBD" },
										// TODO: Replace all "TBD" values with real fields from backend
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
