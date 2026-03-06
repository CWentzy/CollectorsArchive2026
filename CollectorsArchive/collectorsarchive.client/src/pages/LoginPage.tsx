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
import { GoogleLogin } from "@react-oauth/google"

import { useNavigate } from "react-router-dom"
import { useState } from "react"

//const GoogleUserInfoURL = "https://www.googleapis.com/oauth2/v3/userinfo"

const RegisterNewUserURL = "https://localhost:7053/api/Auth/RegisterNewUser"

const LoginUsingGoogleURL = "https://localhost:7053/api/Auth/LoginUsingGoogle"

const RequestForTempCodeURL = "https://localhost:7053/api/Auth/RequestForTempCode"

// this variable i will be using it for after user recieved an email with the code
const VerfyingTemporaryCodeURL = "https://localhost:7053/api/Auth/VerfyingTemporaryCode"

export default function LoginPage(props: PaperProps) {
	const [type, toggle] = useToggle(["login", "register"])
	const navigate = useNavigate()

	// this is for temp code will user provide from their email
	const [isCodeStep, setIsCodeStep] = useState(false)
	const [code, setCode] = useState("")
	const [savedEmail, setSavedEmail] = useState("")

	const form = useForm({
		initialValues: {
			email: "",
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
					<GoogleLogin
						onSuccess={async (response) => {
							if (!response.credential) {
								console.error("NO Token ID from Google")
								return
							}
							try {
								const GoogleIDToken = response.credential

								// decode ID token
								const decoded: any = JSON.parse(atob(GoogleIDToken.split(".")[1]))
								const email = decoded.email
								const userName = parseEmailUsername(email)

								// Try login first
								const backendResponse = await fetch(LoginUsingGoogleURL, {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({ GoogleIDToken }),
								})

								// If user not found then register
								if (backendResponse.status === 404) {
									await fetch(RegisterNewUserURL, {
										method: "POST",
										headers: { "Content-Type": "application/json" },
										body: JSON.stringify({ GoogleIDToken }),
									})
								}

								localStorage.setItem("user", JSON.stringify({ userName, email }))
								navigate("/home")
							} catch (error) {
								console.error("Google login failed:", error)
							}
						}}
						onError={() => console.log("Login Failed")}
					/>
				</Group>

				<Divider label="or continue with email" labelPosition="center" my="lg" />

				{/* Here only works for non google users so their will get temp code and they have to provide it from their email  */}
				<form
					onSubmit={form.onSubmit(async (values) => {
						const email = values.email
						const userName = parseEmailUsername(email)

						// Send email and their name to backend for non-Google login
						await fetch(RequestForTempCodeURL, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ email, userName }),
						})

						console.log("Temporary login code sent to email")

						// as i save email so verify step always has correct value
						setSavedEmail(email)

						setIsCodeStep(true)
					})}
				>
					<Stack>
						<TextInput
							required
							label="Email (for non Google login)"
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
