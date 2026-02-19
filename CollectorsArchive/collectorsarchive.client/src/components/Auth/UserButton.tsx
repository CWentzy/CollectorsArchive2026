import { Skeleton } from "@mantine/core"
import { useMounted } from "@mantine/hooks"
import { useAuth } from "../../auth/useAuth"
import LoginButton from "./LoginButton"
import ProfileButton from "./ProfileButton"

export default function UserButton() {
	const { user } = useAuth()
	const mounted = useMounted()

	if (!mounted) {
		return <Skeleton h={38} w={38} radius="sm" animate />
	}

	return user ? <ProfileButton user={user} /> : <LoginButton />
}
