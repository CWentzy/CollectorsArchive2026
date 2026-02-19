import { Avatar, Group, Menu, UnstyledButton } from "@mantine/core"
import { LogOutIcon } from "lucide-react"
import { forwardRef } from "react"
import type { User } from "../../auth/context"
import { useAuth } from "../../auth/useAuth"

interface UserButtonProps extends React.ComponentPropsWithoutRef<"button"> {
	image?: string
	name?: string
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
	({ image, name, ...others }: UserButtonProps, ref) => (
		<UnstyledButton
			ref={ref}
			style={{
				color: "var(--mantine-color-text)",
				borderRadius: "var(--mantine-radius-sm)",
			}}
			{...others}
		>
			<Group>
				<Avatar src={image} name={name} radius="sm" color="initials" variant="light" />
			</Group>
		</UnstyledButton>
	)
)

interface ProfileButtonClientProps {
	user: User
}

export default function ProfileButton({ user }: ProfileButtonClientProps) {
	const { logout } = useAuth()

	const handleLogout = () => {
		logout()
	}

	return (
		<Menu withArrow arrowOffset={15} position="top-end" radius="sm">
			<Menu.Target>
				<UserButton image={user.pictureUrl || undefined} name={user.userName || undefined} />
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Label>Welcome, {user.userName || "Account"}</Menu.Label>

				<Menu.Divider />

				<Menu.Item color="red" leftSection={<LogOutIcon size={16} />} onClick={() => handleLogout()}>
					Logout
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	)
}
