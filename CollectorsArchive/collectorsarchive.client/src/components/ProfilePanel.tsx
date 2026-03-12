import {
    ActionIcon,
    Avatar,
    Badge,
    Box,
    Button,
    Divider,
    Group,
    Stack,
    Text,
    Transition,
    useMantineColorScheme,
    Loader,
    Modal,
    Textarea,
    TextInput,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { useDisclosure } from "@mantine/hooks"
import {
    IconCalendar,
    IconEdit,
    IconLayoutList,
    IconLogout,
    IconMoon,
    IconSun,
    IconUsers,
    IconLayoutSidebarRightCollapse,
    IconCards,
} from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface ProfilePanelProps {
    opened: boolean
    onClose: () => void
}

type UserProfile = {
    profileId: number
    userId: number
    userName: string
    bio: string | null
    photoUrl: string | null
    joinDate: string
}

const API_BASE = "https://localhost:7053/api/UserProfile"
const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}
    export function ProfilePanel({ opened, onClose }: ProfilePanelProps) {
        const user = JSON.parse(localStorage.getItem("user") || "null")
        const userId = user?.userId ?? user?.id ?? null

        const [profile, setProfile] = useState<UserProfile | null>(null)
        const [loading, setLoading] = useState(false)
        const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false)

        const { colorScheme, toggleColorScheme } = useMantineColorScheme()
        const isDark = colorScheme === "dark"
        const navigate = useNavigate()

        const form = useForm({
            initialValues: { userName: "", bio: "", photoUrl: "" },
        })

        // Fetch profile whenever the panel opens
        useEffect(() => {
            if (!opened || !userId) return
            setLoading(true)
            fetch(`${API_BASE}/${userId}`)
                .then((res) => {
                    if (!res.ok) throw new Error()
                    return res.json()
                })
                .then((data: UserProfile) => {
                    setProfile(data)
                    // Sync localStorage username in case it changed
                    const stored = JSON.parse(localStorage.getItem("user") || "null")
                    if (stored && data.userName) {
                        stored.userName = data.userName
                        localStorage.setItem("user", JSON.stringify(stored))
                    }
                })
                .catch(() => setProfile(null))
                .finally(() => setLoading(false))
        }, [opened, userId])

        const handleOpenEdit = () => {
            form.setValues({
                userName: profile?.userName ?? "",
                bio: profile?.bio ?? "",
                photoUrl: profile?.photoUrl ?? "",
            })
            openEdit()
        }

        const handleSave = async () => {
            await fetch(`${API_BASE}/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userName: form.values.userName || null,
                    bio: form.values.bio || null,
                    photoUrl: form.values.photoUrl || null,
                }),
            })
            // Re-fetch profile to reflect saved changes
            const res = await fetch(`${API_BASE}/${userId}`)
            const updated: UserProfile = await res.json()
            setProfile(updated)
            // Update localStorage username
            const stored = JSON.parse(localStorage.getItem("user") || "null")
            if (stored) {
                stored.userName = updated.userName
                localStorage.setItem("user", JSON.stringify(stored))
            }
            closeEdit()
        }

        const handleLogout = () => {
            localStorage.removeItem("user")
            onClose()
            navigate("/login")
        }

        const userName = profile?.userName ?? user?.userName ?? "User"
        const email = user?.email ?? ""

        return (
            <>
                {/* ── Edit Modal ── */}
                <Modal opened={editOpened} onClose={closeEdit} title="Edit Profile" centered size="sm">
                    <Stack gap="sm">
                        <TextInput
                            label="Username"
                            placeholder="Enter username"
                            {...form.getInputProps("userName")}
                        />
                        <Textarea
                            label="Bio"
                            placeholder="Tell the world about your collection..."
                            autosize
                            minRows={3}
                            maxRows={6}
                            {...form.getInputProps("bio")}
                        />
                        <TextInput
                            label="Profile Picture URL"
                            placeholder="https://..."
                            {...form.getInputProps("photoUrl")}
                        />
                        <Group justify="flex-end" mt="sm">
                            <Button variant="default" size="xs" onClick={closeEdit}>Cancel</Button>
                            <Button color="spell-green" size="xs" onClick={handleSave}>Save</Button>
                        </Group>
                    </Stack>
                </Modal>

                {/* ── Panel ── */}
                <Transition mounted={opened} transition="slide-left" duration={300} timingFunction="ease">
                    {(styles) => (
                        <Box style={{ ...styles, height: "100%", overflowY: "auto" }}>
                            <Stack gap="md" p="lg" h="100%">

                                {/* ── Close button ── */}
                                <Group justify="flex-start">
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        size="sm"
                                        onClick={onClose}
                                        aria-label="Close profile panel"
                                    >
                                        <IconLayoutSidebarRightCollapse size={18} />
                                    </ActionIcon>
                                </Group>

                                {loading ? (
                                    <Group justify="center" mt="xl">
                                        <Loader size="sm" color="spell-green" />
                                    </Group>
                                ) : (
                                    <>
                                        {/* ── Avatar + Name ── */}
                                        <Stack align="center" gap="xs">
                                            <Avatar
                                                src={profile?.photoUrl ?? undefined}
                                                size={80}
                                                radius="xl"
                                                color="spell-green"
                                                variant="filled"
                                                style={{
                                                    fontSize: "2rem",
                                                    fontWeight: 600,
                                                    border: "3px solid var(--mantine-color-spell-green-4)",
                                                }}
                                            >
                                                {!profile?.photoUrl && userName[0]?.toUpperCase()}
                                            </Avatar>

                                            <Stack gap={2} align="center">
                                                <Text fw={600} size="lg" lh={1.2}>{userName}</Text>
                                                <Text size="xs" c="dimmed" truncate maw={180}>{email}</Text>
                                            </Stack>

                                            <Badge variant="light" color="spell-green" size="sm" radius="sm">
                                                Collector
                                            </Badge>
                                        </Stack>

                                        <Divider />

                                        {/* ── Bio ── */}
                                        <Stack gap={4}>
                                            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                                                Bio
                                            </Text>
                                            <Text size="sm" c="dimmed" fs={profile?.bio ? "normal" : "italic"}>
                                                {profile?.bio ?? "No bio yet — tell the world about your collection!"}
                                            </Text>
                                        </Stack>

                                        <Divider />

                                        {/* ── Join Date ── */}
                                        <Group gap="xs">
                                            <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
                                            <Text size="xs" c="dimmed">
                                                Joined {profile?.joinDate ? formatDate(profile.joinDate) : "—"}
                                            </Text>
                                        </Group>

                                        {/* FIX 3: Added onClick={handleOpenEdit} — was missing so button did nothing */}
                                        <Button
                                            variant="light"
                                            color="spell-green"
                                            size="xs"
                                            leftSection={<IconEdit size={14} />}
                                            onClick={handleOpenEdit}
                                        >
                                            Edit Profile
                                        </Button>

                                        <Divider />

                                        {/* ── Stats ── */}
                                        <Stack gap={4}>
                                            <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
                                                Stats
                                            </Text>
                                        </Stack>

                                        <Group gap="xs" align="center">
                                            <IconCards size={14} color="var(--mantine-color-spell-green-5)" />
                                            <Text size="sm">Cards Collected</Text>
                                            <Text size="sm" fw={600} ml="auto" c="spell-green">--</Text>
                                        </Group>

                                        <Group gap="xs" align="center">
                                            <IconLayoutList size={14} color="var(--mantine-color-spell-green-5)" />
                                            <Text size="sm">Card Lists</Text>
                                            <Text size="sm" fw={600} ml="auto" c="spell-green">--</Text>
                                        </Group>

                                        <Group gap="xs" align="center">
                                            <IconUsers size={14} color="var(--mantine-color-spell-green-5)" />
                                            <Text size="sm">Friends</Text>
                                            <Text size="sm" fw={600} ml="auto" c="spell-green">--</Text>
                                        </Group>

                                        <Divider />

                                        {/* ── Theme Toggle ── */}
                                        <Group justify="space-between" align="center">
                                            <Text size="sm" c="dimmed">
                                                {isDark ? "Dark mode" : "Light mode"}
                                            </Text>
                                            <ActionIcon
                                                variant="light"
                                                color="spell-green"
                                                size="md"
                                                onClick={() => toggleColorScheme()}
                                                aria-label="Toggle colour scheme"
                                            >
                                                {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
                                            </ActionIcon>
                                        </Group>

                                        <Divider />

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
                                    </>
                                )}

                            </Stack>
                        </Box>
                    )}
                </Transition>
            </>
        )
    }