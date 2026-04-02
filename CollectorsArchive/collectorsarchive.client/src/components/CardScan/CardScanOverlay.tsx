import { Button, Group, Stack, Text } from "@mantine/core"
import { useState } from "react"
import type { CardInformation, CardsAndPrints, PrintingInformation } from "../../types/api"
import PrintYGO from "../YGO/PrintYGO"
import YgoScanner from "./YgoScanner"

type ScanMode = "YGO" | "MTG"

type ScanResult = {
	mode: ScanMode
	value: string
}

interface CardScanOverlayProps {
	onClose?: () => void
}

export default function CardScanOverlay({ onClose }: CardScanOverlayProps) {
	const [cardAndPrints, setCardAndPrints] = useState<CardsAndPrints | null>(null)
	const [loading, setLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")

	async function handleScanComplete(result: ScanResult) {
		console.log("Scan result:", result)

		try {
			setLoading(true)
			setErrorMessage("")

			let payload: Record<string, string>
			let url = ""

			if (result.mode === "YGO") {
				payload = {
					cardID: result.value,
				}
				url = `${import.meta.env.VITE_SERVER_URL}/api/CardSearch/CVYGOSearch`
			} else {
				payload = {
					cardName: result.value,
				}
				url = `${import.meta.env.VITE_SERVER_URL}/api/CardSearch/CVMTGSearch`
			}

			console.log("Payload being sent:", payload)

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				throw new Error("Failed to send scan result.")
			}

			const data = await response.json()

			const cardsInfo = data.cards[0] // TODO: if we always get back 1 card, then update controller to just send back 1 card instead of array
			const printsInfo = data.printings

			if (result.mode === "YGO") {
				setCardAndPrints({ cardsInfo, printsInfo })
			} else {
				//Nothing set up for MTG display yet... Auto error and log
				console.log("MTG response received:", data)
				setCardAndPrints(null)
				setErrorMessage("MTG response received. UI mapping not added yet.")
			}
		} catch (error) {
			console.error("POST failed, but scan still worked:", error)
			setErrorMessage("Could not load card matches.")
		} finally {
			setLoading(false)
		}
	}

	const cardInfo = cardAndPrints?.cardsInfo as CardInformation | undefined // single card
	const printsInfo = cardAndPrints?.printsInfo as PrintingInformation[] | undefined // multiple prints

	function handleRescan() {
		setCardAndPrints(null)
		setErrorMessage("")
	}

	return (
		<div className="card-scan-overlay">
			{!cardAndPrints && !loading && <YgoScanner onClose={onClose} onScanComplete={handleScanComplete} />}

			{loading && (
				<div style={{ padding: 24 }}>
					<Text>Searching for matching cards...</Text>
				</div>
			)}

			{!loading && cardAndPrints && (
				<div style={{ padding: 24 }}>
					<Group justify="space-between" mb="md">
						<Text fw={700} size="lg">
							Scan Results
						</Text>

						<Group>
							<Button variant="default" onClick={handleRescan}>
								Rescan
							</Button>
							<Button variant="light" onClick={onClose}>
								Close
							</Button>
						</Group>
					</Group>

					{printsInfo?.length === 0 && <Text>No matches found.</Text>}

					{printsInfo?.length && (
						<Stack gap="md">
							{printsInfo.map((print) => (
								<PrintYGO key={print.printID} printInfo={print} cardInfo={cardInfo} />
							))}
						</Stack>
					)}
				</div>
			)}

			{!loading && errorMessage && !cardAndPrints && (
				<div style={{ padding: 24 }}>
					<Text c="red">{errorMessage}</Text>

					<Group mt="md">
						<Button variant="default" onClick={handleRescan}>
							Rescan
						</Button>
						<Button variant="light" onClick={onClose}>
							Close
						</Button>
					</Group>
				</div>
			)}
		</div>
	)
}
