import { Button, Center, Stack, Text, Title } from "@mantine/core"
import { Users2Icon } from "lucide-react"

export default function LandingPage() {
	return (
		<Center h="85vh">
			<Stack align="center" gap="xl">
				<Stack align="center" gap="xs">
					<Title size={40} fw={900} textWrap="nowrap">
						Collector's Archive
					</Title>
					<Text fw={800} c="dimmed" tt="uppercase">
						Scan and Collect Game Cards
					</Text>
				</Stack>

				<Stack align="center" gap="md" w={350}>
					{/* Search Button */}
					<Button component="a" href="/home" size="lg" variant="filled" fullWidth>
						Start Collecting
					</Button>

					{/* Collect Button */}
					<Button
						component="a"
						href="/members"
						size="lg"
						variant="light"
						fullWidth
						leftSection={<Users2Icon size={18} />}
					>
						View Members
					</Button>
				</Stack>
			</Stack>
		</Center>
	)
}
