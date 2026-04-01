import { ActionIcon, Group, Select, Stack, Text } from "@mantine/core"
import { IconMinus, IconPlus } from "@tabler/icons-react"
import { useEffect, useState } from "react"

const ADD_TO_COLLECTION_URL = `${import.meta.env.VITE_SERVER_URL}/api/UserCard/AddToCollection`
const GET_USER_LISTS_URL = `${import.meta.env.VITE_SERVER_URL}/api/UserList/GetUserLists`
const GET_PRINT_QTY_IN_LIST_URL = `${import.meta.env.VITE_SERVER_URL}/api/UserList/GetPrintQuantityInList`
const INCREMENT_PRINT_IN_LIST_URL = `${import.meta.env.VITE_SERVER_URL}/api/UserList/IncrementPrintInList`
const DECREMENT_PRINT_IN_LIST_URL = `${import.meta.env.VITE_SERVER_URL}/api/UserList/DecrementPrintInList`

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
	const [collectionQty, setCollectionQty] = useState(initialQuantity ?? 0)
	const [listQty, setListQty] = useState(0)
	const [loading, setLoading] = useState(false)

	const [selectedList, setSelectedList] = useState<UserListOption | null>(null)
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

	useEffect(() => {
		if (!selectedList || !printID) return
		const fetchListQty = async () => {
			try {
				const res = await fetch(
					`${GET_PRINT_QTY_IN_LIST_URL}?userListID=${selectedList.userListID}&printID=${printID}`
				)
				const data = await res.json()
				setListQty(data.quantity ?? 0)
			} catch (err) {
				console.error("Failed to fetch list quantity:", err)
			}
		}
		fetchListQty()
	}, [selectedList, printID])
	const displayQty = selectedList ? listQty : collectionQty //When list selected, shows the qauntity of card from that list

	const increment = async () => {
		if (!printID || !user?.userId) return
		setLoading(true)
		try {
			if (selectedList) {

				const response = await fetch(INCREMENT_PRINT_IN_LIST_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userListID: selectedList.userListID,
						printID: parseInt(printID)
					}),
				})
				const data = await response.json()
				setListQty(data.quantity)
			}
			else {
				// OG behavior
				const response = await fetch(ADD_TO_COLLECTION_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userId: user.userId,
						printID: printID,
						quantity: AMOUNT_TO_ADD
					}),
				})
				if (!response.ok) throw new Error("Failed to add to collection")
				const data: AddToCollectionResponse = await response.json()
				setCollectionQty(data.quantity)
			}
		} catch (error) {
			console.error("Error while incrementing:", error)
		} finally {
			setLoading(false)
		}
	}

	const decrement = async() => {
		if (!printID || !user?.userId) return

		// Simulate a backend call with a timeout for now... TODO: implement actual decrement functionality
		setLoading(true)

		
		try {
			if (selectedList) {
				const response = await fetch(DECREMENT_PRINT_IN_LIST_URL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userListID: selectedList.userListID,
						printID: parseInt(printID)
					}),
				})
				const data = await response.json()
				setListQty(data.quantity)
			} else {
				setTimeout(() => setLoading(false), 300)
				return
			}
		} catch (err) {
			console.error("Error on decrement::", err)
		} finally {
			setLoading(false)
		}
	}
	// When user selects a list from dropdown, switch to list mode
	const handleListSelect = (userListID: string | null) => {
		if (!userListID) {
			// go back to collection mode
			setSelectedList(null)
			return
		}
		const list = userLists.find((l) => String(l.userListID) === userListID)
		if (list) setSelectedList(list)
	}

	return (
		<Stack gap="xs" align="flex-start">
			{/* -/+ controls*/}
            <Group gap="xs" align="center">
				<ActionIcon variant="light" color="red" size="sm" onClick={decrement} disabled={displayQty === 0} loading={loading}>
					<IconMinus size={12} />
				</ActionIcon>

				<Text fw={600} size="sm" w={20} ta="center" c={loading ? "dimmed" : undefined}>
					{displayQty}
				</Text>

				<ActionIcon variant="light" color="spell-green" size="sm" onClick={increment} loading={loading}>
					<IconPlus size={12} />
				</ActionIcon>
			</Group>

			{/* Dropdown of all the lists*/}
			{userLists.length > 0 && (
				<Select
					key={selectKey}
					size="xs"
					placeholder="Add to collection"
					clearable
					data={userLists.map((list) => ({
						value: String(list.userListID),
						label: list.userListName,
					}))}
					value={selectedList ? String(selectedList.userListID) : null}
					onChange={handleListSelect}
					w={160}
                />
			)}
		</Stack>
	)
}
