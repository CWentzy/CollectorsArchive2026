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

const LoginUsingGoogleURL = `${import.meta.env.VITE_SERVER_URL}/api/Auth/LoginUsingGoogle`
const InitialRequestForTempCodeURL = `${import.meta.env.VITE_SERVER_URL}/api/Auth/InitialConfirmationCodeRequest`
const VerfyingTemporaryCodeURL = `${import.meta.env.VITE_SERVER_URL}/api/Auth/VerfyingTemporaryCode`

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

				// try login first and then if user is not registered or not found then authomatically register them as user
				const backendResponse = await fetch(LoginUsingGoogleURL, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email,
						name: userName, // the backend ecpects name not userName
						googleSubject,
						photoUrl,
					}),
				})
				{
					/* this is a time which will let user to stay login or authomatically will logged them out after 12 hrs  */
				}
				const loginTime = Date.now()
				const loginData = await backendResponse.json()

				localStorage.setItem("user", JSON.stringify({ ...loginData, loginTime }))
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
				// This form is for non-google login, user will provide their email and then we will send them // a code to
				their email and then they will provide that code to verify and login or register if they are new user
				<form
					onSubmit={form.onSubmit(async (values) => {
						const { email } = values

						// This endpoint should send a code to ANY valid email provided
						const response = await fetch(InitialRequestForTempCodeURL, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ email }),
						})

						if (response.ok) {
							setSavedEmail(email)
							setIsCodeStep(true)
						} else {
							console.log("Error sending code")
						}
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
						{/* VERIFY CODE */}
						{isCodeStep ? (
							<Button
								type="button"
								fullWidth
								onClick={async () => {
									// Call one "VerifyAndLogin" endpoint
									const response = await fetch(VerfyingTemporaryCodeURL, {
										method: "POST",
										headers: { "Content-Type": "application/json" },
										body: JSON.stringify({
											email: savedEmail,
											code,
											// If they are new, the backend uses this name
											name: parseEmailUsername(savedEmail),
										}),
									})

									if (response.ok) {
										const data = await response.json()
										const loginTime = Date.now()
										localStorage.setItem("user", JSON.stringify({ ...data, loginTime }))
										navigate("/home")
									} else {
										alert("Invalid or expired code")
									}
								}}
							>
								Verify & Login
							</Button>
						) : (
							<Button type="submit" fullWidth>
								Continue
							</Button>
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
