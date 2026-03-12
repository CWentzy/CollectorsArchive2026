import {
	Box,
	Card,
	Image,
	Text,
	Button,
	Stack,
	Group,
	Grid,
	Badge,
	Divider,
	Title,
	UnstyledButton,
} from "@mantine/core"
import { IconChevronLeft, IconInfoCircle, IconTimeline, IconCards } from "@tabler/icons-react"

import sampleImage from "../assets/singleCardSample.png"
import { Link } from "react-router-dom"

interface CardDetailsProps {
	imageUrl?: string
	name?: string
	description?: string
	printingInfo?: string
	additionalInfo?: {
		type?: string
		attribute?: string
		rarity?: string
		releaseDate?: string
	}
}

export default function SingleCardDisplay({
	imageUrl = sampleImage,
	name = "Yu-Gi-Oh",
	description = "I know nothing about it loool.",
	printingInfo = "First printed Card",
	additionalInfo = {
		type: "Dragon",
		attribute: "Light",
		rarity: "Ultra Rare",
		releaseDate: "2002",
	},
}: CardDetailsProps) {
	return (
		<Box bg="gray.0" style={{ minHeight: "100vh" }}>
			<Box maw={1100} mx="auto" p="xl">
				{/* Navigation / Home page */}
				<Link to="/">
					<UnstyledButton mb="xl" style={{ transition: "color 0.2s ease" }}>
						<Group gap={4} c="dimmed" style={{ "&:hover": { color: "black" } }}>
							<IconChevronLeft size={16} />
							<Text size="sm" fw={600}>
								Back to HomePage
							</Text>
						</Group>
					</UnstyledButton>
				</Link>

				<Grid gutter={40}>
					{/* Card Image Column */}
					<Grid.Col span={{ base: 12, md: 5 }}>
						<Card
							shadow="xl"
							radius="lg"
							p="xl"
							bg="white"
							style={{
								border: "1px solid var(--mantine-color-gray-2)",
								top: "2rem",
								position: "sticky",
							}}
						>
							<Image src={imageUrl} alt={name} radius="md" fit="contain" h={520} />
						</Card>
					</Grid.Col>

					{/* Details Column */}
					<Grid.Col span={{ base: 12, md: 7 }}>
						<Stack gap="xl">
							{/* Header */}
							<Box>
								<Title order={1} fz={44} fw={900} lts={-1.5} lh={1}>
									{name}
								</Title>
								<Group mt="md" gap="xs">
									<Badge variant="dot" size="lg" color="blue">
										{additionalInfo.type}
									</Badge>
									<Badge variant="dot" size="lg" color="orange">
										{additionalInfo.attribute}
									</Badge>
									<Badge variant="gradient" gradient={{ from: "yellow", to: "orange", deg: 45 }} size="lg">
										{additionalInfo.rarity}
									</Badge>
								</Group>
							</Box>

							<Divider />

							{/* Description Section */}
							<Stack gap="xs">
								<Group gap="xs" c="dimmed">
									<IconInfoCircle size={18} />
									<Text fw={700} size="xs" tt="uppercase" lts={1}>
										Description
									</Text>
								</Group>
								<Text size="lg" lh={1.6}>
									{description}
								</Text>
							</Stack>

							{/* Printing Info Section */}
							<Stack gap="xs">
								<Group gap="xs" c="dimmed">
									<IconTimeline size={18} />
									<Text fw={700} size="xs" tt="uppercase" lts={1}>
										Printing Information
									</Text>
								</Group>
								<Text size="md" c="dark.3">
									{printingInfo}
								</Text>
							</Stack>

							{/* Details Grid Card */}
							<Card withBorder radius="lg" p="xl" shadow="sm">
								<Group gap="xs" mb="lg">
									<IconCards size={20} />
									<Text fw={800} size="sm" tt="uppercase" lts={0.5}>
										Card Specifications
									</Text>
								</Group>

								<Grid gutter={30}>
									{[
										{ label: "Type", value: additionalInfo.type },
										{ label: "Attribute", value: additionalInfo.attribute },
										{ label: "Rarity", value: additionalInfo.rarity },
										{ label: "Release Date", value: additionalInfo.releaseDate },
									].map((item) => (
										<Grid.Col span={6} key={item.label}>
											<Text size="xs" c="dimmed" fw={700} tt="uppercase" mb={4}>
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
								<Button size="xl" radius="md" h={60} fz="md" variant="filled" color="green">
									Add to Your Collection
								</Button>

								<Button size="xl" radius="md" h={60} fz="md" variant="filled" color="green">
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
