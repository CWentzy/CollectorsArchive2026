import { Button, Center, Container, Paper, PasswordInput, Stack, Text, TextInput, type PaperProps } from "@mantine/core"
import { useForm } from "@mantine/form"
import { useNavigate } from "react-router-dom"

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
							required
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

						{/* password field */}
						<PasswordInput
							label="Password"
							placeholder="Create a password"
							value={form.values.password}
							onChange={(event) => form.setFieldValue("password", event.currentTarget.value)}
							error={form.errors.password}
							required
						/>

						{/* register button */}
						<Button type="submit" mt="md">
							Register
						</Button>
					</Stack>
				</form>
			</Paper>
		</Container>
	)
}
