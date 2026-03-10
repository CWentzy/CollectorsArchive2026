import { Avatar, Box, Card, Grid, Group, Skeleton, Stack, Text, Title } from "@mantine/core"
import { Users2Icon } from "lucide-react"
import { useEffect, useState } from "react"

// Shape of member data returned from the API
type Member = {
    userId: number
    userName: string
    photoUrl: string | null
    joinDate: string | null
}

const API_URL = "https://localhost:7053/api/Members/GetAllMembers"

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch(API_URL)
                if (!res.ok) throw new Error()
                const data: Member[] = await res.json()
                setMembers(data)
            } catch {
                setError("Could not load members. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchMembers()
    }, [])

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "Unknown"
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    }

    return (
        <Box mih="100vh" w="100%" py="md" px="xl">
            <Stack gap="lg">
                <Group gap="xs">
                    <Users2Icon size={22} />
                    <Title order={2}>Members</Title>
                </Group>

                {error ? (
                    <Text c="red" fz="sm">{error}</Text>
                ) : (
                    <>
                        <Text c="dimmed" fz="sm">
                            {loading
                                ? "Loading members..."
                                : `${members.length} collector${members.length !== 1 ? "s" : ""} in the archive`
                            }
                        </Text>

                        <Grid gutter="lg">
                            {loading
                                ? [...Array(4)].map((_, i) => (
                                    <Grid.Col key={i} span={{ base: 12, sm: 6 }}>
                                        <Skeleton height={90} radius="md" />
                                    </Grid.Col>
                                ))
                                : members.map((member) => (
                                    <Grid.Col key={member.userId} span={{ base: 12, sm: 6 }}>
                                        <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                                            <Group align="center">
                                                <Avatar
                                                    src={member.photoUrl ?? undefined}
                                                    color="spell-green"
                                                    radius="xl"
                                                    size="lg"
                                                >
                                                    {!member.photoUrl && member.userName[0].toUpperCase()}
                                                </Avatar>
                                                <Stack gap={4}>
                                                    <Text fw={700} fz="md">{member.userName}</Text>
                                                    <Text fz="xs" c="dimmed">Joined {formatDate(member.joinDate)}</Text>
                                                </Stack>
                                            </Group>
                                        </Card>
                                    </Grid.Col>
                                ))
                            }
                        </Grid>
                    </>
                )}
            </Stack>
        </Box>
    )
}