import { ActionIcon, Button } from "@mantine/core"
import { ScanSearchIcon } from "lucide-react"

interface CardScanButtonProps {
	iconOnly?: boolean
	onClick: () => void
}

export function CardScanButton({ iconOnly = false, onClick }: CardScanButtonProps) {
	return iconOnly ? (
		<ActionIcon size="lg" variant="gradient" color="blue" onClick={onClick}>
			<ScanSearchIcon />
		</ActionIcon>
	) : (
		<Button size="sm" variant="gradient" onClick={onClick} leftSection={<ScanSearchIcon />}>
			Scan Card
		</Button>
	)
}
