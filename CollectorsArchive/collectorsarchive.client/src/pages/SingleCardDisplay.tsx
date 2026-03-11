import { Box, Card, Image, Text, Divider, Button, Stack, Group, Grid } from "@mantine/core"
import sampleImage from "../assets/singleCardSample.png"

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
	// the info in the below will come from back end also , the image also will be replaced when curtis figured out about the images

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
		<Box maw={1100} mx="auto" p="xl">
			<Grid gutter="xl">
				{/* Card Image */}
				<Grid.Col span={{ base: 12, md: 5 }}>
					<Card shadow="md" radius="md" withBorder p="md">
						<Image src={imageUrl} alt={name} radius="md" fit="contain" height={520} />
					</Card>
				</Grid.Col>

				{/* Card Information */}
				<Grid.Col span={{ base: 12, md: 7 }}>
					<Stack gap="lg">
						<Text fw={700} fz={34}>
							{name}
						</Text>

						<Divider />

						{/* Description */}
						<Box>
							<Text fw={600} mb={4}>
								Description
							</Text>
							<Text c="dimmed">{description}</Text>
						</Box>

						<Divider />

						{/* Printing Info */}
						<Box>
							<Text fw={600} mb={4}>
								Printing Information
							</Text>
							<Text c="dimmed">{printingInfo}</Text>
						</Box>

						<Divider />

						{/* Additional Details */}
						<Box>
							<Text fw={600} mb={6}>
								Additional Details
							</Text>

							<Stack gap={4}>
								<Text c="dimmed">Type: {additionalInfo.type}</Text>
								<Text c="dimmed">Attribute: {additionalInfo.attribute}</Text>
								<Text c="dimmed">Rarity: {additionalInfo.rarity}</Text>
								<Text c="dimmed">Release Date: {additionalInfo.releaseDate}</Text>
							</Stack>
						</Box>

						<Divider />

						<Group>
							<Button radius="md" size="md">
								Add to Your List
							</Button>
						</Group>
					</Stack>
				</Grid.Col>
			</Grid>
		</Box>
	)
}
