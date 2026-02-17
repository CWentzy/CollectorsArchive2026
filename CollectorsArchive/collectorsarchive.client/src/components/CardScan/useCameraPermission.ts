import { useEffect, useState } from "react"

type PermissionState = "prompt" | "denied" | "granted"

export function useCameraPermission() {
	const [permissionState, setPermissionState] = useState<PermissionState>("prompt")

	useEffect(() => {
		let ignore = false
		if (navigator.permissions && navigator.permissions.query) {
			navigator.permissions
				.query({ name: "camera" as PermissionName })
				.then((result) => {
					if (ignore) return
					setPermissionState(result.state as PermissionState)
					result.onchange = () => {
						setPermissionState(result.state as PermissionState)
					}
				})
				.catch(() => {})
		}
		return () => {
			ignore = true
		}
	}, [])

	return permissionState
}
