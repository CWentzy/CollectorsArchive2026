import {
	ActionIcon,
	Anchor,
	Avatar,
	Badge,
	Box,
	Button,
	Divider,
	Group,
	Loader,
	Modal,
	Overlay,
	Stack,
	Text,
	Textarea,
	TextInput,
	Transition,
	useMantineColorScheme,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { useDisclosure, useHover } from "@mantine/hooks"
import { IconCards, IconEdit, IconLayoutList, IconLogout, IconMoon, IconSun } from "@tabler/icons-react"
import { XIcon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { formatDate } from "../utils"

const GET_USER_PROFILE = `${import.meta.env.VITE_SERVER_URL}/api/UserProfile`
const GET_USER_COLLECTION = `${import.meta.env.VITE_SERVER_URL}/api/DisplayCollection/DisplayCollection`

interface ProfilePanelProps {
	opened: boolean
	onClose: () => void
}

export type UserProfile = {
	userId: number
	userName: string
	bio: string | null
	photoUrl: string | null
	joinDate: string
}

type Member = {
	userId: number
	bio: string | null
	userName: string
	photoUrl: string | null
	joinDate: string | null
}

export function ProfilePanel({ opened, onClose }: ProfilePanelProps) {
	const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "null"), [])
	const location = useLocation()

	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const [cards, setCards] = useState<{ cardID: string; cardName: string }[]>([])
	const [listsCount, setListsCount] = useState<number | null>(null)
	const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false)
	const { hovered, ref } = useHover()
	const member: Member | null = location.state?.member ?? null

	// Refs to track which userID/userName we've fetched profile/collection for to prevent unnecessary re-fetches
	const fetchedProfileForUserRef = useRef<number | null>(null)
	const fetchedCollectionForUserNameRef = useRef<string | null>(null)

	const { colorScheme, toggleColorScheme } = useMantineColorScheme()
	const isDark = colorScheme === "dark"
	const navigate = useNavigate()

	const form = useForm({
		initialValues: { userName: "", bio: "", photoUrl: "" },
	})

	const userId = profile?.userId ?? user?.userId
	const userName = profile?.userName ?? user?.userName ?? "User"
	console.log(userName, "username in profile panel")
	const email = user?.email ?? ""

	// Fetch profile whenever the panel opens or userId changes
	useEffect(() => {
		if (!opened || !userId) return
		if (fetchedProfileForUserRef.current === userId) return

		const loadProfile = async () => {
			setLoading(true)

			try {
				const profileResponse = await fetch(`${GET_USER_PROFILE}/${userId}`)
				if (!profileResponse.ok) throw new Error()

				const data: UserProfile = await profileResponse.json()

				setProfile(data)
				fetchedProfileForUserRef.current = userId

				// Sync localStorage username in case it changed
				const stored = JSON.parse(localStorage.getItem("user") || "null")
				if (stored && data.userName && stored.userName !== data.userName) {
					stored.userName = data.userName
					localStorage.setItem("user", JSON.stringify(stored))
				}
			} catch {
				setProfile(null)
				fetchedProfileForUserRef.current = null
			} finally {
				setLoading(false)
			}
		}

		loadProfile()
	}, [opened, userId])

	useEffect(() => {
		const idToUse = member?.userId ?? user?.userId
		if (!member?.userId) return
		const fetchListsCount = async () => {
			try {
				const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/UserList/GetUserLists?userProfileID=${idToUse}`)
				const data = await res.json()
				setListsCount(data.length)
			} catch (err) {
				console.error(err)
			}
		}
		fetchListsCount()
	}, [member])

	// Fetch collection whenever the panel opens or username changes
	useEffect(() => {
		const nameToUse = member?.userName ?? user?.userName
		if (!nameToUse) return

		const loadCollection = async () => {
			try {
				const collectionResponse = await fetch(GET_USER_COLLECTION, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ UserName: nameToUse }),
				})
				if (!collectionResponse.ok) throw new Error()

				const col = await collectionResponse.json()
				setCards(col.collection ?? [])
			} catch (err) {
				console.error("Failed to fetch collection:", err)
				setCards([])
			}
		}

		loadCollection()
	}, [member, user])

	const handleOpenEdit = () => {
		form.setValues({
			userName: profile?.userName ?? "",
			bio: profile?.bio ?? "",
			photoUrl: profile?.photoUrl ?? "",
		})
		form.resetDirty()

		openEdit()
	}

	const handleSave = async (values: typeof form.values) => {
		setIsSaving(true)

		try {
			// TODO: just return the updated profile from the PUT endpoint to avoid an extra fetch
			const response = await fetch(`${GET_USER_PROFILE}/${userId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userName: values.userName || null,
					bio: values.bio || null,
					photoUrl: values.photoUrl || null,
				}),
			})

			if (!response.ok) throw new Error("Failed to save profile")

			// Re-fetch profile to reflect saved changes (TODO: remove this extra fetch - read the to-do above ^)
			const res = await fetch(`${GET_USER_PROFILE}/${userId}`)
			const updated: UserProfile = await res.json()

			setProfile(updated)
			fetchedProfileForUserRef.current = userId

			// Update localStorage username
			const stored = JSON.parse(localStorage.getItem("user") || "null")
			if (stored) {
				stored.userName = updated.userName
				localStorage.setItem("user", JSON.stringify(stored))
			}

			if (fetchedCollectionForUserNameRef.current !== updated.userName) {
				const collectionRes = await fetch(GET_USER_COLLECTION, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ UserName: updated.userName }),
				})

				if (collectionRes.ok) {
					const col = await collectionRes.json()
					setCards(col.collection ?? [])
					fetchedCollectionForUserNameRef.current = updated.userName
				}
			}

			closeEdit()
		} catch (error) {
			console.error(error)
		} finally {
			setIsSaving(false)
		}
	}

	const handleLogout = () => {
		localStorage.removeItem("user")
		window.dispatchEvent(new Event("authChange"))
		onClose()
		navigate("/login")
	}

	return (
		<>
			{/* ── Edit Modal ── */}
			<Modal opened={editOpened} onClose={closeEdit} title="Edit Profile" centered size="sm">
				<form onSubmit={form.onSubmit(handleSave)}>
					<Stack gap="sm">
						<TextInput label="Username" placeholder="Enter username" {...form.getInputProps("userName")} disabled />
						<Textarea
							label="Bio"
							placeholder="Tell the world about your collection..."
							autosize
							minRows={3}
							maxRows={6}
							{...form.getInputProps("bio")}
						/>
						<TextInput label="Profile Picture URL" placeholder="https://..." {...form.getInputProps("photoUrl")} />
						<Group justify="flex-end" mt="sm">
							<Button variant="subtle" size="xs" onClick={closeEdit}>
								Cancel
							</Button>
							<Button type="submit" size="xs" loading={isSaving} disabled={!form.isDirty()}>
								Save
							</Button>
						</Group>
					</Stack>
				</form>
			</Modal>

			{/* ── Panel ── */}
			<Transition mounted={opened} transition="slide-left" duration={300} timingFunction="ease">
				{(styles) => (
					<Box style={{ ...styles, height: "100%", overflowY: "auto" }}>
						<Stack gap="md" p="lg">
							{/* ── Close button ── */}
							<Group justify="flex-start">
								<ActionIcon
									variant="transparent"
									color="gray"
									size="sm"
									onClick={onClose}
									aria-label="Close profile panel"
								>
									<XIcon size={22} />
								</ActionIcon>
							</Group>

							{loading ? (
								<Group justify="center" mt="xl">
									<Loader size="sm" />
								</Group>
							) : (
								<>
									{/* ── Avatar + Name ── */}
									<Stack align="center" gap="xs" mb="sm">
										<Anchor href={`/profile/${profile?.userId}`} td="none">
											<Box ref={ref} pos="relative" w={80} h={80}>
												<Avatar
													src={profile?.photoUrl}
													size={80}
													radius={80}
													name={profile?.userName}
													color="initials"
													styles={{
														image: {
															filter: hovered ? "brightness(0.4)" : "none",
															transition: "filter 150ms ease",
														},
													}}
												/>

												<Overlay
													center
													color="#000"
													backgroundOpacity={0}
													style={{
														opacity: hovered ? 1 : 0,
														transition: "opacity 150ms ease",
														pointerEvents: "none",
													}}
												>
													<Text size="xs" c="white" fw={600} ta="center">
														View
														<br />
														Profile
													</Text>
												</Overlay>
											</Box>
										</Anchor>

										<Stack gap="xs" align="center">
											<Text fw={600} size="lg" lh={1.2}>
												{userName}
											</Text>
											<Badge variant="light" size="xs" radius="sm">
												Collector
											</Badge>
										</Stack>

										<Stack gap={2} align="center">
											<Text size="xs" c="dimmed">
												{email}
											</Text>
											<Text size="xs" c="dimmed">
												Joined {profile?.joinDate ? formatDate(profile.joinDate) : "—"}
											</Text>
										</Stack>
									</Stack>

									{/* ── Bio ── */}
									{profile?.bio && (
										<>
											<Text size="sm" fs={profile?.bio ? "normal" : "italic"}>
												{profile.bio}
											</Text>

											<Divider />
										</>
									)}

									{/* ── Stats ── */}
									<Stack gap="xs">
										<Group gap="xs" align="center">
											<IconCards size={16} color="var(--mantine-color-dimmed)" />
											<Text size="sm">Cards Collected</Text>
											<Text size="sm" fw={600} ml="auto" c="spell-green">
												{cards.length}
											</Text>
										</Group>

										<Group gap="xs" align="center">
											<IconLayoutList size={16} color="var(--mantine-color-dimmed)" />
											<Text size="sm">Card Lists</Text>
											<Text size="sm" fw={600} ml="auto" c="spell-green">
												{listsCount ?? "—"}
											</Text>
										</Group>
									</Stack>

									<Divider />

									<Stack gap="xs">
										{/* ── Theme Toggle ── */}
										<Group justify="space-between" align="center">
											<Text size="xs" c="dimmed">
												Toggle Theme
											</Text>
											<ActionIcon
												variant="light"
												size="md"
												onClick={() => toggleColorScheme()}
												aria-label="Toggle colour scheme"
											>
												{isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
											</ActionIcon>
										</Group>

										{/* Edit Button */}
										<Button variant="light" size="xs" leftSection={<IconEdit size={14} />} onClick={handleOpenEdit}>
											Edit Profile
										</Button>

										{/* ── Logout ── */}
										<Button
											variant="light"
											color="red"
											size="xs"
											leftSection={<IconLogout size={14} />}
											onClick={handleLogout}
											mt="auto"
										>
											Logout
										</Button>
									</Stack>
								</>
							)}
						</Stack>
					</Box>
				)}
			</Transition>
		</>
	)
}
