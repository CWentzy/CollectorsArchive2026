import { ActionIcon, Group, Select, Stack, Text } from "@mantine/core"
import { IconMinus, IconPlus } from "@tabler/icons-react"
import { useEffect, useState } from "react"

const ADD_TO_COLLECTION_URL = `${import.meta.env.VITE_SERVER_URL}/api/UserCard/AddToCollection`
const GET_USER_LISTS_URL = `${import.meta.env.VITE_SERVER_URL}/api/UserList/GetUserLists`
const ADD_PRINT_TO_LIST_URL = `${import.meta.env.VITE_SERVER_URL}/api/UserList/AddPrintToList`

const AMOUNT_TO_ADD = 1

interface AddToCollectionResponse {
	message: string
	quantity: number
}

interface UserListOption {
	userListID: number
	userListName: string
}

interface QuantityPickerProps {
	printID?: string
	initialQuantity?: number
}

export default function QuantityPicker({ printID, initialQuantity }: QuantityPickerProps) {
	const [quantity, setQuantity] = useState(initialQuantity ?? 0)
	const [loading, setLoading] = useState(false)
	const [userLists, setUserLists] = useState<UserListOption[]>([])
	const [selectKey, setSelectKey] = useState(0)

	const user = JSON.parse(localStorage.getItem("user") || "null")

	useEffect(() => {
		if (!user?.userId) return
		const fetchLists = async () => {
			try {
				const res = await fetch(`${GET_USER_LISTS_URL}?userProfileID=${user.userId}`)
				const data = await res.json()
				setUserLists(data)
			} catch (err) {
				console.error("Failed to fetch user lists: ", err)
			}
		}
		fetchLists()
	}, [user?.userId])

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

	const handleAddToList = async (userListID: string | null) => {
		if (!userListID || !printID) return
		try {
			await fetch(ADD_PRINT_TO_LIST_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userListID: parseInt(userListID),
					printID: parseInt(printID),
				}),
			})
            setSelectKey((k) => k + 1) //COME BACK HERE: this is a hack to reset the select after adding to a list, since the API doesn't return the updated list info. Ideally, the API would return the updated list of lists so we could just update that in state instead of forcing a full reset of the select component.
		} catch (err) {
			console.error("Failed to add peint to list:", err)
		}
	}

	return (
		<Stack gap="xs" align="center">
			{/* -/+ controls*/}
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

			{/* Dropdown of all the lists*/}
			{userLists.length > 0 && (
				<Select
					size="xs"
					placeholder="Add to collection"
					clearable
					data={userLists.map((list) => ({
						value: String(list.userListID),
						label: list.userListName,
					}))}
					onChange={handleAddToList}
					value={null}
					w={140}
                />
			)}
		</Stack>
	)
}
