import { Anchor, Text } from "@mantine/core"
import { useAuth } from "../auth/useAuth"

export default function Logo() {
	const { isAuthenticated } = useAuth()

	return (
		<Anchor td="none" href={isAuthenticated ? "/home" : "/"}>
			<Text size="xl" fw={700} c="bright">
				Collector's Archive
			</Text>
		</Anchor>
	)
}
