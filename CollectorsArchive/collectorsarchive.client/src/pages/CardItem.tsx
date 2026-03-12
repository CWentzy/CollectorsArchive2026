// src/components/CardItem.tsx
import { Card, Group, Image, Text } from "@mantine/core"

const placeholderImageUrl = "/assets/images/card_placeholder_ygo.jpg"

interface CardItemProps {
	id: string
	name?: string
	navigate: (path: string) => void
}

export default function CardItem({ id, name = "Card Name", navigate }: CardItemProps) {
	return (
		<Card
			shadow="sm"
			padding="xs"
			radius="md"
			withBorder
			style={{
				cursor: "pointer",
				transition: "transform 0.2s ease, box-shadow 0.2s ease",
			}}
			onClick={() => navigate(`/card/${id}`)}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = "scale(1.05)"
				e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)"
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = "scale(1)"
				e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)"
			}}
		>
			<Card.Section>
				<Image src={placeholderImageUrl} height={260} width={180} alt={name} fit="contain" />
			</Card.Section>

			<Group justify="center" mt="sm">
				<Text fw={600} fz="sm" ta="center">
					{name}
				</Text>
			</Group>
		</Card>
	)
}
