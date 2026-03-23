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
import { useState } from "react"

const GoogleUserInfoURL = "https://www.googleapis.com/oauth2/v3/userinfo"

const RegisterNewUserURL = "https://collectorsarchive.azurewebsites.net/api/Auth/RegisterNewUser"

const LoginUsingGoogleURL = "https://collectorsarchive.azurewebsites.net/api/Auth/LoginUsingGoogle"

const RequestForTempCodeURL = "https://collectorsarchive.azurewebsites.net/api/Auth/RequestForTempCode"
const RegistrationForNonGoogleUsers = "https://collectorsarchive.azurewebsites.net/api/Auth/ForNonGoogleNewUser"

// this variable i will be using it for after user recieved an email with the code
const VerfyingTemporaryCodeURL = "https://collectorsarchive.azurewebsites.net/api/Auth/VerfyingTemporaryCode"

export default function LoginPage(props: PaperProps) {
	const [type, toggle] = useToggle(["login", "register"])
	const navigate = useNavigate()

	// this is for temp code will user provide from their email
	const [isCodeStep, setIsCodeStep] = useState(false)
	const [code, setCode] = useState("")
	const [savedEmail, setSavedEmail] = useState("")

	const login = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			try {
				const response = await fetch(GoogleUserInfoURL, {
					headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
				})

				const userData = await response.json()
				const email = userData.email
				const userName = parseEmailUsername(email)
				const googleSubject = userData.sub
				const photoUrl = userData.picture

				// try login first
				const backendResponse = await fetch(LoginUsingGoogleURL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ googleSubject, photoUrl }),
				})

				const loginData = await backendResponse.json()

				// if user not found then register
				if (loginData.message === "User not found. Please register first.") {
					await fetch(RegisterNewUserURL, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							email,
							name: userName,
							googleSubject,
							photoUrl,
						}),
					})
				}

				localStorage.setItem(
					"user",
					JSON.stringify({
						userId: loginData.userId,
						email,
						userName,
						photoUrl: loginData.photoUrl ?? photoUrl,
					})
				)
				navigate("/home")
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
		},

		validate: {
			email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
		},
	})

	return (
		<Container size="xs">
			<Paper p="lg" {...props}>
				<Center>
					<Text size="lg" fw={500}>
						Welcome to Collector's Archive
					</Text>
				</Center>

				<Group mb="md" mt="md" align="center" justify="center">
					<Button fullWidth variant="light" leftSection={<IconBrandGoogleFilled size={16} />} onClick={() => login()}>
						Sign in with Google
					</Button>
				</Group>

				<Divider label="or continue with email" labelPosition="center" my="lg" />

				<form
					onSubmit={form.onSubmit(async (values) => {
						const { email } = values

						// S BOTH login and register request code
						const response = await fetch(RequestForTempCodeURL, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ email }),
						})

						if (!response.ok) {
							console.log("Failed to send code")
							return
						}

						// save email and move to code step
						setSavedEmail(email)
						setIsCodeStep(true)
					})}
				>
					<Stack>
						<TextInput
							required
							label="Email (for non-Google login)"
							value={form.values.email}
							onChange={(event) => form.setFieldValue("email", event.currentTarget.value)}
							error={form.errors.email && "Invalid email"}
						/>

						{/* show code input after email submitted */}
						{isCodeStep && (
							<TextInput label="Enter the code we emailed you" value={code} onChange={(e) => setCode(e.target.value)} />
						)}
					</Stack>

					<Group justify="space-between" mt="xl">
						<Anchor component="button" type="button" opacity={0.85} onClick={() => toggle()} size="xs">
							{type === "register" ? "Already have an account? Login" : "Don't have an account? Register"}
						</Anchor>

						{/* VERIFY CODE */}
						{isCodeStep ? (
							<Button
								type="button"
								onClick={async () => {
									let response

									if (type === "register") {
										// REGISTER create user
										response = await fetch(RegistrationForNonGoogleUsers, {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({
												email: savedEmail,
												code,
												name: parseEmailUsername(savedEmail),
											}),
										})
									} else {
										// LOGIN verify only
										response = await fetch(VerfyingTemporaryCodeURL, {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({
												email: savedEmail,
												code,
											}),
										})
									}

									if (response.ok) {
										const data = await response.json()

										localStorage.setItem(
											"user",
											JSON.stringify({
												userName: data.userName,
												email: data.email,
												userId: data.userId,
											})
										)

										navigate("/home")
									} else {
										console.log("Invalid or expired code")
									}
								}}
							>
								Verify Code
							</Button>
						) : (
							<Button type="submit">{upperFirst(type)}</Button>
						)}
					</Group>
				</form>
			</Paper>
		</Container>
	)
}

function parseEmailUsername(email: string): string {
	if (!email) return ""
	return email.split("@")[0]
}
