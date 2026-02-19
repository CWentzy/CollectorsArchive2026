import { Avatar, Button, Popover, Stack, Text } from "@mantine/core"
import { useGoogleLogin } from "@react-oauth/google"
import { SquareUserIcon } from "lucide-react"
import { FaGoogle } from "react-icons/fa6"
import { useAuth } from "../../auth/useAuth"

export default function LoginButton() {
	const auth = useAuth()
	const { loginPopoverOpened, openLoginPopover, closeLoginPopover } = auth

	const login = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			try {
				// Send access token to our backend, it verifies with Google and returns a JWT
				const response = await fetch("/api/auth/google", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ accessToken: tokenResponse.access_token }),
				})

				if (!response.ok) {
					throw new Error(`Auth failed: ${response.status}`)
				}

				const data = await response.json()

				auth.login(data.token, {
					email: data.email,
					userName: data.userName,
					pictureUrl: data.pictureUrl,
				})
			} catch (error) {
				console.error("Login failed:", error)
			}
		},
		onError: () => console.log("Login Failed"),
	})

	return (
		<Popover
			withArrow
			arrowOffset={15}
			position="top-end"
			radius="sm"
			opened={loginPopoverOpened}
			onChange={(o) => (o ? openLoginPopover() : closeLoginPopover())}
		>
			<Popover.Target>
				<Avatar
					variant="light"
					radius="sm"
					color="spell-green"
					onClick={() => (loginPopoverOpened ? closeLoginPopover() : openLoginPopover())}
					style={{ cursor: "pointer" }}
				>
					<SquareUserIcon size={24} />
				</Avatar>
			</Popover.Target>
			<Popover.Dropdown w={300}>
				<Stack align="center" gap="xs">
					<Text size="sm">Login for the full experience!</Text>
					<Button fullWidth variant="light" leftSection={<FaGoogle size={18} />} onClick={() => login()}>
						Google
					</Button>
				</Stack>
			</Popover.Dropdown>
		</Popover>
	)
}
