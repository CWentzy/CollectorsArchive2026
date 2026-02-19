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

export default function LoginPage(props: PaperProps) {
	const [type, toggle] = useToggle(["login", "register"])

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
							// TODO: send credentialResponse.credential to your backend for verification
						}}
						onError={() => {
							console.log("Google login failed")
						}}
					/>

					{/* You can replace this placeholder with GitHub login later */}
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
