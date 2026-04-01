import { Button, Group, Stack, Text } from "@mantine/core"
import { useState } from "react"
import { formatCard } from "../../types/mapper"
import type { Card } from "../../types/ygo/schema"
import type { CardServerResponse } from "../CardSearch/schema"
import CardYGO from "../YGO/CardYGO"
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
	const [results, setResults] = useState<Card[] | null>(null)
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

			const cardsList: CardServerResponse[] = await response.json()
			console.log("Backend response:", cardsList)

			if (result.mode === "YGO") {
				setResults(cardsList.map(formatCard))
			} else {
				console.log("MTG response received:", cardsList)
				setResults(null)
				setErrorMessage("MTG response received. UI mapping not added yet.")
			}
		} catch (error) {
			console.error("POST failed, but scan still worked:", error)
			setErrorMessage("Could not load card matches.")
		} finally {
			setLoading(false)
		}
	}

	function handleRescan() {
		setResults(null)
		setErrorMessage("")
	}

	return (
		<div className="card-scan-overlay">
			{!results && !loading && <YgoScanner onClose={onClose} onScanComplete={handleScanComplete} />}

			{loading && (
				<div style={{ padding: 24 }}>
					<Text>Searching for matching cards...</Text>
				</div>
			)}

			{!loading && results && (
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

					{results.length === 0 && <Text>No matches found.</Text>}

					{results.length > 0 && (
						<Stack gap="md">
							{results.map((item) => {
								const cardData = item as Card
								return <CardYGO key={cardData.id} cardData={cardData} />
							})}
						</Stack>
					)}
				</div>
			)}

			{!loading && errorMessage && !results && (
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

//import { Button, Group, Stack, Text } from "@mantine/core"
//import { useState } from "react"
//import { formatCard } from "../../types/mapper"
//import type { Card } from "../../types/ygo/schema"
//import type { CardServerResponse } from "../CardSearch/schema"
//import CardYGO from "../YGO/CardYGO"
//import YgoScanner from "./YgoScanner"

//interface CardScanOverlayProps {
//	onClose?: () => void
//}

//export default function CardScanOverlay({ onClose }: CardScanOverlayProps) {
//	const [results, setResults] = useState<Card[] | null>(null)
//	const [loading, setLoading] = useState(false)
//	const [errorMessage, setErrorMessage] = useState("")

//	async function handleScanComplete(result: { passcode: string; setCode: string; name: string }) {
//		console.log("Scan result:", result)

//		try {
//			setLoading(true)
//			setErrorMessage("")

//			const payload = {
//				cardName: result.name,
//				cardID: result.passcode,
//				setIndex: result.setCode,
//			}

//			console.log("Payload being sent:", payload)

//			const response = await fetch("https://collectorsarchive.azurewebsites.net/api/CardSearch/CVSearch", {
//				method: "POST",
//				headers: {
//					"Content-Type": "application/json",
//				},
//				body: JSON.stringify(payload),
//			})

//			if (!response.ok) {
//				throw new Error("Failed to send scan result.")
//			}

//			const cardsList: CardServerResponse[] = await response.json()
//			console.log("Backend response:", cardsList)

//			setResults(cardsList.map(formatCard))
//		} catch (error) {
//			console.error("POST failed, but scan still worked:", error)
//			setErrorMessage("Could not load card matches.")
//		} finally {
//			setLoading(false)
//		}
//	}

//	function handleRescan() {
//		setResults(null)
//		setErrorMessage("")
//	}

//	return (
//		<div className="card-scan-overlay">
//			{!results && <YgoScanner onClose={onClose} onScanComplete={handleScanComplete} />}

//			{loading && (
//				<div style={{ padding: 24 }}>
//					<Text>Searching for matching cards...</Text>
//				</div>
//			)}

//			{!loading && results && (
//				<div style={{ padding: 24 }}>
//					<Group justify="space-between" mb="md">
//						<Text fw={700} size="lg">
//							Scan Results
//						</Text>

//						<Group>
//							<Button variant="default" onClick={handleRescan}>
//								Rescan
//							</Button>
//							<Button variant="light" onClick={onClose}>
//								Close
//							</Button>
//						</Group>
//					</Group>

//					{results.length === 0 && <Text>No matches found.</Text>}

//					{results.length > 0 && (
//						<Stack gap="md">
//							{(results as Card[]).map((item) => {
//								const cardData = item as Card
//								return <CardYGO key={cardData.id} cardData={cardData} />
//							})}
//						</Stack>
//					)}
//				</div>
//			)}

//			{!loading && errorMessage && !results && (
//				<div style={{ padding: 24 }}>
//					<Text c="red">{errorMessage}</Text>
//				</div>
//			)}
//		</div>
//	)
//}