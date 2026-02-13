
import { Anchor, Text } from "@mantine/core"

export default function Logo() {
	return (
		<Anchor href="/" td="none">
			<Text size="xl" fw={700} c="bright">
				Collector's Archive
			</Text>
		</Anchor>
	)
}