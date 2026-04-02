import { ActionIcon, Button } from "@mantine/core"
import { SearchIcon } from "lucide-react"

interface CardSearchButtonProps {
	iconOnly?: boolean
	onClick: () => void
}

export default function CardSearchButton({ iconOnly = false, onClick }: CardSearchButtonProps) {
	return iconOnly ? (
		<ActionIcon size="lg" variant="transparent" onClick={onClick}>
			<SearchIcon />
		</ActionIcon>
	) : (
		<Button size="sm" variant="light" onClick={onClick} leftSection={<SearchIcon size={17} />}>
			Search
		</Button>
	)
}
