import { Button, Center, Group, Stack, Text, Title } from "@mantine/core"
import { SearchIcon, Users2Icon } from "lucide-react"

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

				<Stack align="center" gap="md" w={420}>
					{/* Search Button */}
					<Button
						component="a"
						href="/home"
						size="lg"
						variant="filled"
						leftSection={<SearchIcon size={24} />}
						fullWidth
					>
						Search Cards
					</Button>

					{/* Collect Button */}
					<Group grow w="100%">
						<Button component="a" href="/home" size="lg" variant="light">
							Start Collecting
						</Button>
						<Button
							component="a"
							href="/members"
							size="lg"
							variant="light"
							leftSection={<Users2Icon size={18} />}
						>
							View Members
						</Button>
					</Group>
				</Stack>
			</Stack>
		</Center>
	)
}
