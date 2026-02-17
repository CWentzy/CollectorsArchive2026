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

// here we i need to import Google Aoth to wire my login page so users can login using their google account
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
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

	// Handle Google login: call the backend to check if user exists
	const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
		if (!credentialResponse.credential) return

		const user = jwtDecode<GoogleUser>(credentialResponse.credential)

		// Fill the form with Google data
		form.setFieldValue("email", user.email!)
		form.setFieldValue("name", user.name!)
		form.setFieldValue("password", user.sub!)

		try {
			// Try to log in with the Google subject
			const loginResponse = await fetch("/api/auth/google-login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: user.email,
					name: user.name,
					googleSubject: user.sub,
				}),
			})

			if (loginResponse.ok) {
				// User found, redirect to homepage
				navigate("/HomePage")
			} else if (loginResponse.status === 404) {
				// User not found, auto-register them with their Google info
				const registerResponse = await fetch("/api/auth/register", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: user.email,
						name: user.name,
						googleSubject: user.sub,
					}),
				})

				if (registerResponse.ok) {
					navigate("/HomePage")
				} else {
					const errorData = await registerResponse.json()
					alert(errorData.message || "Registration failed.")
				}
			} else {
				const errorData = await loginResponse.json()
				alert(errorData.message || "Login failed.")
			}
		} catch (error) {
			console.error("Auth error:", error)
			alert("An error occurred. Please try again.")
		}
	}

	return (
		<Container size="xs">
			<Paper p="lg" {...props}>
				<Center>
					<Text size="lg" fw={500} c="bright">
						Welcome to Collector's Archive, {type} with
					</Text>
				</Center>

				<Group grow mb="md" mt="md">
					{/* when user clicks google login, i wanna auto-fill their info and redirect them if they exist */}
					<GoogleLogin
						/*onSuccess={(credentialResponse: CredentialResponse) => {
							if (credentialResponse.credential) {
								const user = jwtDecode<GoogleUser>(credentialResponse.credential)

								// filling the form with google data so user doesn't type anything manually
								form.setFieldValue("email", user.email!)
								form.setFieldValue("name", user.name!)
								form.setFieldValue("password", user.sub!) // google doesn't give password so i use their unique id

								// here i check if the email exists in my system (backend call later)

								// this is a place holder till the backend its readddyy
								const emailExists = true

								if (emailExists) {
									// if email is recognized then i redirect them to homepage
									navigate("/HomePage")
								} else {
									// if email is not recognized i let them know and ask if they wanna register
									const wantsToRegister = confirm("This email is not recognized. Do you want to register?")

									if (wantsToRegister) {
										// here i will create the account using google info (backend call maybe????)
										console.log("Creating new Google account:", user)

										// after creating account i redirect them to homepage
										navigate("/HomePage")
									} else {
										// if they say no, i stay on login page
										console.log("User chose not to register")
									}
								}
							}
						}}*/
						onSuccess={handleGoogleSuccess}
						onError={() => {
							console.log("Google Login Failed")
						}}
					/>
				</Group>

				<Divider label="or continue with email" labelPosition="center" my="lg" />

				<form onSubmit={form.onSubmit(() => { })}>
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

						<PasswordInput
							required
							label="Password"
							value={form.values.password}
							onChange={(event) => form.setFieldValue("password", event.currentTarget.value)}
							error={form.errors.password && "Password should include at least 6 characters"}
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

// this class will be holding user email , password that google gives ( temporary unique identifier and user name )
interface GoogleUser {
	email: string
	name: string
	picture: string
	sub: string
}
