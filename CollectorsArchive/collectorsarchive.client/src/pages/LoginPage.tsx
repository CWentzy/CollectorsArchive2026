import {
	Anchor,
	Button,
	Center,
	Container,
	Divider,
	Group,
	Paper,
	Stack,
	Text,
	TextInput,
	type PaperProps,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { upperFirst, useToggle } from "@mantine/hooks"
import { useGoogleLogin } from "@react-oauth/google"
import { IconBrandGoogleFilled } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"

const GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

export default function LoginPage(props: PaperProps) {
	const [type, toggle] = useToggle(["login", "register"])
	const navigate = useNavigate()

	const login = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			try {
				// Fetch user info using the access token we got
				const response = await fetch(GOOGLE_USER_INFO_URL, {
					headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
				})

				const userData = await response.json()
				const email = userData.email
				const userName = parseEmailUsername(email)

				// Navigate to home page with user data
				navigate("/home", { state: { userName, email } })
			} catch (error) {
				console.error("Failed to fetch user info from Google:", error)
			}
		},
		onError: () => console.log("Login Failed"),
	})

	const form = useForm({
		initialValues: {
			email: "",
			name: "",
			password: "",
		},

		validate: {
			email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
			password: (val) => (val.length <= 6 ? "Password should include at least 6 characters" : null),
		},
	})

	return (
		<Container size="xs">
			<Paper p="lg" {...props}>
				<Center>
					<Text size="lg" fw={500} c="bright">
						Welcome to Collector's Archive
					</Text>
				</Center>

				<Group mb="md" mt="md" align="center" justify="center">
					{/* Google login button */}
<<<<<<< HEAD
					<GoogleLogin
						onSuccess={(credentialResponse) => {
							console.log("Google login success:", credentialResponse)

							// this will  have a credential ID token
							if (credentialResponse.credential) {
								// Decode the Google ID token to extract user info
								const decoded: any = jwtDecode(credentialResponse.credential)

								// Extract email
								const email = decoded.email
								console.log("Google email:", email)

								// Store email in form
								form.setFieldValue("email", email)

								// Extract username before "@"
								const userName = parseEmailUsername(email)
								console.log("Google username:", userName)
								console.log("Full credentialResponse:", credentialResponse)

								// Navigate to home page with user data
								navigate("/home", { state: { userName, email } })
							}
						}}
						onError={() => {
							console.log("Google login failed")
						}}
					/>
					<Button>Placeholder</Button>
=======
					<Button fullWidth variant="light" leftSection={<IconBrandGoogleFilled size={16} />} onClick={() => login()}>
						Sign in with Google
					</Button>
>>>>>>> e33cec7b0ad03b485cdda63877fa2d0399699a8f
				</Group>

				<Divider label="or continue with email" labelPosition="center" my="lg" />

				<form onSubmit={form.onSubmit(() => {})}>
					<Stack>
						{type === "register" && (
							<TextInput
								label="Username"
								value={form.values.name}
								onChange={(event) => form.setFieldValue("name", event.currentTarget.value)}
							/>
						)}

						<TextInput
							required
							label="Email"
							value={form.values.email}
							onChange={(event) => form.setFieldValue("email", event.currentTarget.value)}
							error={form.errors.email && "Invalid email"}
						/>
					</Stack>

					<Group justify="space-between" mt="xl">
						<Anchor component="button" type="button" c="bright" opacity={0.85} onClick={() => toggle()} size="xs">
							{type === "register" ? "Already have an account? Login" : "Don't have an account? Register"}
						</Anchor>
						<Button type="submit">{upperFirst(type)}</Button>
					</Group>
				</form>
			</Paper>
		</Container>
	)
}

// this function extracts the part before @ from an email
function parseEmailUsername(email: string): string {
	if (!email) return ""
	return email.split("@")[0]
}
