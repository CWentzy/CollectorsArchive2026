import { Anchor, Group, Text } from "@mantine/core"

export default function CreditsFooter() {
	return (
		<Group mt="xl" gap={4} justify="center">
			<Text c="dimmed" size="xs" span>
				Yu-Gi-Oh! symbols © Konami. Attribute icons by{" "}
				<Anchor href="https://yugioh.fandom.com/wiki/User:Falzar_FZ" target="_blank" size="xs">
					Falzar FZ
				</Anchor>
				{" ("}
				<Anchor href="https://creativecommons.org/licenses/by/3.0/" target="_blank" size="xs">
					CC BY 3.0
				</Anchor>
				{"). "}
				This site is an unofficial project and is not affiliated with or endorsed by Konami.
			</Text>
		</Group>
	)
}
