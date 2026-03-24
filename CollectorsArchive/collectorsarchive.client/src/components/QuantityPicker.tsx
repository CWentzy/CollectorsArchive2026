import { ActionIcon, Group, Text } from "@mantine/core"
import { IconMinus, IconPlus } from "@tabler/icons-react"
import { useState } from "react"

const ADD_TO_COLLECTION_URL = `${import.meta.env.VITE_SERVER_URL}/api/UserCard/AddToCollection`

const AMOUNT_TO_ADD = 1

interface AddToCollectionResponse {
	message: string
	quantity: number
}

interface QuantityPickerProps {
	printID?: string
	initialQuantity?: number
}

export default function QuantityPicker({ printID, initialQuantity }: QuantityPickerProps) {
	const [quantity, setQuantity] = useState(initialQuantity ?? 0)
	const [loading, setLoading] = useState(false)

	const user = JSON.parse(localStorage.getItem("user") || "null")

	const increment = async () => {
		if (!printID || !user?.userId) return

		try {
			setLoading(true)

			const response = await fetch(ADD_TO_COLLECTION_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user?.userId,
					printID: printID,
					quantity: AMOUNT_TO_ADD,
				}),
			})

			if (!response.ok) {
				throw new Error("Failed to add to collection")
			}

			const data: AddToCollectionResponse = await response.json()

			setQuantity(data.quantity)
		} catch (error) {
			console.error("Error adding to collection:", error)
		} finally {
			setLoading(false)
		}
	}

	const decrement = () => {
		// const next = Math.max(0, quantity - 1)

		// Simulate a backend call with a timeout for now... TODO: implement actual decrement functionality
		setLoading(true)
		setTimeout(() => {
			setLoading(false)
		}, 300)
	}

	return (
		<Group gap="xs" align="center">
			<ActionIcon variant="light" color="red" size="sm" onClick={decrement} disabled={quantity === 0} loading={loading}>
				<IconMinus size={12} />
			</ActionIcon>

			<Text fw={600} size="sm" w={20} ta="center" c={loading ? "dimmed" : undefined}>
				{quantity}
			</Text>

			<ActionIcon variant="light" color="spell-green" size="sm" onClick={increment} loading={loading}>
				<IconPlus size={12} />
			</ActionIcon>
		</Group>
	)
}
