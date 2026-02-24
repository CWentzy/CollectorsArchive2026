import {
	Anchor,
	Button,
	Center,
	Container,
	Divider,
	Group,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	type PaperProps,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { upperFirst, useToggle } from "@mantine/hooks"
import { GoogleLogin } from "@react-oauth/google" // added for google login
import { jwtDecode } from "jwt-decode" // this is for storing or getting users credentials from google
import { useNavigate } from "react-router-dom"

export default function LoginPage(props: PaperProps) {
	const [type, toggle] = useToggle(["login", "register"])

	const navigate = useNavigate()

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
						Welcome to Collector's Archive, {type} with
					</Text>
				</Center>

				<Group grow mb="md" mt="md">
					{/* Google login button */}
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
