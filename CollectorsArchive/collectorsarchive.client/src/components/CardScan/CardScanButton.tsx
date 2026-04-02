import { ActionIcon, Button } from "@mantine/core"
import { ScanLineIcon } from "lucide-react"

interface CardScanButtonProps {
	iconOnly?: boolean
	onClick: () => void
}

export function CardScanButton({ iconOnly = false, onClick }: CardScanButtonProps) {
	return iconOnly ? (
		<ActionIcon size="lg" variant="transparent" onClick={onClick}>
			<ScanLineIcon />
		</ActionIcon>
	) : (
		<Button size="sm" variant="filled" onClick={onClick} leftSection={<ScanLineIcon size={18} />}>
			Scan
		</Button>
	)
}
