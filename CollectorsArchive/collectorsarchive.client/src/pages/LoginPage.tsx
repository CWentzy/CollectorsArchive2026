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

				// here i am adding a request for backend

				// we let user to try to login first
				const backendResponse = await fetch(LoginUsingGoogleURL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ googleSubject }),
				})

				if (backendResponse.status === 404) {
					await fetch(RegisterNewUserURL, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							email,
							name: userName,
							googleSubject,
						}),
					})
				}

				localStorage.setItem("user", JSON.stringify({ userName, email }))
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

				{/* Here only works for non google users so their will get temp code and they have to provide it from their email  */}
				<form
					onSubmit={form.onSubmit(async (values) => {
						const { email, name } = values

						// Send email and their name to backend for non-Google login
						await fetch(RequestForTempCodeURL, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ email, name }),
						})

						console.log("Temporary login code sent to email")

						// as i save email so verify step always has correct value
						setSavedEmail(email)

						setIsCodeStep(true)
					})}
				>
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
							label="Email (for non‑Google login)"
							value={form.values.email}
							onChange={(event) => form.setFieldValue("email", event.currentTarget.value)}
							error={form.errors.email && "Invalid email"}
						/>

						{/* This input will be displayed  only after user submits email and backend sends temp code */}
						{isCodeStep && (
							<TextInput label="Enter the code we emailed you" value={code} onChange={(e) => setCode(e.target.value)} />
						)}
					</Stack>

					<Group justify="space-between" mt="xl">
						<Anchor component="button" type="button" opacity={0.85} onClick={() => toggle()} size="xs">
							{type === "register" ? "Already have an account? Login" : "Don't have an account? Register"}
						</Anchor>

						{/* If we are in code step, this button should verify the code instead of resending 
						also the fetch URL is different cus the end point at the backend is different too */}
						{isCodeStep ? (
							<Button
								type="button"
								onClick={async () => {
									const response = await fetch(VerfyingTemporaryCodeURL, {
										method: "POST",
										headers: { "Content-Type": "application/json" },
										body: JSON.stringify({ email: savedEmail, code }),
									})

									if (response.ok) {
										const data = await response.json()

										localStorage.setItem(
											"user",
											JSON.stringify({
												userName: data.userName,
												email: data.email,
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
