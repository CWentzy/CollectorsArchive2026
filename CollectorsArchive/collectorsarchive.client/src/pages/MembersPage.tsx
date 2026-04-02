import { Avatar, Box, Card, Grid, Group, Skeleton, Stack, Text, Title } from "@mantine/core"
import { Users2Icon } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

// Shape of member data returned from the API
type Member = {
	userId: number
	userName: string
	photoUrl: string | null
	joinDate: string | null
}

const API_URL = `${import.meta.env.VITE_SERVER_URL}/api/Members/GetAllMembers`

const formatDate = (dateStr: string | null) => {
	if (!dateStr) return "Unknown"
	return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" })
}
export default function MembersPage() {
	const [members, setMembers] = useState<Member[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

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

	const handleMemberClick = (member: Member) => {
		navigate(`/profile/${member.userId}`, { state: { member } })
	}

	return (
		<Box mih="100vh" w="100%" py="md" px="xl">
			<Stack gap="lg">
				<Group gap="xs">
					<Users2Icon size={22} />
					<Title order={2}>Members</Title>
				</Group>

				{error ? (
					<Text c="red" fz="sm">
						{error}
					</Text>
				) : (
					<>
						<Text c="dimmed" fz="sm">
							{loading
								? "Loading members..."
								: `${members.length} collector${members.length !== 1 ? "s" : ""} in the archive`}
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
											<Card
												shadow="sm"
												padding="lg"
												radius="md"
												withBorder
												h="100%"
												style={{ cursor: "pointer" }}
												onClick={() => handleMemberClick(member)}
											>
												<Group align="center">
													<Avatar src={member.photoUrl ?? undefined} color="spell-green" radius="xl" size="lg">
														{!member.photoUrl && member.userName[0].toUpperCase()}
													</Avatar>
													<Stack gap={4}>
														<Text fw={700} fz="md">
															{member.userName}
														</Text>
														<Text fz="xs" c="dimmed">
															Joined {formatDate(member.joinDate)}
														</Text>
													</Stack>
												</Group>
											</Card>
										</Grid.Col>
									))}
						</Grid>
					</>
				)}
			</Stack>
		</Box>
	)
}
