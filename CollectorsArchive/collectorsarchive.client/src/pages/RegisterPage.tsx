import { Button, Center, Container, Paper, Stack, Text, TextInput, type PaperProps } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useNavigate } from "react-router-dom"

import { GoogleLogin } from "@react-oauth/google" // Adding Google button to RegisterPage
import type { CredentialResponse } from "@react-oauth/google" // Type-only import required by TS

export default function RegisterPage(props: PaperProps) {
	const navigate = useNavigate()

	// here i set up my form so i can collect user info for registration
	const form = useForm({
		initialValues: {
			name: "",
			email: "",
			password: "",
		},
	})

<<<<<<< HEAD
	// When user submits the form, send data to the backend
	const handleRegister = async () => {
		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: form.values.email,
					name: form.values.name,
					googleSubject: form.values.password, // Using password field as Google subject placeholder
				}),
			})

			if (response.ok) {
				navigate("/HomePage")
			} else {
				const errorData = await response.json()
				alert(errorData.message || "Registration failed.")
			}
		} catch (error) {
			console.error("Registration error:", error)
			alert("An error occurred. Please try again.")
=======
	// when user submits the form i wanna register them then redirect to homepage
	const handleRegister = async () => {
			console.log("Registering user:", form.values)

			const response = await fetch("https://localhost:7053/api/NewUsersRegistration/manual-register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(form.values),
			})

			const data = await response.json()

			if (data.success) {
					navigate("/HomePage")
			}
	}

	// when user clicks Google button i wanna register them using Google token
	const handleGoogleRegister = async (googleResponse: CredentialResponse) => {
		const token = googleResponse.credential

		if (!token) {
			console.error("Google token missing")
			return
		}

		console.log("Google token received:", token)

		// send google token to backend for registration
		const response = await fetch("https://localhost:7053/api/NewUsersRegistration/google-register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token }), // this is what the back end expecting
		})

		const data = await response.json()

		if (data.success) {
			navigate("/HomePage")
>>>>>>> a0f0bec (Database connected successfully, renamed User to UserInformation, added/removed test column to verify connection)
		}
	}

	return (
		<Container size="xs">
			<Paper p="lg" {...props}>
				<Center>
					<Text size="lg" fw={500} c="bright">
						Create your account
					</Text>
				</Center>

				<form onSubmit={form.onSubmit(handleRegister)}>
					<Stack mt="md">
						{/* username field */}
						<TextInput
							label="Username"
							placeholder="Enter your name"
							value={form.values.name}
							onChange={(event) => form.setFieldValue("name", event.currentTarget.value)}
							error={form.errors.name}
							// required // not required if user isnt provide user name we can give their email user as their user name
						/>

						{/* email field */}
						<TextInput
							label="Email"
							placeholder="Enter your email"
							value={form.values.email}
							onChange={(event) => form.setFieldValue("email", event.currentTarget.value)}
							error={form.errors.email}
							required
						/>

						{/* register button */}
						<Button type="submit" mt="md">
							Register
						</Button>

						{/* google register button */}
						<GoogleLogin
							onSuccess={(cred) => handleGoogleRegister(cred)}
							onError={() => console.log("Google Login Failed")}
						/>
					</Stack>
				</form>
			</Paper>
		</Container>
	)
}
