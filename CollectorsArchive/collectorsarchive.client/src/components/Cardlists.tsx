import {
	ActionIcon,
	Box,
	Button,
	Card,
	Divider,
	Group,
	Loader,
	Modal,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	Title,
	UnstyledButton,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import type { CardsAndPrints } from "../types/api"
import CardCollection from "./CardCollection"

// ─── API URL Placeholders ──────────────────────────────────────────────────────
// TODO: Replace these with your real .NET API endpoints
const BASE_URL = import.meta.env.VITE_SERVER_URL

const GET_USER_LISTS_URL = `${BASE_URL}/api/UserList/GetUserLists`
const CREATE_LIST_URL = `${BASE_URL}/api/UserList/CreateList`
const DELETE_LIST_URL = `${BASE_URL}/api/UserList/DeleteList`
const RENAME_LIST_URL = `${BASE_URL}/api/UserList/RenameList`
const GET_LIST_CARDS_URL = `${BASE_URL}/api/UserList/GetListCards`

// ─── Types ─────────────────────────────────────────────────────────────────────
interface UserList {
	userListID: number
	userProfileID: number
	userListName: string
}
//EACH PROFILE PAGE PASSES ITS OWN UserProfileID TO THIS COMPONENT, SO IT CAN FETCH THE LISTS FOR THE CORRECT USER
interface CardListsProps {
	userProfileID?: number
	isOwner?: boolean
}
// ─── Component ─────────────────────────────────────────────────────────────────
export default function CardLists({ userProfileID: propUserProfileID, isOwner = false }: CardListsProps) {
	const user = JSON.parse(localStorage.getItem("user") || "null")
	const userProfileID = propUserProfileID ?? user?.userId

	const [lists, setLists] = useState<UserList[]>([])
	const [selectedList, setSelectedList] = useState<UserList | null>(null)
	const [listCards, setListCards] = useState<CardsAndPrints | null>(null)
	const [loadingLists, setLoadingLists] = useState(true)
	const [loadingCards, setLoadingCards] = useState(false)

	// Modal state
	const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false)
	const [renameOpened, { open: openRename, close: closeRename }] = useDisclosure(false)
	const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false)

	const [newListName, setNewListName] = useState("")
	const [renameValue, setRenameValue] = useState("")
	const [actionLoading, setActionLoading] = useState(false)

	// ── Fetch all lists for the user ──────────────────────────────────────────
	useEffect(() => {
		if (!userProfileID) return
		fetchLists()
	}, [userProfileID])

	async function fetchLists() {
		setLoadingLists(true)
		try {
			// TODO: confirm query param name matches your controller
			const res = await fetch(`${GET_USER_LISTS_URL}?userProfileID=${userProfileID}`)
			const data: UserList[] = await res.json()
			setLists(data)
			// Auto-select the first list
			if (data.length > 0) {
				setSelectedList(data[0])
			}
		} catch (err) {
			console.error("Failed to fetch user lists:", err)
		} finally {
			setLoadingLists(false)
		}
	}

	// ── Fetch cards for selected list ─────────────────────────────────────────
	useEffect(() => {
		if (!selectedList) return
		fetchListCards(selectedList.userListID)
	}, [selectedList])

	async function fetchListCards(userListID: number) {
		setLoadingCards(true)
		setListCards(null)
		try {
			const res = await fetch(`${GET_LIST_CARDS_URL}?userListID=${userListID}`)
			const data = await res.json()
			setListCards({ cardsInfo: data.cards, printsInfo: data.printings })
		} catch (err) {
			console.error("Failed to fetch list cards:", err)
		} finally {
			setLoadingCards(false)
		}
	}

	// ── Create list ───────────────────────────────────────────────────────────
	async function handleCreateList() {
		if (!newListName.trim()) return
		setActionLoading(true)
		try {
			const res = await fetch(CREATE_LIST_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userProfileID, userListName: newListName.trim() }),
			})
			const created: UserList = await res.json()
			setLists((prev) => [...prev, created])
			setSelectedList(created)
			setNewListName("")
			closeCreate()
		} catch (err) {
			console.error("Failed to create list:", err)
		} finally {
			setActionLoading(false)
		}
	}

	// ── Rename list ───────────────────────────────────────────────────────────
	async function handleRenameList() {
		if (!selectedList || !renameValue.trim()) return
		setActionLoading(true)
		try {
			await fetch(RENAME_LIST_URL, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userListID: selectedList.userListID, userListName: renameValue.trim() }),
			})
			const updated = { ...selectedList, userListName: renameValue.trim() }
			setLists((prev) => prev.map((l) => (l.userListID === selectedList.userListID ? updated : l)))
			setSelectedList(updated)
			closeRename()
		} catch (err) {
			console.error("Failed to rename list:", err)
		} finally {
			setActionLoading(false)
		}
	}

	// ── Delete list ───────────────────────────────────────────────────────────
	async function handleDeleteList() {
		if (!selectedList) return
		setActionLoading(true)
		try {
			await fetch(`${DELETE_LIST_URL}?userListID=${selectedList.userListID}`, {
				method: "DELETE",
			})
			const remaining = lists.filter((l) => l.userListID !== selectedList.userListID)
			setLists(remaining)
			setSelectedList(remaining[0] ?? null)
			setListCards(null)
			closeDelete()
		} catch (err) {
			console.error("Failed to delete list:", err)
		} finally {
			setActionLoading(false)
		}
	}

	// ─────────────────────────────────────────────────────────────────────────
	return (
		<>
			{/* ── Create List Modal ── */}
			<Modal opened={createOpened} onClose={closeCreate} title="Create New List" centered>
				<Stack>
					<TextInput
						label="List Name"
						placeholder="e.g. Synchro Focus"
						value={newListName}
						onChange={(e) => setNewListName(e.currentTarget.value)}
						onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
					/>
					<Button
						color="spell-green"
						onClick={handleCreateList}
						loading={actionLoading}
						disabled={!newListName.trim()}
					>
						Create
					</Button>
				</Stack>
			</Modal>

			{/* ── Rename List Modal ── */}
			<Modal opened={renameOpened} onClose={closeRename} title="Rename List" centered>
				<Stack>
					<TextInput
						label="New Name"
						placeholder={selectedList?.userListName}
						value={renameValue}
						onChange={(e) => setRenameValue(e.currentTarget.value)}
						onKeyDown={(e) => e.key === "Enter" && handleRenameList()}
					/>
					<Button
						color="spell-green"
						onClick={handleRenameList}
						loading={actionLoading}
						disabled={!renameValue.trim()}
					>
						Save
					</Button>
				</Stack>
			</Modal>

			{/* ── Delete Confirm Modal ── */}
			<Modal opened={deleteOpened} onClose={closeDelete} title="Delete List" centered>
				<Stack>
					<Text size="sm">
						Are you sure you want to delete{" "}
						<Text span fw={600}>
							{selectedList?.userListName}
						</Text>
						? This cannot be undone.
					</Text>
					<Group justify="flex-end">
						<Button variant="default" onClick={closeDelete}>
							Cancel
						</Button>
						<Button color="red" onClick={handleDeleteList} loading={actionLoading}>
							Delete
						</Button>
					</Group>
				</Stack>
			</Modal>

			{/* ── Main Card ── */}
			<Card withBorder radius="md" p={0}>
				<Group align="stretch" gap={0} wrap="nowrap">

					{/* ── Left Panel: List Sidebar ── */}
					<Box w={220} style={{ borderRight: "1px solid var(--mantine-color-dark-4)", flexShrink: 0 }}>
						<Group justify="space-between" px="md" py="sm">
							<Text size="sm" fw={600} tt="uppercase" c="dimmed">
								All Lists
							</Text>
							{isOwner && (
								<ActionIcon
									variant="subtle"
									color="spell-green"
									size="sm"
									onClick={openCreate}
									title="Create new list"
								>
									<IconPlus size={14} />
								</ActionIcon>
							)}
						</Group>

						<Divider />

						<ScrollArea h={500} px="xs" py="xs">
							{loadingLists ? (
								<Group justify="center" pt="md">
									<Loader size="sm" />
								</Group>
							) : lists.length === 0 ? (
								<Text size="xs" c="dimmed" px="xs" pt="sm">
									No lists yet. Click + to create one.
								</Text>
							) : (
								<Stack gap={4} pt={4}>
									{lists.map((list) => {
										const isSelected = selectedList?.userListID === list.userListID
										return (
											<UnstyledButton
												key={list.userListID}
												onClick={() => setSelectedList(list)}
												px="sm"
												py={6}
												style={{
													borderRadius: "var(--mantine-radius-sm)",
													backgroundColor: isSelected
														? "var(--mantine-color-spell-green-9)"
														: "transparent",
													transition: "background-color 100ms ease",
												}}
											>
												<Text size="sm" fw={isSelected ? 600 : 400} c={isSelected ? "spell-green" : undefined}>
													{list.userListName}
												</Text>
											</UnstyledButton>
										)
									})}
								</Stack>
							)}
						</ScrollArea>
					</Box>

					{/* ── Right Panel: Cards in Selected List ── */}
					<Box style={{ flex: 1, minWidth: 0 }}>
						{selectedList ? (
							<Stack gap={0} h="100%">
								{/* Header */}
								<Group justify="space-between" px="lg" py="sm">
									<Title order={5}>{selectedList.userListName}</Title>
									{isOwner && (
									<Group gap="xs">
										<Button
											size="xs"
											variant="light"
											leftSection={<IconEdit size={13} />}
											onClick={() => {
												setRenameValue(selectedList.userListName)
												openRename()
											}}
										>
											Edit Name
										</Button>
										<Button
											size="xs"
											variant="light"
											color="red"
											leftSection={<IconTrash size={13} />}
											onClick={openDelete}
										>
											Delete List
										</Button>
										</Group>
									)}
								</Group>

								<Divider />

								{/* Cards */}
								<ScrollArea h={500} px="lg" py="md">
									{loadingCards ? (
										<Group justify="center" pt="xl">
											<Loader size="sm" />
										</Group>
									) : (
										<CardCollection cardsAndPrints={listCards} />
									)}
								</ScrollArea>
							</Stack>
						) : (
							<Group justify="center" align="center" h={540}>
								<Text c="dimmed" size="sm">
									{lists.length === 0
										? "Create a list to get started."
										: "Select a list to view its cards."}
								</Text>
							</Group>
						)}
					</Box>
				</Group>
			</Card>
		</>
	)
}