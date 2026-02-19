import { Button, Center, Stack, Text, Title } from "@mantine/core"
import { SearchIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/useAuth"

export default function LandingPage() {
	const { isAuthenticated, openLoginPopover } = useAuth()
	const navigate = useNavigate()

	const handleButtonClick = () => {
		if (isAuthenticated) {
			navigate("/home")
		} else {
			openLoginPopover()
		}
	}

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

				<Stack align="center" gap="md" w={250}>
					{/* Search Button */}
					<Button
						size="lg"
						variant="filled"
						leftSection={<SearchIcon size={24} />}
						fullWidth
						onClick={handleButtonClick}
					>
						Search Cards
					</Button>

					{/* Collect Button */}
					<Button size="lg" variant="light" fullWidth onClick={handleButtonClick}>
						Start Collecting
					</Button>
				</Stack>
			</Stack>
		</Center>
	)
}
